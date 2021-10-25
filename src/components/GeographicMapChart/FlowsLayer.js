
import { useMemo, useState, useEffect } from 'react';
import { scaleLinear } from 'd3-scale';
import cx from 'classnames';
import { max } from 'd3-array';
import { uniq } from 'lodash';
import { cartesian2Polar, fixSvgDimension, generatePalette, polarToCartesian } from '../../helpers/misc';

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

*/

/**
 * Displays a particular flow
 * @param {string} id
 * @param {boolean} hovered
 * @param {number} xDep
 * @param {number} yDep
 * @param {number} xDest
 * @param {number} yDest
 * @param {number} strokeWidth
 * @param {string} color
 * @param {string} path
 * @param {number} actualXDep
 * @param {number} actualYDep
 * @param {number} actualXDest
 * @param {number} actualYDest
 * @param {number} arrowLength
 * @param {function} onMouseEnter
 * @param {function} onMouseLeave
 * @returns {React.ReactElement} - React component 
 */
const FlowGroup = ({
  id,
  hovered,
  xDep: inputXDep,
  yDep: inputYDep,
  xDest: inputXDest,
  yDest: inputYDest,
  strokeWidth: inputStrokeWidth,
  color = 'black',

  path,
  actualXDep,
  actualYDep,
  actualXDest,
  actualYDest,
  arrowLength,
  onMouseEnter,
  onMouseLeave,
  // datum,
  // layer,
  // depLabelTextAnchor,
  // depLabelX,
  // depLabelY,
  // destLabelTextAnchor,
  // destLabelX,
  // destLabelY,
  // fontSize,
}) => {
  const [isInited, setIsInited] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setIsInited(true)
    })
  }, []);

  const { d, strokeWidth } = useSpring({
    to: {
      xDep: inputXDep,
      yDep: inputYDep,
      xDest: inputXDest,
      yDest: inputYDest,
      d: path,
      strokeWidth: fixSvgDimension(inputStrokeWidth),
      arrowPath: `M ${actualXDep} ${actualYDep} L ${actualXDest} ${actualYDest}`
    },
    immediate: !isInited
  });

  return (
    <g onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} className={cx("flow-group", { hovered })}>
      <defs>
        <marker
          id={`triangle-${id}`}
          viewBox={`0 0 ${arrowLength} ${arrowLength}`}
          refY={arrowLength / 2}
          orient="auto">
          <path d={`M 0 0 L ${arrowLength} ${arrowLength / 2} L 0 ${arrowLength} Z`} fill={color} />
        </marker>
      </defs>
      {/* hover placeholder */}
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
        markerEnd={`url(#triangle-${id})`}
        fill="none"
        stroke={color}
      />
    </g>
  )
}

/**
 * Displays a series of flow and their labels
 * @param {array} layer
 * @param {function} projection
 * @param {number} width
 * @param {number} height
 * @param {string} projectionTemplate
 * @returns {React.ReactElement} - React component
 */
