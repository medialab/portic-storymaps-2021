import Test from './Test';


const VisualizationContainer = ({id, ...props}) => {
  switch(id) {
    case 'test':
    default:
      return <Test {...props} />
  }
}

export default VisualizationContainer;