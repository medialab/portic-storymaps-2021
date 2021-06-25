import {useContext, useMemo} from 'react';

import Test from './Test';
import PrincipalVisualizationPart1 from './PrincipalVisualizationPart1';
import PrincipalVisualizationPart2 from './PrincipalVisualizationPart2';
import PrincipalVisualizationPart3 from './PrincipalVisualizationPart3';


import {DatasetsContext} from '../helpers/contexts';

import visualizationsList from '../visualizationsList';

const VisualizationContainer = ({id, dimensions: inputDimensions, ...props}) => {
  const dimensions = {
    ...inputDimensions,
    // height: inputDimensions.height - inputDimensions.top / 2
  }
  const datasets = useContext(DatasetsContext);
  const relevantDatasets = useMemo(() => {
    const viz = visualizationsList.find(v => v.id === id);
    if (viz) {
      const datasetsIds = viz.datasets && viz.datasets.split(',').map(d => d.trim());
      if (datasetsIds.length && datasets) {
        return datasetsIds.reduce((cur, id) => ({
          ...cur,
          [id]: datasets[id]
        }), {})
      }
    }
  }, [id, datasets]);
  switch(id) {
    case 'viz-principale-partie-1':
      return <PrincipalVisualizationPart1 {...props} datasets={relevantDatasets || {}} {...dimensions} />;
    case 'viz-principale-partie-2':
      return <PrincipalVisualizationPart2 {...props} datasets={relevantDatasets || {}} {...dimensions} />;
    case 'viz-principale-partie-3':
      return <PrincipalVisualizationPart3 {...props} datasets={relevantDatasets || {}} {...dimensions} />;
    case 'test':
    default:
      return <Test {...props} datasets={relevantDatasets || {}} />;
  }
}

export default VisualizationContainer;