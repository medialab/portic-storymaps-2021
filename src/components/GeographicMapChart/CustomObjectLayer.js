


const CustomObjectLayer = ({ layer, projection, width, height, projectionTemplate }) => {
    return (
        <g className="CustomObjectsLayer">
          {
            typeof layer.renderObjects === 'function' ?
                layer.renderObjects({data: layer.data, projection, width, height, projectionTemplate})
            :
            layer.data
              // .filter(({ latitude, longitude }) => latitude && longitude && !isNaN(latitude) && !isNaN(longitude))
              .map((datum, index) => {
                // const { latitude, longitude, size, color, label } = datum;
                // const [x, y] = projection([+longitude, +latitude]);
                return layer.renderObject({ datum, projection, width, height, projectionTemplate })
              })
          }
        </g>
      );
}

export default CustomObjectLayer;