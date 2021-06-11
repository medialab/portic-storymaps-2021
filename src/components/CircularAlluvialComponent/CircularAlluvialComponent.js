import {useMemo, useState} from 'react';
import {scaleLinear} from 'd3-scale';
import {
  schemeAccent as colorScheme1,
  schemeDark2 as colorScheme2,
  schemePaired as colorScheme3
} from 'd3-scale-chromatic';
import cx from 'classnames';

import {prepareAlluvialData} from './utils';

import './CircularAlluvialComponent.scss';
import { min } from 'd3-array';
import { uniq } from 'lodash-es';

const colorSchemes = [colorScheme1, colorScheme2, colorScheme3]


const CircularAlluvialComponent = ({
  data : inputData = [],
  sumBy,
  steps,
  width=1200,
  height=800,
  filters = []
}) => {
  const [highlightedFlow, setHighlightedFlow] = useState(undefined);
  const [highlightedFilter, setHighlightedFilter] = useState(undefined);
  const data = useMemo(() => {
    const vizData = prepareAlluvialData(inputData, {sumBy, steps});
    return vizData;
  }, [inputData, sumBy, steps]);

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
          counter ++;
          return {...m, [value]: colorSchemes[fieldIndex][counter - 1]}
        }, {})
      }
    }, {})
  }, [data]);

  const smallestDimension = useMemo(() => {
    return min([width, height])
  }, [width, height])

  const BAR_SIZE = smallestDimension * .33;
  const BAR_WIDTH = smallestDimension / 50;
  // margin for double bars
  const HORIZONTAL_MARGIN = smallestDimension * .15;
  const textScale = scaleLinear().range([smallestDimension / 100, smallestDimension / 50]).domain([0, 1])
  const handleMouseOut = () => {
    setHighlightedFlow(undefined);
    setHighlightedFilter(undefined);
  }
  const stepScales = {
    0: {
        orientation: 'horizontal',
        direction: 'top',
        displaceX: 0,
        displaceY: smallestDimension / 2 - HORIZONTAL_MARGIN / 2,
        displaceText: HORIZONTAL_MARGIN * .2
    },
    1: {
      orientation: 'vertical',
      displaceX: smallestDimension /2,
      displaceY: 0,
    },
    2: {
      orientation: 'horizontal',
      displaceX: smallestDimension - BAR_SIZE,
      displaceY: smallestDimension / 2 - HORIZONTAL_MARGIN / 2,
      displaceText: HORIZONTAL_MARGIN * .2,
      direction: 'top'
    },
    3: {
      orientation: 'horizontal',
      displaceX: smallestDimension - BAR_SIZE,
      displaceY: smallestDimension / 2 + HORIZONTAL_MARGIN / 2,
      displaceText: 0,
      direction: 'bottom',
    },
    4: {
      orientation: 'vertical',
      displaceX: smallestDimension /2,
      displaceY: smallestDimension - BAR_SIZE,
    },
    5: {
      orientation: 'horizontal',
      displaceY: smallestDimension / 2 + HORIZONTAL_MARGIN / 2,
      displaceX: 0,
      displaceText: 0,
      direction: 'bottom'
    }
  }
  return (
    <>
      <div style={{fontSize: '.6rem', alignSelf: 'flex-start'}}>Aggrégation par le champ : {sumBy}</div>
      <svg width={width} height={height} className={cx("CircularAlluvialComponent", {'has-filters': filters.length, 'has-highlight': highlightedFlow || highlightedFilter})}>
        <g className="background-marks">
          <line x1={0} x2={smallestDimension} y1={smallestDimension/2} y2={smallestDimension/2} />
          <circle
            cx={smallestDimension /2}
            cy={ smallestDimension / 2}
            r={smallestDimension * .5}
          />
          <text
            x={smallestDimension / 2}
            y={smallestDimension/2 - HORIZONTAL_MARGIN /2 + BAR_WIDTH}
          >
            EXPORTS
          </text>
          <text
            x={smallestDimension / 2}
            y={smallestDimension/2 + HORIZONTAL_MARGIN /2 + BAR_WIDTH}
          >
            IMPORTS
          </text>
        </g>
        <g transform={`translate(${width / 2 - smallestDimension / 2}, 0)`} onMouseOut={handleMouseOut}>
          {
            data
            .map((step, stepIndex) => {
              const {orientation, direction, displaceX, displaceY, displaceText} = stepScales[stepIndex];
              let nodesSizeScale = scaleLinear().domain([0, 1]).range([0,  BAR_SIZE]);
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
                              const handleMouseOver = () => {
                                if (highlightedFilter) {
                                  setHighlightedFilter(undefined);
                                }
                                setHighlightedFlow(flow);
                              }
                              const nextStepScales  = stepScales[stepIndex + 1];

                              let x1 = displaceX + BAR_WIDTH;
                              let y1 = displaceY + nodesSizeScale(flow.displacePart);
                              
                              let x2 = nextStepScales.displaceX //+ stepXScale(stepIndex + 1);
                              let y2 = nextStepScales.displaceY + nodesSizeScale(flow.nextPosition.displacePart);
                              
                              let x3 = nextStepScales.displaceX // + stepXScale(stepIndex + 1);
                              let y3 = nextStepScales.displaceY + nodesSizeScale(flow.nextPosition.displacePart) + nodesSizeScale(flow.valuePart);
                              
                              let y4 = displaceY + nodesSizeScale(flow.displacePart) + nodesSizeScale(flow.valuePart);
                              let x4 = displaceX + BAR_WIDTH;
                              
                              if (orientation === 'horizontal') {
                                x1 = displaceX + nodesSizeScale(flow.displacePart);;
                                y1 = displaceY + (direction === 'bottom' ? BAR_WIDTH : 0);
                                y4 = displaceY + (direction === 'bottom' ? BAR_WIDTH : 0);
                                x4 = displaceX + nodesSizeScale(flow.displacePart) + nodesSizeScale(flow.valuePart);
                              }
                              if (nextStepScales.orientation === 'horizontal') {
                                x3 = nextStepScales.displaceX + nodesSizeScale(flow.nextPosition.displacePart);
                                y2 = nextStepScales.displaceY + (nextStepScales.direction === 'bottom' ? BAR_WIDTH : 0);
                                y3 = nextStepScales.displaceY + (nextStepScales.direction === 'bottom' ? BAR_WIDTH : 0);
                                x2 = nextStepScales.displaceX +  nodesSizeScale(flow.nextPosition.displacePart) +  nodesSizeScale(flow.valuePart)
                              }
                              // @todo do this cleaner
                              if (stepIndex === 3) {
                                x2 += BAR_WIDTH;
                                x3 += BAR_WIDTH;
                              }
                              if (stepIndex === 4) {
                                x1 -= BAR_WIDTH;
                                x4 -= BAR_WIDTH;
                              }
                              let controlPoint1X = x1,
                                controlPoint1Y = y2,
                                controlPoint2X = x4,
                                controlPoint2Y = y3;
                              if (stepIndex === 1 || stepIndex === 4) {
                                controlPoint1X = x2;
                                controlPoint1Y = y1;
                                controlPoint2X = x3;
                                controlPoint2Y = y4;
                              }
                              return (
                                <g 
                                  onMouseOver={handleMouseOver} 
                                  className={cx("flow-link", {
                                    'is-filtered-in': filters && filters.find(({key, value}) => flow[key] === value),
                                    'is-highlighted': (highlightedFlow && highlightedFlow._id === flow._id) ||
                                    (highlightedFilter && flow[highlightedFilter.key] === highlightedFilter.value)
                                  })} 
                                  key={linkIndex}
                                >
                                  {/* <polygon 
                                    points={`
                                    ${x1},${y1} 
                                    ${x2}, ${y2} 
                                    ${x3} ${y3}
                                    ${x4},${y4} 
                                    `}
                                    title={'Valeur : ' + flow.valueAbs}
                                  /> */}
                                  <path 
                                    d={`
                                    M ${x1} ${y1} 
                                    Q ${controlPoint1X} ${controlPoint1Y}, ${x2} ${y2} 
                                    L ${x3} ${y3}
                                    Q ${controlPoint2X} ${controlPoint2Y}, ${x4} ${y4} 
                                    Z
                                    `.trim().replace(/\n/g, ' ')}
                                    title={'Valeur : ' + flow.valueAbs}
                                    style={{fill: colorScales[step.field][node.id]}}
                                  />
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
                      const handleMouseOver = () => {
                        if (highlightedFlow) {
                          setHighlightedFlow(undefined);
                        }
                        setHighlightedFilter({key: step.field, value: node.id})
                      }
                      const isHighlighted = (highlightedFilter && node.id === highlightedFilter.value);
                      const isFilteredIn = filters && filters.find(({key, value}) => node.flows.find(flow => flow[key] === value))
                      return (
                        <g 
                          className={cx("step-node-container", {
                            'has-highlights': (highlightedFlow && node.flows.find(flow => flow._id === highlightedFlow._id)) || 
                            (highlightedFilter && step.id === highlightedFilter.key && node.id === highlightedFilter.value),
                            'is-highlighted':  (highlightedFilter && step.field === highlightedFilter.key && node.id === highlightedFilter.value),
                        })} 
                          key={node.id}
                          onMouseOver={handleMouseOver}
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
                            translate(${orientation === 'vertical' ? x + BAR_WIDTH * 2 : x + nodeWidth / 2}, ${orientation === 'vertical' ? y + actualHeight / 2 : y + displaceText})
                            rotate(${orientation === 'vertical' ? 0 : direction === 'bottom' ? -45 : 45})
                          `}

                            className={
                              cx("node-level-label", {
                                'is-filtered-in': isFilteredIn,
                                'is-highlighted':  isHighlighted
                              })
                            }
                          >
                            <text
                              style={{
                                fontSize: textScale(node.valuePart) * (isHighlighted ? 1.5 : 1)
                              }}
                            >
                              {node.id.split('(')[0]}
                            </text>
                          </g>
                          {
                            node.flows.map((flow, flowIndex) => {
                              let flowX = x;
                              let flowY = displaceY + nodesSizeScale(flow.displacePart);
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
                                      'is-filtered-in': isFilteredIn,

                                      'is-highlighted': (highlightedFlow && highlightedFlow._id === flow._id) ||
                                      (highlightedFilter && flow[highlightedFilter.key] === highlightedFilter.value)
                                      // || (highlightedFilter && flow[highlightedFilter.key] === highlightedFilter.value)
                                    })
                                  }
                                  style={{fill: colorScales[step.field][node.id]}}
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
        
      </svg>
      {
        highlightedFlow ?
        <div style={{
          position:'absolute',
          left: 0,
          bottom: '1rem',
          maxWidth: smallestDimension / 2,
          fontSize: '.8rem'
        }}>
            Flux affiché : {highlightedFlow.flow_type} de {highlightedFlow.product} {highlightedFlow.flow_type === 'export' ? 'vers' : 'depuis'} {highlightedFlow.partner} (valeur : {highlightedFlow[sumBy]})
        </div>
        : null
      }
      </>
  )
}

export default CircularAlluvialComponent;