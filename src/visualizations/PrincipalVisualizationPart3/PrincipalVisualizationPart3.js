
import cx from 'classnames';

import SigmaComponent from '../../components/SigmaComponent';
import GeoComponent from '../../components/GeoComponent/GeoComponent';
import TriangleComponent from '../../components/TriangleComponent/TriangleComponent';
import { renderLabel, renderStep3Object, renderTriangles } from './renderObjectsFunctions'; // pas sur que ça reste à terme
import DataProvider from '../../components/DataProvider';
import colorPalettes from '../../colorPalettes.js';

import './PrincipalVisualizationPart3.scss';


const PrincipalVisualizationPart3 = ({ datasets, step, width, height }) => {
  return (
    <div className="PrincipalVisualizationPart3" height={height}>
      <div className={cx('step', { 'is-visible': step === 1 })}>
        {process.env.NODE_ENV === 'development' ?
          <>
            <DataProvider data={'cartoweb_france_1789_geojson.geojson'}>
              {
                backgroundData => (
                  <DataProvider data={'part_3_step1_viz_data.csv'}>
                    {
                      visData => (
                        <GeoComponent
                          layers={[
                            {
                              type: 'choropleth',
                              data: backgroundData
                            },
                            {
                              type: 'points',
                              data: visData
                            },
                            {
                              type: 'custom',
                              data: visData,
                              renderObjects: renderTriangles
                            }
                          ]}
                          projectionTemplate='rotated Poitou'
                          height={height}
                          width={width}
                        />
                      )
                    }
                  </DataProvider>
                )
              }
            </DataProvider>
          </>
          :
          <img alt="step-3.1" src={`${process.env.PUBLIC_URL}/maquettes/VIZ_3.1.svg`} />
        }
      </div>
      <div className={cx('step', { 'is-visible': step === 2 })}>
        {process.env.NODE_ENV === 'development' ?
          <>
            <SigmaComponent
              data="toflit_aggregate_1789_only_out.gexf"
              nodeColor={`admiralty`}
              nodeSize={`inside_degree`}
              labelDensity={0.5}
            />
            <img alt="step-3.2" src={`${process.env.PUBLIC_URL}/maquettes/comparaison_centralite-0.png`} />
            <img alt="step-3.2" src={`${process.env.PUBLIC_URL}/maquettes/comparaison_centralite-1.png`} />
          </>
          :
          <>
            <SigmaComponent
              data="toflit_aggregate_1789_only_out.gexf"
              nodeColor={`admiralty`}
              nodeSize={`inside_degree`}
              labelDensity={0.5}
            />
            <img alt="step-3.2" src={`${process.env.PUBLIC_URL}/maquettes/comparaison_centralite-0.png`} />
            <img alt="step-3.2" src={`${process.env.PUBLIC_URL}/maquettes/comparaison_centralite-1.png`} />
          </>

        }
      </div>
      <div className={cx('step', { 'is-visible': step === 3 })} height={height}>
        {process.env.NODE_ENV === 'development' ?
          <>
            <DataProvider data={'cartoweb_france_1789_geojson.geojson'}>
              {
                backgroundData => (
                  <DataProvider data={'part_3_step3_viz_customs_offices_data.csv'}>
                    {
                      visData => (
                        <GeoComponent
                          layers={[
                            {
                              type: 'choropleth',
                              data: backgroundData,
                              color: {
                                field: 'shortname'
                              }
                            },
                            {
                              type: 'custom',
                              data: visData,
                              renderObject: renderStep3Object // besoin de montrer les labels des bureaux et ports => modifier la fonction
                            }
                          ]}
                          projectionTemplate='Poitou'
                          height={height}
                          width={width}
                        />
                      )
                    }
                  </DataProvider>
                )
              }
            </DataProvider>
          </>
          :
          <img alt="step-3.3" src={`${process.env.PUBLIC_URL}/maquettes/VIZ_3.3.svg`} />
        }
      </div>
    </div>
  )
}

export default PrincipalVisualizationPart3;