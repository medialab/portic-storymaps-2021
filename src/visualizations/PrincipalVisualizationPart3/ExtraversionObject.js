import { useEffect, useState } from 'react';
import { animated, useSpring } from 'react-spring';
import cx from 'classnames';
import colorsPalettes from '../../colorPalettes';

import partialCircle from 'svg-partial-circle';
import { max } from 'd3';
import ReactTooltip from 'react-tooltip';


const ExtraversionObject = ({
  navigoValues: [metric1, metric2],
  toflitPct,
  transformGroup,
  circleRadius,
  width,
  height,
  name,
  legendMode,
  isActive,
  isMinified,
  onClick,
}) => {

  const [isInited, setIsInited] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setIsInited(true)
    })
  }, []);

  useEffect(() => {
    ReactTooltip.rebuild();
  })

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
  const rightTriangleHeight = Math.sqrt(area2 * metric2);

  let start = null
  let end = null
  let leftPath;
  let rightPath;
  if (toflitPct) {
    // let transformGeo = {`translate(${x},${y})`} // ce serzit param qui se mmodifie en attribue de positionnement réparti en bas à droite si co sans coords

    // calcul des angles de départ et d'arrivée de l'arc de cercle, en fonction des données
    start = Math.PI / 2 + (toflitPct - 50) / 100 * Math.PI
    end = Math.PI * 3 / 2 - (toflitPct - 50) / 100 * Math.PI

    leftPath = partialCircle(
      0, 0,         // center X and Y
      circleRadius,              // radius
      start,          // start angle in radians --> Math.PI / 4
      end             // end angle in radians --> Math.PI * 7 / 4
    )
      .map((command) => command.join(' '))
      .join(' ')

    rightPath = partialCircle(
      0, 0,             // center X and Y
      circleRadius,                  // radius
      start,              // start angle in radians --> Math.PI / 4
      end - 2 * Math.PI   // end angle in radians --> Math.PI * 7 / 4
    )
      .map((command) => command.join(' '))
      .join(' ')
  }

  let labelFontSize = parseInt(height * 0.013);
  labelFontSize = labelFontSize > 8 ? labelFontSize : 8;
  return (
    <animated.g
      className={cx('ExtraversionObject', { 'is-active': isActive, 'is-minified': isMinified })}
      // transform={noOverlapTransform}
      transform={transform}
      onClick={() => typeof onClick === 'function' ? onClick(name) : undefined}
    // { datum.longitude === 0 ? x=1 : null }
    >

      <>
        {
          toflitPct && leftPath != null ?
            <>

              <path
                d={`${leftPath}
                  `}
                stroke={legendMode ? 'darkgrey' : colorsPalettes.generic.accent2}
                stroke-width={width * 0.005} // à ajuster en fonction de la largeur de l'écran
                fill="transparent"
                data-for="geo-tooltip"
                data-tip={`${(100 - toflitPct ).toFixed(1)}% de valeur d'exports de produits fabriqués hors de la direction (cliquer pour voir le détail des ports)`}
              />

              <path
                d={`${rightPath}
                  `}
                stroke={legendMode ? 'grey' : colorsPalettes.ui.colorAccentBackground}
                stroke-width={width * 0.005} // à ajuster en fonction de la largeur de l'écran
                fill="transparent"
                data-for="geo-tooltip"
                data-tip={`${(toflitPct).toFixed(1)}% de valeur d'exports de produits fabriqués dans la direction (cliquer pour voir le détail des ports)`}
              />
            </>
            :
            null
        }
        <path className='left-triangle'
          fill={legendMode ? 'darkgrey' : colorsPalettes.generic.accent2}
          d={`M ${0} ${-leftTriangleHeight / 2}
            V ${leftTriangleHeight / 2}
            L ${-leftTriangleHeight} ${0}
            Z
                `}
                data-for="geo-tooltip"
                data-tip={`${(metric1 * 100 ).toFixed(1)}% des voyages réalisés vers l'extérieur de la direction (cliquer pour voir le détail des ports)`}
        />

        <path
          className='right-triangle'
          fill={legendMode ? 'grey' : colorsPalettes.ui.colorAccentBackground}
          d={`M ${0} ${-rightTriangleHeight / 2}
            L ${rightTriangleHeight} ${0}
            L ${0} ${rightTriangleHeight / 2}
            Z
            `}
            data-for="geo-tooltip"
            data-tip={`${(metric2 * 100 ).toFixed(1)}% des voyages réalisés vers l'intérieur de la direction (cliquer pour voir le détail des ports)`}
        />
        <g
          transform={`translate(${parseInt(0)}, ${toflitPct ? parseInt(circleRadius) + 15 : max([leftTriangleHeight, rightTriangleHeight]) / 2 + 10})`}
        >
          <text
            className='object-label'
            font-size={labelFontSize}
            textAnchor="middle"
          >
            {name}
          </text>
        </g>
      </>
      {
        legendMode ?
          <g className="legend-container">
            <foreignObject
              width={circleRadius * 2}
              height={circleRadius * 2}
              x={-circleRadius * 3}
              y={-circleRadius * 1.7}
              className="top left"
            >
              <div className="label-wrapper">
                <span>
                  Part des exports de produits fabriqués hors de la direction
                </span>
              </div>
            </foreignObject>
            <line
              x1={-circleRadius * .95}
              y1={-circleRadius * 1.5}
              x2={-circleRadius * .5}
              y2={-circleRadius * 1}
              marker-end="url(#triangle-end)"
            />
            <foreignObject
              width={circleRadius * 2}
              height={circleRadius * 2}
              x={circleRadius * 1.2}
              y={-circleRadius * 1.7}
              className="top right"
            >
              <div className="label-wrapper">
                <span>
                  Part des exports de produits fabriqués dans la direction
                </span>
              </div>
            </foreignObject>
            <line
              x1={circleRadius * 1.15}
              y1={-circleRadius * 1.5}
              x2={circleRadius * .5}
              y2={-circleRadius * 1}
              marker-end="url(#triangle-end)"
            />
            <foreignObject
              width={circleRadius * 2}
              height={circleRadius * 2}
              x={-circleRadius * 3}
              y={circleRadius / 2}
              className="bottom left"
            >
              <div className="label-wrapper">
                <span>
                  Part des voyages hors direction
                </span>
              </div>
            </foreignObject>
            <line
              x1={-circleRadius * 1.8}
              y1={circleRadius * .7}
              x2={-circleRadius * .3}
              y2={circleRadius * .1}
              marker-end="url(#triangle-end)"
            />
            <foreignObject
              width={circleRadius * 2}
              height={circleRadius * 2}
              x={circleRadius * 1.2}
              y={circleRadius / 2}
              className="bottom right"
            >
              <div className="label-wrapper">
                <span>
                  Part des voyages vers la direction
                </span>
              </div>
            </foreignObject>
            <line
              x1={circleRadius * 2}
              y1={circleRadius * .7}
              x2={circleRadius * .3}
              y2={circleRadius * .1}
              marker-end="url(#triangle-end)"
            />

          </g>
          : null
      }
    </animated.g>);
}

export default ExtraversionObject;