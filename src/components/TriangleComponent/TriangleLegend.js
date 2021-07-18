


const TriangleLegend = ({
  legendWidth,
  totalWidth,
  totalHeight,
  legendTriangleWidth,
  legendTriangleHeight,
  rowHeight,
  fontSize,
}) => {
  return (
    <g className="TriangleLegend" width={legendWidth} transform={`translate(${legendWidth * totalWidth * 0.5}, ${totalHeight * 2.3})`} >
      <g classname="arrows">
        <path
          d={`M ${(legendWidth - legendTriangleWidth) / 2} ${(rowHeight - legendTriangleHeight) / 1.2} 
                    H ${(legendWidth - legendTriangleWidth) / 2 + legendTriangleWidth}
                    L ${legendWidth / 2} ${(rowHeight - legendTriangleHeight) / 1.2 + legendTriangleHeight}
                    Z
                    `}
        />

        <g className="top-arrow">
          <defs>
            <marker id="triangle-left" viewBox="0 0 10 10"
              refX="1" refY="5"
              markerUnits="strokeWidth"
              markerWidth={legendWidth * totalWidth * 0.08} markerHeight={rowHeight * 0.04}
              orient="auto">
              <path d="M 10 0 L 0 5 L 10 10 Z" fill="black" />
            </marker>
            <marker id="triangle-right" viewBox="-10 0 10 10"
              refX="1" refY="5"
              markerUnits="strokeWidth"
              markerWidth={legendWidth * totalWidth * 0.08} markerHeight={rowHeight * 0.04}
              orient="auto">
              <path d="M -10 0 L 0 5 L -10 10 Z" fill="black" />
            </marker>
          </defs>
          <path d={`M ${(legendWidth - legendTriangleWidth) / 2} ${(rowHeight - legendTriangleHeight) / 1.3}  
                H ${(legendWidth - legendTriangleWidth) / 2 + legendTriangleWidth}
                `} stroke="black" strokeWidth={1} marker-start="url(#triangle-left)" marker-end="url(#triangle-right)" />
        </g>

        <g className="left-arrow">
          <defs>
            <marker id="triangle-left" viewBox="-10 0 10 10"
              refX="1" refY="5"
              markerUnits="strokeWidth"
              markerWidth={legendWidth * totalWidth * 0.08} markerHeight={rowHeight * 0.04}
              orient="auto">
              <path d="M 0 0 L -10 5 L 0 10 Z" fill="black" />
            </marker>
            <marker id="triangle-right" viewBox="0 0 10 10"
              refX="1" refY="5"
              markerUnits="strokeWidth"
              markerWidth={legendWidth * totalWidth * 0.08} markerHeight={rowHeight * 0.04}
              orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 Z" fill="black" />
            </marker>
          </defs>
          <path d={`M ${(legendWidth - legendTriangleWidth) / 1.6} ${(rowHeight - legendTriangleHeight) / 1.2}  
                V ${(rowHeight - legendTriangleHeight) / 1.2 + legendTriangleHeight}
                `} stroke="black" strokeWidth={1} marker-start="url(#triangle-left)" marker-end="url(#triangle-right)" />
        </g>

      </g>

      <g className="textLegend">
        {/* <text className="legendTitle"
        // transformOrigin="top left"
        // transform="rotate (-45)"
        font-size={totalHeight * 0.07}
        font-weight="bold"
        // x={legendWidth / 2}
        x={0}
        y={(rowHeight - legendTriangleHeight) / 2}
      // text-anchor="left"
      > Légende </text> */}

        <g transform={`translate(${legendWidth / 2 + fontSize / 2}, ${(rowHeight - legendTriangleHeight) / 1.4})`}>
          <text className="legendContent"
            font-size={fontSize}
          > nombre de navires</text>
        </g>

        <g transform={`translate(${(legendWidth - legendTriangleWidth) / 1.2}, ${(rowHeight - legendTriangleHeight) / 1.2 + legendTriangleHeight / 2})`}>
          <text className="legendContent"
            font-size={fontSize}
          > tonnage moyen des navires </text>
        </g>
      </g>

    </g>

  )
}


export default TriangleLegend;