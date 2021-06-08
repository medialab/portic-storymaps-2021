import omit from 'lodash/omit';

import VisualizationContainer from '../../visualizations/index.js';

const VisualizationController = ({
  activeVisualization
}) => {
  const visProps = activeVisualization && omit(activeVisualization, ['id', 'ref', 'visualizationId'])
  return (
    <div className="VisualizationController">
      <h2>Visualization controller</h2>
      {
        activeVisualization ?
        <>
          <ul>
            <li>Id de la visualisation active : <code>{activeVisualization.visualizationId}</code></li>
            <li>Paramètres spécifiques au caller : <code>{JSON.stringify(visProps)}</code></li>
          </ul>
          <VisualizationContainer id={activeVisualization.visualizationId} {...visProps} />
        </>
        : <div>Pas de visualisation à afficher</div>
      }
    </div>
  );
}

export default VisualizationController;