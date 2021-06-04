import groupBy from 'lodash/groupBy';

export const prepareAlluvialData = (data, spec) => {
  const {sumBy, steps: stepsSpec} = spec;
  // compute nodes for each step
  let steps = stepsSpec.map(step => {
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
    }));
    return {
      ...step,
      totalValue,
      nodes: groups.sort((a, b) => {
        if (a.id > b.id) {
          return 1;
        }
        return -1;
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
  steps = steps.map((step, index) => {
    if (index < steps.length - 1) {
      const nextStep = steps[index + 1];
      const nextKey = nextStep.field;
      const {nodes} = step;
      const newNodes = nodes.map(node => {
        const {flows} = node;
        // build groups of flows for next step
        let nextGroups = groupBy(flows, f => f[nextKey]);
        nextGroups = Object.entries(nextGroups).map(([id, initialFlows]) => {
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
          });
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
        // const totalValue = nextGroups.reduce((sum, g) => sum + g.valueAbs, 0);
        nextGroups = nextGroups.map(g => ({
          ...g,
          // valuePart: g.valueAbs / totalValue,
          valuePart: g.valueAbs / step.totalValue,
          flows: g.flows.map(f => ({
            ...f, 
            // valuePart: f.valueAbs / totalValue,
            valuePart: f.valueAbs / step.totalValue,
          }))
        }));
        return {
          ...node,
          links: nextGroups
        }
      })
      return {
        ...step,
        nodes: newNodes
      }
    }
    return step;
  })
  // @todo compute links displacement for start and end of each
  steps = steps.map((step, stepIndex) => {
    if (stepIndex < steps.length - 1) {
      const nextStep = steps[stepIndex + 1];
      
      const newNodes = step.nodes.map(node => {
        let displace1Abs = node.displaceAbs;
        let displace1Rel = node.displacePart;
        const newLinks = node.links.map(link => {
          const newLink = {
            ...link,
            startAbs: displace1Abs,
            startRel: displace1Rel,
            // @todo compute flow-level displacement
          }
          displace1Abs += link.valueAbs;
          displace1Rel += link.valueRel;
          return newLink;
        })
        return {
          ...node,
          links: newLinks
        }
      })
      return {
        ...step,
        nodes: newNodes
      }
    }
    return step;
  })

  return steps;
}