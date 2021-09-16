import { useEffect, useMemo, useRef, useState } from 'react';
import { scaleLinear } from 'd3-scale';
import {
  schemeAccent as colorScheme1,
  schemeDark2 as colorScheme2,
  schemePaired as colorScheme3
} from 'd3-scale-chromatic';
import cx from 'classnames';

import { prepareAlluvialData } from './utils';

import './CircularAlluvialComponent.scss';
import { min } from 'd3-array';
import { uniq } from 'lodash-es';
import { cartesian2Polar, fixSvgDimension, trimText } from '../../helpers/misc';
import ReactTooltip from 'react-tooltip';

const colorSchemes = [colorScheme1, colorScheme2, colorScheme3]

const CircularAlluvialComponent = ({
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
  const textScale = scaleLinear().range([smallestDimension / 120, smallestDimension / 70]).domain([0, 1])
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
  return (
    <>
      <h5 ref={titleRef} className="visualization-title">{title}</h5>
      <svg 
        data-for="alluvial-tooltip"
        data-tip={tooltipContent}
        width={width} 
        height={height} 
        className={cx("CircularAlluvialComponent", { 'has-filters': filters.length, 'has-highlight': highlightedFlow || highlightedFilter })}
      >
        <g  transform={`translate(${width * .05}, ${height * .05})scale(.9)`}>
        <g className="background-marks" transform={`translate(${width / 2 - smallestDimension / 2}, 0)`} >
          <line x1={0} x2={smallestDimension} y1={smallestDimension / 2} y2={smallestDimension / 2} />
          {
            debug ?
              <>
                <circle
                  cx={smallestDimension / 2}
                  cy={smallestDimension / 2}
                  r={smallestDimension * .5}
                />
                <circle
                  cx={smallestDimension / 2}
                  cy={smallestDimension / 2}
                  r={thirdCircleRadius}
                />
                <circle
                  cx={smallestDimension / 2}
                  cy={smallestDimension / 2}
                  r={secondCircleRadius}
                />

              </>
              : null
          }
          <text
            x={smallestDimension / 2}
            y={smallestDimension / 2 - HORIZONTAL_MARGIN * .8 + BAR_WIDTH}
            style={{
              fontWeight: (highlightedFilter && highlightedFilter.index <= 2) || (highlightedFlow && highlightedFlow.stepIndex <= 2) ? 800 : undefined
            }}
          >
            EXPORTS
          </text>
          <text
            x={smallestDimension / 2}
            y={smallestDimension / 2 + HORIZONTAL_MARGIN * .8 + BAR_WIDTH}
            style={{
              fontWeight: (highlightedFilter && highlightedFilter.index > 2 ) || (highlightedFlow && highlightedFlow.stepIndex > 2) ? 800 : undefined
            }}
          >
            IMPORTS
          </text>
        </g>
        <g 
        transform={`translate(${width / 2 - smallestDimension / 2}, 0)`}>
          {
            data
              .map((step, stepIndex) => {
                const { orientation, direction, displaceX, displaceY: initialDisplaceY, displaceText } = stepScales[stepIndex];
                let displaceY = initialDisplaceY;
                let nodesSizeScale = scaleLinear().domain([0, 1]).range([0, orientation === 'vertical' ? VERTICAL_BAR_SIZE : BAR_SIZE - HORIZONTAL_DISPLACE]);
                let displaceLabels = 0;
                return (
                  <g
                    className={cx("step-container", 'is-oriented-' + orientation)}
                    key={stepIndex}
                  >
                    <rect
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
                            <g
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
                                      y2 += BAR_WIDTH;
                                      y3 += BAR_WIDTH;
                                    }
                                    if (stepIndex === 4) {
                                      x1 -= BAR_WIDTH;
                                      x4 -= BAR_WIDTH;
                                      y1 += BAR_WIDTH;
                                      y4 += BAR_WIDTH;
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
                                    const {flow_type, customs_office, product, partner} = flow;
                                    const value = flow[sumBy];
                                    const tContent = tooltips.flow[lang]({flow_type, customs_office, product, sumBy, value, partner})
                                    return (
                                      <g
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
                                        {/* <path 
                                    d={`
                                    M ${x1} ${y1} 
                                    Q ${controlPoint1AX} ${controlPoint1AY}, ${x2} ${y2} 
                                    L ${x3} ${y3}
                                    Q ${controlPoint2AX} ${controlPoint2AY}, ${x4} ${y4} 
                                    Z
                                    `.trim().replace(/\n/g, ' ')}
                                    title={'Valeur : ' + flow.valueAbs}
                                    style={{fill: colorScales[step.field][node.id]}}
                                  /> */}
                                        <path
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
                                              <line
                                                stroke={'red'}
                                                x1={x1}
                                                y1={y1}
                                                x2={controlPoint1AX}
                                                y2={controlPoint1AY}
                                              />
                                              <circle
                                                cx={controlPoint1AX}
                                                cy={controlPoint1AY}
                                                r={2}
                                                fill="red"
                                              />
                                              {/* control line for control point 2 for large arc */}
                                              <line
                                                stroke={'blue'}
                                                x1={x2}
                                                y1={y2}
                                                x2={controlPoint1BX}
                                                y2={controlPoint1BY}
                                              />
                                              <circle
                                                cx={controlPoint1BX}
                                                cy={controlPoint1BY}
                                                r={2}
                                                fill="blue"
                                              />
                                              {/* control line for control point 1 for small arc */}
                                              <line
                                                stroke={'green'}
                                                x1={x3}
                                                y1={y3}
                                                x2={controlPoint2AX}
                                                y2={controlPoint2AY}
                                              />
                                              <circle
                                                cx={controlPoint2AX}
                                                cy={controlPoint2AY}
                                                r={2}
                                                fill="green"
                                              />
                                              {/* control line for control point 2 for small arc */}
                                              <line
                                                stroke={'lightblue'}
                                                x1={x4}
                                                y1={y4}
                                                x2={controlPoint2BX}
                                                y2={controlPoint2BY}
                                              />
                                              <circle
                                                cx={controlPoint2BX}
                                                cy={controlPoint2BY}
                                                r={2}
                                                fill="lightblue"
                                              />
                                            </>
                                            : null
                                        }
                                      </g>
                                    )
                                  })
                              }
                            </g>
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
                          y += BAR_WIDTH;
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
                          // console.groupEnd('test');
                        }
                        const labelY = orientation === 'vertical' ? y + actualHeight / 2 : y + displaceText;
                        const [labelMain, labelSecondary] = trimText(node.id, 20);
                        const nodeHasHighlights = (highlightedFlow && node.flows.find(flow => flow._id === highlightedFlow._id)) ||
                        (highlightedFilter && step.id === highlightedFilter.key && node.id === highlightedFilter.value);
                        const nodeIsHighlighted = (highlightedFilter && step.field === highlightedFilter.key && node.id === highlightedFilter.value);
                        const labelFontSize = (highlightedFilter || highlightedNode) ? labelHighlightPart > 0 ? textScale(labelHighlightPart) : textScale(node.valuePart) : textScale(1)
                        const tContent = tooltips.node[lang](node, stepIndex);
                        return (
                          <g
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
                            <rect
                              x={x}
                              y={y}
                              width={nodeWidth}
                              height={actualHeight}
                              className="node-level-node"
                            />
                            <g
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
                              <text
                                style={{
                                  fontSize: labelFontSize,
                                  
                                }}
                              >
                                {isFilteredIn || isHighlighted ? labelMain + ' ' + (labelSecondary ? labelSecondary : '') : `${labelSecondary ? labelMain + '...' : labelMain}`}
                              </text>
                            </g>
                            {
                                displaceHorizontalLabels && initialLabelX !== labelX ?
                                <line
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
                                  flowY += BAR_WIDTH;
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
                                  <rect
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
                          </g>
                        )
                      })
                    }

                  </g>
                )
              })
          }
        </g>
        </g>
      </svg>
      <ReactTooltip id="alluvial-tooltip" />
    </>
  )
}

export default CircularAlluvialComponent;