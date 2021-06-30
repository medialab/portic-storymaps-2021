
import { scaleLinear } from 'd3-scale';
import { range, max } from 'd3-array';
import { useRef, useState, useEffect } from 'react';
import { groupBy } from 'lodash';
import { axisPropsFromTickScale } from 'react-d3-axis';
import Tooltip from 'react-tooltip';
import { uniq } from 'lodash';

import colorsPalettes from '../../colorPalettes';
import { generatePalette } from '../../helpers/misc';

const { generic } = colorsPalettes;


const VerticalBarChart = ({
  data,
  title,
  orientation = 'horizontal',
  layout = 'stack',
  width : initialWidth = 1200,
  height: initialHeight = 1200,
  color,
  y,
  x,
  tooltip,
  margins: inputMargins = {},
  formatLabel
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
    tickFormat: xTickFormat,
    tickSpan: xTickSpan,
    domain: initialXDomain,
  } = x;
  const {
    rowHeight: fixedRowHeight
  } = y;
  let colorPalette;
  let colorModalities;
  if (color) {
    colorModalities = uniq(data.map(d => d[color.field]));
  }
  if (color && color.palette) {
    colorPalette = color.palette;
  } else if (color) {
    const colorValues = generatePalette(color.field, colorModalities.length);
    colorPalette = colorModalities.reduce((res, modality, index) => ({
      ...res,
      [modality]: colorValues[index]
    }), {})
  }
  let yValues = uniq(data.map(d => d[y.field]));
  let bandsNb = yValues.length;
  let vizHeight = (fixedRowHeight ? fixedRowHeight * (bandsNb + 1) : height) - margins.top - margins.bottom;

  let rowHeight = fixedRowHeight || vizHeight / bandsNb;

  const groups = Object.entries(groupBy(data, d => d[y.field])) ;

  const xDomain = initialXDomain || layout === 'stack' ? 
    // stack -> max = max sum for a given x modality
    [0, max(
      groups.map(
        ([_groupName, values]) => 
          values.reduce((sum, datum) => sum + +(datum[x.field]), 0)
      )
      )
    ]
    :
    // group -> max = abs max
    [0, max(data.map(d => +d[x.field]))];

    let bandHeight = layout === 'stack' ? rowHeight / 2 : (rowHeight / colorModalities.length) * .5;
    const xScale = scaleLinear().domain(xDomain).range([ margins.left, width - margins.left - margins.right]).nice();
    const xStackScale = xScale.copy().range([0, width - margins.left - margins.right]);

  let { values: xAxisValues } = axisPropsFromTickScale(xScale, 10);

  if (xTickSpan) {
    xDomain[0] = xDomain[0] - xDomain[0] % xTickSpan;
    xDomain[1] = xDomain[1] + (xTickSpan - xDomain[0] % xTickSpan);
    xAxisValues = range(xDomain[0], xDomain[1], xTickSpan);
    xScale.domain(xDomain);
  }
  return (
    <>
      <figure style={{width: initialWidth, height: initialHeight}} className="BarChart is-vertical GenericVisualization">
        <div ref={headerRef} className="row">
          {title ? <h5 className="visualization-title" style={{ marginLeft: margins.left }}>{title}</h5> : null}
        </div>
        <div className="row vis-row">
          <svg className="chart" width={width} height={vizHeight + margins.top + margins.bottom}>
            <g className="axis top-axis ticks">
              {
                xAxisValues.map((value, valueIndex) => (
                  <g
                    key={value}
                    transform={`translate(${xScale(value)}, 0)`}
                  >
                    <text x={0} y={margins.top - 5}>
                      {typeof xTickFormat === 'function' ? xTickFormat(value, valueIndex) : value}
                    </text>
                    <line
                      className="background-line"
                      x1={0}
                      x2={0}
                      y1={margins.top}
                      y2={height - margins.bottom}
                    />
                    <text x={0} y={height - margins.bottom + 20}>
                      {typeof xTickFormat === 'function' ? xTickFormat(value, valueIndex) : value}
                    </text>
                    {/* <line
                      className="tick-mark"
                      x1={0}
                      x2={0}
                      y1={height - margins.bottom}
                      y2={height - margins.bottom + 5}
                    /> */}
                  </g>
                ))
              }
            </g>
            <g className="bars-container">
              {
                groups.map(([yModality, items], groupIndex) => {
                  let stackDisplaceX = margins.left;
                  
                  return (
                    <g key={groupIndex} transform={`translate(0, ${margins.top + rowHeight * groupIndex})`}>
                      <text y={rowHeight / 2 + 5} className="vertical-bar-label" x={margins.left - 5}>
                        {typeof formatLabel === 'function' ? formatLabel(yModality, groupIndex) : yModality}
                      </text>
                      {
                        items.map((item, itemIndex) => {
                          
                          const thatY = layout === 'stack' ? bandHeight / 2 : itemIndex * ((rowHeight * .5) / items.length) + rowHeight / 4;
                          const thatWidth = layout === 'stack' ? xStackScale(+item[x.field]) :  xScale(item[x.field]);
                          const thatX = layout === 'stack' ? stackDisplaceX : margins.left;
                          if (layout === 'stack') {
                            stackDisplaceX += thatWidth;
                          }
                          const thatColor = colorPalette ? colorPalette[item[color.field]] : generic.dark;
                          return (
                            <>
                              {
                                +item[y.field] > 0 ?
                                  <rect key={itemIndex}
                                    fill={thatColor}
                                    width={thatWidth}
                                    x={thatX}
                                    y={thatY}
                                    height={bandHeight}
                                    data-for="bar-tooltip"
                                    data-tip={typeof tooltip === 'function' ? tooltip(item, itemIndex, groupIndex) : undefined}
                                  />
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
                      .map(([modality, color]) => (
                        <li
                          key={modality}
                        >
                          <span className="color-box"
                            style={{ background: color }}
                          />
                          <span className="color-label">
                            {modality}
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
      <Tooltip id="bar-tooltip" />
    </>
  )
}

export default VerticalBarChart;