import axios from "axios";
import { csvParse } from "d3-dsv";
import { useEffect, useState } from "react";
import cx from 'classnames';
import Loader from "../Loader/Loader";
import LongitudinalTradeChart from "./LongitudinalTradeChart";

import './DeclineComponent.scss';
import { ProductsDistributionChart } from "./ProductsDistributionChart";

const DeclineComponent = (props) => {
  const {width, height, step = 1} = props;
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
            <div>France</div>
            <LongitudinalTradeChart
              width={width}
              height={step < 3 ? thirdHeight : halfHeight}
              data={longitudinalData.filter((d) => d.region === "France")}
              absoluteField="Exports"
            />
          </div>

          <div className={cx("viz-1-step", {'is-visible': step < 3})}>
            <div>Bordeaux</div>
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
            <div>La Rochelle</div>
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
            />
          </div>
        </div>
      )}
    </>
  );
};

export default DeclineComponent;
