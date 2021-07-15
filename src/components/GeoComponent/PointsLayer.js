
import { useMemo } from 'react';
import { uniq } from 'lodash';
import { scaleLinear } from 'd3-scale';
import { extent } from 'd3-array';

import { generatePalette } from '../../helpers/misc';

const PointsLayer = ({ layer, projection, width }) => {

  /**
    * Data aggregation for viz (note : could be personalized if we visualize other things than points)
  */
  const markerData = useMemo(() => {
    if (layer.data) {

      // regroup data by coordinates
      const coordsMap = {};
      layer.data.forEach(datum => {
        // id
        const mark = datum.latitude + ',' + datum.longitude;
        if (!coordsMap[mark]) {
          coordsMap[mark] = {
            label: layer.label ? datum[layer.label.field] : undefined,
            latitude: +datum.latitude,
            longitude: +datum.longitude,
            color: layer.color !== undefined ? datum[layer.color.field] : 'default',
            size: (layer.size !== undefined && layer.size.field !== undefined) ? isNaN(+datum[layer.size.field]) ? 0 : +datum[layer.size.field] : 0
          }
        } else {
          coordsMap[mark].size += (isNaN(+datum[layer.size.field]) ? 0 : +datum[layer.size.field])
        }
      })

      let grouped = Object.entries(coordsMap).map(([_mark, datum]) => datum);
      console.log("grouped : ", grouped)


      let palette;
      if (layer.color !== undefined) {
        // colors palette building
        const colorValues = uniq(grouped.map(g => g.color));
        if (layer.color.palette) { // if palette given in parameters we use it, otherwise one palette is generated
          palette = layer.color.palette;
        } else {
          const colors = generatePalette('map', colorValues.length);
          palette = colorValues.reduce((res, key, index) => ({
            ...res,
            [key]: colors[index]
          }), {});
        }
      }
      
      // size building

      // compute size (would have been more elegand with a ternary but I did not manage to write it properly)
      let sizeCoef = width / 300; // default size
      if (layer.size !== undefined && layer.size.custom !== undefined) {
        sizeCoef = parseInt(layer.size.custom * width / 100);
      }

      const sizeExtent = extent(grouped.map(g => g.size));
      const sizeScale = scaleLinear().domain(sizeExtent).range([1, width / 10]) // adapt size to width, @TODO : enable to parameter scale (with domain & range)
      grouped = grouped.map(datum => ({
        ...datum,
        color: layer.color !== undefined ? palette[datum.color] : 'grey',
        size: layer.size !== undefined ? layer.size.custom !== undefined ? sizeCoef : sizeScale(datum.size) : width / 100
      }))

      console.log("grouped (PointsLayer): ", grouped)
      return grouped;
    }
  }, [projection, width, layer])

  // console.log("markerData (pointsLayer): ", markerData)

  return (
    <g className="PointsLayer">
      {
        markerData
          .filter(({ latitude, longitude }) => latitude && longitude && !isNaN(latitude) && !isNaN(longitude))
          .map((datum, index) => {
            const { latitude, longitude, size, color, label } = datum;
            const [x, y] = projection([+longitude, +latitude]);

            return (
              <g className="point-group" key={index} transform={`translate(${x},${y})`}>
                <circle
                  cx={0}
                  cy={0}
                  r={size}
                  style={{ fill: color }}
                  className="marker"
                />
                {
                  label ?
                    <text
                      x={size + 5}
                      y={size / 2}
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
  );
}

export default PointsLayer;