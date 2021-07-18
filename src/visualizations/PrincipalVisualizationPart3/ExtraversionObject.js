import { useEffect, useState } from 'react';
import { animated, useSpring } from 'react-spring';

import colorsPalettes from '../../colorPalettes';

import partialCircle from 'svg-partial-circle';


const ExtraversionObject = ({
  navigoValues: [metric1, metric2],
  toflitPct,
  transformGroup,
  circleRadius,
  width,
  height,
  name,
}) => {

  const [isInited, setIsInited] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setIsInited(true)
    })
  }, []);

  const { transform } = useSpring({
    to: {
      transform: transformGroup
    },
    immediate: !isInited
  });


  const maxTriangleHeight = (circleRadius) * 1.4;
  // dimensionning triangles based on their area (and not triangle height)
  // Area = (height * base) / 2;
  const maxArea = maxTriangleHeight * (maxTriangleHeight) / 2;
  const area1 = metric1 * maxArea;
  const area2 = metric2 * maxArea;
  const leftTriangleHeight = Math.sqrt(area1 * metric1);
  const rightTriangleHeight = Math.sqrt(area2 * metric1);

  let start = null
    let end = null
    // let transformGeo = {`translate(${x},${y})`} // ce serzit param qui se mmodifie en attribue de positionnement réparti en bas à droite si co sans coords

    // calcul des angles de départ et d'arrivée de l'arc de cercle, en fonction des données
    start = Math.PI / 2 + (toflitPct - 50) / 100 * Math.PI
    end = Math.PI * 3 / 2 - (toflitPct - 50) / 100 * Math.PI

    const leftPath = partialCircle(
      0, 0,         // center X and Y
      circleRadius,              // radius
      start,          // start angle in radians --> Math.PI / 4
      end             // end angle in radians --> Math.PI * 7 / 4
    )
      .map((command) => command.join(' '))
      .join(' ')

    const rightPath = partialCircle(
      0, 0,             // center X and Y
      circleRadius,                  // radius
      start,              // start angle in radians --> Math.PI / 4
      end - 2 * Math.PI   // end angle in radians --> Math.PI * 7 / 4
    )
      .map((command) => command.join(' '))
      .join(' ')

  return (
    <animated.g
      className='extraversion-object'
      // transform={noOverlapTransform}
      transform={transform}
    // { datum.longitude === 0 ? x=1 : null }
    >
      <path className='left-triangle' fill={colorsPalettes.generic.accent2}
        d={`M ${0} ${-leftTriangleHeight / 2}
            V ${leftTriangleHeight / 2}
            L ${-leftTriangleHeight} ${0}
            Z
                `}
      />

      <path className='right-triangle' fill={colorsPalettes.ui.colorAccentBackground}
        d={`M ${0} ${-rightTriangleHeight / 2}
            L ${rightTriangleHeight} ${0}
            L ${0} ${rightTriangleHeight / 2}
            Z
            `}
      />
      <>
        {
          leftPath != null ?

            <>

              <path
                d={`${leftPath}
                  `}
                stroke={colorsPalettes.generic.accent2}
                stroke-width={width * 0.005} // à ajuster en fonction de la largeur de l'écran
                fill="transparent"
              />

              <path
                d={`${rightPath}
                  `}
                stroke={colorsPalettes.ui.colorAccentBackground}
                stroke-width={width * 0.005} // à ajuster en fonction de la largeur de l'écran
                fill="transparent"
              />
            </>
            :
            null
        }
        <g
          transform={`translate(${parseInt(0)}, ${parseInt(circleRadius) + 15})`}
        >
          {/* <circle
            cx={0}
            cy={0}
            r={2}
            fill="red"
          /> */}
          <text
            className='object-label'
            font-size={parseInt(height * 0.013)}
            textAnchor="middle"
          >
            {name}
          </text>
        </g>
      </>
    </animated.g>);
}

export default ExtraversionObject;