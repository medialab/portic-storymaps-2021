
import { useMemo } from 'react';
import { uniq } from 'lodash';
import { scaleLinear } from 'd3-scale';
import { extent } from 'd3-array';

import { generatePalette } from '../../helpers/misc';
import { useSpring, animated, Transition } from 'react-spring'
import { useEffect, useState } from 'react';
import ReactTooltip from 'react-tooltip';


const PointGroup = ({
  projection,
  datum,
  layer,
  opacity,
  onGroupMouseEnter,
  onGroupMouseLeave,
  displayLabel
}) => {
  const { tooltip } = layer;
  const { latitude, longitude, size: area, color, label, rawSize, labelPosition = 'right', labelSize, index } = datum;
  const size = Math.sqrt(area / Math.PI)
  const [x, y] = projection([+longitude, +latitude]);
  const [isInited, setIsInited] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setIsInited(true)
    })
  }, [])
  const { transform } = useSpring({
    to: {
      transform: `translate(${x},${y})`
    },
    immediate: !isInited
  });
  return (
    <>
      <animated.g
        className="point-group"
        transform={transform}
        style={{
          zIndex: labelSize,
          opacity: opacity
        }}
        onMouseEnter={() => onGroupMouseEnter(index)}
        onMouseMove={() => onGroupMouseEnter(index)}
        onMouseLeave={() => onGroupMouseLeave()}
        data-for="geo-tooltip"
        data-tip={typeof tooltip === 'function' ? tooltip(datum) : undefined}
      >
        <circle
          cx={0}
          cy={0}
          r={size}
          style={{ fill: color }}
          className="marker"
        />
        {
          layer.size.displayMetric && labelSize > 6 ?
            <text
              x={0}
              y={labelSize / 4}
              textAnchor="middle"
              fontSize={labelSize / 2}
              fill="white"
            >
              {rawSize}
            </text>
            : null
        }

        {
          label && displayLabel ?
            <text
              x={labelPosition === 'right' ? size + 5 : -size - 5}
              y={size / 2}
              fill={layer.color && layer.color.labelsColor}
              textAnchor={labelPosition === 'right' ? 'start' : 'end'}
              fontSize={labelSize}
            >
              {label}
            </text>
            : null
        }
      </animated.g>
    </>

  );
}

const StackedLabelGroup = ({
  layer,
  datum,
  thatIndex,
  opacity,
  stackedRowHeight,
  onGroupMouseEnter,
  onGroupMouseLeave,
  projection
}) => {
  const { tooltip } = layer;
  const { latitude, longitude, size: area, label, /*labelPosition = 'right', labelSize, index*/ } = datum;
  const size = Math.sqrt(area / Math.PI)
  const [x, y] = projection([+longitude, +latitude]);
  const [isInited, setIsInited] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setIsInited(true)
    })
  }, [])
  const { x2, y2, transformLabel } = useSpring({
    to: {
      x2: x - size,
      y2: y,
      transformLabel: `translate(${window.innerWidth * 0.01}, ${datum.labelY})`
    },
    immediate: !isInited
  });
  return (
    <animated.g
      style={{
        // zIndex: labelSize,
        opacity: opacity
      }}
      onMouseEnter={() => onGroupMouseEnter(thatIndex)}
      onMouseMove={() => onGroupMouseEnter(thatIndex)}
      onMouseLeave={() => onGroupMouseLeave()}
      data-for="geo-tooltip"
      data-tip={typeof tooltip === 'function' ? tooltip(datum) : undefined}
    >
      <animated.g className="label-container" transform={transformLabel}>
        <text style={{ fontSize: stackedRowHeight }}>
          {
            label
          }
        </text>
      </animated.g>
      <animated.line
        x1={stackedRowHeight * label.length * .5 + window.innerWidth * 0.01}
        y1={datum.labelY - stackedRowHeight * .2}
        x2={x2}
        y2={y2}
      />
    </animated.g>
  )
}

