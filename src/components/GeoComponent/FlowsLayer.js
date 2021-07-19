
import { useMemo, useState, useEffect } from 'react';
import { scaleLinear } from 'd3-scale';
import { max } from 'd3-array';
import { uniq } from 'lodash';
import { generatePalette } from '../../helpers/misc';

import { useSpring, animated } from 'react-spring'

/*
Principe : path entre deux point géographiques, dont le stroke peut varier, et on peut avoir la direction avec une fleche 

format des données attendu (json) : 

Exemple :
"flow_id": "45.95_-0.9_46.166667_-1.15", 
"port_dep": "Charente", 
"port_dest": "La Rochelle", 
"latitude_dep": 45.95, 
"longitude_dep": -0.9, 
"latitude_dest": 46.166667, 
"longitude_dest": -1.15, 
"nb_flows": 22, 
"tonnages_cumulés": 730}

@TODO : régler le fait que la pointe des flèches ne soit pas à l'arrivée (en l'état c'est la base du triangle qui est sur les coords d'arrivée) => se règle en reculant le triangle :   viewBox="-10 0 10 10" &  <path d="M -10 0 L 0 5 L -10 10 Z" fill="black" /> (à ce moment il fut rétrécir la longueur du path qui fait la barre de la flèche)
@TODO : mettre un point au départ de mes flows ? (pas adapté quand on a des points de départ et d'arrivée qui se recoupent)
*/

const FlowGroup = ({
  arrowSize,
  xDep: inputXDep,
  yDep: inputYDep,
  xDest: inputXDest,
  yDest: inputYDest,
  strokeWidth: inputStrokeWidth,
  width,
  height,
  projectionTemplate,
  datum,
  layer,
  color = 'black',
}) => {
  const [isInited, setIsInited] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setIsInited(true)
    })
  }, []);
  let path = `M ${inputXDep} ${inputYDep} L ${inputXDest} ${inputYDest}`;
  let cp1X = 0, cp1Y = 0, cp2X = 0, cp2Y = 0;
  // left to right
  if (inputXDest > inputXDep) {
    cp1Y = inputYDep;
    cp2Y = inputYDest;
    cp1X = inputXDep - Math.log(inputXDest - inputXDep) // inputXDest + (inputXDest - inputXDep) / 2;
    cp2X = inputXDep - Math.log(inputXDest - inputXDep) // inputXDest + (inputXDest - inputXDep) / 2;
    // @todo clean that someday
    if (inputYDest > height / 2 && projectionTemplate === "World") {
      cp1X -= width * .3;
      cp2X -= width * .3;
    }
    // top to bottom
    if (inputYDest > inputYDep) {
      if (projectionTemplate === 'France') {
        cp1X -= width;
        cp2X -= width;
      }
      path = `M ${inputXDep} ${inputYDep} C ${cp1X}, ${cp1Y} ${cp2X}, ${cp2Y} ${inputXDest}, ${inputYDest}`;
      // bottom to top
    } else {
      // cp2X = inputXDest;
      cp1X = inputXDep - (inputXDest - inputXDep) * 2.5;
      cp2X = inputXDep - (inputXDest - inputXDep) * 2.5;
      cp1Y = inputYDep;
      cp2Y = inputYDest;
      path = `M ${inputXDep} ${inputYDep} C ${cp1X}, ${cp1Y} ${cp2X}, ${cp2Y} ${inputXDest}, ${inputYDest}`;
    }
    // right to left
  } else {
    // top to bottom
    if (inputYDest > inputYDep) {
      cp1X = inputXDest + (width / 4 + inputXDest > inputXDep ? 0 : width / 4);
      cp1Y = inputYDep;

      cp2X = inputXDest + (width / 4 + inputXDest > inputXDep ? 0 : width / 4);
      cp2Y = inputYDep;

      path = `M ${inputXDep} ${inputYDep} C ${cp1X}, ${cp1Y} ${cp2X}, ${cp2Y} ${inputXDest}, ${inputYDest}`;
      // bottom to top
    } else {


      // path = `M ${inputXDep} ${inputYDep} C ${cp1X}, ${cp1Y} ${cp2X}, ${cp2Y} ${inputXDest}, ${inputYDest}`;
    }
  }
  const { d, labelDepTransform, labelDestTransform, strokeWidth } = useSpring({
    to: {
      xDep: inputXDep,
      yDep: inputYDep,
      xDest: inputXDest,
      yDest: inputYDest,
      d: path,
      strokeWidth: inputStrokeWidth,
      labelDepTransform: `translate(${inputXDep}, ${inputYDep})`,
      labelDestTransform: `translate(${inputXDest}, ${inputYDest})`,
      arrowPath: `M ${inputXDep} ${inputYDep} L ${inputXDest} ${inputYDest}`
    },
    immediate: !isInited
  });
  const fontSize = width * 0.01;
  return (
    <g className="flow-group">
      <defs>
        <marker id="triangle" viewBox="0 0 10 10"
          refX="1" refY="5"
          markerUnits="strokeWidth"
          markerWidth={arrowSize} markerHeight={arrowSize}
          orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 Z" fill={color} />
        </marker>
      </defs>
      {/* <animated.line
      x1={xDep}
      y1={yDep}
      x2={xDest}
      y2={yDest}
      stroke="blue"
    /> */}
      {/* <circle
        r={4}
        cx={cp1X}
        cy={cp1Y}
        r={2}
        fill="red"
      />
      <circle
        r={4}
        cx={cp2X}
        cy={cp2Y}
        r={5}
        fill="green"
      /> */}
      <animated.path
        d={d}
        strokeWidth={strokeWidth * 3}
        fill="none"
        stroke={color}
        opacity={0}
      />
      <animated.path
        d={d}
        strokeWidth={strokeWidth}
        marker-end="url(#triangle)"
        fill="none"
        stroke={color}
      />
      {
        layer.label && layer.label.fields ?
          <>
            <animated.g className="label" transform={labelDepTransform}>
              <text
                textAnchor={inputXDest < inputXDep ? 'start' : 'end'}
                x={inputXDest < inputXDep ? 10 + inputStrokeWidth * 2 : -10 - inputStrokeWidth}
                y={fontSize * .3}
                fontSize={fontSize}
              >
                {datum[layer.label.fields[0]]}
              </text>
            </animated.g>
            <animated.g className="label" transform={labelDestTransform}>
              <text
                textAnchor={inputXDest > inputXDep ? 'start' : 'end'}
                x={inputXDest > inputXDep ? 10 + inputStrokeWidth * 2 : -10 - inputStrokeWidth}
                y={fontSize * .3}
                fontSize={fontSize}
              >
                {datum[layer.label.fields[1]]}
              </text>
            </animated.g>
          </>
          : null
      }
      {/* <animated.path 
      d={arrowPath} 
      stroke="black" 
      strokeWidth={strokeWidth} 
      marker-end="url(#triangle)" 
    /> */}
      {/* <line x1={xDep} y1={yDep} x2={xDest} y2={yDest} stroke="black" stroke-width={size} marker-end="url(#triangle)" /> */}
    </g>
  )
}

