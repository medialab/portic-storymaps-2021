import React, { useState, useEffect } from 'react';
import { csvParse } from 'd3-dsv';
import get from 'axios';
// import { geoEqualEarth, geoPath } from "d3-geo";
// import { uniq } from 'lodash';
import { scaleLinear } from 'd3-scale';
import { max } from 'd3-array';

// import { generatePalette } from '../../helpers/misc';

import './TriangleComponent.scss'



const TriangleComponent = ({
  data,
  totalWidth = 1200,
  legendWidth = 0.1,
  margins = {
    left: 0.0,
    right: 0.09
  },
  rowHeight = 200
}) => {

  const numberOfColumns = data.length
  const columnWidth = (totalWidth * (1 - legendWidth - margins.left - margins.right)) / numberOfColumns
  const numberOfRows = data.length / numberOfColumns
  const totalHeight = numberOfRows * rowHeight

  // scaleLinear<Range = number, Output = Range, Unknown = never>(range?: Iterable<Range>): ScaleLinear<Range, Output, Unknown> (+1 overload)
  const scaleX = scaleLinear().domain([
    0,
    max(
      data.map((port) => { // data.map : boucle fonctionelle
        // return +port[xVariable];
        return +port.nb_pointcalls_out;
      })
    )
  ]).range([0, columnWidth * 5]); // @TODO : adapter pour permettre chevauchement => ne plus se limiter à la taille d'une colonne (+ centre de mon triangle à gérer)

  const scaleY = scaleLinear().domain([
    0,
    max(
      data.map((port) => {
        return +port.mean_tonnage; // parseFloat(port.mean_tonnage);
      })
    )
  ]).range([0, rowHeight * 0.85]); // pour l'instant j'ai mis le max de longueur à 85% de la hauteur du rectangle conteneur 
  // je pourrais faire  range([0, rowHeight - place occupée par le texte]

  const legendTriangleWidth = 35;
  const legendTriangleHeight = 60;

  return (

    <g className="TriangleComponent" width={totalWidth} height={totalHeight} transform={`translate(0, ${totalHeight * 2.3})`} style={{ border: '1px solid lightgrey' }}>
      <g className="legend" width={legendWidth} transform={`translate(${legendWidth * totalWidth * 0.5}, 0)`} >

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
              markerWidth={legendWidth*totalWidth*0.08} markerHeight={rowHeight*0.04}
              orient="auto">
              <path d="M 10 0 L 0 5 L 10 10 Z" fill="black" />
            </marker>
            <marker id="triangle-right" viewBox="-10 0 10 10"
              refX="1" refY="5"
              markerUnits="strokeWidth"
              markerWidth={legendWidth*totalWidth*0.08} markerHeight={rowHeight*0.04}
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
              markerWidth={legendWidth*totalWidth*0.08} markerHeight={rowHeight*0.04}
              orient="auto">
              <path d="M 0 0 L -10 5 L 0 10 Z" fill="black" />
            </marker>
            <marker id="triangle-right" viewBox="0 0 10 10"
              refX="1" refY="5"
              markerUnits="strokeWidth"
              markerWidth={legendWidth*totalWidth*0.08} markerHeight={rowHeight*0.04}
              orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 Z" fill="black" />
            </marker>
          </defs>
          <path d={`M ${(legendWidth - legendTriangleWidth) / 1.6} ${(rowHeight - legendTriangleHeight) / 1.2}  
                    V ${(rowHeight - legendTriangleHeight) / 1.2 + legendTriangleHeight}
                    `} stroke="black" strokeWidth={1} marker-start="url(#triangle-left)" marker-end="url(#triangle-right)" />
        </g>

      </g>
      <g className="triangles" width={totalWidth * (1 - margins.left - margins.right - legendWidth)} transform={`translate(${(legendWidth + margins.left) * totalWidth}, 0)`}>
        {
          data.map((port, index) => {

            const triangleWidth = scaleX(+port.nb_pointcalls_out)
            const triangleHeight = scaleY(+port.mean_tonnage)

            const xIndex = index % numberOfColumns;
            const yIndex = (index - index % numberOfColumns) / numberOfColumns;
            const xTransform = xIndex * columnWidth;
            const yTransform = yIndex * rowHeight;

            return (
              <g
                key={index}
                // transform={`translate(${(index) * (columnWidth)}, ${height * .33 + (index%3)*(rowHeight)})`}
                transform={`translate(${xTransform}, ${yTransform})`}
              >
                <rect
                  x={0}
                  y={0}
                  width={columnWidth}
                  height={rowHeight}
                />

                <path class='horizontalLine'
                  d={`M ${columnWidth / 2} ${(rowHeight - triangleHeight) / 1.2} 
                        V ${rowHeight / 7}
                        `}
                />

                <path
                  d={`M ${(columnWidth - triangleWidth) / 2} ${(rowHeight - triangleHeight) / 1.2} 
                        H ${(columnWidth - triangleWidth) / 2 + triangleWidth}
                        L ${columnWidth / 2} ${(rowHeight - triangleHeight) / 1.2 + triangleHeight}
                        Z
                        `}
                />

                <g transformOrigin="bottom left" transform={`translate(${columnWidth / 2}, ${rowHeight / 7 - totalHeight * 0.025})`}>

                  <text
                    transformOrigin="bottom left"
                    transform="rotate (-45)"
                    font-size={totalHeight * 0.07}
                    x={0}
                    y={0}
                    text-anchor="left"
                  > {port.port} </text>
                </g>

              </g>
            )
          })

        }
      </g>

    </g>
  )

}

export default TriangleComponent;