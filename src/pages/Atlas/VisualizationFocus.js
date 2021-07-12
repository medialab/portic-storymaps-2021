import VisualizationController from '../../components/VisualizationController/VisualizationController.js';


const VisualizationFocus = ({ visualization, lang, history }) => {
  const handleClose = () => {
    history.push({
      pathname: `/${lang}/atlas/`
    })
  }
  const howDone = visualization[`comment_cest_fait_${lang}`];
  const howRead = visualization[`comment_lire_${lang}`];
  const messages = {
    howDone: {
      fr: 'Comment les données et la visualisations ont-elles été produites ?',
      en: 'How were the data and visualization produced ?',
    },
    howRead: {
      fr: 'Comment lire la visualisation ?',
      en: 'How to read the visualization?'
    }
  }
  return (
    <div className="VisualizationFocus">
      <div onClick={handleClose} className="lightbox-background" />
      <div className="lightbox-contents">
        
        <div className="visualization-details">
          <div className="details-header">
            <h2>{visualization[`titre_${lang}`]}</h2>
            <button className="close-btn" onClick={handleClose}>
            ✕
            </button>
          </div>
          <div className="details-contents">
            {
              howDone && howDone.length ?
              <section className="details-contents-section">
                <h3>{messages.howDone[lang]}</h3>
                <p>
                  {howDone}
                </p>
              </section>
              : null
            }
            {
              howRead && howRead.length ?
              <section className="details-contents-section">
                <h3>{messages.howRead[lang]}</h3>
                <p>
                  {howRead}
                </p>
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
  )
}

export default VisualizationFocus;