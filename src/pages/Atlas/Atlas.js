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
  <div>
    <h1>Atlas</h1>
    <ul>
      {
        visualizations.map((visualization, visualizationIndex) => {
          const handleClick = () => {
            history.push({
              pathname: `/${lang}/atlas/${visualization.id}`
            })
          }
          return (
            <li 
              className={cx({'is-active': shownVisualization && shownVisualization.id === visualization.id})} 
              onClick={handleClick} 
              key={visualizationIndex}
            >
              {visualization[`titre_${lang}`]}
            </li>
          )
        })
      }
    </ul>
    {
      shownVisualization ?
        <VisualizationFocus visualization={shownVisualization} lang={lang} />
      : null
    }
  </div>
  );
}

export default Atlas;