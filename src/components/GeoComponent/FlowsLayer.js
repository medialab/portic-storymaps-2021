
import { useMemo } from 'react';
import { scaleLinear } from 'd3-scale';
import { max } from 'd3-array';

/*
Principe : path entre deux point géographiques, dont le stroke peut varier, et on peut avoir la direction avec une fleche 

format des données attendu (json) : 

Exemple :
"flow_id": "45.95_-0.9_46.166667_-1.15", 
"port_dep": "Charente", 
"port_dest": "La Rochelle", 
"latitude_dep": 45.95, 
"longitude_dep": -0.9, 
"latitude_dest": 46.166667, 
"longitude_dest": -1.15, 
"nb_flows": 22, 
"tonnages_cumulés": 730}

@TODO : régler le fait que la pointe des flèches ne soit pas à l'arrivée (en l'état c'est la base du triangle qui est sur les coords d'arrivée) => se règle en reculant le triangle :   viewBox="-10 0 10 10" &  <path d="M -10 0 L 0 5 L -10 10 Z" fill="black" /> (à ce moment il fut rétrécir la longueur du path qui fait la barre de la flèche)
@TODO : mettre un point au départ de mes flows ? (pas adapté quand on a des points de départ et d'arrivée qui se recoupent)
*/

const FlowsLayer = ({ layer, projection, width, height }) => {

  /**
    * Data aggregation for viz (note : could be personalized if we visualize other things than points)
  */
  const markerData = useMemo(() => {
    if (layer.data) {

      console.log("data : ", layer.data)
      // size building
      const strokeWidthScale = scaleLinear().domain([
        0,
        max(
          layer.data.map((flow) => {
            // return +flow[tonnages_cumulés];
            console.log("flow[layer.size.field] : ", flow[layer.size.field])
            return +flow[layer.size.field];
          })
        )
      ]).range([0, width*height / 100000]);

      const arrowSizeScale = strokeWidthScale.copy().range([0, width*height / 100000]);

      let grouped = layer.data.map(flow => ({ // je ne sais pas si grouped reste le plus adapté
        ...flow,
        // color: palette[datum.color],
        strokeWidth: strokeWidthScale(+flow[layer.size.field]),
        arrowSize: arrowSizeScale(layer.data.strokeWidth) 
      }))
      console.log("grouped : ", grouped)
      return grouped;
    }
  }, [projection, width, layer, height])/* eslint react-hooks/exhaustive-deps : 0 */

  console.log("markerData (FlowsLayer) : ", markerData)

  return (
    <g className="FlowsLayer" >
      {
        markerData
          .filter(({ latitude_dep, longitude_dep, latitude_dest, longitude_dest }) => latitude_dep && longitude_dep && latitude_dest && longitude_dest && !isNaN(latitude_dep) && !isNaN(longitude_dep) && !isNaN(latitude_dest) && !isNaN(longitude_dest))
          .map((datum, index) => {
            const { latitude_dep, longitude_dep, latitude_dest, longitude_dest, strokeWidth, arrowSize } = datum;
            const [xDep, yDep] = projection([+longitude_dep, +latitude_dep]);
            const [xDest, yDest] = projection([+longitude_dest, +latitude_dest]);
            // console.log("[xDep, yDep] / [xDest, yDest] : ", [xDep, yDep], " / ", [xDest, yDest]);

            return (
              <g className="flow-group">
                <defs>
                  <marker id="triangle" viewBox="0 0 10 10"
                    refX="1" refY="5"
                    markerUnits="strokeWidth"
                    markerWidth={arrowSize} markerHeight={arrowSize}
                    orient="auto">
                    <path d="M 0 0 L 10 5 L 0 10 Z" fill="black" />
                  </marker>
                </defs>
                <path d={`M ${xDep} ${yDep} L ${xDest} ${yDest}`} stroke="black" strokeWidth={strokeWidth} marker-end="url(#triangle)" />
                {/* <line x1={xDep} y1={yDep} x2={xDest} y2={yDest} stroke="black" stroke-width={size} marker-end="url(#triangle)" /> */}
              </g>

            );
          })
      }
    </g>
  );
}

export default FlowsLayer;