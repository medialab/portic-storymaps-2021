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
      fr: () => `Évolution de la valeur absolue cumulée des exports du royaume de France`,
      en: () => `Evolution of the absolute cumulated value of exports from the kingdom of France`
    },
    tradeEvolutionTitle: {
      fr: (cityName, start, end) => `Évolution du commerce de ${cityName} de ${start} à ${end}`,
      en: (cityName, start, end) => `Evolution of ${cityName} trade from ${start} to ${end}`
    },
    top90PctTitle: {
      fr: (cityName, start, end) => `Comparaison des produits exportés par ${cityName} totalisant plus de 90% du commerce en ${start} et en ${end}`,
      en: (cityName, start, end) => `Comparison of the top 90% of exported products by ${cityName} in ${start} and in ${end}`,
    },
    partInPct: {
      fr: () => 'part en %',
      en: () => 'part in %'
    },
    absoluteValue: {
      fr: () => 'valeur absolue',
      en: () => 'absolute value'
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
      fr: (year, pct, city, herfindal) => `En <strong>${year}</strong>, ${pct}% des biens exportés depuis la France le sont à partir de <strong>${city}</strong>.<br/><br/>Indice de herfindal (concentration) : <span>[colorBox] ${herfindal}</span>`,
      en: (year, pct, city, herfindal) => `En <strong>${year}</strong>, ${pct}% des biens exportés depuis la France le sont à partir de <strong>${city}</strong>.<br/><br/>Indice de herfindal (diversité) : <span>[colorBox] ${herfindal}</span>`,
    },
  }
  const margins = { top: 20, right: 50, bottom: 30, left: 50 };

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
            title={messages.franceOverviewTitle[lang]()}
            axisLeftTitle={''}
            axisRightTitle={messages.absoluteValue[lang]()}
            margins={margins}
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
            barWidth={10}
            years={[startYear, endYear]}
            margins={margins}
            herfindhalField="product_revolutionempire_exports_herfindahl"
            title={messages.top90PctTitle[lang]('La Rochelle', startYear, endYear)}
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
