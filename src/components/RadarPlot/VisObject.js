import { sum } from 'lodash';
import React from 'react';
import { useSpring, animated } from 'react-spring'

import { fixSvgDimension, polarToCartesian } from '../../helpers/misc';

const Circle = ({
  cx: inputX,
  cy: inputY,
  r: inputR,
  ...props
}) => {
  const {
    cx,
    cy,
    r,
  } = useSpring({
    cx: fixSvgDimension(inputX),
    cy: fixSvgDimension(inputY),
    r: inputR
  })
  return (
    <animated.circle
      cx={cx}
      cy={cy}
      r={r}
      {...props}
    />
  )
}

const VisObject = ({
  color,
  data,
  axisIndexMap,
  axisRankScale,
  center,
  name,
  radiusScale
}) => {
  const points = Object.entries(axisIndexMap)
  .map(([key, index]) => {
    const val = data[key] || 0;
    const r = radiusScale(val);
    const theta = axisRankScale(+index);
    const [xRaw, yRaw] = polarToCartesian(r, theta);
    const x = fixSvgDimension(xRaw + center[0]);
    const y = fixSvgDimension(yRaw + center[1]);
    return [x, y]
  })
  const {joinedPoints} = useSpring({
    joinedPoints: points.map(([x, y]) => `${x},${y}`).join(' ')
  });

  let tooltipValues = Object.entries(data);
  const sumOfParts = sum(tooltipValues.map(v => v[1]));
  tooltipValues = tooltipValues.map(([key, val]) => [key, val / sumOfParts])
  return (
    <g 
      className="VisObject"
      data-for="radar-tooltip"
      data-html={true}
      data-place="left"
      data-tip={`
      <p>
      ${name === 'Tous les bureaux' ? 'Parts des destinations des voyages de 1789 initiés depuis tous les ports de la région' : 'Part des destinations pour les voyages de 1789 initiés depuis des ports rattachés au bureau des fermes de <strong>' + name + '</strong>'} :
      </p>
      <ol>
        ${
          tooltipValues
          .sort(([_key, portionA], [_key2, portionB]) => {
            if (portionA > portionB) {
              return -1;
            }
            return 1;
          })
          .map(([key, portion]) => `
            <li>
              <strong>${key}</strong> : <strong>${(portion * 100).toFixed(2)}%</strong>
            </li>
          `).join('\n')
        }
      </ol>
  `}
    >
      <animated.polygon
        points={joinedPoints}
        fill={color}
        fillOpacity={.5}
      />
      {
        points
        .map(([x, y], index) => {
          return (
            <Circle
              key={index}
              cx={x}
              cy={y}
              r={1}
              fill={color}
            />
          )
        })
      }
    </g>
  )
}

export default VisObject;