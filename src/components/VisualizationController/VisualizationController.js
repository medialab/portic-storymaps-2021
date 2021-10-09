import {useState} from 'react';
import omit from 'lodash/omit';
import cx from 'classnames';
import Measure from 'react-measure'

import VisualizationContainer from '../../visualizations/index.js';

const VisualizationController = ({
  lang,
  activeVisualization,
  atlasMode,
  screenshotMode
}) => {
  const [dimensions, setDimensions] = useState({
    width: 1000,
    height: 1000
  });
  const visProps = activeVisualization && omit(activeVisualization, ['id', 'ref', 'visualizationId']);
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
              <VisualizationContainer lang={lang} screenshotMode={screenshotMode} atlasMode={atlasMode} id={atlasMode ? activeVisualization.id : activeVisualization.visualizationId} {...visProps} dimensions={dimensions} />
            </>
            : null // <div>Pas de visualisation à afficher</div>
          }
  
        </div>
      )}
    </Measure>
  );
}

export default VisualizationController;