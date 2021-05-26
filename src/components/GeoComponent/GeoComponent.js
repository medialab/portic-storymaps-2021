import React, {useState, useEffect, useMemo} from 'react';
import {csvParse} from 'd3-dsv';
import get from 'axios';
import { geoEqualEarth, geoPath } from "d3-geo";
import {uniq} from 'lodash';
import {scaleLinear} from 'd3-scale';
import {extent} from 'd3-array';

import {generatePalette} from '../../helpers/misc';


const GeoComponent = ({
  dataFilename,
  backgroundFilename,
  width = 800,
  height = 450,
  markerSize,
  markerColor
}) => {
    // useState renvoie un state et un seter qui permet de le modifier
  const [data, setData] = useState(null);
  const [backgroundData, setBackgroundData] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingBackground, setLoadingBackground] = useState(true);


  useEffect(() => {
    if (dataFilename) {
      const dataURL = `${process.env.PUBLIC_URL}/data/${dataFilename}`;
      get(dataURL)
      .then(({data: csvString}) => {
        const newData = csvParse(csvString);
        
        setData(newData);
        setLoadingData(false);
      })
      .catch((err) => {
        setLoadingData(false);
      })
    }
    
  }, [dataFilename])

  const markerData = useMemo(() => {
    if (data) {
      // regroup data by coordinates
      const coordsMap = {};
      data.forEach(datum => {
        const mark = datum.latitude + ',' + datum.longitude;
        if (!coordsMap[mark]) {
          coordsMap[mark] = {
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
      const colorsMap = colorValues.reduce((res, key, index) => ({
        ...res,
        [key]: palette[index]
      }), {});

      const sizeExtent = extent(grouped.map(g => g.size));
      const sizeScale = scaleLinear().domain(sizeExtent).range([1, width / 100])
      grouped = grouped.map(datum => ({
        ...datum,
        color: colorsMap[datum.color],
        size: sizeScale(datum.size)
      }))
      return grouped;
    }
  }, [data, markerColor, markerSize, width])

  useEffect(() => {
    if (backgroundFilename) {
      const backgroundURL = `${process.env.PUBLIC_URL}/data/${backgroundFilename}`;
      get(backgroundURL)
      .then(({data: bgData}) => {
        setBackgroundData(bgData);
        setLoadingBackground(false);
      })
      .catch((err) => {
        setLoadingBackground(false);
      })
    }
    
  }, [backgroundFilename])

  const projection = useMemo(() => {
    if (backgroundData) {
      // if bg data fit on whole geometry
      return geoEqualEarth()
      .fitSize([width, height], backgroundData)
    }
    return geoEqualEarth()
      .scale(200)
      .translate([ width / 2, height / 2 ])
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
        <svg width={ width } height={ height } viewBox={`"0 0 ${width} ${height}`} style={{border: '1px solid lightgrey'}}>
            <g className="background">
              {
                backgroundData.features.map((d,i) => (
                  <path
                    key={ `path-${ i }` }
                    d={ geoPath().projection(projection)(d) }
                    className="geopart"
                    fill={ `rgba(38,50,56,${ 1 / backgroundData.features.length * i})` }
                    stroke="#FFFFFF"
                    strokeWidth={ 0.5 }
                  />
                ))
              }
            </g>
            <g className="markers">
              {
                markerData
                .filter(({latitude, longitude}) => latitude && longitude && !isNaN(latitude) && !isNaN(longitude))
                .map((datum, index) => {
                  const {latitude, longitude, size, color} = datum;
                  const [x, y] = projection([+longitude, +latitude]);
                  return (
                    <circle
                      key={index}
                      cx={ x }
                      cy={ y }
                      r={ size }
                      fill={color}
                      className="marker"
                    />
                  );
                })
              }
            </g>
          </svg>
      </div>
  )
}

export default GeoComponent;
