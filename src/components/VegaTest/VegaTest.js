import React, {useState, useEffect} from 'react';
import {VegaLite} from 'react-vega';
import {csvParse} from 'd3-dsv';
import get from 'axios';

const VegaTest = ({
  filename,
  spec
}) => {
    // useState renvoie un state et un seter qui permet de le modifier
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const test = 'michel' ?? 'foo bar';

  const URL = `${process.env.PUBLIC_URL}/data/${filename}`;

  useEffect(() => {
    // aller chercher les données (get : lancement de la promesse se lance de suite : synchrone, then et catch plus tard)
    get(URL)
    .then(({data: csvString}) => {
      // les convertir en js (avec d3-dsv)
      const newData = csvParse(csvString);
      // vega prend qqch comme ça : [{prop1: 'val', pro2: 'val2'}]
      setData(newData);
      setLoading(false);
    })
    .catch((err) => {
      setLoading(false);
    })
  }, [filename])
  

  if (loading) {
    return (
      <div>Chargement des données ({URL}) ...</div>
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

export default VegaTest;
