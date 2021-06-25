import { scalePow, scaleBand, scaleLinear } from "d3-scale";
import { range } from "lodash";
import {extent, max} from 'd3-array';
import { useMemo, useRef } from "react";
import {axisPropsFromTickScale} from 'react-d3-axis';

import colorsPalettes from "../../colorPalettes";

const LongitudinalTradeChart = ({
  data: inputData,
  // fields: if null, viz will not show the corresponding data
  absoluteField,
  shareField,
  herfindhalField,
  // for axes
  absoluteLabel,
  shareLabel,

  width,
  height: wholeHeight,
  productsHeight,

  startYear,
  endYear,
  fillGaps,

  title,
}) => {
  const data = useMemo(() => inputData.filter(d => +d.year >= startYear & +d.year <= endYear), [startYear, endYear, inputData])
  const titleRef = useRef(null);
  let height = wholeHeight;
  if (titleRef && titleRef.current) {
    height = wholeHeight - titleRef.current.getBoundingClientRect().height;
  }

  const margin = { top: 20, right: 50, bottom: 30, left: 50 };
  const yearsExtent = extent(data.map((d) => +d.year));
  const yearsEnumerated = range(...yearsExtent);

  const xBand = scaleBand()
    .domain([...yearsEnumerated, endYear, endYear + 1])
    .range([margin.left, width - margin.right])
    .padding(0.1);
  const herfindhalColorScale = scalePow()
    .domain(extent(data, (d) => +d[herfindhalField]))
    .range([colorsPalettes.generic.accent2, 'grey']);
  const herfindhalOpacityScale = herfindhalColorScale.copy()
  .range([1, 0.5])
  const svgNode = useRef();

  const yearDomain = xBand.domain().map((y) => +y);
  const yearTicks = yearDomain
      .filter((y) => y % 5 === 0)
  const yAbsoluteScale = scaleLinear()
    .domain([0, max(data, (d) => +d[absoluteField])])
    .nice()
    .range([height - margin.bottom, margin.top]);
  const yShareScale = scaleLinear()
      .domain([0, max(data, (d) => +d[shareField])])
      .nice()
      .range([height - margin.bottom, margin.top]);

  const {values: rightYAxisValues} = axisPropsFromTickScale(yAbsoluteScale, Math.round(height / 20));
  const {values: leftYAxisValue} = axisPropsFromTickScale(yShareScale, Math.round(height / 20));
  return (
    <div className="LongitudinalTradeChart">
      <h3 ref={titleRef}>{title}</h3>
      <svg ref={svgNode} width={width} height={height}>
        <g
          className="axis axis-left"
        >
          {
            leftYAxisValue.map(value => {
              return (
                <g className="axis-group">
                  <line
                    x1={margin.left * .8}
                    x2={margin.left}
                    y1={yShareScale(value)}
                    y2={yShareScale(value)}
                    stroke={'black'}
                  />
                  <line
                    x1={margin.left}
                    x2={width - margin.right}
                    y1={yShareScale(value)}
                    y2={yShareScale(value)}
                    stroke={'grey'}
                    strokeDasharray={'2, 2'}
                    opacity={.2}
                  />
                  <text
                    x={margin.left * .7}
                    y={yShareScale(value) + height / 100}
                    fill={'black'}
                  >
                    {Math.round(+value * 100) + '%'}
                  </text>
                </g>
              )
            })
          }
        </g>
        <g
          className="axis axis-right"
        >
          {
            rightYAxisValues.map(value => {
              return (
                <g className="axis-group">
                  <line
                    x1={xBand(yearTicks[0]) + xBand.bandwidth() / 2}
                    x2={width - margin.right}
                    y1={yAbsoluteScale(value)}
                    y2={yAbsoluteScale(value)}
                    stroke={colorsPalettes.generic.accent1}
                    strokeDasharray={'4, 2'}
                    opacity={.5}
                  />
                  <text
                    x={width - margin.right + 2}
                    y={yAbsoluteScale(value) + height / 100}
                    fill={colorsPalettes.generic.accent1}
                  >
                    {value > 0 ? Math.round(value/1000000) + 'm livres t.' : 0}
                  </text>
                </g>
              )
            })
          }
        </g>
        <g className="axis axis-bottom">
          <line
            y1={height - margin.bottom}
            y2={height - margin.bottom}
            x1={xBand(yearTicks[0]) + xBand.bandwidth() / 2}
            x2={width - margin.right}
            stroke={'black'}
          />
          {
            yearTicks
            .map(year => {
              const x = xBand(year) + xBand.bandwidth() / 2;
              const y = height - margin.bottom;
              return (
                <g
                  key={year}
                  className="axis-group"
                  transform={`translate(${x}, ${y})`}
                >
                  <line
                    x1={0}
                    x2={0}
                    y1={0}
                    y2={margin.bottom / 3}
                    stroke="black"
                  />
                  <text y={2 * margin.bottom / 3}>
                    {year}
                  </text>
                </g>
              )
            })
          }
        </g>

        <g className="bars-container">
          {
            data.map((d) => {
              return (
                <rect
                  key={d.year}
                  x={xBand(+d.year)}
                  y={yShareScale(d[shareField])}
                  width={xBand.bandwidth()}
                  height={yShareScale(0) - yShareScale(d[shareField])}
                  fill={herfindhalField && d[herfindhalField] ? herfindhalColorScale(+d[herfindhalField]) : colorsPalettes.generic.dark}
                  opacity={herfindhalField && d[herfindhalField]
                          ? herfindhalOpacityScale(+d[herfindhalField])
                          : 1}
                />
              )
            })
          }
        </g>

        <g
          className="lines-container"
        >
          {
            data
            .sort((a, b) => {
              if (+a.year > +b.year) {
                return 1;
              }
              return -1;
            })
            .filter((d, index) => {
              const next = data[index + 1];
              return index < data.length - 1
              && (fillGaps ? true : +next.year === +d.year + 1)
            })
            .map((datum, index) => {
              const next = data[index + 1];
              const x1 = xBand(+datum.year) + xBand.bandwidth() / 2;
              const x2 = xBand(+next.year)+ xBand.bandwidth() / 2;
              const y1 = yAbsoluteScale(+datum[absoluteField]);
              const y2 = yAbsoluteScale(+next[absoluteField]);
              if (!+datum[absoluteField] || !+next[absoluteField]) {
                return null;
              }
              return (
                 <line
                   key={datum.year}
                   {
                     ...{
                       x1,
                       x2,
                       y1,
                       y2
                     }
                   }
                   stroke={colorsPalettes.generic.accent1}
                   title={`${datum.year}-${next.year}`}
                   strokeWidth={2}
                 />
              )
            })
          }

        </g>
        
      </svg>
    </div>
  );
};
export default LongitudinalTradeChart;
