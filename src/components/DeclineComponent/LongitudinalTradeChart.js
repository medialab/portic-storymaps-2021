import * as d3 from "d3";
import { range } from "lodash";
import { useEffect, useMemo, useRef } from "react";

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

  title,
}) => {
  const data = useMemo(() => inputData.filter(d => +d.year >= startYear & +d.year <= endYear), [startYear, endYear, inputData])
  const titleRef = useRef(null);
  let height = wholeHeight;
  if (titleRef && titleRef.current) {
    height = wholeHeight - titleRef.current.getBoundingClientRect().height;
  }

  const margin = { top: 20, right: 50, bottom: 30, left: 50 };
  const yearsExtent = d3.extent(data.map((d) => +d.year));
  const yearsEnumerated = range(...yearsExtent);

  const xBand = d3
    .scaleBand()
    .domain([...yearsEnumerated, endYear, endYear + 1])
    .range([margin.left, width - margin.right])
    .padding(0.1);
  const herfindhalScale = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => +d[herfindhalField]))
    .range([0, 1]);
  const svgNode = useRef();
  useEffect(() => {
    const svgPath = d3
      .select(svgNode.current)
      .attr("viewBox", [0, 0, width, height])
      .attr("fill", "none")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round");
    // clean SVG
    svgPath.selectAll("*").remove();

    // X AXIS

    const yearDomain = xBand.domain().map((y) => +y);
    const yearTicks = yearDomain
      .filter((y) => y % 5 === 0 /*&& y !== endYear + 2*/)
      // .concat([endYear + 1]);
    const xAxis = (g) =>
      g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xBand).tickValues(yearTicks).tickSizeOuter(0));

    svgPath.append("g").call(xAxis);

    if (data.length > 0) {
      // LINE PATH FOR ABSOLUTE
      // Y AXIS
      const yAbsolute = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => +d[absoluteField])])
        .nice()
        .range([height - margin.bottom, margin.top]);
      const absoluteYAxis = (g) =>
        g
          .attr("transform", `translate(${width - margin.right},0)`)
          .call(d3.axisRight(yAbsolute))
          .call((g) => g.select(".domain").remove())
          .call((g) =>
            g
              .select(".tick:last-of-type text")
              .clone()
              .attr("x", 3)
              .attr("text-anchor", "start")
              .attr("font-weight", "bold")
              .text(absoluteLabel)
          );
      svgPath.append("g").call(absoluteYAxis);
      // RECT for share series
      // Y AXIS
      const yShare = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => +d[shareField])])
        .nice()
        .range([height - margin.bottom, margin.top]);
      const shareYAxis = (g) =>
        g
          .attr("transform", `translate(${margin.left},0)`)
          .call(d3.axisLeft(yShare))
          .call((g) => g.select(".domain").remove())
          .call((g) =>
            g
              .select(".tick:last-of-type text")
              .clone()
              .attr("x", 3)
              .attr("text-anchor", "start")
              .attr("font-weight", "bold")
              .text(shareLabel)
          );
      svgPath.append("g").call(shareYAxis);
      // BARS

      svgPath
        .append("g")
        .selectAll("rect")
        .data(data)
        .join("rect")
        .attr("fill", colorsPalettes.generic.dark)
        .attr('opacity', d => herfindhalField && d[herfindhalField]
        ? herfindhalScale(+d[herfindhalField])
        : 1)
        .attr("x", (d) => xBand(+d.year))
        .attr("y", (d) => yShare(d[shareField]))
        .attr("height", (d) => yShare(0) - yShare(d[shareField]))
        .attr("width", xBand.bandwidth());
      // LINE
      const line = d3
        .line()
        .defined((d) => d[absoluteField] !== "")
        .x((d) => xBand(+d.year) + xBand.bandwidth() / 2)
        .y((d) => yAbsolute(+d[absoluteField]));

      svgPath
        .append("path")
        .datum(data)
        .attr("stroke", colorsPalettes.generic.accent2)
        .attr("stroke-width", 1.5)
        .attr("d", line);
    }
  }, [data, svgNode]);/* eslint react-hooks/exhaustive-deps : 0 */

  return (
    <div className="LongitudinalTradeChart">
      <h3 ref={titleRef}>{title}</h3>
      <svg ref={svgNode} width={width} height={height}></svg>
    </div>
  );
};
export default LongitudinalTradeChart;
