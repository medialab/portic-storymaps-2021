import { useEffect, useMemo, useRef, useState } from 'react';
import { scaleLinear } from 'd3-scale';
import {
  schemeAccent as colorScheme1,
  schemeDark2 as colorScheme2,
  schemePaired as colorScheme3
} from 'd3-scale-chromatic';
import cx from 'classnames';

import { prepareAlluvialData } from './utils';

import './CircularAlluvialChart.scss';
import { min } from 'd3-array';
import { uniq } from 'lodash-es';
import { cartesian2Polar, fixSvgDimension, trimText } from '../../helpers/misc';
import ReactTooltip from 'react-tooltip';

import {G, Text, Line, Circle, Rect, Path} from './animatedPrimities';

const colorSchemes = [colorScheme1, colorScheme2, colorScheme3];

/**
 * Renders a circular alluvial diagram (duh)
 * @param {array} data
 * @param {string} sumBy - field in data to use to quantify flows
 * @param {array} steps - arrow of steps in the form: {field: [string], labels: {fr: [string], en: [string]}, filters: [{key: [string], value: [string]}]}
 * @param {number} width
 * @param {number} height
 * @param {array} filters - objects in the form {key, value} to highlight some flows in the vis
 * @param {boolean} debug
 * @param {string} title
 * @param {object} colorsPalettes
 * @param {boolean} centerHorizontalLabels
 * @param {boolean} displaceHorizontalLabels - avoid labels overlap (at the cost of invadint the center of the vis)
 * @param {object} tooltips - tooltips of nested functions in the form {node: {fr: [fn], en: [fn]}, flow: {fr: [fn], en: [fn]}}
 * @param {string} lang - enum ['fr', 'en']
 * @param {string} align - enum ['left', 'center']
 * @returns {React.ReactElement} - React component
 */
