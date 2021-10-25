import { useEffect, useState } from "react";
import { csvParse } from 'd3-dsv';
import get from 'axios';

/**
 * Fetches data and provides it to children (used for tests)
 * @param {string} data
 * @param {function} children
 * @returns {React.ReactElement} - React component
 */
const DataProvider = ({
  data: dataFilename,
  children
}) => {
  // raw marker data
  const [data, setData] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  /**
   * Marker data loading
   */
  useEffect(() => {
    if (dataFilename) {
      const dataURL = `${process.env.PUBLIC_URL}/data/${dataFilename}`;
      get(dataURL)
        .then(({ data: str }) => {
          const extension = dataFilename.split('.').pop();
          let newData;
          if (extension === 'csv') {
            newData = csvParse(str);
          } else if (extension === 'geojson' || extension === 'json') {
            newData = str;
          }

          setData(newData);
          setLoadingData(false);
        })
        .catch((err) => {
          setLoadingData(false);
        })
    }

  }, [dataFilename])
  return loadingData ? <div>Loading</div> : children(data)
}

export default DataProvider;