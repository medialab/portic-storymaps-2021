import {useState} from 'react';
import omit from 'lodash/omit';
import cx from 'classnames';
import Measure from 'react-measure'

import VisualizationContainer from '../../visualizations/index.js';

const VisualizationController = ({
  activeVisualization
}) => {
  const [dimensions, setDimensions] = useState({});
  const visProps = activeVisualization && omit(activeVisualization, ['id', 'ref', 'visualizationId'])
  return (
    <Measure 
      bounds
      onResize={contentRect => {
        setDimensions(contentRect.bounds)
      }}
    >
      {({ measureRef }) => (
          <div ref={measureRef} className={cx("VisualizationController", {'is-empty': !activeVisualization})}>
          {/* <h2>Visualization controller</h2> */}
          {
            activeVisualization ?
            <>
              {/* <ul>
                <li>Id de la visualisation active : <code>{activeVisualization.visualizationId}</code></li>
                <li>Paramètres spécifiques au caller : <code>{JSON.stringify(visProps)}</code></li>
              </ul> */}
              <VisualizationContainer id={activeVisualization.visualizationId} {...visProps} dimensions={dimensions} />
            </>
            : <div>Pas de visualisation à afficher</div>
          }
        </div>
      )}
    </Measure>
  );
}

export default VisualizationController;