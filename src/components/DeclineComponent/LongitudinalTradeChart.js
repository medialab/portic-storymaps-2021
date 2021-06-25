import { scalePow, scaleBand, scaleLinear } from "d3-scale";
import { range } from "lodash";
import {extent, max} from 'd3-array';
import { useMemo, useRef, useState, useEffect } from "react";
import {axisPropsFromTickScale} from 'react-d3-axis';

import ReactTooltip from 'react-tooltip';

import colorsPalettes from "../../colorPalettes";

const LongitudinalTradeChart = ({
  data: inputData,
  // fields: if null, viz will not show the corresponding data
  absoluteField,
  shareField,
  herfindhalField,

  width,
  height: wholeHeight,
  axisLeftTitle,
  axisRightTitle,

  startYear,
  endYear,
  fillGaps,
  barTooltipFn,
  cityName,

  title,
  colorScaleMessages,
  margins
}) => {
  const data = useMemo(() => inputData.filter(d => +d.year >= startYear & +d.year <= endYear), [startYear, endYear, inputData])
  const headerRef = useRef(null);
  const footerRef = useRef(null);
  const [height, setHeight] = useState(wholeHeight);
  useEffect(() => {
    // handling ref updates to set the correct height
    setTimeout(() => {
      let newHeight = wholeHeight;
      if (headerRef && headerRef.current) {
        newHeight = wholeHeight - headerRef.current.offsetHeight;
        if (footerRef && footerRef.current) {
          newHeight -= footerRef.current.offsetHeight;;
        }
      }
      setHeight(newHeight);
      ReactTooltip.rebuild();
    })
    
  }, [wholeHeight])
  

  const yearsExtent = extent(data.map((d) => +d.year));
  const yearsEnumerated = range(...yearsExtent);

  const xBand = scaleBand()
    .domain([...yearsEnumerated, endYear, endYear + 1])
    .range([margins.left, width - margins.right])
    .padding(0.1);
  const herfindhalColorScale = scalePow()
    .domain(extent(data, (d) => +d[herfindhalField]))
    .range([colorsPalettes.generic.accent2, 'grey']);
  // const herfindhalOpacityScale = herfindhalColorScale.copy()
  // .range([1, 0.5])

  const yearDomain = xBand.domain().map((y) => +y);
  const yearTicks = yearDomain
      .filter((y) => y % 5 === 0)
  const yAbsoluteScale = scaleLinear()
    .domain([0, max(data, (d) => +d[absoluteField])])
    .nice()
    .range([height - margins.bottom, margins.top]);
  const yShareScale = scaleLinear()
      .domain([0, max(data, (d) => +d[shareField])])
      .nice()
      .range([height - margins.bottom, margins.top]);

  const {values: rightYAxisValues} = axisPropsFromTickScale(yAbsoluteScale, Math.round(height / 20));
  const {values: leftYAxisValue} = axisPropsFromTickScale(yShareScale, Math.round(height / 20));
  return (
    <div className="LongitudinalTradeChart">
      <div className="chart-header" ref={headerRef}>
        <h3 style={{marginLeft: margins.left}}>{title}</h3>
        <div className="axis-headers-container">
          <div style={{background: axisLeftTitle && axisLeftTitle.length ? colorsPalettes.generic.accent2 : undefined}} className="axis-header axis-header-left">
            {axisLeftTitle}
          </div>
          {
            colorScaleMessages ?
            <div className="color-scale-container">
              <div className="color-scale-detail">
                <div 
                  className="bar"
                  style={{
                    background: `linear-gradient(to right, ${herfindhalColorScale(herfindhalColorScale.domain()[0])}, ${herfindhalColorScale(1)})`
                  }}
                />
                <div className="labels">
                  <span>{colorScaleMessages.maximum}</span>
                  {/* <span>{colorScaleMessages.title}</span> */}
                  <span>{colorScaleMessages.minimum}</span>
                </div>
              </div>
            </div>
            : null
          }
          <div style={{background: axisRightTitle && axisRightTitle.length ? colorsPalettes.generic.accent1 : undefined}} className="axis-header axis-header-right">
            {axisRightTitle}
          </div>
        </div>
      </div>
      <svg width={width} height={height}>
        <g
          className="axis axis-left"
        >
          {
            leftYAxisValue.map(value => {
              return (
                <g className="axis-group">
                  <line
                    x1={margins.left * .8}
                    x2={margins.left}
                    y1={yShareScale(value)}
                    y2={yShareScale(value)}
                    stroke={'grey'}
                  />
                  <line
                    x1={margins.left}
                    x2={width - margins.right}
                    y1={yShareScale(value)}
                    y2={yShareScale(value)}
                    stroke={'grey'}
                    strokeDasharray={'2, 2'}
                    opacity={.2}
                  />
                  <text
                    x={margins.left * .7}
                    y={yShareScale(value) + height / 100}
                    fill={'grey'}
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
                    x2={width - margins.right}
                    y1={yAbsoluteScale(value)}
                    y2={yAbsoluteScale(value)}
                    stroke={colorsPalettes.generic.accent1}
                    strokeDasharray={'4, 2'}
                    opacity={.5}
                  />
                  <text
                    x={width - margins.right + 2}
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
            y1={height - margins.bottom}
            y2={height - margins.bottom}
            x1={xBand(yearTicks[0]) + xBand.bandwidth() / 2}
            x2={xBand(yearTicks[yearTicks.length - 1]) + xBand.bandwidth() / 2}
            stroke={'grey'}
          />
          {
            yearTicks
            .map(year => {
              const x = xBand(year) + xBand.bandwidth() / 2;
              const y = height - margins.bottom;
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
                    y2={margins.bottom / 3}
                    stroke="grey"
                  />
                  <g 
                    transform={`translate(${(xBand.bandwidth() * .5)}, ${margins.bottom / 2})`}
                  >
                  <text>
                    {year}
                  </text>
                  </g>
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
                  // opacity={herfindhalField && d[herfindhalField]
                  //         ? herfindhalOpacityScale(+d[herfindhalField])
                  //         : 1}
                  data-tip={barTooltipFn ? 
                    barTooltipFn(d.year, (d[shareField] * 100).toFixed(2), cityName, d[herfindhalField] && (+d[herfindhalField] || 0).toFixed(2)) 
                    .replace('[colorBox]', `<span style="display:inline-block;width: .8em;height:.8em;background:${herfindhalColorScale(+d[herfindhalField] || 0)}"></span>`)
                    : undefined}
                  data-for={cityName}
                  data-effect="solid"
                  data-html={true}
                  data-class="bar-tooltip"
                  data-place="left"
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
                   data-tip={`${datum.year}-${next.year} : ${parseInt(+datum[absoluteField])} → ${parseInt(+next[absoluteField])} livres tournois`}
                    data-for={cityName}
                    data-class="bar-tooltip"
                 />
              )
            })
          }

        </g>
        
      </svg>


      <ReactTooltip id={cityName} />
      
    </div>
  );
};
export default LongitudinalTradeChart;
