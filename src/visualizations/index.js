import { useContext, useMemo } from 'react';

import Test from './Test';
import PrincipalVisualizationPart1 from './PrincipalVisualizationPart1';
import PrincipalVisualizationPart2 from './PrincipalVisualizationPart2';
import PrincipalVisualizationPart3 from './PrincipalVisualizationPart3';
import BarChart from '../components/BarChart';
import GeoComponent from '../components/GeoComponent/GeoComponent';
import colorPalettes from '../colorPalettes'


import { DatasetsContext } from '../helpers/contexts';

import visualizationsList from '../visualizationsList';

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
    case 'partie-1-pays-port-d-attache':
      return (
        <BarChart
          data={
            relevantDatasets[Object.keys(relevantDatasets)[0]]
          }
          title="Pays d'attache des navires étrangers partant de la région en 1789"
          width={dimensions.width}
          height={props.atlasMode ? window.innerHeight * .8 : dimensions.height}
          orientation={'vertical'}
          y={{
            field: 'country',
            title: 'Pays du port d\'attache',
            sort: {
              field: 'nb_outs',
              autoSort: true,
              ascending: false,
              type: 'number'
            }
          }}
          x={{
            field: 'nb_outs',
            title: 'Nombre de départs',
            // tickSpan: 100,
            tickFormat: (d, i) => `${d} départs`
          }}
          // color={{
          //   field: 'entity',
          //   title: 'Part des exports pour :'
          // }}
          margins={{
            right: 60
          }}
          tooltip={d => `En 1789, ${d.nb_outs} bateaux sont partis de la région de La Rochelle (amirautés de La Rochelle, Sables d'Olonnes ou Marennes)`}
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
            title="Comparaison des exports de produits coloniaux, locaux et autres par bureaux des fermes"
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
      return(
        <>
        <GeoComponent 
              layers={[
                {
                  type: 'choropleth',
                  data: datasets['cartoweb_france_1789_geojson.geojson'],
                  reverseColors: true,
                  color:{
                    field: 'shortname',
                    palette: colorPalettes.provinces
                  }
                }
              ]}
              projectionTemplate = 'France'
              height={dimensions.height}
              width={dimensions.width}
            />
          </>
      )
    case 'intro-ports':
      return(
        <>
        <GeoComponent 
              layers={[
                {
                  type: 'choropleth',
                  data: datasets['cartoweb_france_1789_geojson.geojson'],
                  reverseColors: true,
                  // color:{
                  //   field: 'shortname',
                  //   palette: colorPalettes.provinces
                  // }
                },
                {
                  type: 'points',
                  data: datasets['ports_locations_data.csv'],
                  color: {
                    field: 'province',
                    palette: colorPalettes.provinces,
                    labelsColor: 'white'
                  },
                  // size: {
                  //   field: 'name',
                  //   custom: '20'
                  // },
                  label: {
                    field: 'port'
                  }
              }]}
              projectionTemplate = 'Poitou'
              height={dimensions.height}
              width={dimensions.width}
            />
          </>
      )
      case 'intro-bureaux':
        // console.log("heyyyyyy bureaux map");
        return(
          <>
          <GeoComponent 
                layers={[
                  {
                    type: 'choropleth',
                    data: datasets['cartoweb_france_1789_geojson.geojson'],
                    reverseColors: true,
                    // color:{
                    //   field: 'shortname',
                    //   palette: colorPalettes.provinces
                    // }
                  },
                  {
                    type: 'points',
                    data: datasets['part_3_step3_viz_customs_offices_data.csv'],
                    color: {
                      field: 'name',
                      palette: colorPalettes.customs_office,
                      labelsColor: 'white'
                    },
                    size: {
                      custom : 3 // 3 fois plus gros que la taille par défaut
                    },
                    label: {
                      field: 'name'
                    }
                }]}
                projectionTemplate = 'Poitou'
                height={dimensions.height}
                width={dimensions.width}
              />
            </>
        )
    case 'test':
    default:
      return <Test {...props} datasets={relevantDatasets || {}} />;
  }
}

export default VisualizationContainer;