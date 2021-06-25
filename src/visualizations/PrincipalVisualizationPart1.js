import Decline from '../components/DeclineComponent';

const PrincipalVisualizationPart1 = ({width, height, step, ...props}) => {
  switch(step + '') {
    case '1':
      return <Decline startYear={1720} endYear={1789} rows={{'France': 1, 'La Rochelle': 2, 'Bordeaux': 2, 'comparison': 0}}  {...{width, height, ...props}} />
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