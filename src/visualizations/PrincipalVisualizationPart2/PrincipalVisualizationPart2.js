import {useMemo} from 'react';
import cx from 'classnames';
import CircularAlluvialChart from "../../components/CircularAlluvialChart/CircularAlluvialChart";
import RadarWrapper from './RadarWrapper';

import colorsPalettes from '../../colorPalettes';
import {fixSvgDimension, formatNumber} from '../../helpers/misc';

import './PrincipalVisualizationPart2.scss';

import translate from '../../i18n/translate';

/**
 * Composes the principal visualization for part 2
 * @param {number} width
 * @param {number} height
 * @param {object} datasets
 * @param {boolean} showOnlyToflit
 * @param {boolean} atlasMode
 * @param {boolean} screenshotMode
 * @param {string} highlight - enum ['navigo', 'toflit18']
 * @param {string} lang
 * @param {string} filter - custom filters enum ['aucun', 'colonial', 'eau-de-vie', 'sel']
 * @param {string} bureaux - bureaux to highlight enum ['tous', <bureaux names separated by comas>']
 * @param {string} navigoAgregation - enum["tonnage", ...]
 * @param {number} minTonnage
 * @param {number} maxTonnage
 * @returns {React.ReactElement} - React component
 */
const PrincipalVisualizationPart2 = ({
  width: inputWidth, 
  height: containerHeight, 
  datasets, 
  showOnlyToflit = false, 
  atlasMode, 
  screenshotMode,
  highlight = 'toflit18',
  lang = 'fr',
  filter = 'aucun',
  bureaux="tous",
  navigoAgregation="tonnage",
  minTonnage,
  maxTonnage,
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
  const toflit18titles = (() => {
    if (lang === 'fr') {
      return translate('viz-principale-partie-2', 'toflit18titles', lang, {sumToflitBy: sumToflitBy === 'value' ? 'valeur commerciale' : 'poids de marchandises'})
    }
    return translate('viz-principale-partie-2', 'toflit18titles', lang, {sumToflitBy: sumToflitBy === 'value' ? 'commercial value' : 'weight of goods'})
  })()
  const navigoTitles = translate('viz-principale-partie-2', 'navigoTitles', lang)
  return (
    <div 
      className={cx("PrincipalVisualizationPart2", "highlight-" + highlight, {'is-atlas-mode': atlasMode, 'is-screenshot-mode': screenshotMode})}
    >
     <div 
      className="circular-alluvial-container"
      style={{
        width: atlasMode ? window.innerWidth * .5 : highlight === 'toflit18' ? width * .6 : width * .5,
        height: atlasMode ? window.innerWidth * .5 : highlight === 'toflit18' ? height : height * .5,
      }}
    >
        <CircularAlluvialChart
          data={datasets['part_2_toflit_viz_data/part_2_toflit_viz_data.csv']}
          width={atlasMode ? window.innerWidth * .5 : highlight === 'toflit18' ? width * .6 : width * .45}
          height={atlasMode ? window.innerWidth * .5 : highlight === 'toflit18' ? height : height * .45}
          sumBy={sumToflitBy}
          filters={alluvialFilters}
          colorsPalettes={colorsPalettes}
          lang={lang}
          title={toflit18titles}
          displaceHorizontalLabels={highlight === 'toflit18'}
          centerHorizontalLabels={highlight === 'toflit18'}
          tooltips={{
            node: ({id, ...node}, step) => {
              const importTranslate = lang === 'fr' ? 'importé' : 'imported';
              const exportTranslate = lang === 'fr' ? 'exporté' : 'exported';

              if (step === 0 || step === 5) {
                return translate('viz-principale-partie-2', 'node_0_5', lang, { id, step: step < 3 ? exportTranslate : importTranslate, number: formatNumber(parseInt(node.valueAbs)), sumBy: sumToflitBy === 'value' ? 'livres tournoi' : 'kg' })
              } else if (step === 1 || step === 4) {
                return translate('viz-principale-partie-2', 'node_1_4', lang, { id, step: step < 3 ? exportTranslate : importTranslate, number: formatNumber(parseInt(node.valueAbs)), sumBy: sumToflitBy === 'value' ? 'livres tournoi' : 'kg' })
              } else {
                return translate('viz-principale-partie-2', 'node_other', lang, { id, step: step < 3 ? exportTranslate : importTranslate, number: formatNumber(parseInt(node.valueAbs)), sumBy: sumToflitBy === 'value' ? 'livres tournoi' : 'kg' })
              }
            },
            flow: {
              fr: ({flow_type, customs_office, product, sumBy, value, partner}) => translate('viz-principale-partie-2', 'flow', lang, { customs_office, flow_type: flow_type === 'import' ? 'importé' : 'exporté', value: formatNumber(parseInt(value)), sumBy: sumBy === 'value' ? 'livres tournois' : 'kg', product, flow_direction: flow_type === 'import' ? 'depuis' : 'vers', partner }),
              en: ({flow_type, customs_office, product, sumBy, value, partner}) => translate('viz-principale-partie-2', 'flow', lang, { customs_office, flow_type: flow_type === 'import' ? 'imported' : 'exported', value: formatNumber(parseInt(value), 'en'), sumBy: sumBy === 'value' ? 'livres tournois' : 'kg', product, flow_direction: flow_type === 'import' ? 'from' : 'to', partner }),
            }
          }}
          steps={[
            {
              field: "customs_office",
              labels: translate('viz-principale-partie-2', 'customs_office', lang),
              filters: [{key: 'flow_type', value: 'export'}],
              name: lang === 'fr' ? 'bureau' : 'office'
            },
            {
              field: "product",
              labels: translate('viz-principale-partie-2', 'product', lang),
              filters: [{key: 'flow_type', value: 'export'}],
              name: lang === 'fr' ? 'produit' : 'product'
            },
            {
              field: "partner",
              labels: translate('viz-principale-partie-2', 'partner', lang),
              filters: [{key: 'flow_type', value: 'export'}],
              name: lang === 'fr' ? 'partenaire' : 'partner'
            },
            {
              field: "partner",
              labels: translate('viz-principale-partie-2', 'partner', lang),
              filters: [{key: 'flow_type', value: 'import'}],
              name: lang === 'fr' ? 'partenaire' : 'partner'
            },
            {
              field: "product",
              labels: translate('viz-principale-partie-2', 'product', lang),
              filters: [{key: 'flow_type', value: 'import'}],
              name: lang === 'fr' ? 'produit' : 'product'
            },
            {
              field: "customs_office",
              labels: translate('viz-principale-partie-2', 'customs_office', lang),
              filters: [{key: 'flow_type', value: 'import'}],
              name: lang === 'fr' ? 'bureau' : 'office'
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
        data={datasets['part_2_navigo_viz_data/part_2_navigo_viz_data.csv']}
        minified={!atlasMode && highlight !== 'navigo'}
        globalWidth={atlasMode ? window.innerWidth * .5 : width}
        bureaux={bureaux}
        navigoAgregation={navigoAgregation}
        minTonnage={minTonnage}
        maxTonnage={maxTonnage}
        title={navigoTitles}
        lang={lang}
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