const FlowsLayer = ({
  layer,
  projection,
  width,
  height,
  projectionTemplate,
}) => {

  /**
    * Data aggregation for viz
  */
  const markerData = useMemo(() => {
    if (layer.data) {

      // size building
      const strokeWidthScale = scaleLinear().domain([
        0,
        max(
          layer.data.map((flow) => {
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
      return grouped
        .filter(({ latitude_dep, longitude_dep, latitude_dest, longitude_dest }) => latitude_dep && longitude_dep && latitude_dest && longitude_dest && !isNaN(latitude_dep) && !isNaN(longitude_dep) && !isNaN(latitude_dest) && !isNaN(longitude_dest))
        .map((datum, index) => {
          const { latitude_dep, longitude_dep, latitude_dest, longitude_dest, strokeWidth, arrowSize, color } = datum;
          const [xDep, yDep] = projection([+longitude_dep, +latitude_dep]);
          const [xDest, yDest] = projection([+longitude_dest, +latitude_dest]);
          // console.log("[xDep, yDep] / [xDest, yDest] : ", [xDep, yDep], " / ", [xDest, yDest]);
          if (layer.hideOverflowingFlows) {
            if (xDep < 0 || xDep > width || xDest < 0 || xDest > width
              || yDep < 0 || yDep > height || yDest < 0 || yDest > height
            ) {
              return null;
            }
          }
          const id = `${xDep}-${yDep}-${xDest}-${yDest}`;

          const arrowLength = fixSvgDimension(strokeWidth) * 3;

          const { distance, radians } = cartesian2Polar(xDest - xDep, yDest - yDep);
          const [relativeXDest, relativeYDest] = polarToCartesian(distance - arrowLength, radians);
          let actualXDest = xDep + relativeXDest;
          let actualYDest = yDep + relativeYDest;
          let actualXDep = xDep;
          let actualYDep = yDep;
          let path = `M ${actualXDep} ${actualYDep} L ${actualXDest} ${actualYDest}`;

          let depLabelPosition = actualXDest < actualXDep ? 'right' : 'left';
          let destLabelPosition = actualXDest > actualXDep ? 'right' : 'left';
          if (actualXDest < width * .26) {
            destLabelPosition = 'right';
          }
          if (actualXDest > width * .75) {
            destLabelPosition = 'left';
          }

          const fontSize = width * 0.02;

          const depLabelTextAnchor = depLabelPosition === 'right' ? 'start' : 'end';
          const depLabelX = depLabelPosition === 'right' ? 10 : -10
          const depLabelY = fontSize * .3

          const destLabelTextAnchor = destLabelPosition === 'right' ? 'start' : 'end'
          const destLabelX = destLabelPosition === 'right' ? 10 : -10
          const destLabelY = fontSize * .3;

          return {
            id,
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

            fontSize,
            path,
            actualXDep,
            actualYDep,
            actualXDest,
            actualYDest,
            arrowLength,

            depLabelTextAnchor,
            depLabelX,
            depLabelY,

            destLabelTextAnchor,
            destLabelX,
            destLabelY,
          }
        })
        .filter(d => d)
    }
    return []
  }, [projection, width, layer, height])/* eslint react-hooks/exhaustive-deps : 0 */

  const labels = useMemo(() => {
    let newLabels = markerData.reduce((res, flow) => {
      const {
        id,
        xDep,
        yDep,
        xDest,
        yDest,
        strokeWidth,
  
        depLabelX,
        depLabelY,
        depLabelTextAnchor,
  
        destLabelX,
        destLabelY,
        destLabelTextAnchor,
        fontSize,
        datum
      } = flow;
      const depId = datum[layer.label.fields[0]] // `${actualXDep}-${actualYDep}`;
      if (res[depId]) {
        // update position if we find a larger flow for this label
        if (res[depId].largerStrokeWidth > strokeWidth) {
          res[depId] = {
            ...res[depId],
            largerStrokeWidth: strokeWidth,
            x: xDep + depLabelX,
            y: yDep + depLabelY,
            textAnchor: depLabelTextAnchor,
            fontSize
          }
        }
        res[depId].flows = [...res[depId].flows, id]
        // create a new entry for label
      } else {
        res[depId] = {
          label: datum[layer.label.fields[0]],
          largerStrokeWidth: strokeWidth,
          x: xDep + depLabelX,
          y: yDep + depLabelY,
          textAnchor: depLabelTextAnchor,
          fontSize,
          flows: [id]
        }
      }
  
      const destId = datum[layer.label.fields[1]] // `${actualXDest}-${actualYDest}`;
      if (res[destId]) {
        // update position if we find a larger flow for this label
        if (res[destId].largerStrokeWidth > strokeWidth) {
          res[destId] = {
            ...res[destId],
            largerStrokeWidth: strokeWidth,
            x: xDest + destLabelX,
            y: yDest + destLabelY,
            textAnchor: destLabelTextAnchor,
            fontSize
          }
        }
        res[destId].flows = [...res[destId].flows, id]
        // create a new entry for label
      } else {
        res[destId] = {
          label: datum[layer.label.fields[1]],
          largerStrokeWidth: strokeWidth,
          x: xDest + destLabelX,
          y: yDest + destLabelY,
          textAnchor: destLabelTextAnchor,
          fontSize,
          flows: [id]
        }
      }
      return res;
    }, {})
    newLabels = Object.entries(newLabels).map(([id, label]) => ({
      id,
      ...label,
      width: label.label.length * label.fontSize * 0.5,
      actualX: label.textAnchor === 'start' ? label.x : label.x - (label.label.length * label.fontSize * 0.5),
      height: label.fontSize,
    }))
    newLabels = newLabels.sort((a, b) => {
      if (a.y > b.y) {
        return 1;
      }
      return -1;
    })
    // resolve labels collisions
    for (let i = 0 ; i < newLabels.length ; i++) {
      for (let j = i + 1 ; j < newLabels.length ; j++) {
        const label1 = newLabels[i];
        const label2 = newLabels[j];

        const minAx = label1.x;
        const minAy = label1.y - label1.height;
        const maxAx = label1.x + label1.width;
        const maxAy = label1.y;

        const minBx = label2.x;
        const minBy = label2.y - label2.height;
        const maxBx = label2.x + label2.width;
        const maxBy = label2.y;

        const aLeftOfB = maxAx < minBx;
        const aRightOfB = minAx > maxBx;
        const aAboveB = minAy > maxBy;
        const aBelowB = maxAy < minBy;

        if (!( aLeftOfB || aRightOfB || aAboveB || aBelowB )) {
          if (!aAboveB || aBelowB) {
            const distanceY = Math.abs(label1.y - (label2.y - label2.height));
            label1.y -= distanceY / 2 ;
            label2.y += distanceY / 2 ;
          }
          // if (!aLeftOfB || aRightOfB) {
          //   const distanceX = Math.abs(label1.x - (label2.x + label2.width));
          //   label1.x -= distanceX / 2 ;
          //   label2.x += distanceX / 2 ;
          // }
        }
      }
    }
    newLabels = newLabels.sort((a, b) => {
      if (a.largerStrokeWidth > b.largerStrokeWidth) {
        return -1;
      }
      return 1;
    })
    return newLabels;
  }, [markerData])
  

  const [hoverIds, setHoverIds] = useState(undefined);
  return (
    <g className="FlowsLayer" >
      {
        markerData
          .map((data, index) => {

            const {
              id,
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

              fontSize,
              path,
              actualXDep,
              actualYDep,
              actualXDest,
              actualYDest,
              arrowLength,
              depLabelTextAnchor,
              depLabelX,
              depLabelY,
              destLabelTextAnchor,
              destLabelX,
              destLabelY,
            } = data;

            const onMouseEnter = () => {
              setHoverIds([id]);
            }
            const onMouseLeave = () => {
              setHoverIds(undefined);
            }
            const hovered = hoverIds && hoverIds.includes(id);
            return (
              <FlowGroup
                key={index}
                {
                ...{
                  hovered,
                  id,
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

                  fontSize,
                  path,
                  actualXDep,
                  actualYDep,
                  actualXDest,
                  actualYDest,
                  arrowLength,
                  depLabelTextAnchor,
                  depLabelX,
                  depLabelY,
                  destLabelTextAnchor,
                  destLabelX,
                  destLabelY,

                  onMouseEnter,
                  onMouseLeave,
                }
                }
              />
            );
          })
      }
      {
        labels.map((thatLabel, index) => {
          const {
            id,
            label,
            textAnchor,
            x,
            // actualX,
            y,
            fontSize,
            flows,
          } = thatLabel;
          const isVisible = hoverIds ? hoverIds.find(hoveredId => flows.includes(hoveredId)) : true;
          const onMouseEnter = () => {
            setHoverIds(flows);
          }
          const onMouseLeave = () => {
            setHoverIds(undefined);
          }
          return (
            <g
              id={id}
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
            >
              {/* <rect
                x={actualX}
                y={y - height}
                width={width}
                height={height}
                fill="pink"
              /> */}
              <text
                id={id}
                className={cx("label", {'is-visible': isVisible})}
                textAnchor={textAnchor}
                x={x}
                y={y}
                fontSize={fontSize}
              >
                {label}
              </text>
            </g>
          )
        })
      }
    </g>
  );
}

export default FlowsLayer;