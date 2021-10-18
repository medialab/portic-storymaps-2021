import React, { useCallback, useRef, useState, useEffect, useMemo } from 'react';
import gexf from 'graphology-gexf';
import forceAtlas2 from 'graphology-layout-forceatlas2';
import Graph from 'graphology';
import { WebGLRenderer as Renderer } from 'sigma';
import { scaleLinear } from 'd3-scale';
import { min, max, extent } from 'd3-array';
import { uniq } from 'lodash';
// import get from 'axios';

import { createNodeReducer, createEdgeReducer } from './reducers';
import { generatePalette } from '../../helpers/misc';
import { usePrevious } from '../../helpers/hooks';

import './GraphContainer.scss';

// Defaults
const CELL_HEIGHT_RANGE = [200, 10];
const CELL_WIDTH_RANGE = [300, 30];
const CELL_HEIGHT_SCALE = scaleLinear().domain([0, 1]).range(CELL_HEIGHT_RANGE);
const CELL_WIDTH_SCALE = scaleLinear().domain([0, 1]).range(CELL_WIDTH_RANGE);

// Camera controls
// function rescale(renderer) {
//   const camera = renderer.getCamera();
//   camera.animatedReset(renderer);
// }

// function zoomIn(renderer) {
//   const camera = renderer.getCamera();
//   camera.animatedZoom(renderer);
// }

// function zoomOut(renderer) {
//   const camera = renderer.getCamera();
//   camera.animatedUnzoom(renderer);
// }

function GraphContainer({
  graph,
  nodeColor: nodeColorVariable,
  nodeSize: nodeSizeVariable,
  labelDensity,
  nodeLabel,
  onCameraUpdate,
  cameraPosition,
  updateTimestamp,
  width,
  height,
  ratio,
}) {
  let sizes = useMemo(() => {
    const res = [];
    graph.forEachNode((_node, attributes) => {
      res.push(+(nodeSizeVariable ? attributes[nodeSizeVariable] : attributes.size));
    })
    return res;
  }, [nodeSizeVariable, graph]);

  const sizeExtent = extent(sizes);
  const extents = {
    nodeSize: {
      min: sizeExtent[0],
      max: sizeExtent[1]
    }
  }

  const nodeSize = useMemo(() => {
    if (nodeSizeVariable) {

      return {
        min: min(sizeExtent),
        max: max(sizeExtent),
        name: nodeSizeVariable
      }
    } else return undefined;
  }, [nodeSizeVariable, graph])

  const nodeColor = useMemo(() => {
    if (nodeColorVariable && nodeColorVariable.field) {
      let values = [];
      graph.forEachNode((_node, attr) => {
        values.push(attr[nodeColorVariable.field])
      })
      values = uniq(values);
      let palette = {};
      if (nodeColorVariable.palette) {
        palette = nodeColorVariable.palette;
      } else {
        const colors = generatePalette(nodeColorVariable.field, values.length);
        let i = 0;
        values.forEach(option => {
          palette[option] = colors[i];
          i++;
        });
      }

      return {
        palette,
        name: nodeColorVariable.field
      }
    } else return undefined;
  }, [nodeColorVariable, graph])

  const edgesMap = useMemo(() => {
    const m = new Map()
    graph.forEach(
      (_source, _target, sourceAttributes, targetAttributes, edge, _edgeAttributes) => {
        m.set(edge, { sourceNode: sourceAttributes, targetNode: targetAttributes })
      });
    return m;
  }, [graph])

  const previousNodeColor = usePrevious(nodeColor);
  const previousNodeSize = usePrevious(nodeSize);
  const previousNodeLabel = usePrevious(nodeLabel);
  const previousLabelDensity = usePrevious(labelDensity);
  // const previousSearchString = usePrevious(searchString);
  // const previousDontColorEdges = usePrevious(dontColorEdges);
  // const previousFilters = usePrevious(filters);

  const nodeReducer = createNodeReducer({
    nodeColor,
    nodeSize,
    nodeLabel,
    extents,
  });

  const edgeReducer = createEdgeReducer({
    nodeColor,
    nodeSize,
    nodeLabel,
    extents,
    edgesMap
  });


  const container = useRef(null);
  const [renderer, setRenderer] = useState(null);

  useEffect(() => {
    if (cameraPosition && renderer) {
      const camera = renderer.getCamera();
      // console.log('animate camera', camera);
      camera.animate(cameraPosition);
    }
  }, [updateTimestamp]) /* eslint react-hooks/exhaustive-deps : 0 */

  // Should we refresh?
  if (renderer) {
    let needToRefresh = false;


    if (
      previousNodeColor !== nodeColor ||
      previousNodeSize !== nodeSize ||
      // previousDontColorEdges !== dontColorEdges ||
      previousNodeLabel !== nodeLabel
      // previousSearchString !== searchString ||
      // previousFilters !== filters
    ) {
      // console.log('Refreshing sigma');

      // TODO: use upcoming #.setNodeReducer
      renderer.settings.nodeReducer = nodeReducer;
      renderer.settings.edgeReducer = edgeReducer;
      needToRefresh = true;
    }

    if (previousLabelDensity !== labelDensity) {
      renderer.settings.labelGrid.cell = {
        width: CELL_WIDTH_SCALE(labelDensity),
        height: CELL_HEIGHT_SCALE(labelDensity)
      };

      // TODO: we can improve sigma to handle this
      renderer.displayedLabels = new Set();
      needToRefresh = true;
    }

    if (needToRefresh) {
      renderer.refresh();
    }
  }
  useEffect(() => {
    if (renderer) {
      renderer.refresh();
    }
  }, [width, height])

  const setContainer = useCallback(
    node => {
      if (renderer && renderer.graph !== graph) {
        renderer.kill();
        setRenderer(null);
      }

      if (node && graph) {
        const newRenderer = new Renderer(graph, node, { nodeReducer, edgeReducer });

        newRenderer.settings.labelFont = 'IBM Plex Sans';
        setRenderer(newRenderer);
        const camera = newRenderer.getCamera();
        camera.setState({ ...camera.getState(), ratio: ratio || 1 });
        camera.disable();
        onCameraUpdate(camera.getState())
        camera.on('updated', state => {
          onCameraUpdate(state);
        })
      }

      container.current = node;
    },
    [graph]
  );

  return (
    <div className="VisContainer GraphContainer" >

      <div ref={setContainer} style={{ width: '100%', height: '100%', minHeight: '10vh', minWidth: '1vw' }}></div>
      {/*renderer && (
        <GraphControls
          rescale={rescale.bind(null, renderer)}
          zoomIn={zoomIn.bind(null, renderer)}
          zoomOut={zoomOut.bind(null, renderer)}
        />
      )*/}
    </div>
  );
}


