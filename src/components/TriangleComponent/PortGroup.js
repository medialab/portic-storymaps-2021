import React, { useEffect, useState } from 'react';
import cx from 'classnames';
import { animated, useSpring } from 'react-spring';

import colorsPalettes from '../../colorPalettes';


const PortGroup = ({
  numberOfColumns,
  port,
  scaleX,
  scaleY,
  legendWidth,
  columnWidth,
  totalHeight,
  totalWidth,
  projection,
  index,
  margins,
  rowHeight,
  fontSize,
  projectionTemplate
}) => {


  const triangleWidth = scaleX(+port.nb_pointcalls_out)
  const triangleHeight = scaleY(+port.mean_tonnage)

  const xIndex = index % numberOfColumns;
  // const yIndex = (index - index % numberOfColumns) / numberOfColumns;
  const xTransform = xIndex * columnWidth + margins.left // + (legendWidth + margins.left) * totalWidth;
  const yTransform = totalHeight * 2.3;

  // const [x, y] = projection([+port.longitude, +port.latitude]);
  const [x, y] = projection([+port.longitude, +port.latitude]);
  const [isInited, setIsInited] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setIsInited(true)
    })
  }, [])
  const { transform, x1, y1, x2, y2, staticTransform, markerRadius } = useSpring({
    to: {
      transform: `translate(${x},${y})`,
      x1: projectionTemplate === 'rotated Poitou' ? xTransform + columnWidth / 2 : x,
      y1: projectionTemplate === 'rotated Poitou' ? yTransform + rowHeight / 7 : y,
      // x1: projectionTemplate === 'rotated Poitou' ? xTransform + columnWidth / 2 : totalWidth * 0.1,
      // y1: projectionTemplate === 'rotated Poitou' ? yTransform + rowHeight / 7 : index * (totalHeight / numberOfColumns),

      markerRadius: projectionTemplate === 'rotated Poitou' ? totalHeight * 0.02 : 0,
      // markerRadius: projectionTemplate === 'rotated Poitou' ? totalHeight * 0.02 : 1,
      
      // x1: xTransform + columnWidth / 2,
      // y1: yTransform + rowHeight / 7,
      x2: x,
      y2: y,
      staticTransform: projectionTemplate === 'rotated Poitou' ? `translate(${xTransform}, ${yTransform}) scale(1)` : `translate(${x},${y}) scale(${projectionTemplate === 'rotated Poitou' ? 1 : 0.1})`
      // staticTransform: projectionTemplate === 'rotated Poitou' ? `translate(${xTransform}, ${yTransform}) scale(1)` : `translate(${totalWidth * 0.1},${index * (totalHeight / numberOfColumns)}) scale(${projectionTemplate === 'France' ? 0.2 : 1})`
    },
    immediate: !isInited
  });

  const cellCenterX = columnWidth / 2;
  const cellCenterY = rowHeight / 2;
  const textStartY = rowHeight / 7;
  const triangleStartY = cellCenterY + textStartY / 2 - triangleHeight / 2;
  const legendTextWidth= totalWidth * 0.08;

  let labelBgWidth = fontSize * 12;
  if (port.port.length <= 10) {
    labelBgWidth = fontSize * 6;
  } else if (port.port.length <= 12) {
    labelBgWidth = fontSize * 7;
  } else if (port.port.length <= 15) {
    labelBgWidth = fontSize * 8;
  } else if (port.port.length <= 18) {
    labelBgWidth = fontSize * 10;
  }

  return (
    <g className={cx('port-point-and-triangle', {'is-minified': projectionTemplate !== 'rotated Poitou'})}>

      <animated.line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke='grey'
        strokeDasharray='2, 8'
      />

      <animated.g className='port-point' transform={transform}>
        <animated.circle
          cx={0}
          cy={0}
          r={markerRadius}
          style={{ fill: colorsPalettes.generic.dark }}
          className="marker"
        />
      </animated.g>

      <animated.g className='port-triangle'
        // transform={`translate(${(index) * (columnWidth)}, ${height * .33 + (index%3)*(rowHeight)})`}
        transform={staticTransform}
      >
        {/* <rect
          x={0}
          y={0}
          width={columnWidth}
          height={rowHeight}
          style={{stroke: 'red'}}
        /> */}

        {/* <path class='vertical-line'
          d={`M ${cellCenterX} ${(rowHeight - triangleHeight) / 1.2} 
              V ${rowHeight / 7}
              `}
        /> */}
        <path class='vertical-line'
          d={`M ${cellCenterX} ${textStartY} 
              V ${triangleStartY}
              `}
        />

        <g transform={`translate(${cellCenterX}, ${triangleStartY})`}>

          <path className='triangle'
            d={`M ${-triangleWidth / 2} ${0} 
                L ${triangleWidth / 2} ${0}
                L ${0} ${triangleHeight}
                Z
                `}
            fill="url(#TriangleGradient)"
          />
          {/* <circle
            fill="red"
            r={2}
            cx={-triangleWidth / 2}
            cy={0}
          />
          <circle
            fill="red"
            r={2}
            cx={triangleWidth / 2}
            cy={0}
          />
          <circle
            fill="red"
            r={2}
            cx={0}
            cy={triangleHeight}
          /> */}
        </g>
        <g className="local-legend">
          {/* horizontal line */}
          <line
            x1={cellCenterX - triangleWidth/2}
            x2={cellCenterX + triangleWidth/2}
            y1={triangleStartY - 3}
            y2={triangleStartY - 3}
            marker-start="url(#triangle-left)" 
            marker-end="url(#triangle-right)"
          />
          {/* vertical line */}
          <line
            x1={cellCenterX - triangleWidth/2 - 3}
            x2={cellCenterX - triangleWidth/2 - 3}
            y1={triangleStartY}
            y2={triangleStartY + triangleHeight}
            marker-start="url(#triangle-left)" 
            marker-end="url(#triangle-right)"
          />
          {/* pointing arrows */}
          <path
            d={`
            M ${-(legendTextWidth* .2) - triangleWidth / 3} ${triangleStartY * .65}
            Q ${cellCenterX - 10} ${triangleStartY * .65} ${cellCenterX - 2} ${triangleStartY - 5}
            `}
            marker-end="url(#triangle-right)"
          />
          <path
            d={`
            M ${-triangleHeight / 3 + 3} ${triangleStartY + triangleHeight * .6 + 7}
            L ${cellCenterX - triangleWidth/2 - 3} ${triangleStartY + triangleHeight * .6 + 7}
            `}
            marker-end="url(#triangle-right)"
          />
          <foreignObject 
            y={triangleStartY / 2}
            x={-legendTextWidth - triangleWidth / 3}
            width={legendTextWidth}
            height={rowHeight}
          >
            <span xmlns="http://www.w3.org/1999/xhtml">
             nombre de navires sortis du port en 1789 : <strong>{port.nb_pointcalls_out}</strong>
            </span>
          </foreignObject>
          <foreignObject 
            x={-legendTextWidth - triangleWidth / 3}
            y={triangleStartY + triangleHeight * .6}
            width={totalWidth * 0.08}
            height={rowHeight}
          >
            <span xmlns="http://www.w3.org/1999/xhtml">
              tonnage moyen des navires : <strong>{(+port.mean_tonnage || 0).toFixed(1)}</strong>
            </span>
          </foreignObject>
          
        </g>
        <g className='label' transformOrigin="bottom left" transform={`translate(${columnWidth / 2}, ${rowHeight / 7 - totalHeight * 0.025})`}>
          <path
            d={`M 0 ${-fontSize} L ${labelBgWidth} ${-fontSize} ${labelBgWidth - 5} ${(-fontSize + fontSize * 0.2) / 2} ${labelBgWidth} ${fontSize * 0.2} 0 ${fontSize * 0.2} Z`}
            // d={`M 0 ${-fontSize} L ${port.port.length * fontSize * .64} ${-fontSize} ${port.port.length * fontSize * .64 - 5} ${(-fontSize + fontSize * 0.2) / 2} ${port.port.length * fontSize * .64} ${fontSize * 0.2} 0 ${fontSize * 0.2} Z`}
            // x={0}
            // y={-fontSize}
            // height={fontSize * 1.2}
            // width={port.port.length * fontSize * .65}
            style={{ fill: colorsPalettes.generic.dark }}
            transformOrigin="bottom left"
            transform="rotate (-45)"
          />
          <text
            transformOrigin="bottom left"
            transform="rotate (-45)"
            font-size={fontSize}
            style={{ fill: 'white' }}
            x={3}
            y={0}
            textAnchor="left"
          > {port.port} </text>
        </g>

      </animated.g>
    </g>
  )
}

export default PortGroup;