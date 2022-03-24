// @TODO : colorLegends et titres à mettre en place pour cartes notamment
// @TODO : faire une passe sur visualizationList.json que j'ai rempli approximativement pour les vizs 'intro-provinces', 'intro-ports', et 'intro-bureaux'

import { useContext, useMemo } from 'react';

import Test from './Test';
import PrincipalVisualizationPart1 from './PrincipalVisualizationPart1';
import PrincipalVisualizationPart2 from './PrincipalVisualizationPart2';
import PrincipalVisualizationPart3 from './PrincipalVisualizationPart3';
import BarChart from '../components/BarChart';
import LineChart from '../components/LineChart';
import GeographicMapChart from '../components/GeographicMapChart/GeographicMapChart';
import colorPalettes from '../colorPalettes'

import {formatNumber} from '../helpers/misc'
import { DatasetsContext } from '../helpers/contexts';

import visualizationsList from '../visualizationsList';
import IntroBureaux from './IntroBureaux';
import HomeportFlows from './HomeportFlows/HomeportFlows';
import TreemapChart from '../components/TreemapChart/TreemapChart';
import { omit } from 'lodash';
import translate from '../i18n/translate';

/**
 * This script is the bridge between visualization code, visualizations list, and visualization callers in contents.
 * It returns a visualization component depending on the provided id
 * @param {string} id
 * @param {object} dimensions
 * @param {object} - additional props
 * @returns {React.ReactElement} - React component
 */
