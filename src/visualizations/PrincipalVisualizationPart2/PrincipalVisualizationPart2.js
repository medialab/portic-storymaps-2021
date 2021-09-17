import {useMemo} from 'react';
import cx from 'classnames';
import CircularAlluvialComponent from "../../components/CircularAlluvialComponent/CircularAlluvialComponent";
import RadarWrapper from './RadarWrapper';

import colorsPalettes from '../../colorPalettes';
import {fixSvgDimension} from '../../helpers/misc';

import './PrincipalVisualizationPart2.scss';

const PrincipalVisualizationPart2 = ({
  width: inputWidth, 
  height: containerHeight, 
  datasets, 
  showOnlyToflit = false, 
  atlasMode, 
  highlight = 'toflit18',
  lang = 'fr',
  filter = 'aucun',
  bureaux="tous",
  navigoAgregation="tonnage",
  minTonnage,
  maxTonnage,
  ...props
}) => {
  const width = fixSvgDimension(inputWidth);
  const height = atlasMode ? 1200 : fixSvgDimension(containerHeight);
  const {sumToflitBy, alluvialFilters} = useMemo(() => {
    let sumBy = 'value';
    let filters = [];
    switch(filter) {
      case "colonial":
        filters = [
          {
            key: 'product',
            value: `produits coloniaux`
          },
          {
            key: 'partner',
            value: `Afrique`
          },
          {
            key: 'partner',
            value: `Colonies`
          }
        ];
        break;
      case "eau-de-vie":
        filters = [
          {
            key: 'product',
            value: `eau-de-vie et vins divers`
          }
        
        ];
        break;
      case "sel":
        filters = [{
          key: 'product',
          value: `sel`
        }];
        sumBy = 'product_weight_kg'
        break;
      default:
        break;
    }

    return {
      sumToflitBy: sumBy,
      alluvialFilters: filters
    }
  }, [filter]);
  const toflit18titles = {
    fr: `Échanges de la direction des fermes de La Rochelle en 1789 par produit et partenaire, dimensionnés selon leur ${sumToflitBy === 'value' ? 'valeur commerciale' : 'poids de marchandises'}`,
    en: `Échanges de la direction des fermes de La Rochelle en 1789 par produit et partenaire, dimensionnés selon leur ${sumToflitBy === 'value' ? 'valeur commerciale' : 'poids de marchandises'}`
  };
  const navigoTitles = {
    fr: `Parts de différents groupes de directions pour les navires partis de la région PASA en 1789`,
    en: `Parts de différents groupes de direction pour les navires partis de la région PASA en 1789`
  };
  return (
    <div 
      className={cx("PrincipalVisualizationPart2", {'is-atlas-mode': atlasMode})}
    >
     <div 
      className="circular-alluvial-container"
      style={{
        width: atlasMode ? window.innerWidth * .5 : highlight === 'toflit18' ? width * .6 : width * .5,
        height: atlasMode ? window.innerWidth * .5 : highlight === 'toflit18' ? height : height * .5,
      }}
    >
        <CircularAlluvialComponent
          data={datasets['part_2_toflit_viz_data.csv']}
          width={atlasMode ? window.innerWidth * .5 : highlight === 'toflit18' ? width * .6 : width * .45}
          height={atlasMode ? window.innerWidth * .5 : highlight === 'toflit18' ? height : height * .45}
          sumBy={sumToflitBy}
          filters={alluvialFilters}
          colorsPalettes={colorsPalettes}
          lang={lang}
          title={toflit18titles[lang]}
          displaceHorizontalLabels={highlight === 'toflit18'}
          centerHorizontalLabels={highlight === 'toflit18'}
          tooltips={{
            node: {
              fr: ({id, ...node}, step) => {
                if (step === 0 || step === 5) {
                  return `En 1789, le bureau des fermes de ${id} a ${step < 3 ? 'exporté' : 'importé'} ${parseInt(node.valueAbs)} ${sumToflitBy === 'value' ? 'livres tournoi' : 'kg'}.`;
                } else if (step === 1 || step === 4) {
                  return `En 1789, la direction des fermes de La Rochelle a ${step < 3 ? 'exporté' : 'importé'} ${parseInt(node.valueAbs)} ${sumToflitBy === 'value' ? 'livres tournoi' : 'kg'} de ${id}.`;
                } else {
                  return `En 1789, la direction des fermes de La Rochelle a ${step < 3 ? 'exporté' : 'importé'} ${parseInt(node.valueAbs)} ${sumToflitBy === 'value' ? 'livres tournoi' : 'kg'} vers le partenaire ${id}.`;
                }
              },
              en: () => ({id, ...node}, step) => {
                if (step === 0 || step === 5) {
                  return `In 1789, the bureau des fermes of ${id} has ${step < 3 ? 'imported' : 'exported'} ${node[sumToflitBy]} ${sumToflitBy === 'value' ? 'livres tournoi' : 'kg'}.`;
                } else if (step === 1 || step === 4) {
                  return `In 1789, the direction des fermes de La Rochelle has ${step < 3 ? 'imported' : 'exported'} ${parseInt(node.valueAbs)} ${sumToflitBy === 'value' ? 'livres tournoi' : 'kg'} of ${id}.`;
                } else {
                  return `In 1789, the direction des fermes de La Rochelle has ${step < 3 ? 'imported' : 'exported'} ${parseInt(node.valueAbs)} ${sumToflitBy === 'value' ? 'livres tournoi' : 'kg'} to the partner ${id}.`;
                }
              },
            },
            flow: {
              fr: ({flow_type, customs_office, product, sumBy, value, partner}) => `En 1789, le bureau des fermes de ${customs_office} a ${flow_type === 'import' ? 'importé' : 'exporté'} ${parseInt(value)} ${sumBy === 'value' ? 'livres tournois' : 'kg'} de ${product} ${flow_type === 'import' ? 'depuis' : 'vers'} le partenaire ${partner}`,
              en: ({flow_type, customs_office, product, sumBy, value, partner}) => `In 1789, the bureau des fermes of ${customs_office} has ${flow_type === 'import' ? 'imported' : 'exported'} ${parseInt(value)} ${sumBy === 'value' ? 'livres tournois' : 'kg'} of ${product} ${flow_type === 'import' ? 'from' : 'to'} the partner ${partner}`,
            }
          }}
          steps={[
            {
              field: "customs_office",
              labels: {
                fr: 'bureau des fermes',
                en: 'customs office'
              },
              filters: [{key: 'flow_type', value: 'export'}]
            },
            {
              field: "product",
              labels: {
                fr: 'type de produit',
                en: 'product type'
              },
              filters: [{key: 'flow_type', value: 'export'}]
            },
            {
              field: "partner",
              labels: {
                fr: 'partenaire du commerce extérieur',
                en: 'external trade partner'
              },
              filters: [{key: 'flow_type', value: 'export'}]
            },
            {
              field: "partner",
              labels: {
                fr: 'partenaire du commerce extérieur',
                en: 'external trade partner'
              },
              filters: [{key: 'flow_type', value: 'import'}]
            },
            {
              field: "product",
              labels: {
                fr: 'type de produit',
                en: 'product type'
              },
              filters: [{key: 'flow_type', value: 'import'}]
            },
            {
              field: "customs_office",
              labels: {
                fr: 'bureau des fermes',
                en: 'customs office'
              },
              filters: [{key: 'flow_type', value: 'import'}]
            },
          ]}
        />
     </div>
     <div 
      className="radar-container"
      style={{
        width: atlasMode ? window.innerWidth * .5 : highlight === 'navigo' ? width * .7 : width * .4
      }}
    >
      <RadarWrapper 
        data={datasets['part_2_navigo_viz_data.csv']}
        minified={!atlasMode && highlight !== 'navigo'}
        globalWidth={atlasMode ? window.innerWidth * .5 : width}
        bureaux={bureaux}
        navigoAgregation={navigoAgregation}
        minTonnage={minTonnage}
        maxTonnage={maxTonnage}
        title={navigoTitles[lang]}
        axis={[
          'Local',
          'Afrique',
          'Colonies',
          'Grande-Bretagne',
          'Europe',
          'Ports francs et petites îles',
          'France',
          'Reste du monde',
        ]}
        colorPalette={colorsPalettes.customs_office}
      />
       {/* <img alt="radar-maquette" src={`${process.env.PUBLIC_URL}/maquettes/part2-radar.jpg`} /> */}
     </div>
    </div>
  )
}

export default PrincipalVisualizationPart2;