const FlowsLayer = ({
  layer,
  projection,
  width,
  height,
  projectionTemplate
}) => {

  /**
    * Data aggregation for viz (note : could be personalized if we visualize other things than points)
  */
  const markerData = useMemo(() => {
    if (layer.data) {

      console.log("data : ", layer.data)
      // size building
      const strokeWidthScale = scaleLinear().domain([
        0,
        max(
          layer.data.map((flow) => {
            // return +flow[tonnages_cumulés];
            console.log("flow[layer.size.field] : ", flow[layer.size.field])
            return +flow[layer.size.field];
          })
        )
      ]).range([0, width * height / 50000]);

      const arrowSizeScale = strokeWidthScale.copy().range([0, width * height / 100000]);

      let grouped = layer.data.map(flow => ({ // je ne sais pas si grouped reste le plus adapté
        ...flow,
        // color: palette[datum.color],
        strokeWidth: strokeWidthScale(+flow[layer.size.field]),
        arrowSize: arrowSizeScale(layer.data.strokeWidth)
      }))
      let palette;
      if (layer.color !== undefined) {
        // colors palette building
        const colorValues = uniq(grouped.map(g => g[layer.color.field]));
        if (layer.color.palette) { // if palette given in parameters we use it, otherwise one palette is generated
          palette = layer.color.palette;
        } else {
          const colors = generatePalette('map', colorValues.length);
          palette = colorValues.reduce((res, key, index) => ({
            ...res,
            [key]: colors[index]
          }), {});
        }
        grouped = grouped.map(datum => ({
          ...datum,
          color: layer.color !== undefined ? palette[datum[layer.color.field]] : 'grey',
        }))
      }
      console.log("grouped : ", grouped)
      return grouped;
    }
  }, [projection, width, layer, height])/* eslint react-hooks/exhaustive-deps : 0 */

  console.log("markerData (FlowsLayer) : ", markerData)

  return (
    <g className="FlowsLayer" >
      {
        markerData
          .filter(({ latitude_dep, longitude_dep, latitude_dest, longitude_dest }) => latitude_dep && longitude_dep && latitude_dest && longitude_dest && !isNaN(latitude_dep) && !isNaN(longitude_dep) && !isNaN(latitude_dest) && !isNaN(longitude_dest))
          .map((datum, index) => {
            const { latitude_dep, longitude_dep, latitude_dest, longitude_dest, strokeWidth, arrowSize, color } = datum;
            const [xDep, yDep] = projection([+longitude_dep, +latitude_dep]);
            const [xDest, yDest] = projection([+longitude_dest, +latitude_dest]);
            // console.log("[xDep, yDep] / [xDest, yDest] : ", [xDep, yDep], " / ", [xDest, yDest]);

            return (
              <FlowGroup
                {
                ...{
                  arrowSize,
                  xDep,
                  yDep,
                  xDest,
                  yDest,
                  strokeWidth,
                  datum,
                  layer,
                  width,
                  color,
                  height,
                  projectionTemplate,
                }
                }
              />
            );
          })
      }
    </g>
  );
}

export default FlowsLayer;