const PointsLayer = ({ layer, projection, width, height }) => {

  const [hoveredIndex, setHoveredIndex] = useState(null);


  useEffect(() => {
    ReactTooltip.rebuild();
  })

  /**
    * Data aggregation for viz (note : could be personalized if we visualize other things than points)
  */
  const markerData = useMemo(() => {
    if (layer.data) {

      // regroup data by coordinates
      const coordsMap = {};
      layer.data.forEach(datum => {
        // id
        const mark = datum.latitude + ',' + datum.longitude;
        if (!coordsMap[mark]) {
          coordsMap[mark] = {
            label: layer.label ? datum[layer.label.field] : undefined,
            labelPosition: layer.label ? layer.label.position : undefined,
            latitude: +datum.latitude,
            longitude: +datum.longitude,
            color: layer.color !== undefined ? datum[layer.color.field] : 'default',
            size: (layer.size !== undefined && layer.size.field !== undefined) ? isNaN(+datum[layer.size.field]) ? 0 : +datum[layer.size.field] : 0
          }
        } else {
          coordsMap[mark].size += (isNaN(+datum[layer.size.field]) ? 0 : +datum[layer.size.field])
        }
      })

      let grouped = Object.entries(coordsMap).map(([_mark, datum]) => datum);
      // console.log("grouped : ", grouped)


      let palette;
      if (layer.color !== undefined) {
        // colors palette building
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
      }

      // size building

      // compute size (would have been more elegand with a ternary but I did not manage to write it properly)
      let sizeCoef = width / 300; // default size
      if (layer.size !== undefined && layer.size.custom !== undefined) {
        sizeCoef = parseInt(layer.size.custom * width / 100);
      }

      const sizeExtent = extent(grouped.map(g => g.size));
      // basing the scale on area rather than radius
      const radiusRange = [3, width / 30];
      const areaRange = radiusRange.map(r => Math.PI * r * r);
      const sizeScale = scaleLinear().domain(sizeExtent).range(areaRange) // adapt size to width, @TODO : enable to parameter scale (with domain & range)
      const labelSizeScale = scaleLinear().domain(sizeExtent).range([8, width / 30]) // adapt size to width, @TODO : enable to parameter scale (with domain & range)
      grouped = grouped.map(datum => ({
        ...datum,
        color: layer.color !== undefined ? palette[datum.color] : 'grey',
        size: layer.size !== undefined ? layer.size.custom !== undefined ? sizeCoef : sizeScale(datum.size) : width / 100,
        rawSize: datum.size,
        labelSize: layer.size !== undefined ? labelSizeScale(datum.size) : width / 100
      }))

      // console.log("grouped (PointsLayer): ", grouped)
      return grouped;
    }
  }, [projection, width, layer])/* eslint react-hooks/exhaustive-deps : 0 */

  let visibleMarkers = markerData
    .filter(({ latitude, longitude }) => latitude && longitude && !isNaN(latitude) && !isNaN(longitude))
    .sort((a, b) => {
      if (a.latitude > b.latitude) {
        return 1;
      }
      return -1;
    })

  const onGroupMouseEnter = index => {
    if (hoveredIndex !== index)
      setHoveredIndex(index);
  }
  const onGroupMouseLeave = () => {
    setTimeout(() => {
      if (hoveredIndex !== null)
        setHoveredIndex(null);
    })
  }
  const stackedLabelsTop = height * .1;
  const stackedLabelsHeight = height * .9;
  const stackedRowHeight = stackedLabelsHeight / visibleMarkers.length;
  if (layer.stackLabels) {
    visibleMarkers = visibleMarkers
      .sort((a, b) => {
        if (a.latitude > b.latitude) {
          return -1;
        }
        return 1;
      })
      .map((d, i) => ({
        ...d,
        labelY: stackedRowHeight * i + stackedLabelsTop
      }))
  }
  visibleMarkers = visibleMarkers.map((d, index) => ({ ...d, index }));
  return (
    <g className="PointsLayer">
      {
        layer.stackLabels ?
          <g className="stacked-labels-container">
            <Transition
              // items={visibleMarkers.map((d, i) => ({...d, labelPosition: i%2 === 0 ? 'left' : 'right', index: i}))}
              items={visibleMarkers}
              from={{ opacity: 0 }}
              enter={{ opacity: 1 }}
              leave={{ opacity: 0 }}
            >
              {({ opacity }, datum, thatIndex) => (
                <StackedLabelGroup
                  key={datum.label}
                  {...{
                    projection,
                    datum,
                    layer,
                    opacity: hoveredIndex !== null ? hoveredIndex === datum.index ? 1 : .1 : opacity,
                    thatIndex: datum.index,
                    onGroupMouseEnter,
                    onGroupMouseLeave,
                    stackedRowHeight,
                  }}
                />
              )

              }
            </Transition>
          </g>
          : null
      }
      <Transition
        // items={visibleMarkers.map((d, i) => ({...d, labelPosition: i%2 === 0 ? 'left' : 'right', index: i}))}
        items={visibleMarkers}
        from={{ opacity: 0 }}
        enter={{ opacity: 1 }}
        leave={{ opacity: 0 }}
      >
        {({ opacity }, datum, index) => (
          <PointGroup
            key={datum.label}
            {...{
              projection,
              datum,
              layer,
              opacity: hoveredIndex !== null ? hoveredIndex === datum.index ? 1 : .1 : opacity,
              index: datum.index,
              onGroupMouseEnter,
              onGroupMouseLeave,
              displayLabels: !layer.stackLabels
            }}
          />
        )

        }
      </Transition>
      {/* {
        visibleMarkers
          .map((datum, index) => {
            return (
              <PointGroup
                key={datum.label}
                {...{ projection, datum, layer }}
              />
            )
          })
      } */}
    </g>
  );
}

export default PointsLayer;