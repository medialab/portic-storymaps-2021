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

const VisualizationContainer = ({ id, dimensions: inputDimensions, ...props }) => {
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
          title="Produits dont les valeurs d'exports sont les plus importantes en 1789 : comparaison de La Rochelle à la moyenne française"
          width={dimensions.width}
          height={props.atlasMode ? window.innerHeight / 2 : dimensions.height}
          orientation={'vertical'}
          layout={'groups'}
          y={{
            field: 'product',
            title: 'produit',
          }}
          x={{
            field: 'value_rel_per_direction',
            title: 'Valeur en pourcentage',
            tickSpan: .1,
            tickFormat: (d, i) => parseInt(d * 100) + '%'
          }}
          color={{
            field: 'entity',
            title: 'Part des exports pour :'
          }}
          margins={{
            left: 140
          }}
          tooltip={d => `Le produit ${d.product} représente ${(d.value_rel_per_direction * 100).toFixed(2)}% des exports pour ${d.entity.includes('France') ? 'la France' : 'la direction des fermes de La Rochelle'}`}
        />
      )
    case 'partie-1-evolution-de-la-part-des-echanges-de-la-rochelle-au-xviiie':
      return (
        <BarChart
          data={
            relevantDatasets[Object.keys(relevantDatasets)[0]]
          }
          title="Évolution globale de la part des échanges de La Rochelle par rapport à l'ensemble de la France"
          width={dimensions.width}
          height={props.atlasMode ? window.innerHeight / 2 : dimensions.height * .5}
          orientation={'horizontal'}
          layout={'stack'}
          y={{
            field: 'portion',
            title: 'part du commerce fr.',
            tickFormat: d => parseInt(d * 100) + '%'
          }}
          x={{
            field: 'year',
            title: 'année',
            fillGaps: true,
            tickSpan: 5,
            // tickFormat: d => d%10 === 0 ? d : undefined
          }}
          color={{
            field: 'type',
            title: 'Type'
          }}
          margins={{
            left: 140,
            right: 0,
          }}
          tooltip={d => `En ${d.year}, la direction des fermes de la Rochelle a ${d.type === 'import' ? 'importé' : 'exporté'} ${(+d.portion * 100).toFixed(2)}% des ${d.type === 'import' ? 'imports' : 'exports'} français totaux`}
        />
      )
    case 'sorties-de-sel':
      return (
        <BarChart
          data={
            relevantDatasets[Object.keys(relevantDatasets)[0]]
          }
          title="Ports de départ des navires transportant du sel en 1789, agrégés par tonnage cumulé"
          width={dimensions.width}
          height={props.atlasMode ? window.innerHeight * .8 : dimensions.height}
          orientation={'vertical'}
          y={{
            field: 'port',
            title: 'Port',
            sort: {
              field: 'tonnage',
              autoSort: true,
              ascending: false,
              type: 'number'
            }
          }}
          x={{
            field: 'tonnage',
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
          tooltip={d => `En 1789, ${d.tonnage} tonneaux (et ${d.nb_pointcalls} navires) sont partis de la région PASA avec du sel comme cargaison.`}
        />
      )
    case 'sorties-de-marennes':
      return (
        <BarChart
          data={
            relevantDatasets[Object.keys(relevantDatasets)[0]]
          }
          title="Destination des navires partant de Marennnes en 1789, agrégées par pays et par tonnage cumulé"
          width={dimensions.width}
          height={props.atlasMode ? window.innerHeight * .8 : dimensions.height / 2}
          orientation={'vertical'}
          y={{
            field: 'country',
            title: 'Pays',
            sort: {
              field: 'tonnage',
              autoSort: true,
              ascending: false,
              type: 'number'
            }
          }}
          x={{
            field: 'tonnage',
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
          tooltip={d => `En 1789, ${d.tonnage} tonneaux (et ${d.nb_pointcalls} navires) sont partis du port de Marennes en direction d'un port de ${d.country}.`}
        />
      )
    case 'partie-1-pays-port-d-attache':
      return (
        <BarChart
          data={
            relevantDatasets[Object.keys(relevantDatasets)[0]]
          }
          title="Pays du port d'attache des navires étrangers partant de la région en 1789"
          width={dimensions.width}
          height={props.atlasMode ? window.innerHeight * .8 : dimensions.height}
          orientation={'vertical'}
          y={{
            field: 'country',
            title: 'Pays du port d\'attache',
            sort: {
              field: 'tonnage',
              autoSort: true,
              ascending: false,
              type: 'number'
            }
          }}
          x={{
            field: 'tonnage',
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
          tooltip={d => `En 1789, ${d.nb_pointcalls} navires soit ${d.tonnage} tonnaux sont partis de la région de La Rochelle (amirautés de La Rochelle, Sables d'Olonnes ou Marennes)`}
        />
      )
    // case 'partie-1-produits-importants-pour-la-rochelle':
    //   return (
    //     <BarChart
    //       data={
    //         relevantDatasets[Object.keys(relevantDatasets)[0]]
    //           .sort((a, b) => {
    //             if (+a.order > +b.order) {
    //               return 1;
    //             }
    //             return -1;
    //           })
    //           .slice(0, 20)
    //       }
    //       title="Produits dont les valeurs d'exports sont les plus importantes en 1789 : comparaison de La Rochelle à la moyenne française"
    //       width={dimensions.width}
    //       height={props.atlasMode ? window.innerHeight / 2 : dimensions.height}
    //       orientation={'vertical'}
    //       layout={'groups'}
    //       y={{
    //         field: 'product',
    //         title: 'produit',
    //       }}
    //       x={{
    //         field: 'value_rel_per_direction',
    //         title: 'Valeur en pourcentage',
    //         tickSpan: .1,
    //         tickFormat: (d, i) => parseInt(d * 100) + '%'
    //       }}
    //       color={{
    //         field: 'entity',
    //         title: 'Part des exports pour :'
    //       }}
    //       margins={{
    //         left: 140
    //       }}
    //       tooltip={d => `Le produit ${d.product} représente ${(d.value_rel_per_direction * 100).toFixed(2)}% des exports pour ${d.entity.includes('France') ? 'la France' : 'la direction des fermes de La Rochelle'}`}
    //     />
    //   )
    case 'partie-3-comparaison-exports-coloniaux':
      return (
        <BarChart
          data={
            relevantDatasets[Object.keys(relevantDatasets)[0]]
          }
          title="Comparaison des exports de produits coloniaux, locaux et autres par bureaux des fermes (1789)"
          width={dimensions.width}
          height={props.atlasMode ? window.innerHeight * .8 : dimensions.height * .5}
          orientation={'vertical'}
          layout={'grouped'}
          y={{
            field: 'customs_office',
            title: 'Bureau des fermes',
            // tickFormat: d => parseInt(d * 100) + '%'
          }}
          x={{
            field: 'value',
            title: 'valeur en livres tournoi',
            tickSpan: 1000000,
            domain: [0, 6000000]
          }}
          color={{
            field: 'type',
            title: 'Type de produit'
          }}
          margins={{
            left: 140,
            right: 50,
          }}
          tooltip={d => `En 1789, le bureau des fermes de ${d.customs_office} a exporté à l'étrange ${d.value} livres tournois de produits de type ${d.type}`}
        />
      )
    case 'intro-provinces':
      return (
        <>
          <GeographicMapChart
            title={'Carte des provinces étudiées : Poitou, Aunis, Saintonge, Angoumois (PASA)'}
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
          <GeographicMapChart
            title={'Carte des navires sortis de Marennes avec du sel en 1789, dimensionnés par tonnage cumulé'}
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
                  title: 'tonnage cumulé',
                  // custom: '20'
                },
                tooltip: d => `En 1789, des navires pour un total d'approximativement ${d.rawSize} tonneaux sont partis de Marennes avec du sel pour se rendre au port de ${d.label}`,
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
                  title: 'tonnage cumulé',
                  // custom: '20'
                },
                tooltip: d =>`En 1789, des navires pour un total d'approximativement ${d.rawSize} tonneaux sont partis de Marennes avec du sel pour se rendre au port de ${d.label}`,
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
            title={'Carte des ports de la région PASA'}
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
                  title: 'Province du port',
                  palette: omit(colorPalettes.provinces, ['Angoumois']),
                  labelsColor: props.atlasMode ? undefined : 'white'
                },
                size: {
                  field: 'nb_pointcalls',
                  title: 'nombre de congés enregistrés en 1789',
                  // custom: '20'
                },
                tooltip: d => `${d.rawSize} départs de navires ont été observés par le port de ${d.label} en 1789`,
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
            title={'Part de la navigation française dans la région'}
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
                  title: 'Part de la navigation française (par tonnage cumulé)',
                  palette: colorPalettes.tonnageClasses,
                  labelsColor: props.atlasMode ? undefined : 'white'
                },
                size: {
                  field: 'tonnage',
                  title: 'Tonnage sorti des ports (en miliers)',
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
            title: 'Ports d\'attache des navires partant de la région PASA en 1789 (dimensionnés par tonnage cumulé)',
            width: dimensions.width,
            height: props.atlasMode ? window.innerHeight * .8 : dimensions.height * .8,
            tooltip: d => `En 1789, ${d.tonnage} tonneaux cumulés sortis de la région PASA provenaient de navires rattachés au port de ${d.homeport} - ${d.category_2}.`,
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
            title: 'Destinations des navires partant depuis la région PASA vers l\'étranger en 1789 (dimensionnées par tonnage cumulé)',
            width: dimensions.width,
            height: props.atlasMode ? window.innerHeight * .8 : dimensions.height * .8,
            tooltip: d => `En 1789, ${d.tonnage} tonneaux cumulés sortis de la région PASA ont eu pour destination le port de ${d.port} - ${d.category_2}.`,
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
          title="Évolution des exports d'eau-de-vie et liqueurs par la direction de La Rochelle (ports francs non pris en compte - pas de données pour Montpellier en 1770)"
          width={dimensions.width}
          height={props.atlasMode ? window.innerHeight / 2 : dimensions.height / 2}
          orientation={'horizontal'}
          // layout={'groups'}
          y={{
            field: 'value',
            title: 'valeur',
            tickFormat: d => formatNumber(d) + ' lt'
          }}
          x={{
            field: 'year',
            title: 'Année',
          }}
          margins={{
            left: 140
          }}
          tooltip={d => `En ${d.year}, la direction des fermes de La Rochelle a exporté ${d.value} livres tournois d'eau-de-vie et liqueurs.`}
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
            title="Comparaison des exports d'eau-de-vie et liqueurs par différentes directions des fermes (ports francs non pris en compte)"
            width={dimensions.width}
            height={props.atlasMode ? window.innerHeight / 2 : dimensions.height / 2}
            orientation={'vertical'}
            layout={'groups'}
            y={{
              field: 'year',
              title: 'année',
              // tickFormat: d => d + ' lt'
            }}
            x={{
              field: 'value',
              title: 'valeur',
              tickSpan: 1000000,
              tickFormat: d => formatNumber(d) + ' lt'
            }}
            color={{
              field: 'customs_region',
              title: 'direction des fermes'
            }}
            margins={{
              left: 140,
              right: 50
            }}
            tooltip={d => `En ${d.year}, la direction des fermes de ${d.customs_region} a exporté ${parseInt(d.value)} livres tournois d'eau-de-vie et liqueurs.`}
          />
        );
    case 'origines-exports-eau-de-vie-1789-la-rochelle':
      return (
        <BarChart
            data={
              relevantDatasets[Object.keys(relevantDatasets)[0]]
            }
            title="Origine des exports d'eau-de-vie de la direction des fermes de La Rochelle en 1789 (ports francs non pris en compte)"
            width={dimensions.width}
            height={props.atlasMode ? window.innerHeight / 2 : dimensions.height / 2}
            orientation={'vertical'}
            layout={'groups'}
            y={{
              field: 'origin',
              title: 'origine',
              // tickFormat: d => d + ' lt'
            }}
            x={{
              field: 'value',
              title: 'valeur',
              tickFormat: d => formatNumber(d / 100) + ' lt'
            }}
            color={{
              field: 'type',
              title: "type d'eau de vie",
            }}
            margins={{
              left: 140,
              right: 50
            }}
            tooltip={d => `La direction des fermes de La Rochelle a exporté ${parseInt(d.value)} livres tournois d'eau-de-vie et liqueurs de type "${d.type}", originaires de ${d.origin}.`}
          />
        );
    case 'partie-1-ports-dattache-vers-etranger':
      return (
        <TreemapChart
        {
          ...{
            data: datasets['hierarchie_destinations_des_navires_partant_de_la_region_vers_letranger/hierarchie_destinations_des_navires_partant_de_la_region_vers_letranger.csv'],
            title: 'Ports d’attache des navires en provenance de la région PASA et en direction de l’étranger en 1789 (dimensionnées par tonnages cumulés)',
            width: dimensions.width,
            height: props.atlasMode ? window.innerHeight * .8 : dimensions.height * .8,
            tooltip: d => `En 1789, ${d.tonnage} tonneaux cumulés sortis de la région PASA étaient rattachés au port de ${d.homeport} - ${d.category_2}.`,
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