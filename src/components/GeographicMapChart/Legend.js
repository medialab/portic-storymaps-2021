import { useContext } from 'react';

import { uniq } from "lodash-es";
import { SettingsContext } from "../../helpers/contexts";
import { generatePalette } from '../../helpers/misc';


/**
 * Centralized map legend
 * @param {array<object>} layers
 * @param {string} position - used as css suffix ('bottom', 'bottom left', ...)
 * @param {function} layerFilter - allows to hide some layers from legend
 * @returns {React.ReactElement} - React component 
 */
const Legend = ({
  layers,
  position,
  layerFilter
}) => {
  const { lang } = useContext(SettingsContext);
  const legendTitle = lang === 'fr' ? 'Légende' : 'Legend';
  return (
    <div className={`Legend ${typeof position === 'string' ? position : ''}`}>
      <h5 className="legend-main-title">{legendTitle}</h5>
      {
        layers
        .filter(l => {
          if (typeof layerFilter === 'function') {
            return layerFilter(l);
          }
          return true;
        })
        .map((layer, id) => {
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
                <div key={id} className="size-legend-container">
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
                <div key={id + 'b'} className="color-legend-container">
                  <h6 className="legend-title">{layer.color.title || layer.color.field}</h6>
                  <ul className="modalities-list">
                    {
                      colorModalities.map(([modality, color], modalityIndex) => (
                        <li key={modalityIndex}>
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