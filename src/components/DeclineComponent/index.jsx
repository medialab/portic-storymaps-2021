import axios from "axios";
import { csvParse } from "d3-dsv";
import { flatMap, groupBy, sumBy, toPairs } from "lodash";
import { useEffect, useState } from "react";
import { getToflitFlowsByCsv } from "../../helpers/misc";
import Loader from "../Loader";
import LongitudinalTradeChart from "./LongitudinalTradeChart";




const DeclineComponent = (props) => {
    const {exportImport, show} = props;
    const [LaRochelleData , setLaRochelleData] = useState([]);
    const [loadingLR, setLoadingLR] = useState(true);
    const [error, setError] = useState(null);
     
    useEffect(() => {
        axios.get(`${process.env.PUBLIC_URL}/data/decline_longitudinal_data.csv`).then(response => {
            const data = csvParse(response.data);
              const LaRochelleData = data.filter(d => d.region === "La Rochelle");
              setLaRochelleData(LaRochelleData)
              console.log("LR data", LaRochelleData);
              setLoadingLR(false)
            })
            .catch((err) => {
                setLoadingLR(false);
                setError(err.toString())
            })
    }, [])

    return <>
    {error ? 
        <div>{error}</div> :
    <div>
        <div>Bordeaux</div>
        <div>La Rochelle</div>
        <LongitudinalTradeChart width="800" height="400" data={LaRochelleData} absoluteField="Imports" shareField="Imports_share" herfindhalField="product_revolutionempire_imports_herfindahl"/>
        <div>{loadingLR && <Loader message="Chargement des données de La Rochelle"/>}</div>
    </div>}
    </>
}

export default DeclineComponent;