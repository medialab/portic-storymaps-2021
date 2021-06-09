

const Test = ({
  datasets = {}
}) => {
  return(
    <div className="Test">
      <div>Coucou, ceci est le composant de la visualisation avec l'id <code>test</code></div>
      {
        Object.keys(datasets).length ? 
        <div>
          <h3>Datasets de la visualisation :</h3>
          {
            Object.entries(datasets)
            .map(([datasetName, values]) => {
              return (
              <div key={datasetName}>
                <h3>{datasetName}</h3>
                <pre>
                  <code>
                    {
                      JSON.stringify(values, null, 2)
                    }
                  </code>
                </pre>
              </div>
              )
            })
          }
        </div>
        : null
      }
    </div>
    )
}

export default Test;