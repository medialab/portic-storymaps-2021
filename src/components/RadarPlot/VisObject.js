import React from 'react';
import { useSpring, animated } from 'react-spring'

import { polarToCartesian } from '../../helpers/misc';


const VisObject = ({
  color,
  data,
  axisIndexMap,
  axisRankScale,
  center,
  radiusScale
}) => {
  const points = Object.entries(axisIndexMap)
  .map(([key, index]) => {
    const val = data[key];
    const r = radiusScale(val);
    const theta = axisRankScale(+index);
    const [xRaw, yRaw] = polarToCartesian(r, theta);
    const x = xRaw + center[0];
    const y = yRaw + center[1];
    return [x, y]
  })
  const {joinedPoints} = useSpring({
    joinedPoints: points.map(([x, y]) => `${x},${y}`).join(' ')
  })
  return (
    <g className="VisObject">
      <animated.polygon
        points={joinedPoints}
        fill={color}
        fillOpacity={.5}
      />
      {
        points
        .map(([x, y], index) => {
          return (
            <circle
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