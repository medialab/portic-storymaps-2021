
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
        const mark = datum.latitude + ',' + datum.longitude;
        if (!coordsMap[mark]) {
          coordsMap[mark] = {
            label: layer.label ? datum[layer.label.field] : undefined,
            latitude: +datum.latitude,
            longitude: +datum.longitude,
            color: datum[layer.color.field],
            size: isNaN(+datum[layer.size.field]) ? 0 : +datum[layer.size.field]
          }
        } else {
          coordsMap[mark].size += (isNaN(+datum[layer.size.field]) ? 0 : +datum[layer.size.field])
        }
      })
      let grouped = Object.entries(coordsMap).map(([_mark, datum]) => datum);
      // colors palette building
      let palette;
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
      
      // size building
      const sizeExtent = extent(grouped.map(g => g.size));
      const sizeScale = scaleLinear().domain(sizeExtent).range([1, width / 100]) // adapt size to width, @TODO : enable to parameter scale (with domain & range)
      grouped = grouped.map(datum => ({
        ...datum,
        color: palette[datum.color],
        size: sizeScale(datum.size)
      }))
      return grouped;
    }
  }, [projection, width, layer]) 

  return (
    <g className="PointsLayer">
      {
        markerData
          .filter(({ latitude, longitude }) => latitude && longitude && !isNaN(latitude) && !isNaN(longitude))
          .map((datum, index) => {
            const { latitude, longitude, size, color, label } = datum;
            const [x, y] = projection([+longitude, +latitude]);
            // console.table([{x,y,size}])
            return (
              <g className="point-group" transform={`translate(${x},${y})`}>
                <circle
                  key={index}
                  cx={0}
                  cy={0}
                  r={size}
                  style={{fill: color}}
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