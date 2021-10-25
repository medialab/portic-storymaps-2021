


/**
 * Allows to display custom objects on the map
 * @param {object} layer
 * @param {function} projection
 * @param {number} width
 * @param {number} height
 * @param {string} projectionTemplate
 * @returns {React.ReactElement} - React component
 */
const CustomObjectLayer = ({ 
  layer, 
  projection, 
  width, 
  height, 
  projectionTemplate 
}) => {
    return (
        <g className="CustomObjectsLayer">
          {
            typeof layer.renderObjects === 'function' ?
                layer.renderObjects({data: layer.data, projection, width, height, projectionTemplate})
            :
            layer.data
              .map((datum, index) => {
                return <g key={index}>{layer.renderObject({ datum, projection, width, height, projectionTemplate })}</g>
              })
          }
        </g>
      );
}

export default CustomObjectLayer;