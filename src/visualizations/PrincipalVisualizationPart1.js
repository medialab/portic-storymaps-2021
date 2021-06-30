import Decline from '../components/DeclineComponent';

const PrincipalVisualizationPart1 = ({width, height, step, ...props}) => {
  if (props.atlasMode) {
    return (
      <Decline 
        startYear={1720} 
        endYear={1789} 
        rows={{'France': 1, 'La Rochelle': 1, 'Bordeaux': 1, 'comparison': 1}}  
        {...{width, height, ...props}} 
      />
    )
  }
  switch(step + '') {
    case '1':
      return <Decline startYear={1720} endYear={1789} rows={{'France': 2, 'La Rochelle': 3, 'Bordeaux': 3, 'comparison': 0}}  {...{width, height, ...props}} />
    case '2':
      return <Decline startYear={1720} endYear={1789} rows={{'France': 0, 'La Rochelle': 1, 'Bordeaux': 1, 'comparison': 0}} {...{width, height, ...props}} />
    case '3':
      return <Decline startYear={1750} endYear={1789} rows={{'France': 0, 'La Rochelle': 1, 'Bordeaux': 0, 'comparison': 2}} {...{width, height, ...props}} />
    case '4':
    default:
      return <Decline startYear={1750} endYear={1789} rows={{'France': 1, 'La Rochelle': 1, 'Bordeaux': 0, 'comparison': 1}} {...{width, height, ...props}} />
    
  }
}

export default PrincipalVisualizationPart1;