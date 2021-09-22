import cx from 'classnames';
import LongitudinalTradeChart from "./LongitudinalTradeChart";
import ProductsDistributionChart from './ProductsDistributionChart';

import './DeclineChart.scss';
import { fixSvgDimension } from '../../helpers/misc';

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
    franceOverviewTitle: {
      fr: (start, end) => `Évolution de la valeur des exports du royaume de France de ${start} à ${end}`,
      en: (start, end) => `Evolution of the value of exports from the kingdom of France from ${start} to ${end}`
    },
    tradeEvolutionTitle: {
      fr: (cityName, start, end) => `Évolution du commerce de la direction des fermes de ${cityName} de ${start} à ${end}`,
      en: (cityName, start, end) => `Evolution of the direction des fermes of ${cityName} trade from ${start} to ${end}`
    },
    top90PctTitle: {
      fr: (cityName, start, end) => `Comparaison des parts des produits exportés par la direction des fermes de ${cityName} totalisant plus de 90% du commerce en ${start} et en ${end} (ports francs non pris en compte)`,
      en: (cityName, start, end) => `Comparison of shares of the top 90% of exported products by the direction des fermes of ${cityName} in ${start} and in ${end} (ports francs non pris en compte)`,
    },
    partInPct: {
      fr: () => 'part des exports fr.',
      en: () => 'share of french exports'
    },
    absoluteValue: {
      fr: () => 'valeur absolue des exports',
      en: () => 'exports\' absolute value'
    },
    herfindalLegendTitle: {
      // fr: () => `Degré de diversité du commerce (inverse de l’indice de Herfindahl)`,
      // en: () => `Degree of trade diversity (inverse of the Herfindahl index)`,
      fr: () => `degré de diversité du commerce`,
      en: () => `degree of trade diversity`,
    },
    herfindal0: {
      fr: () => `commerce peu diversifié`,
      en: () => `fewly diversified trade`,
    },
    herfindal1: {
      fr: () => `commerce très diversifié`,
      en: () => `very diversified trade`,
    },
    barTooltip: {
      fr: (year, pct, city, herfindal) => `En <strong>${year}</strong>, ${pct}% des biens exportés depuis la France le sont à partir de <strong>${city}</strong>.<br/><br/>Concentration du commerce <i>(indice de Herfindahl-Hirschmann : somme du carré des parts du marché français par classe de produits exportés)</i> : <span>[colorBox] ${herfindal}</span>`,
      en: (year, pct, city, herfindal) => `In <strong>${year}</strong>, ${pct}% of exported goods from France are exported <strong>${city}</strong>.<br/><br/>Trade concentration <i>(Herfindahl-Hirschmann index : sum of square french market' shares sorted by exported products classes)</i> : <span>[colorBox] ${herfindal}</span>`,
    },
    productTooltip: {
      fr: (year, product, pct) => `En <strong>${year}</strong>, les produits de la classe "${product}" représentent <strong>${pct}%</strong> de la valeur des biens exportés par la direction des fermes de La Rochelle.`,
      en: (year, product, pct) => `In <strong>${year}</strong>, products classed as "${product}" represent ${pct}% of goods exported by La Rochelle's direction des fermes.`,
    },
    sevenYearsWar: {
      fr: () => 'guerre de sept ans',
      en: () => 'seven years war'
    },
    austriaWar: {
      fr: () => 'guerre franco-britannique au sein de la guerre de succession d’Autriche',
      en: () => 'guerre franco-britannique au sein de la guerre de succession d’Autriche',
    },
    usIndependance: {
      fr: () => 'guerre d’indépendance Américaine',
      en: () => 'guerre d’indépendance Américaine',
    },
    laRochelleDiaspora: {
      fr: () => 'Organisation de convois partant de La Rochelle pour échapper aux Anglais',
      en: () => 'Organisation de convois partant de La Rochelle pour échapper aux Anglais',
    },
    // absolute1789: {
    //   fr: item => `Total des exports en 1789 : ${(item.Exports / 1000000).toFixed(1)} m. de livres tournois`,
    //   en: item => `Total des exports en 1789 : ${(item.Exports / 1000000).toFixed(1)} m. de livres tournois`
    // }
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
            title={messages.franceOverviewTitle[lang](startYear, endYear)}
            axisLeftTitle={''}
            axisRightTitle={messages.absoluteValue[lang]()}
            margins={margins}
            annotations={[
              {
                type: 'span',
                startYear: 1756,
                endYear: 1763,
                label: messages.sevenYearsWar[lang]()
              },
              {
                type: 'span',
                startYear: 1744,
                endYear: 1748,
                row: .5,
                label: messages.austriaWar[lang]()
              },
              {
                type: 'span',
                startYear: 1778,
                endYear: 1781,
                labelPosition: 'left',
                row: 3,
                label: messages.usIndependance[lang]()
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
            title={messages.tradeEvolutionTitle[lang]('La Rochelle', startYear, endYear)}
            axisLeftTitle={messages.partInPct[lang]()}
            axisRightTitle={messages.absoluteValue[lang]()}
            margins={margins}
            barTooltipFn={messages.barTooltip[lang]}
            cityName="La Rochelle"
            highlightYears={rows.comparison > 0 ? [startYear, endYear] : undefined}
            annotations={[
              {
                type: 'span',
                startYear: 1756,
                endYear: 1763,
                label: messages.sevenYearsWar[lang]()
              },
              {
                type: 'span',
                startYear: 1744,
                endYear: 1748,
                row: 1,
                label: messages.austriaWar[lang]()
              },
              {
                type: 'span',
                startYear: 1747,
                endYear: 1747,
                row: 2,
                label: messages.laRochelleDiaspora[lang]()
              },
              {
                type: 'span',
                startYear: 1778,
                endYear: 1781,
                labelPosition: 'left',
                row: 3,
                label: messages.usIndependance[lang]()
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
              title: messages.herfindalLegendTitle[lang](),
              minimum: messages.herfindal0[lang](),
              maximum: messages.herfindal1[lang](),
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
            title={messages.tradeEvolutionTitle[lang]('Bordeaux', startYear, endYear)}
            axisLeftTitle={messages.partInPct[lang]()}
            axisRightTitle={messages.absoluteValue[lang]()}
            barTooltipFn={ messages.barTooltip[lang]}
            cityName="Bordeaux"
            annotations={[
              {
                type: 'span',
                startYear: 1756,
                endYear: 1763,
                row: 0.5,
                label: messages.sevenYearsWar[lang]()
              },
              {
                type: 'span',
                startYear: 1744,
                endYear: 1748,
                row: 0,
                label: messages.austriaWar[lang]()
              },
              {
                type: 'span',
                startYear: 1778,
                endYear: 1781,
                labelPosition: 'left',
                row: 1,
                label: messages.usIndependance[lang]()
              },
            ]}
            margins={margins}
            colorScaleMessages={{
              title: messages.herfindalLegendTitle[lang](),
              minimum: messages.herfindal0[lang](),
              maximum: messages.herfindal1[lang](),
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
            herfindhalField="product_revolutionempire_exports_herfindahl"
            title={messages.top90PctTitle[lang]('La Rochelle', atlasMode ? 1750 : startYear, atlasMode ? 1789 : endYear)}
            productTooltipFn={messages.productTooltip[lang]}
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
