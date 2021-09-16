import { scaleLinear } from 'd3-scale';
import React, { useMemo } from 'react';
import { useSpring, animated } from 'react-spring'

import AxisObject from './AxisObject';
import VisObject from './VisObject';

const RadarPlot= ({
  data,
  size : wholeSize = 100,
  axis,
}) => {
  const axisIndexMap = useMemo(() =>
    axis.reduce((res, a, aIndex) => ({
      ...res,
      [a]: aIndex
    }), {})
  , [axis])
  const MARGIN = 100;
  const size = wholeSize - MARGIN;
  const { visCenter, visSize } = useSpring({
    visCenter: size/2 + MARGIN / 2,
    visSize: size/2,
  })
  const axisRankScale = scaleLinear().domain([0, axis.length]).range([Math.PI / 2, Math.PI * 2.5])
  const radiusScale = scaleLinear().domain([0, 1]).range([0, size / 2])
  return (
    <svg className="RadarPlot" width={wholeSize} height={wholeSize}>
      <animated.circle
        cx={visCenter}
        cy={visCenter}
        r={visSize}
        stroke="grey"
        fill="none"
      />
      <g className="background-container">
        {
          axis.map((label, axisIndex) => (
            <AxisObject
              key={axisIndex}
              {
                ...{
                  size,
                  MARGIN,
                  axisIndex,
                  axisRankScale,
                  axis,
                  label
                }
              }
            />
          ))
        }
      </g>
      <g className="objects-container">
        {
          data.map((datum, datumIndex) => (
            <VisObject
              key={datumIndex}
              color={datum.meta.color}
              data={datum.data}
              axisIndexMap={axisIndexMap}
              axisRankScale={axisRankScale}
              center={[size/2 + MARGIN / 2, size/2 + MARGIN / 2]}
              radiusScale={radiusScale}
            />
          ))
        }
      </g>
    </svg>
  )
}

export default RadarPlot;
