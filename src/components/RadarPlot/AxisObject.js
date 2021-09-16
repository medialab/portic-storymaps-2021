import React from 'react';
import { useSpring, animated } from 'react-spring'

import { polarToCartesian } from '../../helpers/misc';


const AxisObject = ({
  size,
  MARGIN,
  axisIndex,
  axisRankScale,
  axis,
  label
}) => {
    const [rawX1, rawY1] = [size/2 + MARGIN / 2, size/2 + MARGIN / 2];
    const [x2Rel, y2Rel] = polarToCartesian(size/2, axisRankScale(axisIndex))
    const rawX2 = rawX1 + x2Rel;
    const rawY2 = rawY1 + y2Rel;
    let labelXDisplace = -MARGIN / 8;
    let labelYDisplace = 15;
    if (axisIndex > 0) {
      labelYDisplace = -10;
      if (axisIndex === axis.length / 2) {
        labelYDisplace = -20;
        labelXDisplace = -MARGIN / 6;
      } else if (axisIndex < axis.length / 2) {
        labelXDisplace = -MARGIN / 2;
      } else {
        labelXDisplace = 5;
      }
      // special cases
      if (axisIndex === 3 || axisIndex === 5) {
        labelYDisplace = -30;
      }
      if (axisIndex === 7) {
        labelYDisplace = 5;
      }
      if (axisIndex === 1) {
        labelYDisplace = 5;
        labelXDisplace = -MARGIN/3;
      }
    }
    const {
      x1,
      y1,
      x2,
      y2,
      labelX,
      labelY
    } = useSpring({
      x1: rawX1,
      y1: rawY1,
      x2: rawX2,
      y2: rawY2,
      labelX: rawX2 + labelXDisplace,
      labelY: rawY2 + labelYDisplace
    })
    return (
      <g key={axisIndex} className="AxisObject">
        <animated.line
          {
            ...{
              x1,
              y1,
              x2,
              y2,
            }
          }
        />
        <animated.foreignObject 
          x={labelX} 
          y={labelY} 
          width={MARGIN * .7} 
          height={MARGIN}
        >
          <div className="label">
            {label}
          </div>
        </animated.foreignObject>
      </g>
    )
}

export default AxisObject;