/* eslint react-hooks/exhaustive-deps : 0 */
import { useEffect, useMemo, useState } from 'react';
import { scaleLinear } from 'd3-scale';
import _, { maxBy, uniqBy, sumBy, values } from 'lodash';
import cx from 'classnames';

import SliderRange from '../../components/SliderRange';
import RadarPlot from '../../components/RadarPlot';

/**
 * Prepares radar data
 * @author Géraldine Geoffroy
 * @param {array} datas 
 * @returns {array}
 */
const prepareTravelData = datas => {
  return _(datas)
    .groupBy('destination_radar')
    .map((dest, id) => {
      var rObj = {};
      rObj[id] = dest.length;
      return rObj;
    })
    .value();
};

/**
 * Prepares radar data
 * @author Géraldine Geoffroy
 * @param {array} datas 
 * @returns {array}
 */
const prepareTonnageData = (datas) => {
  return _(datas)
    .groupBy("destination_radar")
    .map((dest, id) => {
      var rObj = {};
      rObj[id] = sumBy(dest, "tonnage");
      return rObj;
    })
    .value();
};


/**
 * Normalizes radar values so that they get comparable
 * @author Géraldine Geoffroy
 * @param {array} datas 
 * @param {object} destCaptions 
 * @returns {array}
 */
const normalizeRadarValues = (datas, destCaptions) => {
  // mapping on max value
  const maxValue = maxBy(values(datas), function (o) {
    return o;
  });
  // if mapping on sum rather than max
  // const maxValue = sum(values(datas))
  var x = scaleLinear()
    .domain([0, maxValue])
    .range([0, 1]);
  for (var key in datas) {
    if (datas.hasOwnProperty(key)) {
      datas[key] = x(datas[key]);
    }
  }
  for (var dkey in destCaptions) {
    if (!datas.hasOwnProperty(dkey)) {
      datas[dkey] = 0
    }
  }

  return datas;
};

/**
 * Wraps radar vis by controlling interactions and interpreting writers-level instructions
 * @param {array} data
 * @param {number} globalWidth
 * @param {boolean} minified
 * @param {string} title
 * @param {string} bureaux
 * @param {string} navigoAgregation
 * @param {number} minTonnage
 * @param {number} maxTonnage
 * @param {array} axis
 * @param {object} colorPalette
 * @returns {React.ReactElement} - React component
 */
