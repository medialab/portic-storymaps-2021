
import { useMemo } from 'react';
import { scaleLinear } from 'd3-scale';
import { max } from 'd3-array';

/*
Principe : path entre deux point géographiques, dont le stroke peut varier, et on peut avoir la direction avec une fleche (marker-end sur path : https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/marker-end)

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
*/

const FlowsLayer = ({ layer, projection, width }) => {

  console.log("heyyyyyyy 1")
  /**
    * Data aggregation for viz (note : could be personalized if we visualize other things than points)
  */
  const markerData = useMemo(() => {
    if (layer.data) {

      console.log("heyyyyyyy 2")
      console.log("data : ",layer.data)
      // size building
      // const strokeWidthScale = scaleLinear().domain([
      //   0,
      //   max(
      //     layer.data.map((flow) => {
      //       // return +flow[tonnages_cumulés];
      //       return +flow[layer.size.field];
      //     })
      //   )
      // ]).range([0, width / 6]);

      // let grouped = layer.data.map(flow => ({ // je ne sais pas si grouped reste le plus adapté
      //   ...flow,
      //   color: palette[datum.color],
      //   size: strokeWidthScale(flow) === undefined ? 1 : strokeWidthScale(flow) // pour l'instant je mets en place cette ternaire care ùon strokeWidthScale ne fonctionne pas (renvoie toujours undefined)
      // }))

      console.log("grouped (FlowsLayer): ")
      // return grouped;
    }
  }, [projection, width, layer])

  console.log("markerData (FlowsLayer) : ", markerData)

  return (
    <g className="FlowsLayer">
      {/* {
        markerData
          .filter(({ latitude_dep, longitude_dep, latitude_dest, longitude_dep }) => latitude_dep && longitude_dep && latitude_dest && longitude_dest && !isNaN(latitude_dep) && !isNaN(longitude_dep) && !isNaN(latitude_dest) && !isNaN(longitude_dest))
          .map((datum, index) => {
            const { latitude_dep, longitude_dep, latitude_dep, longitude_dep, size } = datum;
            const [xDep, yDep] = projection([+longitude_dep, +latitude_dep]);
            const [xDest, yDest] = projection([+longitude_dest, +latitude_dest]);

            return (
              <g className="flow-group" transform={`translate(${xDep},${yDep})`}>
                <defs>
                  <marker id={index} viewBox="0 0 10 10"
                    refX="1" refY="5"
                    markerUnits="strokeWidth"
                    markerWidth="10" markerHeight="10"
                    orient="auto">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#f00" />
                  </marker>
                </defs>
                <polyline fill="none" stroke="black" stroke-width={size} className="marker"
                  points="20,100 40,60 70,80 100,20" marker-end="url(#triangle)" />
              </g>

            );
          })
      } */}
    </g>
  );
}

export default FlowsLayer;