const VisualizationContainer = ({ 
  id, 
  dimensions: inputDimensions, 
  ...props 
}) => {
  const dimensions = {
    ...inputDimensions,
    // height: inputDimensions.height - inputDimensions.top / 2
  }
  const datasets = useContext(DatasetsContext);

  const relevantDatasets = useMemo(() => {
    const viz = visualizationsList.find(v => v.id === id);
    if (viz) {
      const datasetsIds = viz.datasets && viz.datasets.split(',').map(d => d.trim());
      if (datasetsIds.length && datasets) {
        return datasetsIds.reduce((cur, id) => ({
          ...cur,
          [id]: datasets[id]
        }), {})
      }
    }
  }, [id, datasets]);

  const hasData = Object.keys(relevantDatasets || {}).length && !Object.entries(relevantDatasets).find(([id, payload]) => !payload);
  if (!hasData) {
    // console.log('no data for ', id, 'looked for', visualizationsList.find(v => v.id === id))
    return null;
  }
  switch (id) {
    case 'viz-principale-partie-1':
      return <PrincipalVisualizationPart1 {...props} datasets={relevantDatasets || {}} {...dimensions} />;
    case 'viz-principale-partie-2':
      return <PrincipalVisualizationPart2 {...props} datasets={relevantDatasets || {}} {...dimensions} />;
    case 'viz-principale-partie-3':
      return <PrincipalVisualizationPart3 {...props} datasets={relevantDatasets || {}} {...dimensions} />;
    case 'partie-1-produits-importants-pour-la-rochelle':
      return (
        <BarChart
          data={
            relevantDatasets[Object.keys(relevantDatasets)[0]]
              .sort((a, b) => {
                if (+a.order > +b.order) {
                  return 1;
                }
                return -1;
              })
              .slice(0, 20)
          }
          title={translate('partie-1-produits-importants-pour-la-rochelle', 'title', props.lang)}
          width={dimensions.width}
          height={props.atlasMode ? window.innerHeight / 2 : dimensions.height}
          orientation={'vertical'}
          layout={'groups'}
          y={{
            field: 'product',
            title: translate('partie-1-produits-importants-pour-la-rochelle', 'y', props.lang),
          }}
          x={{
            field: 'value_rel_per_direction',
            title: translate('partie-1-produits-importants-pour-la-rochelle', 'x', props.lang),
            tickSpan: .1,
            tickFormat: (d, i) => parseInt(d * 100) + '%'
          }}
          color={{
            field: 'entity',
            title: translate('partie-1-produits-importants-pour-la-rochelle', 'color', props.lang),
            palette: {
              'direction des fermes de La Rochelle': '#00C4AF',
              'France (moyenne)': '#FEA43B'
            }
          }}
          margins={{
            left: 140
          }}
          tooltip={d => translate('partie-1-produits-importants-pour-la-rochelle', 'tooltip', props.lang, { product: d.product, value: (d.value_rel_per_direction * 100).toFixed(2), entite: d.entity.includes('France') ? 'la France' : 'la direction des fermes de La Rochelle' })}
        />
      )
    case 'partie-1-evolution-de-la-part-des-echanges-de-la-rochelle-au-xviiie':
      return (
        <BarChart
          data={
            relevantDatasets[Object.keys(relevantDatasets)[0]]
          }
          title={translate('partie-1-evolution-de-la-part-des-echanges-de-la-rochelle-au-xviiie', 'title', props.lang)}
          width={dimensions.width}
          height={props.atlasMode ? window.innerHeight / 2 : dimensions.height * .5}
          orientation={'horizontal'}
          layout={'stack'}
          y={{
            field: 'portion',
            title: translate('partie-1-evolution-de-la-part-des-echanges-de-la-rochelle-au-xviiie', 'y', props.lang),
            tickFormat: d => parseInt(d * 100) + '%'
          }}
          x={{
            field: 'year',
            title: translate('partie-1-evolution-de-la-part-des-echanges-de-la-rochelle-au-xviiie', 'x', props.lang),
            fillGaps: true,
            tickSpan: 5,
            // tickFormat: d => d%10 === 0 ? d : undefined
          }}
          color={{
            field: 'type',
            title: translate('partie-1-evolution-de-la-part-des-echanges-de-la-rochelle-au-xviiie', 'color', props.lang)
          }}
          margins={{
            left: 140,
            right: 20,
            bottom: 30
          }}
          tooltip={d =>translate('partie-1-evolution-de-la-part-des-echanges-de-la-rochelle-au-xviiie', 'tooltip', props.lang, { year: d.year, direction: d.type === 'import' ? 'importé' : 'exporté', value: (+d.portion * 100).toFixed(2), type: d.type === 'import' ? 'imports' : 'exports' })}
        />
      )
    case 'sorties-de-sel':
      return (
        <BarChart
          data={
            relevantDatasets[Object.keys(relevantDatasets)[0]]
          }
          title={translate('sorties-de-sel', 'title', props.lang)}
          width={dimensions.width}
          height={props.atlasMode ? window.innerHeight * .8 : dimensions.height}
          orientation={'vertical'}
          y={{
            field: 'port',
            title: translate('sorties-de-sel', 'y', props.lang),
            sort: {
              field: 'tonnage',
              autoSort: true,
              ascending: false,
              type: 'number'
            }
          }}
          x={{
            field: translate('sorties-de-sel', 'x', props.lang),
            title: 'Tonnage cumulé',
            // tickSpan: 100,
            tickFormat: (d, i) => `${formatNumber(d)} tx`
          }}
          // color={{
          //   field: 'entity',
          //   title: 'Part des exports pour :'
          // }}
          margins={{
            right: 60
          }}
          tooltip={d => translate('sorties-de-sel', 'y', props.lang, { tonnage: d.tonnage, number: d.nb_pointcalls })}
        />
      )
    case 'sorties-de-marennes':
      return (
        <BarChart
          data={
            relevantDatasets[Object.keys(relevantDatasets)[0]]
          }
          title={translate('sorties-de-marennes', 'title', props.lang)}
          width={dimensions.width}
          height={props.atlasMode ? window.innerHeight * .8 : dimensions.height / 2}
          orientation={'vertical'}
          y={{
            field: 'country',
            title: translate('sorties-de-marennes', 'y', props.lang),
            sort: {
              field: 'tonnage',
              autoSort: true,
              ascending: false,
              type: 'number'
            }
          }}
          x={{
            field: translate('sorties-de-marennes', 'x', props.lang),
            title: 'Tonnage cumulé',
            // tickSpan: 100,
            tickFormat: (d, i) => `${formatNumber(d)} tx`
          }}
          // color={{
          //   field: 'entity',
          //   title: 'Part des exports pour :'
          // }}
          margins={{
            right: 60
          }}
          tooltip={d => translate('sorties-de-marennes', 'tooltip', props.lang, { tonnage: d.tonnage, number: d.nb_pointcalls, country: d.country })}
        />
      )
    case 'partie-1-pays-port-d-attache':
      return (
        <BarChart
          data={
            relevantDatasets[Object.keys(relevantDatasets)[0]]
          }
          title={translate('partie-1-pays-port-d-attache', 'title', props.lang)}
          width={dimensions.width}
          height={props.atlasMode ? window.innerHeight * .8 : dimensions.height}
          orientation={'vertical'}
          y={{
            field: 'country',
            title: translate('partie-1-pays-port-d-attache', 'y', props.lang),
            sort: {
              field: 'tonnage',
              autoSort: true,
              ascending: false,
              type: 'number'
            }
          }}
          x={{
            field: 'tonnage',
            title: translate('partie-1-pays-port-d-attache', 'x', props.lang),
            // tickSpan: 100,
            tickFormat: (d, i) => `${formatNumber(d)} tx`
          }}
          // color={{
          //   field: 'entity',
          //   title: 'Part des exports pour :'
          // }}
          margins={{
            right: 60
          }}
          tooltip={d => translate('partie-1-pays-port-d-attache', 'tooltip', props.lang, { tonnage: d.tonnage, number: d.nb_pointcalls })}
        />
      )
    case 'partie-3-comparaison-exports-coloniaux':
      return (
        <BarChart
          data={
            relevantDatasets[Object.keys(relevantDatasets)[0]]
          }
          title={translate('partie-3-comparaison-exports-coloniaux', 'title', props.lang)}
          width={dimensions.width}
          height={props.atlasMode ? window.innerHeight * .8 : dimensions.height * .5}
          orientation={'vertical'}
          layout={'grouped'}
          y={{
            field: 'customs_office',
            title: translate('partie-3-comparaison-exports-coloniaux', 'y', props.lang),
            // tickFormat: d => parseInt(d * 100) + '%'
          }}
          x={{
            field: 'value',
            title: translate('partie-3-comparaison-exports-coloniaux', 'x', props.lang),
            tickSpan: 1000000,
            domain: [0, 6000000],
            tickFormat: d => formatNumber(d) + ' lt'
          }}
          color={{
            field: 'type',
            title: translate('partie-3-comparaison-exports-coloniaux', 'color', props.lang)
          }}
          margins={{
            left: 140,
            right: 50,
          }}
          tooltip={d => translate('partie-3-comparaison-exports-coloniaux', 'tooltip', props.lang, { customs_office: d.customs_office, value: d.value, type: d.type })}
        />
      )
    case 'intro-provinces':
      return (
        <>
          <GeographicMapChart
            title={translate('intro-provinces', 'title', props.lang)}
            layers={[
              {
                type: 'choropleth',
                data: datasets['map_backgrounds/map_france_1789.geojson'],
                reverseColors: props.atlasMode ? undefined : true,
                color: {
                  field: 'shortname',
                  palette: colorPalettes.provinces
                },
                tooltip: (d) => {
                  return d.properties.shortname
                }
              }
            ]}
            projectionTemplate='France'
            width={dimensions.width}
            height={props.atlasMode ? window.innerHeight * .9 : dimensions.height}
          />
        </>
      )
    case 'sorties-de-marennes-avec-sel-destinations':
      return (
        <div>
          <div style={{borderBottom: '2px solid #333'}}>
            <GeographicMapChart
              title={translate('sorties-de-marennes-avec-sel-destinations', 'title', props.lang)}
              layers={[
                {
                  type: 'choropleth',
                  data: datasets['map_backgrounds/map_france_1789.geojson']
                },
                {
                  type: 'points',
                  data: datasets['sorties-de-marennes-avec-sel-destinations/sorties-de-marennes-avec-sel-destinations.csv'].filter(d => d.country === 'France'),
                  // color: {
                  //   field: 'country',
                  //   title: 'Pays',
                  //   palette: colorPalettes.franceAlone
                  // },
                  size: {
                    field: 'tonnage',
                    title: translate('sorties-de-marennes-avec-sel-destinations', 'size', props.lang),
                    // custom: '20'
                  },
                  tooltip: d => translate('sorties-de-marennes-avec-sel-destinations', 'tooltip', props.lang, { raw_size: d.rawSize, label : d.label}),
                  label: {
                    field: 'port',
                    position: 'left'
                  },
                  stackLabels: true
                }
              ]}
              projectionTemplate='France'
              width={dimensions.width}
              height={props.atlasMode ? window.innerHeight * .4 : dimensions.height / 2}
            />
          </div>
          <GeographicMapChart
            layers={[
              {
                type: 'choropleth',
                data: datasets['map_backgrounds/map_world_1789.geojson']
              },
              {
                type: 'points',
                data: datasets['sorties-de-marennes-avec-sel-destinations/sorties-de-marennes-avec-sel-destinations.csv'].filter(d => d.country !== 'France'),
                // color: {
                //   field: 'country',
                //   title: 'Pays',
                //   // labelsColor: props.atlasMode ? undefined : 'white'
                // },
                size: {
                  field: 'tonnage',
                  title: translate('sorties-de-marennes-avec-sel-destinations', 'size', props.lang),
                  // custom: '20'
                },
                tooltip: d => translate('sorties-de-marennes-avec-sel-destinations', 'tooltip', props.lang, { rawSize: d.rawSize, label : d.label}),
                label: {
                  field: 'port',
                },
                stackLabels: true
              }
            ]}
            projectionTemplate='World'
            projectionConfig={{
              scale: (props.atlasMode ? window.innerHeight : dimensions.height) * .8,
              centerY:  45,
              centerX: -30
            }}
            width={dimensions.width}
            withLegend={'bottom right'}
            height={props.atlasMode ? window.innerHeight * .4 : dimensions.height / 2}
          />
        </div>
      )
    case 'intro-ports':
      return (
        <>
          <GeographicMapChart
            title={translate('intro-ports', 'title', props.lang)}
            layers={[
              {
                type: 'choropleth',
                data: datasets['map_backgrounds/map_france_1789.geojson'],
                reverseColors: props.atlasMode ? undefined : true,
                // color:{
                //   field: 'shortname',
                //   palette: colorPalettes.provinces
                // }
              },
              {
                type: 'points',
                data: datasets['ports_locations_data_intro/ports_locations_data_intro.csv'],
                color: {
                  field: 'province',
                  title: translate('intro-ports', 'color', props.lang),
                  palette: omit(colorPalettes.provinces, ['Angoumois']),
                  labelsColor: props.atlasMode ? undefined : 'white'
                },
                size: {
                  field: 'nb_pointcalls',
                  title: translate('intro-ports', 'size', props.lang),
                  // custom: '20'
                },
                tooltip: d => `${d.rawSize} départs de navires ont été observés par le port de ${d.label} en 1789`,
                tooltip: d => translate('intro-ports', 'tooltip', props.lang, { rawSize: d.rawSize, label: d.label }),
                label: {
                  field: 'port',
                  position: 'left'
                },
                stackLabels: true
              }]}
            projectionTemplate='Poitou'
            width={dimensions.width}
            height={props.atlasMode ? window.innerHeight * .9 : dimensions.height}
            withLegend={'top right'}

          />
        </>
      )
    case 'intro-bureaux':
      // console.log("heyyyyyy bureaux map");
      return (
        <IntroBureaux
          lang={props.lang}
          {
            ...{
              datasets,
              atlasMode: props.atlasMode,
              dimensions
            }
          }
        />
      )
    case 'partie-2-part-navigation-francaise':
      return (
        <>
          <GeographicMapChart
            title={translate('partie-2-part-navigation-francaise', 'title', props.lang)}
            layers={[
              {
                type: 'choropleth',
                data: datasets['map_backgrounds/map_france_1789.geojson'],
                reverseColors: props.atlasMode ? undefined : true,
                // color:{
                //   field: 'shortname',
                //   palette: colorPalettes.provinces
                // }
              },
              {
                type: 'points',
                data: datasets['part_navigation_fr/part_navigation_fr.csv'],
                color: {
                  field: 'tonnage_part_of_french',
                  title: translate('partie-2-part-navigation-francaise', 'color', props.lang),
                  palette: colorPalettes.tonnageClasses,
                  labelsColor: props.atlasMode ? undefined : 'white'
                },
                size: {
                  field: 'tonnage',
                  title: translate('partie-2-part-navigation-francaise', 'size', props.lang),
                  displayMetric: true,
                  // custom: '20'
                },
                // tooltip: d => `${d.rawSize} mouvements de bateaux ont été enregistrés par le port de ${d.label} en 1789`,
                label: {
                  field: 'port',
                  position: 'left'
                },
                stackLabels: true
              }]}
            projectionTemplate='Poitou'
            width={dimensions.width}
            height={props.atlasMode ? window.innerHeight * .9 : dimensions.height}
            withLegend={'top right'}

          />
        </>
      );
    case 'partie-2-carte-direction-bateaux-de-la-rochelle':
      // voyages-bateaux-homeport-larochelle-1787.csv
      return (
        <HomeportFlows
        lang={props.lang}
        {
          ...{
            datasets,
            atlasMode: props.atlasMode,
            dimensions,
          }
        }
        />
      );
    case 'partie-1-ports-dattache':
      return (
        <TreemapChart
        {
          ...{
            data: datasets['hierarchie_ports_dattache_des_navires_partant_de_la_region/hierarchie_ports_dattache_des_navires_partant_de_la_region.csv'],
            title: translate('partie-1-ports-dattache', 'title', props.lang),
            width: dimensions.width,
            height: props.atlasMode ? window.innerHeight * .8 : dimensions.height * .8,
            tooltip: d => translate('partie-1-ports-dattache', 'tooltip', props.lang, { tonnage: d.tonnage, homeport: d.homeport, category: d.category_2 }),
            fieldsHierarchy: ['country_group', 'category_1', 'category_2', 'ports'],
            color: {
              field: 'category_2',
              palette: colorPalettes.portsTreemaps
            },
            leaf: {
              labelField: 'homeport',
              countField: 'tonnage'
            }
          }
        }
        />
      )
    case 'partie-1-ports-destinations':
      const thatPalette = {
        ...colorPalettes.portsTreemaps
      }
      delete thatPalette['France (région PASA)']
      delete thatPalette['France (hors région PASA)']
      return (
        <TreemapChart
        {
          ...{
            data: datasets['hierarchie_destinations_des_navires_partant_de_la_region/hierarchie_destinations_des_navires_partant_de_la_region.csv'],
            title: translate('partie-1-ports-destinations', 'title', props.lang),
            width: dimensions.width,
            height: props.atlasMode ? window.innerHeight * .8 : dimensions.height * .8,
            tooltip: d => translate('partie-1-ports-destinations', 'tooltip', props.lang, { tonnage: d.tonnage, homeport: d.homeport, category: d.category_2 }),
            fieldsHierarchy: ['country_group', 'category_1', 'category_2', 'ports'],
            color: {
              field: 'category_2',
              palette: thatPalette
            },
            leaf: {
              labelField: 'port',
              countField: 'tonnage'
            }
          }
        }
        />
      );
    case 'exports-eau-de-vie-la-rochelle-longitudinal':
      return (
      <LineChart
          data={
            relevantDatasets[Object.keys(relevantDatasets)[0]]
              // .sort((a, b) => {
              //   if (+a.order > +b.order) {
              //     return 1;
              //   }
              //   return -1;
              // })
              // .slice(0, 20)
          }
          title={translate('exports-eau-de-vie-la-rochelle-longitudinal', 'title', props.lang)}
          width={dimensions.width}
          height={props.atlasMode ? window.innerHeight / 2 : dimensions.height / 2}
          orientation={'horizontal'}
          // layout={'groups'}
          y={{
            field: 'value',
            title: translate('exports-eau-de-vie-la-rochelle-longitudinal', 'y', props.lang),
            tickFormat: d => formatNumber(d) + ' lt'
          }}
          x={{
            field: 'year',
            title: translate('exports-eau-de-vie-la-rochelle-longitudinal', 'x', props.lang),
          }}
          margins={{
            left: 140
          }}
          tooltip={d => translate('exports-eau-de-vie-la-rochelle-longitudinal', 'y', props.lang, { year: d.year, value: d.value })}
        />
      );
    case 'exports-eau-de-vie-comparaison-directions-des-fermes':
      return (
        <BarChart
            data={
              relevantDatasets[Object.keys(relevantDatasets)[0]]
                // .sort((a, b) => {
                //   if (+a.order > +b.order) {
                //     return 1;
                //   }
                //   return -1;
                // })
                // .slice(0, 20)
            }
            title={translate('exports-eau-de-vie-comparaison-directions-des-fermes', 'title', props.lang)}
            width={dimensions.width}
            height={props.atlasMode ? window.innerHeight / 2 : dimensions.height / 2}
            orientation={'vertical'}
            layout={'groups'}
            y={{
              field: 'year',
              title: translate('exports-eau-de-vie-comparaison-directions-des-fermes', 'y', props.lang),
              // tickFormat: d => d + ' lt'
            }}
            x={{
              field: 'value',
              title: translate('exports-eau-de-vie-comparaison-directions-des-fermes', 'x', props.lang),
              tickSpan: 1000000,
              tickFormat: d => formatNumber(d) + ' lt'
            }}
            color={{
              field: 'customs_region',
              title: translate('exports-eau-de-vie-comparaison-directions-des-fermes', 'color', props.lang)
            }}
            margins={{
              left: 140,
              right: 50
            }}
            tooltip={d => translate('exports-eau-de-vie-comparaison-directions-des-fermes', 'tooltip', props.lang, { year: d.year, customsRegion: d.customs_region, value: parseInt(d.value) })}
          />
        );
    case 'origines-exports-eau-de-vie-1789-la-rochelle':
      return (
        <BarChart
            data={
              relevantDatasets[Object.keys(relevantDatasets)[0]]
            }
            title={translate('origines-exports-eau-de-vie-1789-la-rochelle', 'title', props.lang)}
            width={dimensions.width}
            height={props.atlasMode ? window.innerHeight / 2 : dimensions.height / 2}
            orientation={'vertical'}
            layout={'groups'}
            y={{
              field: 'origin',
              title: translate('origines-exports-eau-de-vie-1789-la-rochelle', 'y', props.lang),
              // tickFormat: d => d + ' lt'
            }}
            x={{
              field: 'value',
              title: translate('origines-exports-eau-de-vie-1789-la-rochelle', 'x', props.lang),
              tickFormat: d => formatNumber(d / 100) + ' lt'
            }}
            color={{
              field: 'type',
              title: translate('origines-exports-eau-de-vie-1789-la-rochelle', 'color', props.lang),
            }}
            margins={{
              left: 140,
              right: 50
            }}
            tooltip={d => translate('origines-exports-eau-de-vie-1789-la-rochelle', 'tooltip', props.lang, { value: parseInt(d.value), type: d.type, origin: d.origin })}
          />
        );
    case 'partie-1-ports-dattache-vers-etranger':
      return (
        <TreemapChart
        {
          ...{
            data: datasets['hierarchie_destinations_des_navires_partant_de_la_region_vers_letranger/hierarchie_destinations_des_navires_partant_de_la_region_vers_letranger.csv'],
            title: translate('partie-1-ports-dattache-vers-etranger', 'title', props.lang),
            width: dimensions.width,
            height: props.atlasMode ? window.innerHeight * .8 : dimensions.height * .8,
            tooltip: d => `En 1789, ${d.tonnage} tonneaux cumulés sortis de la région PASA étaient rattachés au port de ${d.homeport} - ${d.category_2}.`,
            tooltip: d => translate('partie-1-ports-dattache-vers-etranger', 'tooltip', props.lang, { tonnage: d.tonnage, homeport: d.homeport, category: d.category_2 }),
            fieldsHierarchy: ['country_group', 'category_1', 'category_2', 'homeport'],
            color: {
              field: 'category_2',
              palette: colorPalettes.portsTreemaps
            },
            leaf: {
              labelField: 'homeport',
              countField: 'tonnage'
            }
          }
        }
        />
      );
    case 'test':
    default:
      return <Test {...props} datasets={relevantDatasets || {}} />;
  }
}

export default VisualizationContainer;