import React from 'react';
import {useHistory} from 'react-router-dom';
import cx from 'classnames';

import VisualizationContainer from '../../visualizations/index.js';
// charger le json de la liste des visualisations de l'atlas
import visualizations from '../../visualizationsList';

const VisualizationFocus = ({visualization, lang}) => {
  return (
    <div className="VisualizationFocus">
      <h2>Visualisation en lightbox : {visualization[`titre_${lang}`]}</h2>
      <VisualizationContainer id={visualization.id} />
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
                className={cx('visualization-item', {'is-active': shownVisualization && shownVisualization.id === visualization.id})} 
                onClick={handleClick} 
                key={visualizationIndex}
              >
                <figure className="thumbnail-container">
                  {visualization.thumbnail ? 
                    <img 
                      src={`${process.env.PUBLIC_URL}/images/thumbnails/${visualization.thumbnail}}`}
                      alt= {visualization[`titre_${lang}`]}
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
        <VisualizationFocus visualization={shownVisualization} lang={lang} />
      : null
    }
  </div>
  );
}

export default Atlas;