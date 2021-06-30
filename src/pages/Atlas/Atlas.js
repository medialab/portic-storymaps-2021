import React from 'react';
import { useHistory } from 'react-router-dom';
import cx from 'classnames';

import VisualizationContainer from '../../visualizations/index.js';
// charger le json de la liste des visualisations de l'atlas
import visualizations from '../../visualizationsList';

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
    <div onClick={handleClose} className="VisualizationFocus">
      <div className="lightbox-background" />
      <div className="lightbox-contents">
        <div className="visualization-wrapper">
          <VisualizationContainer id={visualization.id} />
        </div>
        <div className="visualization-details">
          <div className="details-header">
            <h2>Visualisation en lightbox : {visualization[`titre_${lang}`]}</h2>
            <button className="close-btn" onClick={handleClose}>
            ✕
            </button>
          </div>
          <div className="details-contents">
            {
              howDone && howDone.length ?
              <section className="details-contents-section">
                <h2>{messages.howDone[lang]}</h2>
                <p>
                  {howDone}
                </p>
              </section>
              : null
            }
            {
              howRead && howRead.length ?
              <section className="details-contents-section">
                <h2>{messages.howRead[lang]}</h2>
                <p>
                  {howRead}
                </p>
              </section>
              : null
            }
          </div>
        </div>
      </div>
    </div>
  )
}

const visualizationsMap = visualizations.reduce((res, visualization) => ({
  ...res,
  [visualization.id]: visualization
}), {})

function Atlas({
  match: {
    params: {
      visualizationId,
      lang
    }
  }
}) {
  const history = useHistory();
  const shownVisualization = visualizationId && visualizationsMap[visualizationId];
  return (
    <div className="Atlas secondary-page">
      <div className="centered-contents">
        <h1>Atlas</h1>
        <ul className="visualizations-list">
          {
            visualizations.map((visualization, visualizationIndex) => {
              const handleClick = () => {
                history.push({
                  pathname: `/${lang}/atlas/${visualization.id}`
                })
              }
              return (
                <li
                  className={cx('visualization-item', { 'is-active': shownVisualization && shownVisualization.id === visualization.id })}
                  onClick={handleClick}
                  key={visualizationIndex}
                >
                  <figure className="thumbnail-container">
                    {visualization.thumbnail ?
                      <img
                        src={`${process.env.PUBLIC_URL}/images/thumbnails/${visualization.thumbnail}}`}
                        alt={visualization[`titre_${lang}`]}
                      />
                      : null
                    }
                  </figure>
                  <h5 className="visualization-title">
                    {visualization[`titre_${lang}`]}
                  </h5>
                </li>
              )
            })
          }
        </ul>
      </div>
      {
        shownVisualization ?
          <VisualizationFocus history={history} visualization={shownVisualization} lang={lang} />
          : null
      }
    </div>
  );
}

export default Atlas;