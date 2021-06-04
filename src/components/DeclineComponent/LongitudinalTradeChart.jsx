import * as d3 from "d3";
import { range } from "lodash";
import { useEffect, useRef, useState } from "react";
import { ProductsDistributionChart } from "./ProductsDistributionChart";

// TODO: refacto fields props to ease exports/Imports switch

const PRODUCT_TRADE_PART_TRESHOLD = 0.9;

const LongitudinalTradeChart = ({
  data,
  // possible extension
  productsData,
  // fields: if null, viz will not show the corresponding data
  absoluteField,
  shareField,
  herfindhalField,
  // for axes
  absoluteLabel,
  shareLabel,
  // TODO: update on resize in parent ?
  width,
  height,
}) => {
  const margin = { top: 20, right: 50, bottom: 30, left: 50 };
  const xBand = d3
    .scaleBand()
    .domain(range(...d3.extent(data.map((d) => +d.year))))
    .range([margin.left, width - margin.right])
    .padding(0.1);
  const herfindhalScale = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => +d[herfindhalField]))
    .range([0, 0.8]);
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
      .filter((y) => y % 5 === 0 && y !== 1790)
      .concat([1789]);
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
        .attr("fill", (d) =>
          herfindhalField && d[herfindhalField]
            ? d3.rgb(200, 50, 0, herfindhalScale(+d[herfindhalField]))
            : "lightgrey"
        )
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
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", line);
    }
  }, [data, svgNode]);

  //TODO: make that a prop or a config
  const productVizHeight = 600;

  // pass herfindhal for products chart color
  const her1750 = (data.filter((d) => d.year === "1750")[0] || {})[
    herfindhalField
  ];
  const her1789 = (data.filter((d) => d.year === "1789")[0] || {})[
    herfindhalField
  ];

  return (
    <>
      <svg ref={svgNode} width={width} height={height}></svg>
      {/* TODO: make year display generic peeking what's in the data ? */}
      {productsData && (
        <div
          style={{
            position: "relative",
            height: productVizHeight,
            width: `${width}px`,
            textAlign: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              right: width - xBand(1750) - xBand.bandwidth(),
            }}
          >
            <ProductsDistributionChart
              data={productsData.filter((d) => d.year === "1750")}
              field="Exports"
              partTreshold={PRODUCT_TRADE_PART_TRESHOLD}
              height={productVizHeight}
              barWidth={xBand.bandwidth()}
              color={
                her1750
                  ? d3.rgb(200, 50, 0, herfindhalScale(+her1750))
                  : "lightgrey"
              }
              labelFirst={true}
            />
          </div>

          <div style={{ position: "absolute", left: xBand(1789) }}>
            <ProductsDistributionChart
              data={productsData.filter((d) => d.year === "1789")}
              field="Exports"
              partTreshold={PRODUCT_TRADE_PART_TRESHOLD}
              height={productVizHeight}
              barWidth={xBand.bandwidth()}
              color={
                her1789
                  ? d3.rgb(200, 50, 0, herfindhalScale(+her1789))
                  : "lightgrey"
              }
            />
          </div>
          <h4>
            Noms des produits totalisant {PRODUCT_TRADE_PART_TRESHOLD * 100}% du
            commerce{" "}
          </h4>
        </div>
      )}
    </>
  );
};
export default LongitudinalTradeChart;
