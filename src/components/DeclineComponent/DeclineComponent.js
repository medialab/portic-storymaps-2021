import cx from 'classnames';
import LongitudinalTradeChart from "./LongitudinalTradeChart";
import ProductsDistributionChart from './ProductsDistributionChart';

import './DeclineComponent.scss';

const DeclineComponent = (props) => {
  const {
    width, 
    height, 
    lang = 'fr',
    startYear = 1720,
    endYear = 1789,
    productTradePartThreshold = 0.9,
    rows,
    datasets = {},
  } = props;
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
      fr: (cityName, start, end) => `Comparaison des parts des produits exportés par la direction des fermes de ${cityName} totalisant plus de 90% du commerce en ${end}, en ${start} et en ${end}`,
      en: (cityName, start, end) => `Comparison of shares of the top 90% of exported products by the direction des fermes of ${cityName} in ${start}, in ${start} and in ${end}`,
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
      en: () => `fewly diverse trade`,
    },
    herfindal1: {
      fr: () => `commerce très diversifié`,
      en: () => `very diverse trade`,
    },
    barTooltip: {
      fr: (year, pct, city, herfindal) => `En <strong>${year}</strong>, ${pct}% des biens exportés depuis la France le sont à partir de <strong>${city}</strong>.<br/><br/>Concentration du commerce <i>(indice Herfindahl-Hirschmann : somme du carré des parts du marché français par classe de produits exportés)</i> : <span>[colorBox] ${herfindal}</span>`,
      en: (year, pct, city, herfindal) => `En <strong>${year}</strong>, ${pct}% des biens exportés depuis la France le sont à partir de <strong>${city}</strong>.<br/><br/>Indice de herfindal () : <span>[colorBox] ${herfindal}</span>`,
    },
    productTooltip: {
      fr: (year, product, pct) => `En <strong>${year}</strong>, les produits de la classe "${product}" représentaient <strong>${pct}%</strong> de la valeur des biens exportés par la direction des fermes de La Rochelle.`,
      en: (year, product, pct) => `En <strong>${year}</strong>, les produits de type "${product}" représentaient ${pct}% des biens exportés par La Rochelle`,
    },
    sevenYearsWar: {
      fr: () => 'guerre de sept ans',
      en: () => 'seven years war'
    }
  }
  const margins = { top: 10, right: 50, bottom: 30, left: 50 };

  const totalRows = Object.entries(rows).reduce((sum, [id, count]) => sum + count, 0)
  const renderRow = (row, rowFlex, rowIndex) => {
    switch(row) {
      case 'France':
        if (!datasets['decline_longitudinal_data.csv']) {
          return null;
        }
        return (
          <LongitudinalTradeChart
            width={width}
            height={height/totalRows * rowFlex}
            data={datasets['decline_longitudinal_data.csv'].filter((d) => d.region === "France")}
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
              }
            ]}
            fillGaps
            {
              ...{
                startYear,
                endYear
              }
            }
          />
        )
      case 'La Rochelle':
        if (!datasets['decline_longitudinal_data.csv']) {
          return null;
        }
        return (
          <LongitudinalTradeChart
            width={width}
            height={height/totalRows * rowFlex}
            data={datasets['decline_longitudinal_data.csv'].filter((d) => d.region === "La Rochelle")}
            absoluteField="Exports"
            shareField="Exports_share"
            herfindhalField="product_revolutionempire_exports_herfindahl"
            title={messages.tradeEvolutionTitle[lang]('La Rochelle', startYear, endYear)}
            axisLeftTitle={messages.partInPct[lang]()}
            axisRightTitle={messages.absoluteValue[lang]()}
            margins={margins}
            barTooltipFn={messages.barTooltip[lang]}
            cityName="La Rochelle"
            annotations={[
              {
                type: 'span',
                startYear: 1756,
                endYear: 1763,
                label: messages.sevenYearsWar[lang]()
              }
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
        if (!datasets['decline_longitudinal_data.csv']) {
          return null;
        }
        return (
          <LongitudinalTradeChart
            width={width}
            height={height/totalRows * rowFlex}
            data={datasets['decline_longitudinal_data.csv'].filter((d) => d.region === "Bordeaux")}
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
                label: messages.sevenYearsWar[lang]()
              }
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
        if (!datasets[`decline_LR_products.csv`] || !datasets['decline_longitudinal_data.csv']) {
          return null;
        }
        return (
          <ProductsDistributionChart
            data={datasets[`decline_LR_products.csv`]}
            tradeData={datasets['decline_longitudinal_data.csv']}
            field="Exports"
            key={rowIndex}
            partTreshold={productTradePartThreshold}
            height={height/totalRows * rowFlex}
            barWidth={width * 0.02}
            years={[startYear, endYear]}
            margins={margins}
            herfindhalField="product_revolutionempire_exports_herfindahl"
            title={messages.top90PctTitle[lang]('La Rochelle', startYear, endYear)}
            productTooltipFn={messages.productTooltip[lang]}
            width={width}
          />
        )
      default:
        return <div>{row}</div>
    }
  }
  return (
    <div className="DeclineComponent">
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

export default DeclineComponent;
