import {useMemo, useState} from 'react';
import {scaleLinear} from 'd3-scale';
import cx from 'classnames';

import {prepareAlluvialData} from './utils';

import './LinearAlluvialChart.scss';

/**
 * A classical alluvial chart component
 * @param {array<object>} data
 * @param {string} sumBy
 * @param {array} steps
 * @param {number} width
 * @param {number} height
 * @param {array<object>} filters - filters in the form {key: [string], value: [string]}
 * @param {object} colorsPalettes - map of key-values
 * @returns {React.ReactElement} - React component 
 */
const LinearAlluvialChart = ({
  data : inputData = [],
  sumBy,
  steps,
  width=1200,
  height=800,
  filters = [],
  colorsPalettes = {}
}) => {
  const [highlightedFlow, setHighlightedFlow] = useState(undefined);
  const [highlightedFilter, setHighlightedFilter] = useState(undefined);
  const data = useMemo(() => {
    const vizData = prepareAlluvialData(inputData, {sumBy, steps});
    return vizData;
  }, [inputData, sumBy, steps]);

  const BAR_WIDTH = width / 100;
  const stepXScale = scaleLinear().range([0, width]).domain([0, data.length - 1])
  const handleMouseOut = () => {
    setHighlightedFlow(undefined);
    setHighlightedFilter(undefined);
  }
  return (
      <svg width={width} height={height} className={cx("LinearAlluvialChart", {'has-filters': filters.length})}>
        <g onMouseOut={handleMouseOut} transform={'scale(0.8)translate(10,10)'}>
          {
            data.map((step, stepIndex) => {
              const nodesYScale = scaleLinear().domain([0, 1]).range([0, height]);
              const x = stepXScale(stepIndex);
              return (
                <g 
                  className="step-container" 
                  key={stepIndex}
                >
                  <rect
                    x={x}
                    y={0}
                    width={BAR_WIDTH}
                    height={height}
                    fill="white"
                    className="step-bar-background"
                  />
                  {
                    /** for each node display links to next */

                    step.nodes
                    .map((node, nodeIndex) => {
                      const x1 = stepXScale(stepIndex) + BAR_WIDTH;
                      const x2 = stepXScale(stepIndex + 1);
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
                                    ${x1},${nodesYScale(flow.displacePart)} 
                                    ${x2}, ${nodesYScale(flow.nextPosition.displacePart)} 
                                    ${x2} ${nodesYScale(flow.nextPosition.displacePart) + nodesYScale(flow.valuePart)}
                                    ${x1},${nodesYScale(flow.displacePart) + nodesYScale(flow.valuePart)} 
                                    `}
                                    title={'Valeur : ' + flow.valueAbs}
                                    fill={colorsPalettes && colorsPalettes[step.field] && colorsPalettes[step.field][node.id]}
                                  /> */}
                                  <path 
                                    d={`
                                    M ${x1} ${nodesYScale(flow.displacePart)} 
                                    L ${x2} ${nodesYScale(flow.nextPosition.displacePart)} 
                                    L ${x2} ${nodesYScale(flow.nextPosition.displacePart) + nodesYScale(flow.valuePart)}
                                    L ${x1} ${nodesYScale(flow.displacePart) + nodesYScale(flow.valuePart)} 
                                    Z
                                    `}
                                    title={'Valeur : ' + flow.valueAbs}
                                    fill={colorsPalettes && colorsPalettes[step.field] && colorsPalettes[step.field][node.id]}
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
                      const nodeHeight = nodesYScale(node.valuePart);
                      const y = nodesYScale(node.displacePart);
                      const handleMouseOver = () => {
                        if (highlightedFlow) {
                          setHighlightedFlow(undefined);
                        }
                        setHighlightedFilter({key: step.field, value: node.id})
                      }
                      console.log(node.id, colorsPalettes[step.field][node.id])

                      return (
                        <g 
                          className="step-node-container" 
                          key={node.id}
                          onMouseOver={handleMouseOver}
                        >
                          <rect
                            x={x}
                            y={y}
                            width={BAR_WIDTH}
                            height={nodeHeight - 2}
                            className="node-level-node"
                          />
                          <text
                            y={y + nodeHeight / 2}
                            x={x + BAR_WIDTH * 2}
                            className={
                              cx("node-level-label", {
                                'is-filtered-in': filters && filters.find(({key, value}) => node.flows.find(flow => flow[key] === value)),
                              })
                            }
                          >
                            {node.id.split('(')[0]}
                          </text>
                          {
                            node.flows.map((flow, flowIndex) => {
                              
                              return (
                                <rect
                                  key={flowIndex}
                                  x={x}
                                  y={nodesYScale(flow.displacePart)}
                                  width={BAR_WIDTH}
                                  height={nodesYScale(flow.valuePart)}
                                  className={
                                    cx("flow-level-node", {
                                      'is-filtered-in': filters && filters.find(({key, value}) => flow[key] === value),

                                      'is-highlighted': (highlightedFlow && highlightedFlow._id === flow._id)
                                      || (highlightedFilter && flow[highlightedFilter.key] === highlightedFilter.value)
                                    })
                                  }
                                  title={node.id}
                                  fill={colorsPalettes && colorsPalettes[step.field] && colorsPalettes[step.field][node.id]}
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

export default LinearAlluvialChart;