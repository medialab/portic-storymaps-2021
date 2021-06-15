import React, { useState, useEffect } from 'react';
import { csvParse } from 'd3-dsv';
import get from 'axios';

import './TriangleComponent.css'

const TriangleComponent = ({
  dataFilename,
  totalWidth = 1200,
  rowHeight = 200, 
  numberOfColumns = 5,
  marginUnderText = 0.1, // je ne sais pas si c'est le mieux comme unité pour une marge ...
  marginBetweenTriangleAndText = 0.1
}) => {

  // raw marker data
  const [data, setData] = useState(null);

  const [loadingData, setLoadingData] = useState(true);



  /**
   * Marker data loading
   */
  useEffect(() => {
    if (dataFilename) {
      const dataURL = `${process.env.PUBLIC_URL}/data/${dataFilename}`;
      get(dataURL)
        .then(({ data: csvString }) => {
          const newData = csvParse(csvString);

          setData(newData);
          setLoadingData(false);
        })
        .catch((err) => {
          setLoadingData(false);
        })
    }

  }, [dataFilename])

  if (loadingData) {
    return (
      <div>Chargement des données ...</div>
    )
  } else if (!data) {
    return (
      <div>Erreur ...</div>
    )
  }

  const columnWidth = totalWidth / numberOfColumns
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
  ]).range([0, columnWidth]);

  const scaleY = scaleLinear().domain([
    0,
    max(
      data.map((port) => {
        return +port.mean_tonnage; // parseFloat(port.mean_tonnage);
      })
    )
  ]).range([0,(1 - marginUnderText - marginBetweenTriangleAndText) *rowHeight]); // pour l'instant j'ai mis le max de longueur à 85% de la hauteur du rectangle conteneur 
  // je pourrais faire  range([0, rowHeight - place occupée par le texte]



  return (
    <div>

      <svg width={totalWidth} height={totalHeight} viewBox={`0 0 ${totalWidth} ${totalHeight}`} style={{ border: '1px solid lightgrey' }}>
        {
          data.map((port, index) => {

            const rectWidth = scaleX(+port.nb_pointcalls_out)
            const rectHeight = scaleY(+port.mean_tonnage)

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

                <path
                  d={`M ${(columnWidth - rectWidth) / 2} ${0} 
                        H ${(columnWidth - rectWidth) / 2 + rectWidth}
                        L ${columnWidth / 2} ${rectHeight}
                        Z
                        `} // accents chelous : "je commence à faire des interpolations" 


                />

                {/* <path
                  key={`path-${i}`}
                  d={geoPath().projection(projection)(d)}
                  className="geopart"
                  fill={`rgba(38,50,56,${1 / backgroundData.features.length * i})`}
                  stroke="#FFFFFF"
                  strokeWidth={0.5}
                /> */}
                <text
                  x={parseInt(columnWidth / 2)}
                  y={parseInt(rowHeight * (1 - marginUnderText))}
                  // centrer le texte horizontalement
                  dominant-baseline="middle"
                  text-anchor="middle"
                > {port.port} </text>

              </g>
            )
          })

        }

      </svg>

    </div>
  )

}

export default TriangleComponent;