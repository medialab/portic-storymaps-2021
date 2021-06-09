import {useContext, useMemo} from 'react';

import Test from './Test';

import {DatasetsContext} from '../helpers/contexts';

import visualizationsList from '../visualizationsList';

const VisualizationContainer = ({id, ...props}) => {
  const datasets = useContext(DatasetsContext);
  const relevantDatasets = useMemo(() => {
    const viz = visualizationsList.find(v => v.id === id);
    if (viz) {
      console.log('str datasets', viz.datasets)
      const datasetsIds = viz.datasets && viz.datasets.split(',').map(d => d.trim());
      if (datasetsIds.length && datasets) {
        return datasetsIds.reduce((cur, id) => ({
          ...cur,
          [id]: datasets[id]
        }), {})
      }
    }
  }, [id]);
  console.log('relevantDatasets', relevantDatasets);
  switch(id) {
    case 'test':
    default:
      return <Test {...props} />
  }
}

export default VisualizationContainer;