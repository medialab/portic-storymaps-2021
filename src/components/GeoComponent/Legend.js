import { color } from "d3";
import { uniq } from "lodash-es";
import { generatePalette } from '../../helpers/misc';


const Legend = ({
  layers,
  position
}) => {
  return (
    <div className={`Legend ${typeof position === 'string' ? position : ''}`}>
      <h5 className="legend-main-title">Légende</h5>
      {
        layers.map((layer, id) => {
          let hasSize;
          let hasColors;
          let colorModalities;
          if (layer.size && layer.size.field) {
            hasSize = true;
          }
          if (layer.color && layer.color.field) {
            hasColors = true;
            const colorValues = uniq(layer.data.map(datum => datum[layer.color.field]))
            // @todo refactor the following with PointsLayer as an util
            let palette;
            // colors palette building
            if (layer.color.palette) { // if palette given in parameters we use it, otherwise one palette is generated
              palette = layer.color.palette;
            } else {
              const colors = generatePalette('map', colorValues.length);
              palette = colorValues.reduce((res, key, index) => ({
                ...res,
                [key]: colors[index]
              }), {});
            }
            colorModalities = Object.entries(palette);
          }
          return (
            <>
              {
                hasSize ?
                <div className="size-legend-container">
                  {/* <h6 className="legend-title">Taille des cercles</h6> */}
                  <div className="size-legend-item">
                  <span className="size-icon-container">
                    <span />
                    <span />
                  </span>
                  <span className="label">
                  {layer.size.title || layer.size.field}
                  </span>
                  </div>
                </div>
                : null
              }
              {
                hasColors ?
                <div className="color-legend-container">
                  <h6 className="legend-title">{layer.color.title || layer.color.field}</h6>
                  <ul className="modalities-list">
                    {
                      colorModalities.map(([modality, color]) => (
                        <li key={modality}>
                          <span style={{background: color}} className="color-marker" />
                          <span className="label">{modality}</span>
                        </li>
                      ))
                    }
                  </ul>
                </div>
                : null
              }
            </>
          )
        })
      }
    </div>
  )
}

export default Legend;