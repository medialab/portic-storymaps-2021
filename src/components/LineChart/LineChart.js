
import { scaleLinear } from 'd3-scale';
import { extent, range, max } from 'd3-array';
import { useRef, useState, useEffect } from 'react';
import { groupBy } from 'lodash';
import { axisPropsFromTickScale } from 'react-d3-axis';
import Tooltip from 'react-tooltip';
import { uniq } from 'lodash';

import colorsPalettes from '../../colorPalettes';
import { fixSvgDimension, generatePalette } from '../../helpers/misc';

import './LineChart.scss';

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
 * @param {array} annotations
 * @params {string} annotations[n].type ['span]
 * @params {number} annotations[n].start
 * @params {number} annotations[n].end
 * @params {string} annotations[n].axis ['x', 'y']
 * @params {string} annotations[n].label
 * 
 * @param {function} tooltip
 * 
 * @returns {React.ReactElement} - React component 
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
  margins: inputMargins = {},
  annotations = []
}) => {
  const [headersHeight, setHeadersHeight] = useState(0);
  const [legendWidth, setLegendWidth] = useState(0);

  const legendRef = useRef(null);
  const headerRef = useRef(null);
  
  const width = fixSvgDimension(initialWidth - legendWidth);
  const height = fixSvgDimension(initialHeight - headersHeight);

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

  const xScale = scaleLinear().domain(xDomain).range([margins.left, width - margins.right]).nice();
  const yScale = scaleLinear().domain(yDomain).range([height - margins.bottom, margins.top]).nice();
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
              <text x={margins.left - 10} y={margins.top - 10} className="axis-title">
                {y.title || y.field}
              </text>
              {
                yAxisValues.map((value, valueIndex) => (
                  <g
                    key={value}
                    transform={`translate(0, ${yScale(value)})`}
                  >
                    <text x={margins.left - 10} y={3}>
                      {typeof yTickFormat === 'function' ? yTickFormat(value, valueIndex) : value}
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
                xAxisValues.map((value, valueIndex) => (
                  <g
                    key={value}
                    transform={`translate(${xScale(value)}, 0)`}
                  >
                    <text x={0} y={height - margins.bottom + 20}>
                      {typeof xTickFormat === 'function' ? xTickFormat(value, valueIndex) : value}
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
            <g className="annotations-container">
              {
                annotations
                .filter(a => a.axis === 'x')
                .map((annotation, annotationIndex) => {
                  const {start, end, label, labelPosition = 20} = annotation;
                  const thatHeight = height - yScale(yAxisValues[yAxisValues.length - 1]) - margins.bottom;
                  const thatY1 = height - margins.bottom;
                  const thatY2 = yScale(yAxisValues[yAxisValues.length - 1]);
                  return (
                    <g className="annotation x-axis-annotation" key={annotationIndex}>
                      <rect
                        x={xScale(start)}
                        width={xScale(end) - xScale(start)}
                        height={thatHeight}
                        y={thatY2}
                        fill="url(#diagonalHatch)"
                        opacity={.4}
                      />
                      <line
                        x1={xScale(start)}
                        x2={xScale(start)}
                        y1={thatY1}
                        y2={thatY2}
                        stroke="grey"
                        opacity={.4}
                        strokeDasharray={'4,2'}
                      />
                      <line
                        x1={xScale(end)}
                        x2={xScale(end)}
                        y1={thatY1}
                        y2={thatY2}
                        stroke="grey"
                        opacity={.4}
                        strokeDasharray={'4,2'}
                      />
                      <line 
                        x1={xScale(end) + 20} 
                        x2={xScale(end) + 10} 
                        y1={thatY2 + labelPosition - 5}
                        y2={thatY2 + labelPosition - 5}
                        stroke="grey" 
                        markerEnd="url(#arrowhead)" 
                      />
                      <text
                        x={xScale(end) + 22}
                        y={thatY2 + labelPosition}
                        fontSize={'.5rem'}
                        fill="grey"
                      >
                        {label}
                      </text>
                      <defs>
                        <marker id="arrowhead" markerWidth="5" markerHeight="5" 
                        refX="0" refY="2.5" orient="auto">
                          <polygon stroke="grey" fill="transparent" points="0 0, 5 2.5, 0 5" />
                        </marker>
                      </defs>
                      <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="4" height="4">
                      <path d="M-1,1 l2,-2
                              M0,4 l4,-4
                              M3,5 l2,-2" 
                            style={{stroke:'grey', opacity: .5, strokeWidth:1}} />
                    </pattern>

                    </g>
                  )
                })
              }
              {
                annotations
                .filter(a => a.axis === 'y')
                .map((annotation, annotationIndex) => {
                  const {start, end, label, labelPosition = 20} = annotation;
                  const thatX1 = margins.left;
                  const thatX2 = xScale(xAxisValues[xAxisValues.length - 1]);
                  return (
                    <g className="annotation y-axis-annotation" key={annotationIndex}>
                      <rect
                        x={thatX1}
                        width={thatX2 - thatX1}
                        y={yScale(start)}
                        height={Math.abs(yScale(end) - yScale(start))}
                        fill="url(#diagonalHatch)"
                        opacity={.4}
                      />
                       <line
                        x1={thatX1}
                        x2={thatX2}
                        y1={yScale(start)}
                        y2={yScale(start)}
                        stroke="grey"
                        opacity={.4}
                        strokeDasharray={'4,2'}
                      />
                      <line
                        x1={thatX1}
                        x2={thatX2}
                        y1={yScale(end)}
                        y2={yScale(end)}
                        stroke="grey"
                        opacity={.4}
                        strokeDasharray={'4,2'}
                      />
                      <line 
                        x1={thatX1 + labelPosition - 5} 
                        x2={thatX1 + labelPosition - 5} 
                        y1={yScale(start) - 15}
                        y2={yScale(start) - 5}
                        stroke="grey" 
                        markerEnd="url(#arrowhead)" 
                      />
                     <text
                        x={thatX1 + labelPosition}
                        y={yScale(start) - 10}
                        fontSize={'.5rem'}
                        fill="grey"
                      >
                        {label}
                      </text>
                      <defs>
                        <marker id="arrowhead" markerWidth="5" markerHeight="5" 
                        refX="0" refY="2.5" orient="auto">
                          <polygon stroke="grey" fill="transparent" points="0 0, 5 2.5, 0 5" />
                        </marker>
                      </defs>
                      <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="4" height="4">
                      <path d="M-1,1 l2,-2
                              M0,4 l4,-4
                              M3,5 l2,-2" 
                            style={{stroke:'grey', opacity: .5, strokeWidth:1}} />
                    </pattern>

                    </g>
                  )
                })
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