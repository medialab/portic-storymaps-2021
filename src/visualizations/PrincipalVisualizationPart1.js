import Decline from '../components/DeclineComponent';

const PrincipalVisualizationPart1 = ({width, height, step, ...props}) => {
  switch(step + '') {
    case '1':
      return <Decline startYear={1720} endYear={1789} rows={['France', 'La Rochelle', 'Bordeaux', 'comparison']} visibleRows={[0, 1, 2]} {...{width, height, ...props}} />
    case '2':
      return <Decline startYear={1720} endYear={1789} rows={['France', 'La Rochelle', 'Bordeaux', 'comparison']}  visibleRows={[1, 2]} {...{width, height, ...props}} />
    case '3':
      return <Decline startYear={1750} endYear={1789} rows={['France', 'La Rochelle', 'Bordeaux', 'comparison']}  visibleRows={[2, 3]} {...{width, height, ...props}} />
    case '4':
    default:
      return <Decline startYear={1750} endYear={1789} rows={['France', 'La Rochelle', 'Bordeaux', 'comparison']}  visibleRows={[2, 3]} {...{width, height, ...props}} />
  }
}

export default PrincipalVisualizationPart1;