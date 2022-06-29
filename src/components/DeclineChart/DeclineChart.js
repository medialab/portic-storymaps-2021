import cx from 'classnames';
import LongitudinalTradeChart from "./LongitudinalTradeChart";
import ProductsDistributionChart from './ProductsDistributionChart';

import './DeclineChart.scss';
import { fixSvgDimension } from '../../helpers/misc';

import translate from '../../i18n/translate'

/**
 * Configurable wrapper for main viz #1
 * @param {number} width
 * @param {number} height
 * @param {string} lang
 * @param {number} startYear
 * @param {number} endYear
 * @param {number} productTradePartThreshold
 * @param {array<string>} rows - list of visualization rows to display at a certain time
 * @param {datasets} object
 * @param {boolean} atlasMode
 * @returns {React.ReactElement} - React component
 */
const DeclineChart = (props) => {
  const {
    width: inputWidth, 
    height: containerHeight, 
    lang = 'fr',
    startYear = 1720,
    endYear = 1789,
    productTradePartThreshold = 0.9,
    rows,
    datasets = {},
    atlasMode
  } = props;
  const height = atlasMode ? 1200 : fixSvgDimension(containerHeight);
  const width = fixSvgDimension(inputWidth);
  const messages = {
    franceOverviewTitle: (start, end) => translate('viz-principale-partie-1', 'franceOverviewTitle', lang, { start: start, end: end }),
    tradeEvolutionTitle: (cityName, start, end) => translate('viz-principale-partie-1', 'tradeEvolutionTitle', lang, { cityName: cityName, start: start, end: end }),
    top90PctTitle: (cityName, start, end) => translate('viz-principale-partie-1', 'top90PctTitle', lang, { cityName: cityName, start: start, end: end }),
    partInPct: () => translate('viz-principale-partie-1', 'partInPct', lang),
    absoluteValue: () => translate('viz-principale-partie-1', 'absoluteValue', lang),
    herfindalLegendTitle: () => translate('viz-principale-partie-1', 'herfindalLegendTitle', lang),
    herfindal0: () => translate('viz-principale-partie-1', 'herfindal0', lang),
    herfindal1: () => translate('viz-principale-partie-1', 'herfindal1', lang),
    barTooltip: (year, pct, city, herfindal) => translate('viz-principale-partie-1', 'barTooltip', lang, { year: year, pct: pct, city: city, herfindal: herfindal }),
    productTooltip: (year, product, pct) => translate('viz-principale-partie-1', 'productTooltip', lang, { year: year, product: product, pct: pct }),
    sevenYearsWar: (year, product, pct) => translate('viz-principale-partie-1', 'sevenYearsWar', lang, { year: year, product: product, pct: pct }),
    austriaWar: () => translate('viz-principale-partie-1', 'austriaWar', lang),
    usIndependance: () => translate('viz-principale-partie-1', 'usIndependance', lang),
    laRochelleDiaspora: () => translate('viz-principale-partie-1', 'laRochelleDiaspora', lang)
  }
  const margins = { top: 10, right: 50, bottom: 30, left: 50 };

  const totalRows = Object.entries(rows).reduce((sum, [id, count]) => sum + count, 0)
  const renderRow = (row, rowFlex, rowIndex) => {
    switch(row) {
      case 'France':
        if (!datasets['decline_longitudinal_data/decline_longitudinal_data.csv']) {
          return null;
        }
        return (
          <LongitudinalTradeChart
            width={width}
            height={fixSvgDimension(height/totalRows * rowFlex)}
            data={datasets['decline_longitudinal_data/decline_longitudinal_data.csv'].filter((d) => d.region === "France")}
            absoluteField="Exports"
            title={messages.franceOverviewTitle(startYear, endYear)}
            axisLeftTitle={''}
            axisRightTitle={messages.absoluteValue()}
            margins={margins}
            annotations={[
              {
                type: 'span',
                startYear: 1756,
                endYear: 1763,
                label: messages.sevenYearsWar()
              },
              {
                type: 'span',
                startYear: 1744,
                endYear: 1748,
                row: .5,
                label: messages.austriaWar()
              },
              {
                type: 'span',
                startYear: 1778,
                endYear: 1781,
                labelPosition: 'left',
                row: 3,
                label: messages.usIndependance()
              },

              
            ]}
            // fillGaps
            {
              ...{
                startYear,
                endYear
              }
            }
          />
        )
      case 'La Rochelle':
        if (!datasets['decline_longitudinal_data/decline_longitudinal_data.csv']) {
          return null;
        }
        return (
          <LongitudinalTradeChart
            width={width}
            height={fixSvgDimension(height/totalRows * rowFlex)}
            data={datasets['decline_longitudinal_data/decline_longitudinal_data.csv'].filter((d) => d.region === "La Rochelle")}
            absoluteField="Exports"
            shareField="Exports_share"
            herfindhalField="product_revolutionempire_exports_herfindahl"
            title={messages.tradeEvolutionTitle('La Rochelle', startYear, endYear)}
            axisLeftTitle={messages.partInPct()}
            axisRightTitle={messages.absoluteValue()}
            margins={margins}
            barTooltipFn={messages.barTooltip}
            cityName="La Rochelle"
            highlightYears={rows.comparison > 0 ? [startYear, endYear] : undefined}
            annotations={[
              {
                type: 'span',
                startYear: 1756,
                endYear: 1763,
                label: messages.sevenYearsWar()
              },
              {
                type: 'span',
                startYear: 1744,
                endYear: 1748,
                row: 1,
                label: messages.austriaWar()
              },
              {
                type: 'span',
                startYear: 1747,
                endYear: 1747,
                row: 2,
                label: messages.laRochelleDiaspora()
              },
              {
                type: 'span',
                startYear: 1778,
                endYear: 1781,
                labelPosition: 'left',
                row: 3,
                label: messages.usIndependance()
              },
              // {
              //   type: 'span',
              //   startYear: 1789,
              //   endYear: 1789,
              //   row: 4,
              //   labelPosition: 'left',
              //   label: messages.absolute1789[lang](datasets['decline_longitudinal_data.csv'].find((d) => d.region === "La Rochelle" && d.year === "1789"))
              // },
            ]}
            colorScaleMessages={{
              title: messages.herfindalLegendTitle(),
              minimum: messages.herfindal0(),
              maximum: messages.herfindal1(),
            }}
            {
              ...{
                startYear,
                endYear
              }
            }
          />
        )
      case 'Bordeaux':
        if (!datasets['decline_longitudinal_data/decline_longitudinal_data.csv']) {
          return null;
        }
        return (
          <LongitudinalTradeChart
            width={width}
            height={fixSvgDimension(height/totalRows * rowFlex)}
            data={datasets['decline_longitudinal_data/decline_longitudinal_data.csv'].filter((d) => d.region === "Bordeaux")}
            absoluteField="Exports"
            shareField="Exports_share"
            herfindhalField="product_revolutionempire_exports_herfindahl"
            title={messages.tradeEvolutionTitle('Bordeaux', startYear, endYear)}
            axisLeftTitle={messages.partInPct()}
            axisRightTitle={messages.absoluteValue()}
            barTooltipFn={ messages.barTooltip}
            cityName="Bordeaux"
            annotations={[
              {
                type: 'span',
                startYear: 1756,
                endYear: 1763,
                row: 0.5,
                label: messages.sevenYearsWar()
              },
              {
                type: 'span',
                startYear: 1744,
                endYear: 1748,
                row: 0,
                label: messages.austriaWar()
              },
              {
                type: 'span',
                startYear: 1778,
                endYear: 1781,
                labelPosition: 'left',
                row: 1,
                label: messages.usIndependance()
              },
            ]}
            margins={margins}
            colorScaleMessages={{
              title: messages.herfindalLegendTitle(),
              minimum: messages.herfindal0(),
              maximum: messages.herfindal1(),
            }}
            {
              ...{
                startYear,
                endYear
              }
            }
          />
        )
      case 'comparison':
        if (!datasets[`decline_LR_products/decline_LR_products.csv`] || !datasets['decline_longitudinal_data/decline_longitudinal_data.csv']) {
          return null;
        }
        return (
          <ProductsDistributionChart
            data={datasets[`decline_LR_products/decline_LR_products.csv`]}
            tradeData={datasets['decline_longitudinal_data/decline_longitudinal_data.csv']}
            field="Exports"
            key={rowIndex}
            partTreshold={productTradePartThreshold}
            height={fixSvgDimension(height/totalRows * rowFlex)}
            barWidth={width * 0.02}
            years={[atlasMode ? 1750 : startYear, atlasMode ? 1789 : endYear]}
            margins={margins}
            lang={lang}
            herfindhalField="product_revolutionempire_exports_herfindahl"
            title={messages.top90PctTitle('La Rochelle', atlasMode ? 1750 : startYear, atlasMode ? 1789 : endYear)}
            productTooltipFn={messages.productTooltip}
            width={width}
          />
        )
      default:
        return <div>{row}</div>
    }
  }
  return (
    <div className="DeclineChart">
      {
        Object.entries(rows).map(([rowId, rowFlex], rowIndex) => {
          return (
            <div className={cx('row', {'is-visible': rows[rowId]})}>
                {renderRow(rowId, rowFlex, rowIndex)}
            </div>
          )
        })
      }
    </div>
  )
};

export default DeclineChart;
