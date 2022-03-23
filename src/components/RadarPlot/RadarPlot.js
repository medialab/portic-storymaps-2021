import { scaleLinear } from 'd3-scale';
import React, { useEffect, useMemo } from 'react';
import { useSpring, animated } from 'react-spring'
import Tooltip from 'react-tooltip';

import AxisObject from './AxisObject';
import VisObject from './VisObject';

import './RadarPlot.scss';

/**
 * Displays a radar plot
 * @todo this component should be genericized at some point, it was done in haste
 * @param {array} data
 * @param {number} size
 * @param {array<string>} axis - list of columns names to use as axis
 * @returns {React.ReactElement} - React component
 */
const RadarPlot= ({
  lang,
  data,
  size : wholeSize = 100,
  axis,
}) => {

  useEffect(() => {
    Tooltip.rebuild();
  })
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
    <>
    <svg className="RadarPlot" width={wholeSize} height={wholeSize}>
      <animated.circle
        cx={visCenter}
        cy={visCenter}
        r={visSize}
        strokeWidth={.5}
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
              lang={lang}
              key={datum.meta.name}
              color={datum.meta.color}
              name={datum.meta.name}
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
    <Tooltip id="radar-tooltip" />
    </>
  )
}

export default RadarPlot;
