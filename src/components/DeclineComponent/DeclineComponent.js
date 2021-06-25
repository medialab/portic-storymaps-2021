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
      fr: () => 'Part en %',
      en: () => 'Part in %'
    },
    absoluteValue: {
      fr: () => 'Valeur absolue',
      en: () => 'Absolute value'
    },
    herfindalLegendTitle: {
      fr: () => `Degré de diversité du commerce (inverse de l’indice de Herfindahl)`,
      en: () => `Degree of trade diversity (inverse of the Herfindahl index)`,
    },
    herfindal0: {
      fr: () => `0 (commerce peu diversifié)`,
      en: () => `0 (fewly diverse trade)`,
    },
    herfindal1: {
      fr: () => `1 (commerce très diversifié)`,
      en: () => `1 (very diverse trade)`,
    },

  }

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
