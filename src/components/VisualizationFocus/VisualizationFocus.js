import { useState, useRef, useEffect } from 'react';
import { homepage } from '../../../package.json';
import copy from 'copy-to-clipboard';
import VisualizationController from '../VisualizationController/VisualizationController.js';
import Md from 'react-markdown';


const VisualizationFocus = ({ visualization, lang, onClose }) => {

  const [copyClicked, setCopyClicked] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef && inputRef.current) {
      inputRef.current.focus();
    }
  }, [visualization])
  let howDone, howRead;
  if (visualization) {
    howDone = visualization[`comment_cest_fait_${lang}`];
    howRead = visualization[`comment_lire_${lang}`];
  }

  const messages = {
    howDone: {
      fr: 'Comment les données et la visualisation ont-elles été produites ?',
      en: 'How were the data and visualization produced ?',
    },
    howRead: {
      fr: 'Comment lire la visualisation ?',
      en: 'How to read the visualization?'
    },
    copyLink: {
      fr: 'copier le lien de cette visualisation',
      en: 'copy this visualization link'
    },
    linkCopied: {
      fr: 'lien copié dans le presse-papier !',
      en: 'link copied in the clipboard !'
    }
  }

  const handleCopyClick = (e) => {
    e.stopPropagation();
    const url = `${homepage}/${lang}/atlas/${visualization.id}`;
    setCopyClicked(true);
    copy(url);
    setTimeout(() => setCopyClicked(false), 5000);
  }
  const handleKeyUp = (e) => {
    // on press escape
    if (e.keyCode === 27 && visualization) {
      onClose();
    }
  }
  return (
    <div className={`VisualizationFocus ${visualization ? 'is-visible' : 'is-hidden'}`}>
      <input type="text" onKeyUp={handleKeyUp} ref={inputRef} />
      <div onClick={onClose} className="lightbox-background" />
      {
        visualization ?
          <div className="lightbox-contents-container">
            <div className="lightbox-contents">

              <div className="visualization-details">
                <div className="details-header">
                  <h2>{visualization[`titre_${lang}`]}</h2>
                  <button className="close-btn" onClick={onClose}>
                    ✕
                  </button>
                </div>
                <div className="copy-link-container">
                  <button onClick={handleCopyClick}>{copyClicked ? messages.linkCopied[lang] : messages.copyLink[lang]}</button>
                </div>
                <div className="details-contents">
                  {
                    howDone && howDone.length ?
                      <section className="details-contents-section">
                        <h3>{messages.howDone[lang]}</h3>
                        <Md>
                          {howDone.replace(/<br\/>/g, '\n\n')}
                        </Md>
                      </section>
                      : null
                  }
                  {
                    howRead && howRead.length ?
                      <section className="details-contents-section">
                        <h3>{messages.howRead[lang]}</h3>
                        <Md>
                          {howRead.replace(/<br\/>/g, '\n\n')}
                        </Md>
                      </section>
                      : null
                  }
                </div>
              </div>
              <div className="visualization-wrapper">
                <VisualizationController lang={lang} atlasMode activeVisualization={visualization} />
              </div>
            </div>
          </div>
          : null
      }

    </div>
  )
}

export default VisualizationFocus;