export default function NetworkGraphChart({
  data: gexfString,
  nodeColor,
  nodeLabel,
  nodeSize,
  labelDensity = 0.5,
  spatialize,
  cameraPosition: inputCameraPosition = { x: 0.5, y: 0.5, angle: 0, ratio: 1 },
  width = 0,
  height,
  ratio,
  title
}) {
  const headerRef = useRef(null);
  const headerHeight = useMemo(
    () => headerRef.current ? headerRef.current.getBoundingClientRect().height : 0, [headerRef.current])

  // useState renvoie un state et un seter qui permet de le modifier
  const [cameraPosition, setCameraPosition] = useState(inputCameraPosition);

  useEffect(() => {
    if (['x', 'y', 'angle', 'ratio'].find(prop => inputCameraPosition[prop] !== cameraPosition[prop])) {
      setCameraPosition(inputCameraPosition);
    }
  }, [inputCameraPosition])

  const onCameraUpdate = cam => {
    setCameraPosition(cam);
  }
  const graph = useMemo(() => {
    const g = gexf.parse(Graph, gexfString);
    if (spatialize) {
      const settings = forceAtlas2.inferSettings(g);
      // To directly assign the positions to the nodes:
      forceAtlas2.assign(g, {
        settings,
        iterations: 50
      });
    }
    return g;
  }, [gexfString]);

  if (!graph) {
    return null;
  }
  return (
    <div className="NetworkGraphChart" style={{ 
      width: '100%', 
      height: height || '100%',
    }}>
      <div ref={headerRef} className="row visualization-title-container">
        {title ? <h5 className="visualization-title">{title}</h5> : null}
      </div>
      <div style={{
        position: 'relative',
        flex: 1,
        // top: headerHeight,
        // background: 'red',
        // height: height - headerHeight
      }}>

        <GraphContainer
          {
          ...{
            graph,
            cameraPosition,
            nodeColor,
            nodeSize,
            labelDensity,
            nodeLabel,
            ratio,
            onCameraUpdate,
            width,
            height: height - headerHeight
          }
          }
        />
      </div>
    </div>
  )
}