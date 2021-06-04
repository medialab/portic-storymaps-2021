import React, { useState, useEffect, useMemo } from 'react';
import { csvParse } from 'd3-dsv';
import get from 'axios';
import { geoEqualEarth, geoPath } from "d3-geo";
import { uniq } from 'lodash';
import { scaleLinear } from 'd3-scale';
import { extent } from 'd3-array';

import { generatePalette } from '../../helpers/misc';

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

  return (
    <div>

      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ border: '1px solid lightgrey' }}>
          {
            data.map((port, index) => {
              return (
                <g 
                  transform={`translate(${(index) * (width/data.length)}, ${height * .33 + (index%3)*(height/5)})`}
                >
                    <rect
                        x = {0}
                        y = {0}
                    />

                    
                        
                {/* <path
                  key={`path-${i}`}
                  d={geoPath().projection(projection)(d)}
                  className="geopart"
                  fill={`rgba(38,50,56,${1 / backgroundData.features.length * i})`}
                  stroke="#FFFFFF"
                  strokeWidth={0.5}
                /> */}
                <text> {port.port} </text>
                    
                </g>
              )
            })

          }
        
      </svg>

    </div>
  )

}

export default TriangleComponent;