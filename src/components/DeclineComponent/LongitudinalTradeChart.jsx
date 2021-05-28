import * as d3 from "d3";
import { useEffect, useRef } from "react";

// props
// share Serie : { label: string,  color:string, data: [{value: number, year:number}]}
// absolute Serie : { label: string, color:string, data:  [{value: number, year:number}]}


const LongitudinalTradeChart = ({data, absoluteField, shareField, herfindhalField, absoluteLabel, shareLabel, width, height }) => {
    
    const svgNode = useRef()
    useEffect(()=>{
        const svgPath = d3.select(svgNode.current)
      .attr("viewBox", [0, 0, width, height])
      .attr("fill", "none")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round");
      // clean SVG
      svgPath.selectAll("*").remove();
    const margin = ({top: 20, right: 50, bottom: 30, left: 50})
    // X AXIS 
    const yearsDomain = d3.extent(data, d => +d.year);
    const x = d3.scaleLinear()
        .domain(yearsDomain)
        .range([margin.left, width - margin.right])
    const xBand = d3.scaleBand()
        .domain(data.map(d => d.year))
        .range([margin.left, width - margin.right])
        .padding(0.1)
    
    const xAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xBand).ticks(xBand.bandwidth() / 80).tickSizeOuter(0))
    svgPath.append("g")
      .call(xAxis);

    if (data.length > 0){
        console.log(data);
        // LINE PATH FOR ABSOLUTE
        // Y AXIS 
        const yAbsolute = d3.scaleLinear()
            .domain([0, d3.max(data, d => +d[absoluteField])]).nice()
            .range([height - margin.bottom, margin.top])
        const absoluteYAxis = g => g
            .attr("transform", `translate(${width - margin.right},0)`)
            .call(d3.axisRight(yAbsolute))
            .call(g => g.select(".domain").remove())
            .call(g => g.select(".tick:last-of-type text").clone()
            .attr("x", 3)
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .text(absoluteLabel))
        svgPath.append("g")
            .call(absoluteYAxis);
        // LINE
        const line = d3.line()
            .x(d => xBand(+d.year)+xBand.bandwidth()/2)
            .y(d => yAbsolute(+d[absoluteField]))

        svgPath.append("path")
            .datum(data)
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", line);
    
        // RECT for share series
        // Y AXIS 
        const yShare = d3.scaleLinear()
            .domain([0, d3.max(data, d => +d[shareField])]).nice()
            .range([height - margin.bottom, margin.top])
        const shareYAxis = g => g
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(yShare))
            .call(g => g.select(".domain").remove())
            .call(g => g.select(".tick:last-of-type text").clone()
            .attr("x", 3)
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .text(shareLabel))
        svgPath.append("g")
            .call(shareYAxis);
        // BARS
        const herfindhalScale =  d3.scaleLinear().domain(d3.extent(data, d => +d[herfindhalField])).range([0.1,0.7])
        svgPath.append("g")
            .selectAll("rect")
            .data(data)
            .join("rect")
            .attr("fill", (d) => herfindhalField ? d3.rgb(0,0,0, herfindhalScale(+d[herfindhalField])) : "pink")
            .attr("x", (d) => xBand(+d.year))
            .attr("y", d => yShare(d[shareField]))
            .attr("height", d => yShare(0) - yShare(d[shareField]))
            .attr("width", xBand.bandwidth());
    }

    }, [data, svgNode])
    
    return <svg ref={svgNode} width={width} height={height}></svg>
};
export default LongitudinalTradeChart;