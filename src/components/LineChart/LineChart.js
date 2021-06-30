
import { scaleLinear } from 'd3-scale';
import { extent, range, max } from 'd3-array';
import { useRef, useState, useEffect } from 'react';
import { groupBy } from 'lodash';
import { axisPropsFromTickScale } from 'react-d3-axis';
import Tooltip from 'react-tooltip';
import { uniq } from 'lodash';

import colorsPalettes from '../../colorPalettes';
import { generatePalette } from '../../helpers/misc';

const { generic } = colorsPalettes;

/**
 * LineChart component - returns a <figure> containing a svg linechart
 * 
 * @param {array} data 
 * @param {string} title 
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
 * @returns {react}
 */
const LineChart = ({
  data,
  title,
  width : initialWidth = 1000,
  height: initialHeight = 400,
  color,
  x,
  y,
  tooltip,
  margins: inputMargins = {}
}) => {
  const [headersHeight, setHeadersHeight] = useState(0);
  const [legendWidth, setLegendWidth] = useState(0);

  const legendRef = useRef(null);
  const headerRef = useRef(null);
  
  const width = initialWidth - legendWidth;
  const height = initialHeight - headersHeight;

  useEffect(() => {
    setTimeout(() => {
      const newHeadersHeight = headerRef.current ?  headerRef.current.getBoundingClientRect().height : 0;
      const newLegendWidth = legendRef.current ?  legendRef.current.getBoundingClientRect().width : 0;
      setHeadersHeight(newHeadersHeight);
      setLegendWidth(newLegendWidth);
    })
  }, [width, height, color, data])
  const margins = {
    left: 100,
    top: 30,
    bottom: 20,
    right: 20,
    ...inputMargins
  };

  const {
    tickFormat: yTickFormat,
    tickSpan: yTickSpan,
    domain: initialYDomain,
    fillGaps
  } = y;
  const {
    tickFormat: xTickFormat,
    tickSpan: xTickSpan,
    domain: initialXDomain,
  } = x;
  let colorPalette;
  if (color && color.palette) {
    colorPalette = color.palette;
  } else if (color) {
    const colorModalities = uniq(data.map(d => d[color.field]));
    const colorValues = generatePalette(color.field, colorModalities.length);
    colorPalette = colorModalities.reduce((res, modality, index) => ({
      ...res,
      [modality]: colorValues[index]
    }), {})
  }
  const xDomain = initialXDomain || extent(data.filter(d => +d[y.field]).map(d => +d[x.field]));
  const yDomain = initialYDomain || [0, max(data.map(d => +d[y.field]))];

  const xScale = scaleLinear().domain(xDomain).range([margins.left, width - margins.right]);
  const yScale = scaleLinear().domain(yDomain).range([height - margins.bottom, margins.top]);
  const groups = color ? Object.entries(groupBy(data, d => d[color.field])) : [[undefined, data]];
  let { values: xAxisValues } = axisPropsFromTickScale(xScale);
  let { values: yAxisValues } = axisPropsFromTickScale(yScale, 10);
  if (xTickSpan) {
    xDomain[0] = xDomain[0] - xDomain[0] % xTickSpan;
    xDomain[1] = xDomain[1] + (xTickSpan - xDomain[0] % xTickSpan);
    xAxisValues = range(xDomain[0], xDomain[1], xTickSpan);
    xScale.domain(xDomain);
  }
  if (yTickSpan) {
    yDomain[0] = yDomain[0] - yDomain[0] % yTickSpan;
    yDomain[1] = yDomain[1] + (yTickSpan - yDomain[0] % yTickSpan);
    yAxisValues = range(yDomain[0], yDomain[1], yTickSpan);
    yScale.domain(yDomain)
  }
  return (
    <>
      <figure style={{width: initialWidth, height: initialHeight}} className="LineChart GenericVisualization">
        <div ref={headerRef} className="row">
          {title ? <h5 className="visualization-title" style={{ marginLeft: margins.left }}>{title}</h5> : null}
        </div>
        <div className="row vis-row">
          <svg className="chart" width={width} height={height}>
            <g className="axis left-axis ticks">
              <text x={margins.left - 10} y={margins.top} className="axis-title">
                {y.title || y.field}
              </text>
              {
                yAxisValues.map(value => (
                  <g
                    key={value}
                    transform={`translate(0, ${yScale(value)})`}
                  >
                    <text x={margins.left - 10} y={3}>
                      {typeof yTickFormat === 'function' ? yTickFormat(value) : value}
                    </text>
                    <line
                      className="tick-mark"
                      x1={margins.left - 5}
                      x2={margins.left}
                      y1={0}
                      y2={0}
                    />
                    <line
                      className="background-line"
                      x1={margins.left}
                      x2={xScale(xAxisValues[xAxisValues.length - 1])}
                      y1={0}
                      y2={0}
                    />
                  </g>
                ))
              }
            </g>
            <g className="axis bottom-axis ticks">
              {
                xAxisValues.map(value => (
                  <g
                    key={value}
                    transform={`translate(${xScale(value)}, 0)`}
                  >
                    <text x={0} y={height - margins.bottom + 20}>
                      {typeof xTickFormat === 'function' ? xTickFormat(value) : value}
                    </text>
                    <line
                      className="background-line"
                      x1={0}
                      x2={0}
                      y1={yScale(yAxisValues[yAxisValues.length - 1])}
                      y2={height - margins.bottom}
                    />
                    <line
                      className="tick-mark"
                      x1={0}
                      x2={0}
                      y1={height - margins.bottom}
                      y2={height - margins.bottom + 5}
                    />
                  </g>
                ))
              }
            </g>
            <g className="lines-container">
              {
                groups.map(([groupName, items], groupIndex) => {
                  const color = colorPalette && groupName ? colorPalette[groupName] : generic.dark;
                  return (
                    <g key={groupIndex}>
                      {
                        items.map((item, itemIndex) => {
                          let next;
                          let consecutive;
                          const hasNext = itemIndex < items.length - 1;
                          if (hasNext) {
                            next = items[itemIndex + 1];
                            consecutive = +item[x.field] + 1 === +next[x.field];
                          }
                          return (
                            <>
                              {
                                (hasNext && fillGaps)
                                  || (hasNext && consecutive && +item[y.field] && +next[y.field])
                                  ?
                                  <line
                                    className="chart-line"
                                    x1={xScale(+item[x.field])}
                                    x2={xScale(+next[x.field])}
                                    y1={yScale(+item[y.field])}
                                    y2={yScale(+next[y.field])}
                                    style={{ stroke: color }}
                                  />
                                  : null
                              }
                              {
                                +item[y.field] > 0 ?
                                  <g key={itemIndex} className="data-dot-container">
                                    <circle
                                      className="data-dot"
                                      fill={color}
                                      r={height / 200}
                                      cx={xScale(item[x.field]) || 0}
                                      cy={yScale(item[y.field]) || 0}
                                    />
                                    <circle
                                      className="data-dot-big"
                                      fill={color}
                                      r={5}
                                      cx={xScale(item[x.field]) || 0}
                                      cy={yScale(item[y.field]) || 0}
                                    />
                                    <circle
                                      fill={'transparent'}
                                      r={5}
                                      cx={xScale(item[x.field]) || 0}
                                      cy={yScale(item[y.field]) || 0}
                                      data-tip={tooltip ? tooltip(item) : undefined}
                                      data-for="line-tooltip"
                                    />
                                  </g>
                                  : null
                              }
                            </>
                          )
                        })
                      }
                    </g>
                  );
                })
              }
            </g>
          </svg>
          {
            color ?
              <div
                className="ColorLegend"
                ref={legendRef}
                style={{
                  top: headersHeight + margins.top
                }}
              >
                <h5>{color.title || 'Légende'}</h5>
                <ul className="color-legend">
                  {
                    Object.entries(colorPalette)
                      .map(([genre, color], genreIndex) => (
                        <li
                          key={genre}
                        >
                          <span className="color-box"
                            style={{ background: color }}
                          />
                          <span className="color-label">
                            {genre}
                          </span>
                        </li>
                      ))
                  }
                </ul>
              </div>
              : null
          }
        </div>
      </figure>
      <Tooltip id="line-tooltip" />
    </>
  )
}
export default LineChart;