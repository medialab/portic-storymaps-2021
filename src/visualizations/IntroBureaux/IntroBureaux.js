import cx from 'classnames';
import GeoComponent from "../../components/GeoComponent/GeoComponent";

import './IntroBureaux.scss';

import colorPalettes from "../../colorPalettes";

const renderBureaux = ({data, projection, width, height}) => {
  const radius = width * height * 0.00006;
  
  return (
    <g className="IntroBureaux">
      {
        data
        .filter(d => !isNaN(+d.latitude))
        .map((datum, index) => {
          const [x, y] = projection([+datum.longitude, +datum.latitude]);
          const transform = `translate(${x}, ${y})`;
          const labelOnRight = ['La Rochelle', 'Tonnay-Charente'].includes(datum.name);
          const thatWidth = datum.name.length * width * height * .0005;
          return (
            <g transform={transform}>
              <circle
                r={radius * 2}
                cx={0}
                cy={0}
                fill={`url(#bureau-${index})`}
              />
              <circle
                r={2}
                cx={0}
                cy={0}
                fill={'white'}
              />
              <foreignObject
                x={labelOnRight ? radius : -radius - thatWidth}
                y={-radius/2}
                fill="white"
                width={thatWidth}
                height={height / 20}
                className={cx("bureau-label", {
                  'is-reversed': !labelOnRight
                })}
              >
                <span xmlns="http://www.w3.org/1999/xhtml">
                  {datum.name}
                </span>
              </foreignObject>
              <radialGradient id={`bureau-${index}`}>
                <stop offset="20%" stop-color={colorPalettes.customs_office[datum.name]}/>
                <stop offset="100%" stop-color="rgba(51,109,124,0)"/>
              </radialGradient>
            </g>
          )
        })
      }
    </g>
  )
}

const IntroBureaux = ({
  datasets,
  atlasMode,
  dimensions
}) => {
  return (
    <GeoComponent
            layers={[
              {
                type: 'choropleth',
                data: datasets['cartoweb_france_1789_geojson.geojson'],
                reverseColors: atlasMode ? false : true,
                // color:{
                //   field: 'shortname',
                //   palette: colorPalettes.provinces
                // }
              },
              // {
              //   type: 'points',
              //   data: datasets['part_3_step3_viz_customs_offices_data.csv'],
              //   color: {
              //     field: 'name',
              //     palette: colorPalettes.customs_office,
              //     labelsColor: atlasMode ? undefined : 'white'
              //   },
              //   size: {
              //     custom : 3 // 3 fois plus gros que la taille par défaut
              //   },
              //   label: {
              //     field: 'name',
              //     position: 'left'
              //   }
              // }
              {
                type: 'custom',
                data: datasets['part_3_step3_viz_customs_offices_data.csv'],
                renderObjects: renderBureaux
              }
            ]}
            projectionTemplate='Poitou'
            height={dimensions.height}
            width={dimensions.width}
          />
  )
}

export default IntroBureaux;