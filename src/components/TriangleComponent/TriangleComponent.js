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
  dataFilename,
  totalWidth = 1200,
  rowHeight = 200,
  numberOfColumns = 5,
  marginUnderText = 0.1, // obsolète (mais encore utilisé dans le code)
  marginBetweenTriangleAndText = 0.1 // obsolète (mais encore utilisé dans le code)
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
  ]).range([0, (1 - marginUnderText - marginBetweenTriangleAndText) * rowHeight]); // pour l'instant j'ai mis le max de longueur à 85% de la hauteur du rectangle conteneur 
  // je pourrais faire  range([0, rowHeight - place occupée par le texte]



  return (
    <div className="TriangleComponent">

      <svg width={totalWidth} height={totalHeight} viewBox={`0 0 ${totalWidth} ${totalHeight}`} style={{ border: '1px solid lightgrey' }}>
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
                  d={`M ${columnWidth / 2} ${(rowHeight - triangleHeight)/1.2} 
                        V ${rowHeight / 7}
                        `}
                />

                <path
                  d={`M ${(columnWidth - triangleWidth) / 2} ${(rowHeight - triangleHeight)/1.2} 
                        H ${(columnWidth - triangleWidth) / 2 + triangleWidth}
                        L ${columnWidth / 2} ${(rowHeight - triangleHeight)/1.2 + triangleHeight}
                        Z
                        `} // accents chelous : "je commence à faire des interpolations" 
                />

                <g transform={`translate(${-columnWidth/1.25}, ${rowHeight/50}) rotate(-45 0 0)`}>
                  <text
                    x={parseInt(columnWidth / 2)}
                    y={parseInt(rowHeight / 3)}
                    text-anchor="left"
                  > {port.port} </text>
                </g>

              </g>
            )
          })

        }

      </svg>

    </div>
  )

}

export default TriangleComponent;