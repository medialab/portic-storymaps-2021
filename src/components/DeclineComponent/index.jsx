import axios from "axios";
import { csvParse } from "d3-dsv";
import { flatMap, groupBy, sumBy, toPairs } from "lodash";
import { useEffect, useState } from "react";
import { getToflitFlowsByCsv } from "../../helpers/misc";
import Loader from "../Loader";
import LongitudinalTradeChart from "./LongitudinalTradeChart";




const DeclineComponent = (props) => {
    const {exportImport, show} = props;
    const [data , setData] = useState([]);
    const [loadingLR, setLoadingLR] = useState(true);
    const [error, setError] = useState(null);
     
    useEffect(() => {
        axios.get(`${process.env.PUBLIC_URL}/data/decline_longitudinal_data.csv`).then(response => {
            const data = csvParse(response.data);
              setData(data);
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
        <div>France</div>
        <LongitudinalTradeChart width="1800" height="200" data={data.filter(d => d.region === "France")} absoluteField="Exports"/>
        
        <div>Bordeaux</div>
        <LongitudinalTradeChart width="1800" height="200" data={data.filter(d => d.region === "Bordeaux")} absoluteField="Exports" shareField="Exports_share" herfindhalField="product_revolutionempire_exports_herfindahl"/>
        
        <div>La Rochelle</div>
        <LongitudinalTradeChart width="1800" height="200" data={data.filter(d => d.region === "La Rochelle")} absoluteField="Exports" shareField="Exports_share" herfindhalField="product_revolutionempire_exports_herfindahl"/>
        <div>{loadingLR && <Loader message="Chargement des données de La Rochelle"/>}</div>
    </div>}
    </>
}

export default DeclineComponent;