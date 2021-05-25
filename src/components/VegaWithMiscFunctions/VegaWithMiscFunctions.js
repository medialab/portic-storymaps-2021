import React, {useState, useEffect} from 'react';
import {VegaLite} from 'react-vega';
import {csvParse} from 'd3-dsv';
// import get from 'axios';

const VegaWithMiscFunctions = ({
  chosen_function,
  spec
}) => {
    // useState renvoie un state et un seter qui permet de le modifier
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // const test = 'michel' ?? 'foo bar';

  // const URL = `${process.env.PUBLIC_URL}/data/${filename}`;

  useEffect(() => {
    // aller chercher les données (get : lancement de la promesse se lance de suite : synchrone, then et catch plus tard)
    chosen_function({
      year: 1789,
      customs_region: "La Rochelle",
      partner: "Quatre villes hanséatiques",
      params: ['year', 'customs_region', 'customs_office', 'partner', 'value']
  })
      .then((newData) => {
          setData(newData);
          setLoading(false);
          console.log("data caguht by VegaComponent : ", newData)
      })
      .catch((err) => {
          setLoading(false);
      })
}, [chosen_function]) // est ce qu'on a des valeurs qui quand elles changent demanderaient de relancer la fonction asynchrone ?  si oui les mettre dans ce tableau 
// a terme, si on inclut params de requete de donnée dans cette fonction (mais je ne pense pas que ce soit une bonne idée), si params changent, on relance la fonction

  if (loading) {
    return (
      <div>Chargement des données (avec {chosen_function}) ...</div>
    )
  } else if (!data) {
    return (
    <div>Erreur ...</div>
    )
  }
  return (
      <div>
        <VegaLite
          spec={{
            ...spec,
            "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
            "data": {
              "values": data
            }
          }}
        />
        {/* <pre>
          <code>
            {JSON.stringify(data, null, 2)}
          </code>
        </pre> */}
      </div>
  )
}

export default VegaWithMiscFunctions;
