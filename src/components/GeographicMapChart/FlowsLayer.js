
import { useMemo, useState, useEffect } from 'react';
import { scaleLinear } from 'd3-scale';
import cx from 'classnames';
import { max } from 'd3-array';
import { uniq } from 'lodash';
import { fixSvgDimension, generatePalette } from '../../helpers/misc';

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
  const footprint = `${inputXDep}-${inputYDep}-${inputXDest}-${inputYDest}`
  const [isInited, setIsInited] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setIsInited(true)
    })
  }, []);
  let actualXDep = inputXDep;
  let actualYDep = inputYDep;
  let actualXDest = inputXDest;
  let actualYDest = inputYDest;

  // if (actualXDest < 0 || actualXDest > width) {

  // }
  let path = `M ${actualXDep} ${actualYDep} L ${actualXDest} ${actualYDest}`;

  const { d, labelDepTransform, labelDestTransform, strokeWidth } = useSpring({
    to: {
      xDep: inputXDep,
      yDep: inputYDep,
      xDest: inputXDest,
      yDest: inputYDest,
      d: path,
      strokeWidth: fixSvgDimension(inputStrokeWidth),
      labelDepTransform: `translate(${actualXDep}, ${actualYDep})`,
      labelDestTransform: `translate(${actualXDest}, ${actualYDest})`,
      arrowPath: `M ${actualXDep} ${actualYDep} L ${actualXDest} ${actualYDest}`
    },
    immediate: !isInited
  });
  const fontSize = window.innerWidth * 0.01;
  return (
    <g className="flow-group">
      <defs>
        <marker id={`triangle-${footprint}`} viewBox="0 0 10 10"
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
        markerEnd={`url(#triangle-${footprint})`}
        fill="none"
        stroke={color}
      />
      {
        layer.label && layer.label.fields ?
          <>
            <animated.g className={cx("label", {'is-always-visible': layer.label.alwaysVisible})} transform={labelDepTransform}>
              <text
                textAnchor={actualXDest < actualXDep ? 'start' : 'end'}
                x={actualXDest < actualXDep ? 10 + inputStrokeWidth * 2 : -10 - inputStrokeWidth}
                y={fontSize * .3}
                fontSize={fontSize}
              >
                {datum[layer.label.fields[0]]}
              </text>
            </animated.g>
            <animated.g className={cx("label", {'is-always-visible': layer.label.alwaysVisible})} transform={labelDestTransform}>
              <text
                textAnchor={actualXDest > actualXDep ? 'start' : 'end'}
                x={actualXDest > actualXDep ? 10 + inputStrokeWidth * 2 : -10 - inputStrokeWidth}
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
      markerEnd="url(#triangle)" 
    /> */}
      {/* <line x1={xDep} y1={yDep} x2={xDest} y2={yDest} stroke="black" stroke-width={size} markerEnd="url(#triangle)" /> */}
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

      // console.log("data : ", layer.data)
      // size building
      const strokeWidthScale = scaleLinear().domain([
        0,
        max(
          layer.data.map((flow) => {
            // return +flow[tonnages_cumulés];
            // console.log("flow[layer.size.field] : ", flow[layer.size.field])
            return +flow[layer.size.field];
          })
        )
      ]).range([1, width * height / 20000]);

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
      // console.log("grouped : ", grouped)
      return grouped;
    }
  }, [projection, width, layer, height])/* eslint react-hooks/exhaustive-deps : 0 */

  // console.log("markerData (FlowsLayer) : ", markerData)

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
                key={index}
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