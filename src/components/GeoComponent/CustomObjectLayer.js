


const CustomObjectLayer = ({ layer, projection, width}) => {

    return (
        <g className="CustomObjectsLayer">
          {
            layer.data
              // .filter(({ latitude, longitude }) => latitude && longitude && !isNaN(latitude) && !isNaN(longitude))
              .map((datum, index) => {
                // const { latitude, longitude, size, color, label } = datum;
                // const [x, y] = projection([+longitude, +latitude]);
                console.log("layer.renderObject : ", layer.renderObject)
                // return layer.renderObject(datum, projection, { width })
              })
          }
        </g>
      );
}

export default CustomObjectLayer;