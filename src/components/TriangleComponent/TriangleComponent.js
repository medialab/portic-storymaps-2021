import React, { useState, useEffect, useMemo } from 'react';
import { csvParse } from 'd3-dsv';
import get from 'axios';
import { geoEqualEarth, geoPath } from "d3-geo";
import { uniq } from 'lodash';
import { scaleLinear } from 'd3-scale';
import { max } from 'd3-array';

import { generatePalette } from '../../helpers/misc';

import './TriangleComponent.css'

const TriangleComponent = ({
  dataFilename,
  width = 1200,
  height = 600
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

  const NUMBER_OF_COLUMNS = 5
  // const columnWidth = width/data.length
  const columnWidth = width / NUMBER_OF_COLUMNS
  const rowHeight = height / 5

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
  ]).range([0, rowHeight]);



  return (
    <div>

      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ border: '1px solid lightgrey' }}>
        {
          data.map((port, index) => {

            const rectWidth = scaleX(+port.nb_pointcalls_out)
            const rectHeight = scaleY(+port.mean_tonnage)

            const xIndex = index % NUMBER_OF_COLUMNS;
            const yIndex = (index - index % NUMBER_OF_COLUMNS) / NUMBER_OF_COLUMNS;
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
                  fill="grey"
                  stroke="white"
                />

                <path
                  stroke='red'
                  d={`M ${(columnWidth - rectWidth) / 2} ${0} 
                        H ${(columnWidth - rectWidth) / 2 + rectWidth}
                        L ${columnWidth / 2} ${rectHeight}
                        Z
                        `} // accents chelous : je commence à faire des interpolations 


                />
                <rect
                  x={(columnWidth - rectWidth) / 2}
                  y={0}
                  width={rectWidth}
                  height={rectHeight}
                  fill='transparent'
                  stroke='black'
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
                  y={parseInt(rowHeight / 2)} // attention on veut un entier en coord
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