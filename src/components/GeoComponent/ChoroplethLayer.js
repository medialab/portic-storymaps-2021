import { geoPath } from "d3-geo";


const ChoroplethLayer = ({ layer, projection }) => {
  return (
    <g className="ChoroplethLayer">
      {
        layer.data.features.map((d, i) => {
          return (
            <path
              key={`path-${i}`}
              d={geoPath().projection(projection)(d)}
              className="geopart"
              // fill="purple"
              // stroke="black"
              // strokeWidth={0.5}
            />
          )
        })
      }
    </g>
  );

}

export default ChoroplethLayer;