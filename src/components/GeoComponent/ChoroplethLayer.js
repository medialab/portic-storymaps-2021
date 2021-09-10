import { geoPath } from "d3-geo";
import { generatePalette } from '../../helpers/misc';
import { uniq } from 'lodash';
import cx from 'classnames';
import { useSpring, animated } from 'react-spring'
import { useEffect, useState } from "react";
import ReactTooltip from "react-tooltip";

const GeoPart = ({ d: initialD, projection, project, palette, layer, width, height}) => {

  const [isInited, setIsInited] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setIsInited(true)
    })
  }, [])

  const currentD = project(initialD);

  const animationProps = useSpring({
    to: {
      d: currentD
    },
    immediate: !isInited
  });

  // @todo do this cleanly (removing out of bound objects to improve performance)
  // const boundsAbs = geoPath().bounds(initialD);
  // const boundsRel = [projection(boundsAbs[0]), projection(boundsAbs[1])];
  // let outOfBounds = boundsRel[0][0] > width;

  useEffect(() => {
    ReactTooltip.rebuild();
  });
  return (
    <animated.path
      d={animationProps.d}
      className="geopart"
      data-tip={layer.tooltip ? layer.tooltip(initialD) : undefined}
      data-for="geo-tooltip"
      style={{
        fill: layer.color !== undefined && palette !== undefined ? palette[initialD.properties[layer.color.field]] : 'transparent'
      }}
    />
  )
}


// @TODO : mettre en place une palette de couleurs quantitative 

const ChoroplethLayer = ({ layer, projection, width, height, reverseColors }) => {

  let palette;
  const project = geoPath().projection(projection);

  if (!layer.data) {
    console.info(layer);
    return null;
  }

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
    <>
      <g className={cx("ChoroplethLayer", { 'reverse-colors': reverseColors })}>
        {
          layer.data.features.map((d, i) => {
            return (
              <GeoPart 
                key={d.properties.id || d.properties.name || i} 
                {...{projection, project, palette, layer, d, width, height}}
              />
            )
          })
        }
      </g>
      {/* LEGENDE A METTRE EN PLACE, pour l'instant j'ai trop galéré
                {
                layer.color ?
                    <g className="legend">
                        <rect
                            className="color-legend"
                            width={width / 6}
                            height={height / 6}
                            transform={`translate(0, ${height / 5})`}
                            // ref={legendRef}
                            style={{
                                fill: "transparent",
                                top: height
                            }}
                        >
                            <text class='title'
                            width={width / 6}
                            height={height / 6}
                            x={0}
                            y={height/5}
                            style = {{textSizeAdjust}}
                            transform={`translate(0, ${height / 5})`}
                            >{'Légende'}</text>
                            <g className="colors-legend">
                                {
                                    Object.entries(palette)
                                        .map(([modality, color]) => (
                                            <rect
                                                style= {{fill: "transparent"}}
                                                key={modality}
                                            >
                                                <rect className="color-box"
                                                    style={{ fill: color }}
                                                />
                                                <text className="color-label">
                                                    {modality}
                                                </text>
                                            </rect>
                                        ))
                                }
                            </g>
                        </rect>
                    </g>
                    : null
            } */}    
    </>
  );

}

export default ChoroplethLayer;