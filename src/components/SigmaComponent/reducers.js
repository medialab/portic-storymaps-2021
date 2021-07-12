import Color from 'color';
import {scaleLinear} from 'd3-scale';
// import {evalIfNodeMatches} from '../../helpers/misc';


// Defaults
const DEFAULT_NODE_COLOR = '#999';
const DEFAULT_NODE_SIZE_RANGE = [2, 15];

export function createNodeReducer({
  nodeColor,
  nodeSize,
  nodeLabel,
  nodeSizeFactor = 1,
  extents,
  // filters = [],
  // filtersModeAnd
}) {
  
  let nodeSizeScale = null;

  // Creating scales
  if (!nodeSize) {
    nodeSizeScale = scaleLinear()
      .domain([extents.nodeSize.min, extents.nodeSize.max])
      .range(DEFAULT_NODE_SIZE_RANGE);
  } else {
    nodeSizeScale = scaleLinear()
      .domain([nodeSize.min, nodeSize.max])
      .range(DEFAULT_NODE_SIZE_RANGE);
  }
  
  // Creating actual reducer
  const nodeReducer = function (key, attr) {
    const renderedNode = {
      ...attr,
      x: isNaN(attr.x) || attr.x === undefined ? 0 : attr.x,
      y: isNaN(attr.y) || attr.y === undefined ? 0 : attr.y
    };



    // Color
    if (!nodeColor) {
      renderedNode.color = attr.color || DEFAULT_NODE_COLOR;
    } else {
      // console.log('color the attr', nodeColor.name, attr[nodeColor.name]);
      renderedNode.color =
        nodeColor.palette[attr[nodeColor.name]] || DEFAULT_NODE_COLOR;
    }
    // Size
    if (!nodeSize) {
      let v = attr.size || 1;
      renderedNode.size = nodeSizeScale(v);
    } else {
      // console.log('size attr', nodeSize.name, attr);
      let v = attr[nodeSize.name];
      v = typeof v === 'number' ? v : 1;
      renderedNode.size = nodeSizeScale(v);
    }

    renderedNode.size *= nodeSizeFactor;

    return renderedNode;
  };


  return nodeReducer;
}


export function createEdgeReducer({
  nodeColor,
  nodeSize,
  nodeLabel,
  nodeSizeFactor = 1,
  extents,
  dontColorEdges,
  edgesMap
}) {

  
  // Creating actual reducer
  const edgeReducer = function (key, attr, el1, el2) {
    const {
      sourceNode, 
      targetNode
    } = edgesMap.get(key);
    const renderedEdge = {};
    // color with biggest node
    const sourceNodeSize = nodeSize ? sourceNode[nodeSize.name] : sourceNode.size;
    const targetNodeSize = nodeSize ? targetNode[nodeSize.name] : targetNode.size;
    const biggerNode = sourceNodeSize > targetNodeSize ? sourceNode : targetNode;

    // Color
    if (biggerNode) {
      if (!nodeColor) {
        renderedEdge.color = biggerNode.color || DEFAULT_NODE_COLOR;
      } else {
        renderedEdge.color =
          nodeColor.palette[biggerNode[nodeColor.name]] || DEFAULT_NODE_COLOR;
      }
      renderedEdge.color = Color(renderedEdge.color).lighten(0.4).rgb().string();
    }
    return renderedEdge;
  };

  return edgeReducer;
}