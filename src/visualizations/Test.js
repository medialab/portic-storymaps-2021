const Test = ({
  datasets = {}
}) => {
  return(
    <div className="Test">
      <div>Ceci est un appel pour une visualisation qui n'a pas encore été développée</div>
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