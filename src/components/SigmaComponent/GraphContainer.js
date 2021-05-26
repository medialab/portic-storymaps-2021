import React, {useCallback, useRef, useState, useEffect, useMemo} from 'react';
import gexf from 'graphology-gexf';
import Graph from 'graphology';
import {WebGLRenderer} from 'sigma';
import {scaleLinear} from 'd3-scale';
import {min, max, extent} from 'd3-array';
import {uniq} from 'lodash';
import get from 'axios';

import {createNodeReducer, createEdgeReducer} from './reducers';
import {generatePalette, usePrevious} from '../../helpers/misc';

import GraphControls from './GraphControls';

import './GraphContainer.css';


// Defaults
const CELL_HEIGHT_RANGE = [200, 10];
const CELL_WIDTH_RANGE = [300, 30];
const CELL_HEIGHT_SCALE = scaleLinear().domain([0, 1]).range(CELL_HEIGHT_RANGE);
const CELL_WIDTH_SCALE = scaleLinear().domain([0, 1]).range(CELL_WIDTH_RANGE);

// Camera controls
function rescale(renderer) {
  const camera = renderer.getCamera();
  camera.animatedReset(renderer);
}

function zoomIn(renderer) {
  const camera = renderer.getCamera();
  camera.animatedZoom(renderer);
}

function zoomOut(renderer) {
  const camera = renderer.getCamera();
  camera.animatedUnzoom(renderer);
}

function GraphContainer({
  graph,
  nodeColor: nodeColorVariable,
  nodeSize: nodeSizeVariable,
  labelDensity,
  nodeLabel,
  onCameraUpdate,
  cameraPosition,
  updateTimestamp,
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
    if (nodeColorVariable) {
      let values = [];
      graph.forEachNode((_node, attr) => {
        values.push(attr[nodeColorVariable])
      })
      values = uniq(values);
      const colors = generatePalette(nodeColorVariable, values.length);
      let palette = {};
      let i = 0;
      values.forEach(option => {
        palette[option] = colors[i];
        i++;
      });
      return {
        palette,
        name: nodeColorVariable
      }
    } else return undefined;
  }, [nodeColorVariable, graph])

  const edgesMap = useMemo(() => {
    const m = new Map()
    graph.forEach(
      (_source, _target, sourceAttributes, targetAttributes, edge, _edgeAttributes) => {
      m.set(edge, {sourceNode: sourceAttributes, targetNode: targetAttributes})
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

  const setContainer = useCallback(
    node => {
      if (renderer && renderer.graph !== graph) {
        renderer.kill();
        setRenderer(null);
      }

      if (node && graph) {
        const newRenderer = new WebGLRenderer(graph, node, {nodeReducer, edgeReducer});
        setRenderer(newRenderer);
        const camera = newRenderer.getCamera();
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

      <div ref={setContainer} style={{width: '100%', height: '50vh'}}></div>
      {renderer && (
        <GraphControls
          rescale={rescale.bind(null, renderer)}
          zoomIn={zoomIn.bind(null, renderer)}
          zoomOut={zoomOut.bind(null, renderer)}
        />
      )}
    </div>
  );
}


export default function SigmaComponent({
  data: filename,
  nodeColor,
  nodeLabel,
  nodeSize,
  labelDensity = 0.5,
  cameraPosition: inputCameraPosition = { x: 0.5, y: 0.5, angle: 0, ratio: 1 }
}) {
    // useState renvoie un state et un seter qui permet de le modifier
    const [graph, setGraph] = useState(null);
    const [cameraPosition, setCameraPosition] = useState(inputCameraPosition);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (['x', 'y', 'angle', 'ratio'].find(prop => inputCameraPosition[prop] !== cameraPosition[prop])) {
        setCameraPosition(inputCameraPosition);
      }
    }, [inputCameraPosition])

    const onCameraUpdate = cam => {
      setCameraPosition(cam);
    }
  
    const URL = `${process.env.PUBLIC_URL}/data/${filename}`;
  
    useEffect(() => {
      // aller chercher les données (get : lancement de la promesse se lance de suite : synchrone, then et catch plus tard)
      get(URL)
      .then(({data: gexfString}) => {
        const graph = gexf.parse(Graph, gexfString);
        graph.forEachNode((node) => {
          graph.updateNode(node, attr => {
            return {
              ...attr,
              x: attr.x ? attr.x : 0,
              y: attr.y ? attr.y : 0
            }
          })
        })
        setGraph(graph);
        setLoading(false);
      })
      .catch((_err) => {
        setLoading(false);
      })
    }, [URL])
  
    if (loading) {
      return (
        <div>Chargement des données ({URL}) ...</div>
      )
    } else if (!graph) {
      return (
      <div>Erreur ...</div>
      )
    }
    return (
        <div className="SigmaComponent">
          <GraphContainer
            {
              ...{
                graph,
                cameraPosition,
                nodeColor,
                nodeSize,
                labelDensity,
                nodeLabel,
                onCameraUpdate
              }
            }
          />
        </div>
    )
}