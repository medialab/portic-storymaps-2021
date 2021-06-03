import React, { useState, useEffect, useMemo } from 'react';
import { csvParse } from 'd3-dsv';
import get from 'axios';
import { geoEqualEarth, geoPath } from "d3-geo";
import { uniq } from 'lodash';
import { scaleLinear } from 'd3-scale';
import { extent } from 'd3-array';

import { generatePalette } from '../../helpers/misc';


const GeoComponent = ({
  dataFilename,
  backgroundFilename,
  width = 1800,
  height = 1500,
  label,
  markerSize,
  markerColor,
  showLabels,
  centerOnRegion
}) => {
  // raw marker data
  const [data, setData] = useState(null);
  // map background data
  const [backgroundData, setBackgroundData] = useState(null);
  const [colorsMap, setColorsMap] = useState(null);

  const [loadingData, setLoadingData] = useState(true);
  const [loadingBackground, setLoadingBackground] = useState(true);


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

  /**
   * Data aggregation for viz (note : could be personalized if we visualize other things than points)
   */
  const markerData = useMemo(() => {
    if (data) {
      // regroup data by coordinates
      const coordsMap = {};
      data.forEach(datum => {
        const mark = datum.latitude + ',' + datum.longitude;
        if (!coordsMap[mark]) {
          coordsMap[mark] = {
            label: showLabels && label ? datum[label] : undefined,
            latitude: datum.latitude,
            longitude: datum.longitude,
            color: datum[markerColor],
            size: isNaN(+datum[markerSize]) ? 0 : +datum[markerSize]
          }
        } else {
          coordsMap[mark].size += (isNaN(+datum[markerSize]) ? 0 : +datum[markerSize])
        }
      })
      let grouped = Object.entries(coordsMap).map(([_mark, datum]) => datum);
      const colorValues = uniq(grouped.map(g => g.color));
      const palette = generatePalette('map', colorValues.length);
      const thatColorsMap = colorValues.reduce((res, key, index) => ({
        ...res,
        [key]: palette[index]
      }), {});
      setColorsMap(thatColorsMap);

      const sizeExtent = extent(grouped.map(g => g.size));
      const sizeScale = scaleLinear().domain(sizeExtent).range([1, width / 100])
      grouped = grouped.map(datum => ({
        ...datum,
        color: thatColorsMap[datum.color],
        size: sizeScale(datum.size)
      }))
      return grouped;
    }
  }, [data, markerColor, markerSize, width])

  /**
   * Map background data loading
   */
  useEffect(() => {
    if (backgroundFilename) {
      const backgroundURL = `${process.env.PUBLIC_URL}/data/${backgroundFilename}`;
      get(backgroundURL)
        .then(({ data: bgData }) => {
          setBackgroundData(bgData);
          setLoadingBackground(false);
        })
        .catch((err) => {
          setLoadingBackground(false);
        })
    }

  }, [backgroundFilename])

  /**
   * d3 projection making
   */
  const projection = useMemo(() => {
    if (backgroundData) {
      if (centerOnRegion) {
        return geoEqualEarth()
        .scale(50000)
        .center([-1.7475027, 46.573642])
      }
      // if bg data is available fit on whole geometry
      return geoEqualEarth()
      .fitSize([width, height], backgroundData)
    }
    return geoEqualEarth()
      .scale(200)
      .translate([width / 2, height / 2])
  }, [backgroundData, width, height])



  if (loadingBackground || loadingData) {
    return (
      <div>Chargement des données ...</div>
    )
  } else if (!backgroundData || !data) {
    return (
      <div>Erreur ...</div>
    )
  }

  return (
    <div>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ border: '1px solid lightgrey' }}>
        <g className="background">
          {
            backgroundData.features.map((d, i) => (
              <path
                key={`path-${i}`}
                d={geoPath().projection(projection)(d)}
                className="geopart"
                fill={`rgba(38,50,56,${1 / backgroundData.features.length * i})`}
                stroke="#FFFFFF"
                strokeWidth={0.5}
              />
            ))
          }
        </g>
        <g className="markers">
          {
            markerData
              .filter(({ latitude, longitude }) => latitude && longitude && !isNaN(latitude) && !isNaN(longitude))
              .map((datum, index) => {
                const { latitude, longitude, size, color, label } = datum;
                const [x, y] = projection([+longitude, +latitude]);
                return (
                  <g transform={`translate(${x},${y})`}>
                    <circle
                      key={index}
                      cx={0}
                      cy={0}
                      r={size}
                      fill={color}
                      className="marker"
                    />
                    {
                      label ? 
                      <text
                        x={size + 5}
                        y= {size/2}
                      >
                        {label}
                      </text>
                      : null
                    }
                  </g>
                );
              })
          }
        </g>
        {
          colorsMap ?
          <g className="legend" transform={`translate(${width * .85}, ${height - (Object.keys(colorsMap).length + 1) * 20})`}>
            <g>
              <text style={{fontWeight: 800}}>
                {markerColor}
              </text>
            </g>
            {
              Object.entries(colorsMap)
              .map(([label, color], index) => {
                return (
                  <g transform={`translate(0, ${(index + 1) * 20})`}>
                    <rect
                      x={0}
                      y={-8}
                      width={10}
                      height={10}
                      fill={color}
                    />
                    <text x={15} y={0}>
                      {label || 'Indéterminé'}
                    </text>
                  </g>
                )
              })
            }
          </g>
          : null
        }
      </svg>
    </div>
  )
}

export default GeoComponent;