const RadarWrapper = ({
  data: inputData,
  globalWidth = 500,
  minified,
  title,
  bureaux = "tous",
  navigoAgregation = "tonnage",
  minTonnage,
  maxTonnage,
  axis = [],
  colorPalette
}) => {
  const [selectedBureaux, setSelectedBureaux] = useState(new Set(['Tous les bureaux']));
  const [aggregationMethod, setAggregationMethod] = useState('tonnage');
  const [tonnageFilterValues, setTonnageFilterValues] = useState([]);
  const [datasetMaximumTonnage, setDatasetMaximumTonnage] = useState();
  const datasetMinimumTonnage = 0;

  /**
   * DATA UPDATE
   */
  const data = useMemo(() => {
    if (inputData) {
      const newData = inputData.map(d => {
        // remove csv empty values
        if ((d.destination_radar !== '') & (d.ferme_bureau !== '')) {
          return {
            ferme_bureau: d.ferme_bureau,
            destination_radar: d.destination_radar.replace(/['"]+/g, ''),
            tonnage: +d.tonnage
          };
        }
        return undefined;
      })
        .filter(d => d)
      // setDestCaptions(Object.assign({}, ...prepareDestCaptions(newData)))
      let max = maxBy(newData, 'tonnage').tonnage;
      setDatasetMaximumTonnage(max);
      if (maxTonnage) {
        max = +maxTonnage;
      }
      let min = datasetMinimumTonnage;
      if (minTonnage) {
        min = +minTonnage;
      }
      setTonnageFilterValues([min, max]);
      return newData;
    }
    return inputData;
  }, [inputData])

  const bureauxList = useMemo(() => {
    return [
      'Tous les bureaux',
      ...uniqBy(data, 'ferme_bureau').map(({ ferme_bureau }) => ferme_bureau)
    ]
  }, [data])

  const filteredData = useMemo(() => {
    const bureauxToKeep = Array.from(selectedBureaux);
    return data
      .filter(datum => {
        if (bureauxToKeep.includes('Tous les bureaux')) {
          return true;
        }
        return bureauxToKeep.includes(datum.ferme_bureau)
      })
      .filter(datum => {
        if (aggregationMethod === 'tonnage' && tonnageFilterValues && tonnageFilterValues.length) {
          return datum.tonnage >= tonnageFilterValues[0]
            && datum.tonnage <= tonnageFilterValues[1]
        }
        return true;
      })
  }, [data, selectedBureaux, tonnageFilterValues])

  /**
   * UPDATE FROM PROPS
   */
  /** update from navigoAgregation prop */
  useEffect(() => {
    setAggregationMethod(navigoAgregation);
  }, [navigoAgregation])

  /** update from bureaux prop */
  useEffect(() => {
    if (bureaux) {
      const cleanBureaux = (bureaux).split(',')
      .map(b => b.trim())
      .map(b => b === 'tous' ? 'Tous les bureaux' : b)
    setSelectedBureaux(new Set(cleanBureaux));
    }
    
  }, [bureaux])

  /** update from maxTonnage prop */
  useEffect(() => {
    if (maxTonnage) {
      if (tonnageFilterValues && tonnageFilterValues.length) {
        setTonnageFilterValues([tonnageFilterValues[0], +maxTonnage]);
      } else {
        setTonnageFilterValues([0, +maxTonnage]);
      }
    }
  }, [maxTonnage])

  /** update from minTonnage prop */
  useEffect(() => {
    if (minTonnage) {
      if (tonnageFilterValues && tonnageFilterValues.length) {
        setTonnageFilterValues([+minTonnage, tonnageFilterValues[1]]);
      } else {
        const max = maxBy(data, 'tonnage').tonnage;
        setTonnageFilterValues([+minTonnage, max]);
      }
    }
  }, [minTonnage])


  const radarData = useMemo(() => {
    const bureauxObjects = Array.from(selectedBureaux);

    return bureauxObjects.map((bureauName) => {
      const relevantData = bureauName === 'Tous les bureaux' ? filteredData :
        filteredData.filter(datum => datum.ferme_bureau === bureauName);
      const preparedData = aggregationMethod === 'tonnage' ? prepareTonnageData(relevantData) : prepareTravelData(relevantData);
      return {
        data: normalizeRadarValues
          (Object.assign({}, ...preparedData)
          ),
        meta: {
          color: colorPalette[bureauName],
          name: bureauName
        }
      }
    })
  }, [selectedBureaux, tonnageFilterValues, aggregationMethod]);

  if (!data || !radarData) {
    return null;
  }
  return (
    <div className={cx("RadarWrapper", { 'is-minified': minified })}>

      <h5 className="visualization-title">{title}</h5>
      <RadarPlot
        data={radarData.reverse()}
        size={minified ? globalWidth * .4 : globalWidth * .7}
        axis={axis}
      />
      <div
        className={cx("controls-container", { 'is-minified': minified })}
      >
        <div className="controls-contents">
          <strong>{filteredData.length}</strong> voyages agrégés par <span className="aggregation-controls-container">

            <select value={aggregationMethod} onChange={e => setAggregationMethod(e.target.value)}>
              <option
                key={'tonnage'}
                id={'tonnage'}
                value={'tonnage'}
              >tonnage{aggregationMethod === 'tonnage' ? ` (navires de ${tonnageFilterValues[0]} à ${tonnageFilterValues[1]} tonneaux)` : ''}</option>
              <option
                key={'voyages'}
                id={'voyages'}
                value={'voyages'}
              >nombre de voyages</option>
            </select>
            {
              aggregationMethod && aggregationMethod === 'tonnage' &&
              <span className="slider-container">
                <SliderRange
                  min={datasetMinimumTonnage}
                  max={datasetMaximumTonnage}
                  value={tonnageFilterValues}
                  onChange={value => [setTonnageFilterValues(value)]}
                />
              </span>
            }
          </span>
          <p>
            Ports de départ agrégés par bureau des Fermes&nbsp;:
          </p>
          <ul className="bureaux-list">
            {
              bureauxList.map((bureau, index) => {
                const handleClick = () => {
                  const newSelectedBureaux = new Set(selectedBureaux);
                  if (selectedBureaux.has(bureau) && Array.from(selectedBureaux).length > 1) {
                    newSelectedBureaux.delete(bureau);
                  } else {
                    newSelectedBureaux.add(bureau);
                  }
                  setSelectedBureaux(newSelectedBureaux);
                }
                return (
                  <li
                    key={index}
                    onClick={handleClick}
                    className={cx("bureau-item", { 'is-active': selectedBureaux.has(bureau) })}
                  >
                    <span
                      className="color-marker"
                      style={{ background: colorPalette[bureau] }}
                    />
                    <span className="bureau-label">
                      {bureau === 'Tous les bureaux' ? 'Ensemble des ports' : bureau}
                    </span>
                  </li>
                )
              })
            }
          </ul>
        </div>
      </div>
    </div>
  )
}

export default RadarWrapper;