const CircularAlluvialChart = ({
  data: inputData = [],
  sumBy,
  steps,
  width: inputWidth = 1200,
  height : inputHeight = 800,
  filters = [],
  debug = false,
  title,
  colorsPalettes,
  centerHorizontalLabels = true,
  displaceHorizontalLabels = true,
  tooltips,
  lang,
  align = 'left'
}) => {
  const titleRef = useRef(null);
  let height = titleRef.current ? inputHeight - titleRef.current.getBoundingClientRect().height : inputHeight;
  height = fixSvgDimension(height);
  const width = fixSvgDimension(inputWidth);
  // state is used for managing interactions through svg elements' classes
  const [highlightedFlow, setHighlightedFlow] = useState(undefined);
  const [highlightedFilter, setHighlightedFilter] = useState(undefined);
  // rebuild data each time data or viz params are changed
  const data = useMemo(() => {
    const vizData = prepareAlluvialData(inputData, { sumBy, steps });
    return vizData;
  }, [inputData, sumBy, steps]);
  const filtersTotal = useMemo(() => {
    if (filters && filters.length) {
      return inputData
      .filter(flow => filters.find(({key, value}) => flow[key] === value))
      .reduce((sum, flow) => sum + (+flow[sumBy]), 0)
    }
    return inputData.reduce((sum, flow) => sum + (+flow[sumBy]), 0)
  }, [inputData, sumBy, filters]);

  let tooltipContent;

  useEffect(() => {
    ReactTooltip.rebuild();
  })

  useEffect(() => {
    setHighlightedFlow(undefined);
    setHighlightedFilter(undefined);
  }, [filters])

  // build categorical color scales
  const colorScales = useMemo(() => {
    const modalitiesMap = data.reduce((cur, datum) => {
      const ids = uniq(datum.nodes.map(node => node.id));
      return {
        ...cur,
        [datum.field]: cur[datum.field] ? uniq([...cur[datum.field], ...ids]) : ids
      }
    }, {});
    return Object.entries(modalitiesMap).reduce((cur, [field, values], fieldIndex) => {
      let counter = 0;
      return {
        ...cur,
        [field]: values.reduce((m, value) => {
          counter++;
          return { ...m, [value]: colorSchemes[fieldIndex][counter - 1] }
        }, {})
      }
    }, {})
  }, [data]);

  // dimensions are aligned with the smallest dimension of the container (width or height)
  const smallestDimension = useMemo(() => {
    return min([width, height])
  }, [width, height])

  // bar size and height is relative to dimensions
  let BAR_SIZE = smallestDimension * .3;
  const BAR_WIDTH = smallestDimension / 50;
  // margin for double bars
  const HORIZONTAL_MARGIN = smallestDimension * .2;
  const textScale = scaleLinear().range([smallestDimension / 120, smallestDimension / 50]).domain([0, 1])
  // these radiuses are used to align bars extremities on the three implicit circles they form
  // (circle 1 : inner intersection of the 4 bars)
  // (circle 2 : outer intersection of the external point of 4 bars)
  // (circle 3 : outer intersection of the internal point of 4 bars)
  const secondCircleRadius = cartesian2Polar(-smallestDimension / 2 + BAR_SIZE, -HORIZONTAL_MARGIN / 2).distance;
  const thirdCircleRadius = cartesian2Polar(-smallestDimension / 2, -HORIZONTAL_MARGIN / 2 + BAR_WIDTH).distance;
  const HORIZONTAL_DISPLACE = Math.abs(smallestDimension / 2 - thirdCircleRadius);
  const VERTICAL_BAR_SIZE = smallestDimension / 2 - secondCircleRadius;

  const stepScales = {
    0: {
      orientation: 'horizontal',
      direction: 'top',
      displaceX: HORIZONTAL_DISPLACE,
      displaceY: smallestDimension / 2 - HORIZONTAL_MARGIN / 2,
      displaceText: HORIZONTAL_MARGIN * .2 + 5
    },
    1: {
      orientation: 'vertical',
      displaceX: smallestDimension / 2,
      displaceY: 0,
    },
    2: {
      orientation: 'horizontal',
      displaceX: smallestDimension - BAR_SIZE - HORIZONTAL_DISPLACE,
      displaceY: smallestDimension / 2 - HORIZONTAL_MARGIN / 2,
      displaceText: HORIZONTAL_MARGIN * .2 + 5,
      direction: 'top',
    },
    3: {
      orientation: 'horizontal',
      displaceX: smallestDimension - BAR_SIZE - HORIZONTAL_DISPLACE,
      displaceY: smallestDimension / 2 + HORIZONTAL_MARGIN / 2,
      displaceText: -5,
      direction: 'bottom',
    },
    4: {
      orientation: 'vertical',
      displaceX: smallestDimension / 2,
      displaceY: smallestDimension - BAR_SIZE,
    },
    5: {
      orientation: 'horizontal',
      displaceY: smallestDimension / 2 + HORIZONTAL_MARGIN / 2,
      displaceX: HORIZONTAL_DISPLACE,
      displaceText: -5,
      direction: 'bottom'
    }
  }
  // const highlightedNode = highlightedFilter ? steps.find(s => s.field === highlightedFilter.key).find(node => node.id === highlightedFilter.value) : undefined;
  const highlightedNode = highlightedFilter ? data.find(s => s.field === highlightedFilter.key).nodes.find(node => node.id === highlightedFilter.value) : undefined;
  const highlightedNodeTotal = highlightedNode ? highlightedNode.flows.reduce((sum, f) => sum + (+f[sumBy]), 0) : 0;

  // const legendX1 = smallestDimension * .36;
  // const legendX2 = smallestDimension * .64;

  const legendX1 = smallestDimension * .4;
  const legendX2 = smallestDimension * .6;

  const legendTopYInternal = smallestDimension / 2 - HORIZONTAL_MARGIN * .5 + BAR_WIDTH;
  const legendTopYExternal = smallestDimension / 2 - HORIZONTAL_MARGIN + BAR_WIDTH;
  const legendBottomYInternal = smallestDimension / 2 + HORIZONTAL_MARGIN * .5 + BAR_WIDTH;
  const legendBottomYExternal = smallestDimension / 2 + HORIZONTAL_MARGIN;
  return (
    <>
      <h5 ref={titleRef} className="visualization-title">{title}</h5>
      <svg 
        data-for="alluvial-tooltip"
        data-tip={tooltipContent}
        width={width} 
        height={height} 
        className={cx("CircularAlluvialChart", { 'has-filters': filters.length, 'has-highlight': highlightedFlow || highlightedFilter })}
      >
        <G  transform={`translate(${width * .05}, ${height * .05})scale(.9)`}>
        <G className="background-marks" transform={`translate(${align === 'left' ?  0 : width / 2 - smallestDimension / 2}, 0)`} >
          <Line x1={0} x2={smallestDimension} y1={smallestDimension / 2} y2={smallestDimension / 2} />
          {
            debug ?
              <>
                <Circle
                  cx={smallestDimension / 2}
                  cy={smallestDimension / 2}
                  r={smallestDimension * .5}
                />
                <Circle
                  cx={smallestDimension / 2}
                  cy={smallestDimension / 2}
                  r={thirdCircleRadius}
                />
                <Circle
                  cx={smallestDimension / 2}
                  cy={smallestDimension / 2}
                  r={secondCircleRadius}
                />

              </>
              : null
          }
          <Text
            x={smallestDimension / 2}
            y={smallestDimension / 2 - HORIZONTAL_MARGIN * .5 + BAR_WIDTH}
            style={{
              fontSize: textScale(1),
              fontWeight: (highlightedFilter && highlightedFilter.index <= 2) || (highlightedFlow && highlightedFlow.stepIndex <= 2) ? 800 : undefined
            }}
          >
            EXPORTS
          </Text>
          
          <Text
            x={smallestDimension / 2}
            y={smallestDimension / 2 + HORIZONTAL_MARGIN * .5 + BAR_WIDTH}
            style={{
              fontSize: textScale(1),
              fontWeight: (highlightedFilter && highlightedFilter.index > 2 ) || (highlightedFlow && highlightedFlow.stepIndex > 2) ? 800 : undefined
            }}
          >
            IMPORTS
          </Text>
          <Path
            d={`M ${legendX1} ${legendTopYInternal} 
            Q ${legendX1} ${legendTopYExternal}, ${smallestDimension/2} ${legendTopYExternal} 
            Q ${legendX2} ${legendTopYExternal}, ${legendX2} ${legendTopYInternal}`}
            stroke={'grey'} strokeWidth={.5}
            fill="none"
            markerEnd="url(#arrowhead)"
            style={{
              opacity: (highlightedFilter && highlightedFilter.index <= 2 ) || (highlightedFlow && highlightedFlow.stepIndex <= 2) ? 1 : .5
            }}
          />
          <Text
            x={legendX1 - 5}
            y={smallestDimension / 2 - HORIZONTAL_MARGIN * .5 + BAR_WIDTH}
            style={{
              fontSize: textScale(.5),
              fontStyle: 'italic',
              textAnchor: 'end',
              opacity: (highlightedFilter && highlightedFilter.index <= 2 ) || (highlightedFlow && highlightedFlow.stepIndex <= 2) ? 1 : .5
            }}
          >
            {steps[0].name}
          </Text>
          <Text
            x={smallestDimension / 2}
            y={legendTopYExternal - 5}
            style={{
              fontSize: textScale(.5),
              fontStyle: 'italic',
              textAnchor: 'middle',
              opacity: (highlightedFilter && highlightedFilter.index <= 2 ) || (highlightedFlow && highlightedFlow.stepIndex <= 2) ? 1 : .5
            }}
          >
            {steps[1].name}
          </Text>
          <Text
            x={legendX2 + 5}
            y={smallestDimension / 2 - HORIZONTAL_MARGIN * .5 + BAR_WIDTH}
            style={{
              fontSize: textScale(.5),
              fontStyle: 'italic',
              textAnchor: 'start',
              opacity: (highlightedFilter && highlightedFilter.index <= 2 ) || (highlightedFlow && highlightedFlow.stepIndex <= 2) ? 1 : .5
            }}
          >
            {steps[2].name}
          </Text>
          
          <Path
            d={`M ${legendX2} ${legendBottomYInternal} 
            Q ${legendX2} ${legendBottomYExternal}, ${smallestDimension/2} ${legendBottomYExternal} 
            Q ${legendX1} ${legendBottomYExternal}, ${legendX1} ${legendBottomYInternal}`}
            stroke={'grey'} 
            strokeWidth={.5}
            fill="none"
            markerEnd="url(#arrowhead)"
            style={{
              opacity: (highlightedFilter && highlightedFilter.index <= 2 ) || (highlightedFlow && highlightedFlow.stepIndex <= 2) ? 1 : .5
            }}
          />
          <Text
            x={legendX1 - 5}
            y={smallestDimension / 2 + HORIZONTAL_MARGIN * .5 + BAR_WIDTH}
            style={{
              fontSize: textScale(.5),
              fontStyle: 'italic',
              textAnchor: 'end',
              opacity: (highlightedFilter && highlightedFilter.index > 2 ) || (highlightedFlow && highlightedFlow.stepIndex > 2) ? 1 : .5
            }}
          >
            {steps[5].name}
          </Text>
          <Text
            x={smallestDimension / 2}
            y={legendBottomYExternal + 10}
            style={{
              fontSize: textScale(.5),
              fontStyle: 'italic',
              textAnchor: 'middle',
              opacity: (highlightedFilter && highlightedFilter.index > 2 ) || (highlightedFlow && highlightedFlow.stepIndex > 2) ? 1 : .5
            }}
          >
            {steps[4].name}
          </Text>
          <Text
            x={legendX2 + 5}
            y={smallestDimension / 2 + HORIZONTAL_MARGIN * .5 + BAR_WIDTH}
            style={{
              fontSize: textScale(.5),
              fontStyle: 'italic',
              textAnchor: 'start',
              opacity: (highlightedFilter && highlightedFilter.index > 2 ) || (highlightedFlow && highlightedFlow.stepIndex > 2) ? 1 : .5
            }}
          >
            {steps[3].name}
          </Text>
          

          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="10"
            refX="0" refY="5" orient="auto">
              <polygon stroke="grey" strokeWidth={1} fill="grey" points="0 0, 10 5, 0 10" />
            </marker>
          </defs>
        </G>
        <G 
          transform={`translate(${align === 'left' ? 0 : width / 2 - smallestDimension / 2}, 0)`}
        >
          {
            data
              .map((step, stepIndex) => {
                const { orientation, direction, displaceX, displaceY: initialDisplaceY, displaceText } = stepScales[stepIndex];
                let displaceY = initialDisplaceY;
                let nodesSizeScale = scaleLinear().domain([0, 1]).range([0, orientation === 'vertical' ? VERTICAL_BAR_SIZE : BAR_SIZE - HORIZONTAL_DISPLACE]);
                let displaceLabels = 0;
                return (
                  <G
                    className={cx("step-container", 'is-oriented-' + orientation)}
                    key={stepIndex}
                  >
                    <Rect
                      x={displaceX}
                      y={displaceY}
                      width={orientation === 'vertical' ? BAR_WIDTH : BAR_SIZE}
                      height={orientation === 'vertical' ? BAR_SIZE : BAR_WIDTH}
                      fill="white"
                      className="step-bar-background"
                    />
                    {
                      /** for each node display links to next */

                      step.nodes
                        .map((node, nodeIndex) => {
                          return (
                            <G
                              className={cx("links-group")}
                              key={nodeIndex}
                            >
                              {
                                node.flows
                                  .filter(f => f.nextPosition)
                                  .map((flow, linkIndex) => {
                                    const handleClick = () => {
                                      if (highlightedFlow && highlightedFlow._id === flow._id) {
                                        setHighlightedFilter(undefined);
                                        setHighlightedFlow(undefined);
                                      }
                                      else {
                                        if (highlightedFilter) {
                                          setHighlightedFilter(undefined);
                                        }
                                        setHighlightedFlow({...flow, stepIndex});
                                      }
                                      
                                    }
                                    const nextStepScales = stepScales[stepIndex + 1];
                                    let nextNodesSizeScale = scaleLinear().domain([0, 1]).range([0, nextStepScales.orientation === 'vertical' ? VERTICAL_BAR_SIZE : BAR_SIZE - BAR_WIDTH / 3]);

                                    let x1 = displaceX + BAR_WIDTH;
                                    let y1 = displaceY + nodesSizeScale(flow.displacePart);

                                    let x2 = nextStepScales.displaceX //+ stepXScale(stepIndex + 1);
                                    let y2 = nextStepScales.displaceY + nextNodesSizeScale(flow.nextPosition.displacePart);

                                    let x3 = nextStepScales.displaceX // + stepXScale(stepIndex + 1);
                                    let y3 = nextStepScales.displaceY + nextNodesSizeScale(flow.nextPosition.displacePart) + nextNodesSizeScale(flow.valuePart);

                                    let y4 = displaceY + nodesSizeScale(flow.displacePart) + nodesSizeScale(flow.valuePart);
                                    let x4 = displaceX + BAR_WIDTH;

                                    if (orientation === 'horizontal') {
                                      x1 = displaceX + nodesSizeScale(flow.displacePart);;
                                      y1 = displaceY + (direction === 'bottom' ? BAR_WIDTH : 0);
                                      y4 = displaceY + (direction === 'bottom' ? BAR_WIDTH : 0);
                                      x4 = displaceX + nodesSizeScale(flow.displacePart) + nodesSizeScale(flow.valuePart);
                                    }
                                    if (nextStepScales.orientation === 'horizontal') {
                                      x2 = nextStepScales.displaceX + nextNodesSizeScale(flow.nextPosition.displacePart) + nextNodesSizeScale(flow.valuePart)
                                      y2 = nextStepScales.displaceY + (nextStepScales.direction === 'bottom' ? BAR_WIDTH : 0);

                                      x3 = nextStepScales.displaceX + nextNodesSizeScale(flow.nextPosition.displacePart);
                                      y3 = nextStepScales.displaceY + (nextStepScales.direction === 'bottom' ? BAR_WIDTH : 0);
                                    }
                                    // @todo do this cleaner
                                    if (stepIndex === 3) {
                                      x2 += BAR_WIDTH;
                                      x3 += BAR_WIDTH;
                                      y2 += BAR_WIDTH * 2;
                                      y3 += BAR_WIDTH * 2;
                                    }
                                    if (stepIndex === 4) {
                                      x1 -= BAR_WIDTH;
                                      x4 -= BAR_WIDTH;
                                      y1 += BAR_WIDTH * 2;
                                      y4 += BAR_WIDTH * 2;
                                    }
                                    // large arc control point 1
                                    let controlPoint1AX = x1,
                                      controlPoint1AY = y2,
                                      // large arc control point 2
                                      controlPoint1BX = x1,
                                      controlPoint1BY = y2,
                                      // little arc control point 1
                                      controlPoint2AX = x4,
                                      controlPoint2AY = y3,
                                      // little arc control point 2
                                      controlPoint2BX = x4,
                                      controlPoint2BY = y3;
                                    if (stepIndex === 1 || stepIndex === 4) {
                                      // large arc control point 1
                                      controlPoint1AX = x2;
                                      controlPoint1AY = y1;
                                      // large arc control point 2
                                      controlPoint1BX = x2;
                                      controlPoint1BY = y1;
                                      // little arc control point 1
                                      controlPoint2AX = x3;
                                      controlPoint2AY = y4;
                                      // little arc control point 2
                                      controlPoint2BX = x3;
                                      controlPoint2BY = y4;
                                    }
                                    if (stepIndex === 0) {
                                      controlPoint1AY = y1 - (4 / 3) * (1 - Math.cos(45) / Math.sin(45)) * Math.abs(y2 - y1);
                                      controlPoint1BX = x2 - (4 / 3) * (1 - Math.cos(45) / Math.sin(45)) * Math.abs(x2 - x1);

                                      controlPoint2BY = y4 - (4 / 3) * (1 - Math.cos(45) / Math.sin(45)) * Math.abs(y4 - y3);
                                      controlPoint2AX = x3 - (4 / 3) * (1 - Math.cos(45) / Math.sin(45)) * Math.abs(x3 - x4);

                                    } else if (stepIndex === 1) {
                                      controlPoint1AX = x1 + (4 / 3) * (1 - Math.cos(45) / Math.sin(45)) * Math.abs(x2 - x1);
                                      controlPoint1BY = y2 - (4 / 3) * (1 - Math.cos(45) / Math.sin(45)) * Math.abs(y2 - y1);

                                      controlPoint2AY = y3 - (4 / 3) * (1 - Math.cos(45) / Math.sin(45)) * Math.abs(y3 - y4);
                                      controlPoint2BX = x4 + (4 / 3) * (1 - Math.cos(45) / Math.sin(45)) * Math.abs(x4 - x3);
                                    } else if (stepIndex === 3) {
                                      controlPoint1AY = y1 + (4 / 3) * (1 - Math.cos(45) / Math.sin(45)) * Math.abs(y2 - y1);
                                      controlPoint1BX = x2 + (4 / 3) * (1 - Math.cos(45) / Math.sin(45)) * Math.abs(x2 - x1);

                                      controlPoint2AX = x3 + (4 / 3) * (1 - Math.cos(45) / Math.sin(45)) * Math.abs(x4 - x3);
                                      controlPoint2BY = y4 + (4 / 3) * (1 - Math.cos(45) / Math.sin(45)) * Math.abs(y3 - y4);
                                    } else if (stepIndex === 4) {
                                      controlPoint1AX = x1 - (4 / 3) * (1 - Math.cos(45) / Math.sin(45)) * Math.abs(x2 - x1);
                                      controlPoint1BY = y2 + (4 / 3) * (1 - Math.cos(45) / Math.sin(45)) * Math.abs(y2 - y1);

                                      controlPoint2BX = x4 - (4 / 3) * (1 - Math.cos(45) / Math.sin(45)) * Math.abs(x4 - x3);
                                      controlPoint2AY = y3 + (4 / 3) * (1 - Math.cos(45) / Math.sin(45)) * Math.abs(y3 - y4);
                                    }
                                    const {flow_type, customs_office} = flow;
                                    const value = flow[sumBy];
                                    const tContent = tooltips.flow[lang]({
                                      flow_type, 
                                      customs_office, 
                                      product: flow['product_' + lang], 
                                      sumBy, 
                                      partner: flow['partner_' + lang],
                                      value
                                    })
                                    // console.log('tContent : ', tContent);
                                    return (
                                      <G
                                        onClick={handleClick}
                                        className={cx("flow-link", {
                                          'is-filtered-in': filters && filters.find(({ key, value }) => flow[key] === value),
                                          'is-highlighted': (highlightedFlow && highlightedFlow._id === flow._id) ||
                                            (highlightedFilter && flow[highlightedFilter.key] === highlightedFilter.value)
                                        })}
                                        key={linkIndex}
                                        data-for="alluvial-tooltip"
                                        data-tip={tContent}
                                      >
                                        <Path
                                          d={`
                                    M ${x1} ${y1} 
                                    C ${controlPoint1AX},${controlPoint1AY} ${controlPoint1BX},${controlPoint1BY} ${x2} ${y2} 
                                    L ${x3} ${y3}
                                    C ${controlPoint2AX},${controlPoint2AY} ${controlPoint2BX},${controlPoint2BY} ${x4} ${y4} 
                                    Z
                                    `.trim().replace(/\n/g, ' ')}
                                          style={{ fill: colorsPalettes ? colorsPalettes[step.field][node.id] : colorScales[step.field][node.id] }}
                                        />
                                        {
                                          debug ?
                                            <>
                                              {/* control line for control point 1 for large arc */}
                                              <Line
                                                stroke={'red'}
                                                x1={x1}
                                                y1={y1}
                                                x2={controlPoint1AX}
                                                y2={controlPoint1AY}
                                              />
                                              <Circle
                                                cx={controlPoint1AX}
                                                cy={controlPoint1AY}
                                                r={2}
                                                fill="red"
                                              />
                                              {/* control line for control point 2 for large arc */}
                                              <Line
                                                stroke={'blue'}
                                                x1={x2}
                                                y1={y2}
                                                x2={controlPoint1BX}
                                                y2={controlPoint1BY}
                                              />
                                              <Circle
                                                cx={controlPoint1BX}
                                                cy={controlPoint1BY}
                                                r={2}
                                                fill="blue"
                                              />
                                              {/* control line for control point 1 for small arc */}
                                              <Line
                                                stroke={'green'}
                                                x1={x3}
                                                y1={y3}
                                                x2={controlPoint2AX}
                                                y2={controlPoint2AY}
                                              />
                                              <Circle
                                                cx={controlPoint2AX}
                                                cy={controlPoint2AY}
                                                r={2}
                                                fill="green"
                                              />
                                              {/* control line for control point 2 for small arc */}
                                              <Line
                                                stroke={'lightblue'}
                                                x1={x4}
                                                y1={y4}
                                                x2={controlPoint2BX}
                                                y2={controlPoint2BY}
                                              />
                                              <Circle
                                                cx={controlPoint2BX}
                                                cy={controlPoint2BY}
                                                r={2}
                                                fill="lightblue"
                                              />
                                            </>
                                            : null
                                        }
                                      </G>
                                    )
                                  })
                              }
                            </G>
                          )
                        })
                    }
                    {
                      step.nodes.map((node, nodeIndex) => {
                        const nodeHeight = nodesSizeScale(node.valuePart);
                        const initialY = nodesSizeScale(node.displacePart);
                        const initialWidth = BAR_WIDTH;
                        const initialHeight = nodeHeight - 2;

                        let y = displaceY + initialY;
                        let x = displaceX;
                        let nodeWidth = initialWidth;
                        let actualHeight = initialHeight;
                        if (orientation === 'horizontal') {
                          nodeWidth = initialHeight;
                          actualHeight = initialWidth;
                          x = displaceX + initialY;
                          y = displaceY;
                        }
                        if (stepIndex === 4) {
                          y += BAR_WIDTH * 2;
                        }
                        const handleClick = () => {
                          if (highlightedFilter && highlightedFilter.value === node.id) {
                            setHighlightedFlow(undefined);
                            setHighlightedFilter(undefined);
                          }
                          else {
                            if (highlightedFlow) {
                              setHighlightedFlow(undefined);
                            }
                            setHighlightedFilter({ key: step.field, value: node.id, index: stepIndex })
                          }
                        }
                        const isHighlighted = highlightedFilter && node.id === highlightedFilter.value && stepIndex === highlightedFilter.index;
                        let labelHighlightPart = 0;
                        if (highlightedFilter) {
                          labelHighlightPart = node.flows.filter(f => f[highlightedFilter.key] === highlightedFilter.value).reduce((sum, f) => sum + (+f[sumBy]), 0) / highlightedNodeTotal;
                        } else if (filters && filters.length) {
                          labelHighlightPart = node.flows
                          .filter(flow => filters.find(({ key, value }) => flow[key] === value))
                          .reduce((sum, f) => sum + (+f[sumBy]), 0) 
                          / filtersTotal;
                        }
                        if (labelHighlightPart > 1) {
                          labelHighlightPart = 1;
                        }
                        const isFilteredIn = filters && filters.find(({ key, value }) => node.flows.find(flow => flow[key] === value))
                        let textRotate = 0;
                        if (stepIndex === 0 || stepIndex === 2) {
                          textRotate = 30;
                        } else if (stepIndex === 3 || stepIndex === 5) {
                          textRotate = -30;
                        }
                        const initialLabelX = orientation === 'vertical' ? x + BAR_WIDTH * 2 : x + (centerHorizontalLabels ? nodeWidth / 2 : 0);
                        let labelX = initialLabelX;
                        if (orientation === 'horizontal') {
                      
                          const minTextWidth = 20;
                          if (displaceHorizontalLabels && displaceLabels && labelX < displaceLabels + minTextWidth) {
                            labelX = displaceLabels + minTextWidth;
                          }
                          displaceLabels = labelX;
                        }
                        const labelY = orientation === 'vertical' ? y + actualHeight / 2 : y + displaceText;
                        const [labelMain, labelSecondary] = trimText(node.label || node.id, 20);
                        const nodeHasHighlights = (highlightedFlow && node.flows.find(flow => flow._id === highlightedFlow._id)) ||
                        (highlightedFilter && step.id === highlightedFilter.key && node.id === highlightedFilter.value);
                        const nodeIsHighlighted = (highlightedFilter && step.field === highlightedFilter.key && node.id === highlightedFilter.value);
                        const labelFontSize = (highlightedFilter || highlightedNode) ? labelHighlightPart > 0 ? textScale(labelHighlightPart) : textScale(node.valuePart) : textScale(1)
                        const tContent = tooltips.node(node, stepIndex);
                        return (
                          <G
                            className={cx("step-node-container", {
                              'has-highlights': nodeHasHighlights,
                              'is-filtered-in': isFilteredIn,
                              'is-highlighted': nodeIsHighlighted,
                            })}
                            key={node.id}
                            onClick={handleClick}
                            data-for="alluvial-tooltip"
                            data-tip={tContent}
                          >
                            <Rect
                              x={x}
                              y={y}
                              width={nodeWidth}
                              height={actualHeight}
                              className="node-level-node"
                            />
                            <G
                              transform={`
                            translate(${labelX}, ${labelY})
                            rotate(${textRotate})
                          `}

                              className={
                                cx("node-level-label", {
                                  'is-filtered-in': isFilteredIn,
                                  'is-highlighted': isHighlighted,
                                  'is-secondary-highlighted': !isHighlighted && labelHighlightPart > 0
                                })
                              }
                            >
                              <Text
                                style={{
                                  fontSize: stepIndex === 0 || [2, 3, 5].find(index => index === stepIndex) ? labelFontSize * .75 : labelFontSize,
                                  
                                }}
                              >
                                {isFilteredIn || isHighlighted ? labelMain + ' ' + (labelSecondary ? labelSecondary : '') : `${labelSecondary ? labelMain + '...' : labelMain}`}
                              </Text>
                            </G>
                            {
                                displaceHorizontalLabels && initialLabelX !== labelX ?
                                <Line
                                  x1={x + nodeHeight / 2}
                                  y1={stepIndex === 0 || stepIndex === 2 ? y + BAR_WIDTH : y}
                                  x2={labelX}
                                  y2={labelY}
                                  className={
                                    cx("label-line", {
                                      'is-filtered-in': isFilteredIn,
                                      'is-highlighted': isHighlighted,
                                      'is-secondary-highlighted': !isHighlighted && labelHighlightPart > 0
                                    })
                                  }

                                />
                                : null
                            }
                            {
                              node.flows.map((flow, flowIndex) => {
                                let flowX = x;
                                let flowY = displaceY + nodesSizeScale(flow.displacePart);
                                if (stepIndex === 4) {
                                  flowY += BAR_WIDTH * 2;
                                }
                                let flowWidth = BAR_WIDTH;
                                let flowHeight = nodesSizeScale(flow.valuePart);
                                if (orientation === 'horizontal') {
                                  flowWidth = nodesSizeScale(flow.valuePart);
                                  flowHeight = BAR_WIDTH;
                                  flowX = displaceX + nodesSizeScale(flow.displacePart);
                                  flowY = displaceY;
                                }
                                return (
                                  <Rect
                                    key={flowIndex}
                                    x={flowX}
                                    y={flowY}
                                    width={flowWidth}
                                    height={flowHeight}
                                    className={
                                      cx("flow-level-node", {
                                        'is-filtered-in': filters && filters.find(({ key, value }) => flow[key] === value),

                                        'is-highlighted': (highlightedFlow && highlightedFlow._id === flow._id) ||
                                          (highlightedFilter && flow[highlightedFilter.key] === highlightedFilter.value)
                                        // || (highlightedFilter && flow[highlightedFilter.key] === highlightedFilter.value)
                                      })
                                    }
                                    style={{ fill: colorsPalettes ? colorsPalettes[step.field][node.id] : colorScales[step.field][node.id] }}
                                    title={node.id}
                                  />
                                )
                              })
                            }
                          </G>
                        )
                      })
                    }

                  </G>
                )
              })
          }
        </G>
        </G>
      </svg>
      <ReactTooltip id="alluvial-tooltip" />
    </>
  )
}

export default CircularAlluvialChart;