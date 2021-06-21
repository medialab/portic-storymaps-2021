import axios from "axios";
import { csvParse } from "d3-dsv";
import { useEffect, useState } from "react";
import cx from 'classnames';
import Loader from "../Loader/Loader";
import LongitudinalTradeChart from "./LongitudinalTradeChart";

import './DeclineComponent.scss';

// import { ProductsDistributionChart } from "./ProductsDistributionChart";

const DeclineComponent = (props) => {
  const {
    width, 
    height, 
    step = 1,
    lang = 'fr',
    startYear = 1720,
    endYear = 1789,
  } = props;
  const [longitudinalData, setLongitudinalData] = useState([]);
  const [productsData, setProductsData] = useState([]);
  const [loadingLR, setLoadingLR] = useState(true);
  const [error, setError] = useState(null);

  // @todo refactor by using the 'datasets' prop if avilable (finally we collect all datasets upstream)
  useEffect(() => {
    setLoadingLR(true);
    axios
      .get(`${process.env.PUBLIC_URL}/data/decline_longitudinal_data.csv`)
      .then((response) => {
        const data = csvParse(response.data);
        setLongitudinalData(data);
        setLoadingLR(false);
      })
      .catch((err) => {
        setLoadingLR(false);
        setError(err.toString());
      });
    axios
      .get(`${process.env.PUBLIC_URL}/data/decline_LR_products.csv`)
      .then((response) => {
        const data = csvParse(response.data);
        setProductsData(data);
        setLoadingLR(false);
      })
      .catch((err) => {
        setLoadingLR(false);
        setError(err.toString());
      });
  }, []);

  const thirdHeight = height/3 - 20;
  const halfHeight = height/2 - 20;

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
  return (
    <>
      {error ? (
        <div>{error}</div>
      ) : (
        <div className="DeclineComponent">
          <div>
            {loadingLR && (
              <Loader message="Chargement des données de La Rochelle" />
            )}
          </div>
          <div className={cx("viz-1-step", {'is-visible': step === 1})}>
            <h2>
              {messages.franceOverviewTitle[lang]()}
            </h2>
            <LongitudinalTradeChart
              width={width}
              height={step < 3 ? thirdHeight : halfHeight}
              data={longitudinalData.filter((d) => d.region === "France")}
              absoluteField="Exports"
            />
          </div>

          <div className={cx("viz-1-step", {'is-visible': step < 3})}>
            <h2>{messages.tradeEvolutionTitle[lang]('Bordeaux', startYear, endYear)}</h2>
            <LongitudinalTradeChart
              width={width}
              height={step < 2 ? thirdHeight : halfHeight}
              data={longitudinalData.filter((d) => d.region === "Bordeaux")}
              absoluteField="Exports"
              shareField="Exports_share"
              herfindhalField="product_revolutionempire_exports_herfindahl"
            />
          </div>
          <div className={cx("viz-1-step", {'is-visible': true})}>
          <h2>{messages.tradeEvolutionTitle[lang]('La Rochelle', startYear, endYear)}</h2>
            <LongitudinalTradeChart
              width={width}
              height={step < 2 ? thirdHeight : halfHeight}
              productsHeight={halfHeight - 20}
              data={longitudinalData.filter((d) => d.region === "La Rochelle")}
              productsData={productsData}
              absoluteField="Exports"
              shareField="Exports_share"
              herfindhalField="product_revolutionempire_exports_herfindahl"
              showProducts={step >= 3}
              messages={messages}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default DeclineComponent;
