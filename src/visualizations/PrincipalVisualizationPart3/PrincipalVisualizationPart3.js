
import cx from 'classnames';
import { useState, useEffect } from 'react';

import SigmaComponent from '../../components/SigmaComponent';
import GeoComponent from '../../components/GeoComponent/GeoComponent';
import { renderStep3Object, renderStep3SmallMultiples, renderTriangles } from './renderObjectsFunctions'; // pas sur que ça reste à terme
import BarChart from '../../components/BarChart';
import colorPalettes from '../../colorPalettes.js';

import './PrincipalVisualizationPart3.scss';


const PrincipalVisualizationPart3 = ({ datasets, step, width, height }) => {
  const ANIMATION_DURATION = 1000;
  const [currentMapTemplate, setCurrentMapTemplate] = useState('France');
  useEffect(() => {
    setTimeout(() => {
      switch(step) {
        case 1:
          setCurrentMapTemplate('rotated Poitou');
          break;
        case 3:
          setCurrentMapTemplate('Poitou');
          break;
        default:
          break;
      }
    }, ANIMATION_DURATION)
  }, [step])
  return (
    <div className="PrincipalVisualizationPart3" height={height}>
      <div className={cx('step', { 'is-visible': step === 1 })}>
        <GeoComponent
          layers={[
            {
              type: 'choropleth',
              data: datasets['cartoweb_france_1789_geojson.geojson']
            },
            {
              type: 'custom',
              data: datasets['part_3_step1_viz_data.csv'],
              renderObjects: renderTriangles
            }
          ]}
          projectionTemplate={currentMapTemplate}
          height={height}
          width={width}
        />
      </div>
      <div className={cx('step', { 'is-visible': step === 2 })}>
        <>
          <div className="graphs-container" style={{ position: 'relative', height: height * .6 }}>
            <div className="graph-container" style={{ width: width * .6, height: height * .6, position: 'absolute' }}>
              <SigmaComponent
                data={datasets['flows_1787_around_La Rochelle.gexf']}
                nodeSize={`degree`}
                labelDensity={1}
                nodeColor={{
                  field: 'internal',
                  palette: {
                    'interne à la région': colorPalettes.generic.dark,
                    'externe à la région': colorPalettes.generic.accent2,
                  }
                }}
                spatialize
                ratio={1.1}
                title={'Réseau des voyages partant ou arrivant dans la région PASA en 1787 ...'}
              />
            </div>
            <div className="graph-container" style={{ width: width * .4, height: height * .3, position: 'absolute', right: 0, top: 0 }}>
              <SigmaComponent
                data={datasets['flows_1787_around_Bordeaux.gexf']}
                nodeSize={`degree`}
                labelDensity={1}
                nodeColor={{
                  field: 'internal',
                  palette: {
                    'interne à la région': colorPalettes.generic.dark,
                    'externe à la région': colorPalettes.generic.accent2,
                  }
                }}
                spatialize
                title={'...comparé à celui de l\'amirauté de Bordeaux'}
                ratio={1}
              />
            </div>
            <div className="graph-container" style={{ width: width * .4, height: height * .3, position: 'absolute', right: 0, bottom: 0 }}>
              <SigmaComponent
                data={datasets['flows_1787_around_Nantes.gexf']}
                nodeSize={`degree`}
                labelDensity={1}
                nodeColor={{
                  field: 'internal',
                  palette: {
                    'interne à la région': colorPalettes.generic.dark,
                    'externe à la région': colorPalettes.generic.accent2,
                  }
                }}
                title={'...comparé à celui de l\'amirauté de Nantes'}
                ratio={1}
                spatialize
              />
            </div>
          </div>
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: width * .3,
            height: height * .3
          }}
            className="ColorLegend"
          >
            <h5>Légende des réseaux</h5>
            <ul className="color-legend">
              <li>
                Taille des points représentant les ports : nombre de liens avec d'autres ports dans le réseau
              </li>
              <li>
                <span style={{ background: colorPalettes.generic.dark }} className="color-box"></span>
                <span className="color-label">
                  Port interne à la région
                </span>
              </li>
              <li>
                <span style={{ background: colorPalettes.generic.accent2 }} className="color-box"></span>
                <span className="color-label">
                  Port externe à la région
                </span>
              </li>
            </ul>
          </div>
          <div style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: width * .7,
            height: height * .3
          }}>
            <BarChart
              data={datasets['part_3_centralite_comparaison.csv']}
              title="Centralité comparée de La Rochelle par rapport à PASA et, pour ses régions côtières voisines, du port principal par rapport au réseau des voyages de son amirauté (1787)"
              width={width * .7}
              height={height * .3}
              orientation={'vertical'}
              layout={'groups'}
              y={{
                field: 'port',
                title: 'Port (dans son réseau local)',
              }}
              x={{
                field: 'score',
                title: 'Score',
                // tickSpan: .1,
                // tickFormat: (d, i) => parseInt(d * 100) + '%'
              }}
              color={{
                field: 'metrics_type',
                title: 'Type de métrique',
                palette: {
                  'PageRank': colorPalettes.generic.dark,
                  'betweenness centrality': colorPalettes.generic.accent1,
                }
              }}
              margins={{
                bottom: 20
              }}
              tooltip={d => d.metrics_type === 'PageRank' ? 'Le PageRank est une mesure de centralité qui consiste à donner à chaque port un score proportionnel à la somme des pageranks des ports avec lesquels il a des voyages en commun.' : 'La centralité intermédiaire est une mesure de centralité égale au nombre de fois où un port donné est sur le chemin le plus court entre deux autres ports du réseau des voyages.'}
            />
          </div>
        </>
      </div>
      <div className={cx('step', { 'is-visible': step === 3 })} height={height}>
        <GeoComponent
          layers={[
            {
              type: 'choropleth',
              data: datasets['cartoweb_france_1789_geojson.geojson'],
              color: {
                field: 'shortname'
              }
            },
            {
              type: 'custom',
              data: datasets['part_3_step3_viz_customs_offices_data.csv'],
              renderObject: renderStep3Object // besoin de montrer les labels des bureaux et ports => modifier la fonction
            },
            {
              type: 'custom',
              data: datasets['part_3_step3_viz_customs_offices_data.csv'],
              renderObjects: renderStep3SmallMultiples
            }
          ]}
          projectionTemplate={currentMapTemplate}
          height={height}
          width={width}
        />
      </div>
    </div>
  )
}

export default PrincipalVisualizationPart3;