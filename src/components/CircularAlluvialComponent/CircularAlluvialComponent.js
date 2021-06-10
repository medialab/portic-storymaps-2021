import {useMemo, useState} from 'react';
import {scaleLinear} from 'd3-scale';
import cx from 'classnames';

import {prepareAlluvialData} from './utils';

import './CircularAlluvialComponent.scss';
import { min } from 'd3-array';

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
  }, [inputData]);

  const smallestDimension = useMemo(() => {
    return min([width, height])
  }, [width, height])

  const BAR_SIZE = smallestDimension / 3;
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
        displaceText: HORIZONTAL_MARGIN * .15
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
      displaceText: HORIZONTAL_MARGIN * .15,
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
      <svg width={width} height={height} className={cx("CircularAlluvialComponent", {'has-filters': filters.length})}>
        <g transform={`translate(${width / 2 - smallestDimension / 2}, 0)`} onMouseOut={handleMouseOut}>
          {
            data
            // .filter((step, stepIndex) => stepScales[stepIndex].orientation === 'vertical')
            .map((step, stepIndex) => {
              let nodesSizeScale = scaleLinear().domain([0, 1]).range([0, BAR_SIZE]);
              const {orientation, direction, displaceX, displaceY, displaceText} = stepScales[stepIndex];
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
                        <g className="links-group" key={nodeIndex}>
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
                                  <polygon 
                                    points={`
                                    ${x1},${y1} 
                                    ${x2}, ${y2} 
                                    ${x3} ${y3}
                                    ${x4},${y4} 
                                    `}
                                    title={'Valeur : ' + flow.valueAbs}
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
                      return (
                        <g 
                          className="step-node-container" 
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
                                'is-filtered-in': filters && filters.find(({key, value}) => node.flows.find(flow => flow[key] === value)),
                              })
                            }
                          >
                            <text
                              style={{
                                fontSize: textScale(node.valuePart)
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
                                      'is-filtered-in': filters && filters.find(({key, value}) => flow[key] === value),

                                      'is-highlighted': (highlightedFlow && highlightedFlow._id === flow._id)
                                      || (highlightedFilter && flow[highlightedFilter.key] === highlightedFilter.value)
                                    })
                                  }
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
  )
}

export default CircularAlluvialComponent;