import HorizontalBarChart from './HorizontalBarChart';
import VerticalBarChart from './VerticalBarChart';

import './BarChart.scss';

/**
 * BarChart component - returns a <figure> containing a svg linechart
 * 
 * @param {array} data 
 * @param {string} title 
 * @param {string} orientation ['horizontal', 'vertical'] 
 * @param {string} layout ['stack', 'groups'] 
 * @param {width} number 
 * @param {height} number 
 * 
 * @param {object} color
 * @param {string} color.field
 * @param {string} color.title
 * @param {object} color.palette
 * 
 * @param {object} x
 * @param {string} x.field
 * @param {string} x.title
 * @param {number} x.tickSpan
 * @param {function} x.tickFormat
 * @param {array} x.domain
 * 
 * @param {object} x
 * @param {string} y.field
 * @param {string} y.title
 * @param {number} y.tickSpan
 * @param {function} y.tickFormat
 * @param {array} y.domain
 * @param {boolean} y.fillGaps
 * 
 * @param {object} margins
 * @param {number} margins.left
 * @param {number} margins.top
 * @param {number} margins.right
 * @param {number} margins.bottom
 * 
 * @param {function} tooltip
 * 
 * @returns {React.ReactElement} - React component
 */
const BarChart = ({
  orientation = 'horizontal',
  ...props
}) => {
  if (orientation === 'horizontal') {
    return <HorizontalBarChart {...props} />
  }
  return <VerticalBarChart {...props} />
}
export default BarChart;