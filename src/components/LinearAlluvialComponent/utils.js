import groupBy from 'lodash/groupBy';

export const prepareAlluvialData = (inputData, spec) => {
  const {sumBy, steps: stepsSpec} = spec;
  // attribute an id to each flow
  const data = inputData.map((d, index) => ({...d, _id: index}))
  // compute nodes for each step
  let steps = stepsSpec.map((step, stepIndex) => {
    const {filters} = step;
    let stepData = data;
    if (filters && filters.length) {
      // filter relevant flows
      stepData = filters.reduce((current, {key, value}) => {
        return current.filter(datum => {
          return datum[key] === value;
        })
      }, stepData);
    }
    // count values for spec modalities
    let groups = groupBy(stepData, d => d[step.field]);
    groups = Object.entries(groups).map(([id, initialFlows]) => {
      const flows = initialFlows.map(flow => {
        let valueAbs;
        // if a sumBy is define with sum with its value
        if (sumBy) {
          let actualValue = flow[sumBy];
          actualValue = actualValue === '' ? 0 : actualValue;
          valueAbs = +actualValue
        } else valueAbs = 1;
        return {
          ...flow,
          valueAbs
        }
      })
      const valueAbs = flows.reduce((sum, flow) => {
        return sum + flow.valueAbs
      }, 0);
      return {
        id,
        valueAbs,
        flows
      }
    });
    // compute relative part of each modality
    const totalValue = groups.reduce((sum, g) => sum + g.valueAbs, 0);
    groups = groups.map(g => ({
      ...g,
      valuePart: g.valueAbs / totalValue,
      flows: g.flows.map(flow => ({
        ...flow,
        valuePart: flow.valueAbs / totalValue
      }))
      .sort((a, b) => {
        // if (a.id > b.id) {
        const sortAscending = stepIndex >= 2 && stepIndex <= 4 ? -1 : 1;
        if (a.valuePart < b.valuePart) {
          return sortAscending;
        }
        return -sortAscending;
      })
    }));
    return {
      ...step,
      totalValue,
      nodes: groups.sort((a, b) => {
        // if (a.id > b.id) {
        const sortAscending = stepIndex >= 2 && stepIndex <= 4 ? -1 : 1;
        if (a.valuePart < b.valuePart) {
          return sortAscending;
        }
        return -sortAscending;
      })
    }
  })

  // compute displacements for each step
  steps = steps.map((step, index) => {
    let displaceAbs = 0;
    let displacePart = 0;
    const newNodes = step.nodes.map(node => {
      // computing flow-level displacement
      let localDisplaceAbs = displaceAbs;
      let localDisplacePart = displacePart;
      const newNode = {
        ...node,
        displaceAbs,
        displacePart,
        flows: node.flows.map(flow => {
          const newFlow = {
            ...flow,
            displaceAbs: localDisplaceAbs,
            displacePart: localDisplacePart,
            relativeDisplaceAbs: localDisplaceAbs - displaceAbs,
            relativeDisplacePart: localDisplacePart - displacePart
          }
          localDisplaceAbs += flow.valueAbs;
          localDisplacePart += flow.valuePart;
          return newFlow;
        })
      };
      displaceAbs += node.valueAbs;
      displacePart += node.valuePart;
      return newNode;
    })
    return {
      ...step,
      nodes: newNodes
    }
  })

  // compute links
  const stepsWithLinks = steps.map((step, index) => {
    // for each step except last one
    if (index < steps.length - 1) {
      const nextStep = steps[index + 1];
      const nextKey = nextStep.field;
      const {nodes} = step;
      // iterate over step's to add links
      const newNodes = nodes.map((node, nodeIndex) => {
        
        const {flows} = node;
        
        const newFlows = flows.map((flow, flowIndex) => {
          const nextVal = flow[nextKey];
          const nextStepGroup = nextStep.nodes.find(({id}) => id === nextVal);
          if (nextStepGroup) {
            
            const nextFlow = nextStepGroup.flows.find(flow2 => {
              return (flow._id === flow2._id)
            })
            if (nextFlow) {
              const {
                displaceAbs,
                displacePart,
                relativeDisplaceAbs,
                relativeDisplacePart
              } = nextFlow;
              const nextPosition = {
                displaceAbs,
                displacePart,
                relativeDisplaceAbs,
                relativeDisplacePart
              }
              return {
                ...flow,
                nextPosition
              }
            }
          } else {
          }
          return flow;
        })
        return {
          ...node,
          flows: newFlows
        }
      });
      return {
        ...step,
        nodes: newNodes
      }
    }
    return step;
  })

  return stepsWithLinks;
}