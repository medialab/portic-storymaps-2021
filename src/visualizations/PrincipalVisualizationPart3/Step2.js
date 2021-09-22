
import NetworkGraphChart from "../../components/NetworkGraphChart/GraphContainer";
import BarChart from "../../components/BarChart";
import colorPalettes from "../../colorPalettes";
import { fixSvgDimension } from "../../helpers/misc";

const Step2 = ({
  width: inputWidth,
  height: inputHeight,
  datasets,
}) => {
  const width = fixSvgDimension(inputWidth);
  const height = fixSvgDimension(inputHeight);
  return (
    <>
          <div className="graphs-container" style={{ position: 'relative', height: height * .6 }}>
            <div className="graph-container" style={{ width: width * .6, height: height * .6, position: 'absolute' }}>
              <NetworkGraphChart
                data={datasets['flows_1787_around_La Rochelle/flows_1787_around_La Rochelle.gexf']}
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
              <NetworkGraphChart
                data={datasets['flows_1787_around_Bordeaux/flows_1787_around_Bordeaux.gexf']}
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
              <NetworkGraphChart
                data={datasets['flows_1787_around_Nantes/flows_1787_around_Nantes.gexf']}
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
            height: height * .3,
            paddingLeft: 0,
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
              data={datasets['part_3_centralite_comparaison/part_3_centralite_comparaison.csv']}
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
  )
}

export default Step2;