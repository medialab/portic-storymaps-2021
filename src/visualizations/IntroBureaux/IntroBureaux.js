import cx from 'classnames';
import GeoComponent from "../../components/GeoComponent/GeoComponent";
import { useSpring, animated } from 'react-spring'

import { useEffect, useState } from 'react';
import './IntroBureaux.scss';

import colorPalettes from "../../colorPalettes";

const Bureau = ({
  projection,
  height,
  datum,
  width,
  index,
  radius
}) => {
  const [x, y] = projection([+datum.longitude, +datum.latitude]);
  const labelOnRight = ['La Rochelle', 'Tonnay-Charente'].includes(datum.name);
  const thatWidth = datum.name.length * width * height * .0005;

  const [isInited, setIsInited] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setIsInited(true)
    })
  }, [])

  // const r2 = useMemo(() => ({
  //   r: radius * 2
  // }), [radius]);
  // const r1 = useMemo(() => ({
  //   r: radius
  // }), [radius]);
  // const {r} = useSpring({
  //   loop: true,
  //   from: r1,
  //   to: [r2, r1],
  //   config: { duration: 1500 }
  // });

  const {transform} = useSpring({ 
    to: {
      transform: `translate(${x}, ${y})` 
    },
    immediate: !isInited
  });
  return (
    <animated.g transform={transform}>
      <animated.circle
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
        y={0}
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
        <stop offset="20%" stopColor={colorPalettes.customs_office[datum.name]} />
        <stop offset="100%" stopColor="rgba(51,109,124,0)" />
      </radialGradient>
    </animated.g>
  )
}

const renderBureaux = ({ data, projection, width, height, atlasMode }) => {
  const radius = width * height * 0.00006;

  return (
    <g className={cx("IntroBureaux", {'is-atlas-mode': atlasMode})}>
      
      {
        data
          .filter(d => !isNaN(+d.latitude) && colorPalettes.customs_office[d.name])
          .map((datum, index) => (
            <Bureau
              key={index}
              {
              ...{
                projection,
                height,
                datum,
                width,
                index,
                radius
              }
              }
            />
          ))
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
      title={'Carte des bureaux des fermes de la région PASA'}
      layers={[
        {
          type: 'choropleth',
          data: datasets['map_france_1789.geojson'],
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
          renderObjects: props => renderBureaux({...props, atlasMode})
        }
      ]}
      projectionTemplate='Poitou'
      width={dimensions.width}
      height={atlasMode ? window.innerHeight * .9 : dimensions.height}
    />
  )
}

export default IntroBureaux;