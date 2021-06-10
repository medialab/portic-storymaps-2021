import {useMemo} from 'react';
import {csvParse} from 'd3-dsv';
import {scaleLinear} from 'd3-scale';
import get from 'axios';

import {prepareAlluvialData} from './utils';

const CircularAlluvialComponent = ({
  data : inputData = [],
  sumBy,
  steps,
  width=1200,
  height=800
}) => {
  // const [data, setData] = useState(null);
  const data = useMemo(() => {
    const vizData = prepareAlluvialData(inputData, {sumBy, steps});
    console.log(vizData);
    return vizData;
  }, [inputData]);

  const BAR_WIDTH = width / 100;
  const stepXScale = scaleLinear().range([0, width]).domain([0, data.length - 1])
  return (
      <svg width={width} height={height}>
        <g transform={'scale(0.8)translate(10,10)'}>
          {
            data.map((step, stepIndex) => {
              const nodesYScale = scaleLinear().domain([0, 1]).range([0, height]);
              return (
                <g 
                  className="step-container" 
                  key={stepIndex}
                  transform={`translate(${stepXScale(stepIndex)}, 0)`}
                >
                  <rect
                    x={0}
                    y={0}
                    width={BAR_WIDTH}
                    height={height}
                    fill="lightgrey"
                    className="step-bar-background"
                  />
                  {
                    step.nodes.map((node, nodeIndex) => {
                      const nodeHeight = nodesYScale(node.valuePart);
                      const y = nodesYScale(node.displacePart);
                      return (
                        <g 
                          className="step-node-container" 
                          key={node.id}
                          transform={`translate(0, ${y})`}
                        >
                          <rect
                            x={0}
                            y={0}
                            width={BAR_WIDTH}
                            height={nodeHeight - 2}
                            fill={nodeIndex%2 === 0 ? 'blue' : 'yellow'}
                          />
                          <text
                            y={nodeHeight / 2}
                            x={BAR_WIDTH * 2}
                          >
                            {node.id}
                          </text>
                          {
                            node.flows.map((flow, flowIndex) => {
                              return (
                                <rect
                                  key={flowIndex}
                                  x={0}
                                  y={nodesYScale(flow.relativeDisplacePart)}
                                  width={BAR_WIDTH}
                                  height={nodesYScale(flow.valuePart) - 1}
                                  fill={'grey'}
                                  opacity={0.3}
                                />
                              )
                            })
                          }
                        </g>
                      )
                    })
                  }
                  {
                    step.nodes
                    .filter(n => n.links)
                    .map((node, nodeIndex) => {
                      return (
                        <g className="links-group" key={nodeIndex}>
                          {
                            node.links.map((link, linkIndex) => {
                              return (
                                <g className="link-index" key={linkIndex}>
                                  <rect
                                    x={BAR_WIDTH}
                                    y={nodesYScale(link.startRel)}
                                    width={(linkIndex + 1) * 10}
                                    height={nodesYScale(link.valuePart) - 1}
                                    fill="lightgrey"
                                    opacity={0.3}
                                  />
                                </g>
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