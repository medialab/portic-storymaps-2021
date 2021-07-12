import VisualizationController from '../../components/VisualizationController/VisualizationController.js';

import visualizationsList from '../../visualizationsList.json';
const StandaloneVisualization = ({
  id,
  lang
}) => {
  const visualization = visualizationsList.find(({id: thatId}) => thatId === id)
  return (
    <div className="StandaloneVisualization">
      <VisualizationController lang={lang} atlasMode activeVisualization={visualization} />
    </div>
  )
}

export default StandaloneVisualization;