import { geoPath } from "d3-geo";
import { generatePalette } from '../../helpers/misc';
import { uniq } from 'lodash';


// @TODO : mettre en place une palette de couleurs quantitative 

const ChoroplethLayer = ({ layer, projection }) => {

    let palette = null;

    if (layer.data.features && layer.color && layer.color.field) {
        // colors palette building
        const colorValues = uniq(layer.data.features.map(datum => datum.properties[layer.color.field]));
        if (layer.color.palette) { // if palette given in parameters we use it, otherwise one palette is generated
            palette = layer.color.palette;
        } else if (layer.color.generatedPalette) {
            const colors = generatePalette('map', layer.data.features.length);
            palette = colorValues.reduce((res, key, index) => ({
                ...res,
                [key]: colors[index]
            }), {});
        }
    }

    return (
        <g className="ChoroplethLayer">
            {
                layer.data.features.map((d, i) => {
                    return (
                        <path
                            key={`path-${i}`}
                            d={geoPath().projection(projection)(d)}
                            className="geopart"
                            style= {{
                                fill: palette !== null ? palette[d.properties[layer.color.field]] : '#d3d9de'
                            }}
                        />
                    )
                })
            }
        </g>
    );

    }

export default ChoroplethLayer;