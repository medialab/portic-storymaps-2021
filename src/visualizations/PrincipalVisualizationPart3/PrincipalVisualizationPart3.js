
import cx from 'classnames';
import { useState, useEffect } from 'react';

import GeographicMapChart from '../../components/GeographicMapChart/GeographicMapChart';
import { Step3Objects, SmallMultiples, renderTriangles } from './renderObjectsFunctions'; // pas sur que ça reste à terme

import './PrincipalVisualizationPart3.scss';
import colorsPalettes from '../../colorPalettes.js';
import Step2 from './Step2';
import { fixSvgDimension } from '../../helpers/misc';


/**
 * Renders main viz #3
 * @param {object} datasets
 * @param {number} step - scrollytelling step
 * @param {number} width
 * @param {number} height
 * @param {boolean} atlasMode
 * @returns {React.ReactElement} - React component
 */
const PrincipalVisualizationPart3 = ({ 
  datasets, 
  step, 
  width: inputWidth, 
  height: inputHeight, 
  atlasMode 
}) => {
  const width = fixSvgDimension(inputWidth);
  const height = atlasMode ? window.innerHeight : fixSvgDimension(inputHeight);
  const [currentMapTemplate, setCurrentMapTemplate] = useState('France');
  useEffect(() => {
    setTimeout(() => {
      switch (step) {
        case 1:
          setCurrentMapTemplate('rotated Poitou');
          break;
        case 3:
          setCurrentMapTemplate('Poitou zoomed');
          break;
        default:
          break;
      }
    })
  }, [step])
  return (
    <div className={cx("PrincipalVisualizationPart3", { 'is-atlas-mode': atlasMode })} style={{ height: atlasMode ? undefined : height }}>
      <div className={cx('step', { 'is-visible': step === 1 })}>
        <GeographicMapChart
          title={'Navigation au départ des ports de la région PASA en 1789'}
          layers={[
            {
              type: 'choropleth',
              data: datasets['map_backgrounds/map_france_1789.geojson']
            },
            {
              type: 'custom',
              data: datasets['part_3_step1_viz_data/part_3_step1_viz_data.csv'],
              renderObjects: () => (
                <>
                  <rect
                    x={0}
                    y={0}
                    width={width}
                    height={height / 8}
                    fill={`url(#radial-bg-${atlasMode})`}
                  />
                  <defs>
                    <linearGradient id={`radial-bg-${atlasMode}`} gradientTransform="rotate(90)">
                      <stop offset="10%" stopColor={atlasMode ? 'white' : colorsPalettes.ui.colorBackgroundBlue} />
                      <stop offset="100%" stopColor={atlasMode ? 'white' : colorsPalettes.ui.colorBackgroundBlue} stop-opacity={0} />
                    </linearGradient>
                  </defs>
                </>
              )
            },
            {
              type: 'custom',
              data: datasets['part_3_step1_viz_data/part_3_step1_viz_data.csv'],
              renderObjects: props => renderTriangles({...props, atlasMode})
            }
          ]}
          projectionTemplate={atlasMode ? 'rotated Poitou' : currentMapTemplate}
          height={atlasMode ? window.innerHeight * .9 : height}
          width={width}
        />
      </div>
      <div className={cx('step', { 'is-visible': step === 2 })} style={{ height }}>
        <Step2
          {
          ...{
            width,
            height,
            datasets,
          }
          }
        />
      </div>
      <div className={cx('step', { 'is-visible': step === 3 })} height={height}>
        <GeographicMapChart
          layers={[
            {
              type: 'choropleth',
              data: datasets['map_backgrounds/map_france_1789.geojson'],
              color: {
                field: 'shortname'
              }
            },
            {
              type: 'custom',
              data: {
                customsOffices: datasets['part_3_step3_viz_customs_offices_data/part_3_step3_viz_customs_offices_data.csv']
              .filter(d => 
                d.customs_region === 'La Rochelle' 
                && d.name !== 'undefined customs office'
                && !d.name.includes('Bouin')
                ),
                ports: datasets['part_3_step3_viz_ports_data/part_3_step3_viz_ports_data.csv']
              },
              renderObjects: Step3Objects // besoin de montrer les labels des bureaux et ports => modifier la fonction
            },
            {
              type: 'custom',
              data: datasets['part_3_step3_viz_customs_offices_data/part_3_step3_viz_customs_offices_data.csv'],
              renderObjects: SmallMultiples
            }
          ]}
          projectionTemplate={atlasMode ? 'Poitou zoomed' : currentMapTemplate}
          height={height}
          width={width}
          title={'Extraversion du commerce et de la navigation regroupés par bureau de fermes en 1789'}
        />

      </div>
    </div>
  )
}

export default PrincipalVisualizationPart3;