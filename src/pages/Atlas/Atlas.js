import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import {Helmet} from "react-helmet";
import cx from 'classnames';

// charger le json de la liste des visualisations de l'atlas
import visualizations from '../../visualizationsList';
import VisualizationFocus from '../../components/VisualizationFocus/VisualizationFocus';

import {buildPageTitle} from '../../helpers/misc';


const visualizationsMap = visualizations.reduce((res, visualization) => ({
  ...res,
  [visualization.id]: visualization
}), {})

function Atlas({
  match: {
    params: {
      visualizationId,
      lang = 'fr'
    }
  }
}) {
  /**
   * Scroll to top on mount
   */
   useEffect(() => {
    window.scrollTo(0, 0);
  }, [])
  const history = useHistory();
  const shownVisualization = visualizationId && visualizationsMap[visualizationId];
  return (
    <div className={cx("Atlas secondary-page", {'has-focus': shownVisualization})}>
      <Helmet>
        <title>{buildPageTitle('Atlas', lang)}</title>
      </Helmet>
      <div className="centered-contents">
        <h1>{lang === 'fr' ? 'Atlas des visualisations' : 'Visualizations atlas'}</h1>
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
                      <img
                        src={`${process.env.PUBLIC_URL}/thumbnails/${lang}/${visualization.id}.png`}
                        alt={visualization[`titre_${lang}`]}
                      />
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
        <VisualizationFocus 
          visualization={shownVisualization} 
          lang={lang}
          onClose={() => {
            history.push({
              pathname: `/${lang}/atlas/`
            })
          }}
        />
    </div>
  );
}

export default Atlas;