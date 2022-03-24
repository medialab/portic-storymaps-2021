
import NetworkGraphChart from "../../components/NetworkGraphChart/GraphContainer";
import BarChart from "../../components/BarChart";
import colorPalettes from "../../colorPalettes";
import { fixSvgDimension } from "../../helpers/misc";

import translate from "../../i18n/translate";

/**
 * Viz 3.2 wrapper
 * @param {number} width
 * @param {number} height
 * @param {object} datasets
 * @returns {React.ReactElement} - React component
 */
const Step2 = ({
  width: inputWidth,
  height: inputHeight,
  datasets,
  lang
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
                title={translate('viz-principale-partie-3', 'network_1_title', lang)}
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
                title={translate('viz-principale-partie-3', 'network_2_title', lang)}
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
                title={translate('viz-principale-partie-3', 'network_3_title', lang)}
                ratio={0.7}
                spatialize
              />
            </div>
          </div>
          <div style={{
            position: 'absolute',
            bottom: '1rem',
            left: 0,
            width: width * .3,
            height: height * .3,
            paddingLeft: 0,
            // marginBottom: '1rem'
          }}
            className="ColorLegend"
          >
            <h5>{translate('viz-principale-partie-3', 'network_legend_title', lang)}</h5>
            <ul className="color-legend">
              <li>
                {translate('viz-principale-partie-3', 'network_legend_color_title', lang)}
              </li>
              <li>
                <span style={{ background: colorPalettes.generic.dark }} className="color-box"></span>
                <span className="color-label">
                  {translate('viz-principale-partie-3', 'network_legend_color_1', lang)}
                </span>
              </li>
              <li>
                <span style={{ background: colorPalettes.generic.accent2 }} className="color-box"></span>
                <span className="color-label">
                  {translate('viz-principale-partie-3', 'network_legend_color_2', lang)}
                </span>
              </li>
            </ul>
          </div>
          <div style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: width * .7,
            height: height * .3,
            // marginBottom: '2rem'
          }}>
            <BarChart
              data={datasets['part_3_centralite_comparaison/part_3_centralite_comparaison.csv']}
              title={translate('viz-principale-partie-3', 'barchart_title', lang)}
              width={width * .7}
              height={height * .3}
              orientation={'vertical'}
              layout={'groups'}
              y={{
                field: 'port',
                title: translate('viz-principale-partie-3', 'barchart_y', lang),
              }}
              x={{
                field: 'score',
                title: translate('viz-principale-partie-3', 'barchart_x', lang),
                // tickSpan: .1,
                // tickFormat: (d, i) => parseInt(d * 100) + '%'
              }}
              color={{
                field: 'metrics_type',
                title: translate('viz-principale-partie-3', 'barchart_color', lang),
                palette: {
                  'PageRank': colorPalettes.generic.dark,
                  'betweenness centrality': colorPalettes.generic.accent1,
                }
              }}
              margins={{
                bottom: 40
              }}
              tooltip={d => d.metrics_type === 'PageRank' ? translate('viz-principale-partie-3', 'barchart_toolip_pagerank', lang) : translate('viz-principale-partie-3', 'barchart_toolip_nopagerank', lang)}
            />
          </div>
        </>
  )
}

export default Step2;