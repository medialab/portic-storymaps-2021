import axios from "axios";
import { csvParse } from "d3-dsv";
import { useEffect, useState } from "react";
import Loader from "../Loader";
import LongitudinalTradeChart from "./LongitudinalTradeChart";

// TODO: make width a props and/or update on resize like here: https://gitlab.com/ouestware/cujas-hoppe/-/blob/devel/client/src/components/with-size.tsx
const DeclineComponent = (props) => {
  const [longitudinalData, setLongitudinalData] = useState([]);
  const [productsData, setProductsData] = useState([]);
  const [loadingLR, setLoadingLR] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <>
      {error ? (
        <div>{error}</div>
      ) : (
        <div>
          <div>
            {loadingLR && (
              <Loader message="Chargement des données de La Rochelle" />
            )}
          </div>
          <div>France</div>
          <LongitudinalTradeChart
            width="1800"
            height="200"
            data={longitudinalData.filter((d) => d.region === "France")}
            absoluteField="Exports"
          />

          <div>Bordeaux</div>
          <LongitudinalTradeChart
            width="1800"
            height="200"
            data={longitudinalData.filter((d) => d.region === "Bordeaux")}
            absoluteField="Exports"
            shareField="Exports_share"
            herfindhalField="product_revolutionempire_exports_herfindahl"
          />

          <div>La Rochelle</div>
          <LongitudinalTradeChart
            width="1800"
            height="200"
            data={longitudinalData.filter((d) => d.region === "La Rochelle")}
            productsData={productsData}
            absoluteField="Exports"
            shareField="Exports_share"
            herfindhalField="product_revolutionempire_exports_herfindahl"
          />
        </div>
      )}
    </>
  );
};

export default DeclineComponent;
