import { useEffect, useState } from 'react';
import { scaleLinear } from 'd3-scale';
import _ from 'lodash';

import SliderRange from '../../components/SliderRange';
import RadioButton from '../../components/RadioButton';
import RadarPlot from '../../components/RadarPlot';

const RadarWrapper = ({
  data: inputData,
  globalWidth = 500,
  minified
}) => {
  const [data, setData] = useState(undefined);
  const [checkedValue, setIsChecked] = useState('La Rochelle');
  const [checkedTypeButton, setIsCheckedTypeButton] = useState(2);
  const [dataFilteredTonnage, setDataFilteredTonnage] = useState([]);
  const [dataFilteredTonnageFerme, setDataFilteredTonnageFerme] = useState([]);
  const [fermeCaptions, setFermeCaptions] = useState([]);
  const [destCaptions, setDestCaptions] = useState({});
  const [tonnageData, setTonnageData] = useState([]);
  const [travelData, setTravelData] = useState([])
  const [radarData, setRadarData] = useState([]);
  const [upperSlider, setUpperSlider] = useState();
  const [valueSlider, setValueSlider] = useState();
  const lowerSlider = 0;
  const colorAll = 'blue';
  const colorFerme = 'red';

  const prepareDestCaptions = datas => {
    return _.uniqBy(datas, 'destination_radar').map(obj => {
      var rObj = {};
      rObj[obj.destination_radar] = obj.destination_radar;
      return rObj;
    });
  };

  const prepareFermeCaptions = datas => {
    return _.uniqBy(datas, 'ferme_bureau').map(obj => {
      return obj.ferme_bureau;
    });
  };

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

  const prepareTonnageData = (datas) => {
    return _(datas)
      .groupBy("destination_radar")
      .map((dest, id) => {
        var rObj = {};
        rObj[id] = _.sumBy(dest, "tonnage");
        return rObj;
      })
      .value();
  };

  const rescale = datas => {
    const maxValue = _.maxBy(_.values(datas), function (o) {
      return o;
    });
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

  const filtered = (range, ferme) => {
    if (ferme === 'Toutes fermes') {
      return _.filter(data, item => {
        return (item.tonnage >= range[0]) & (item.tonnage <= range[1]);
      });
    } else {
      return _.filter(data, item => {
        return (
          (item.tonnage >= range[0]) &
          (item.tonnage <= range[1]) &
          (item.ferme_bureau === ferme)
        );
      });
    }
  };

  const radioAggType = [{
    id: 1,
    label: 'Aggrégation par tonnage',
    data: tonnageData
  }, {
    id: 2,
    label: 'Aggrégation par nb de trajets',
    data: travelData
  }];

  useEffect(() => {
    if (inputData) {
      const newData = inputData.map(d => {
        //pour dégager les valeurs vides du csv
        if ((d.destination_radar !== '') & (d.ferme_bureau !== '')) {
          return {
            ferme_bureau: d.ferme_bureau,
            destination_radar: d.destination_radar.replace(/['"]+/g, ''),
            //tonnage: (parseInt(d.tonnage) || 0) + parseInt(d.tonnage)
            tonnage: +d.tonnage
          };
        }
        return undefined;
      })
        .filter(d => d)

      setFermeCaptions([...prepareFermeCaptions(newData), 'Toutes fermes']);
      setDestCaptions(Object.assign({}, ...prepareDestCaptions(newData)))
      let max = _.maxBy(newData, 'tonnage').tonnage;
      setUpperSlider(max);
      setValueSlider([lowerSlider, max]);
      setData(newData);
    }
  }, [inputData])

  useEffect(() => {
    setDataFilteredTonnage(filtered(valueSlider, 'Toutes fermes') || []);
    setDataFilteredTonnageFerme(
      filtered(valueSlider, checkedValue) || []
    );
  }, [checkedValue, valueSlider]);

  useEffect(() => {
    setTonnageData([
      {
        data: rescale
          (Object.assign({}, ...prepareTonnageData(dataFilteredTonnageFerme))
          ),
        meta: { color: colorFerme }
      },
      {
        data: rescale(Object.assign({}, ...prepareTonnageData(dataFilteredTonnage))),
        meta: { color: colorAll }
      }
    ]);
    setTravelData([
      {
        data: rescale
          (Object.assign({}, ...prepareTravelData(dataFilteredTonnageFerme))
          ),
        meta: { color: colorFerme }
      },
      {
        data: rescale(Object.assign({}, ...prepareTravelData(dataFilteredTonnage))),
        meta: { color: colorAll }
      }
    ]);

    /*setRadarData([
      {
        data: rescale
         (Object.assign({}, ...prepareTravelData(dataFilteredTonnageFerme))
        ),
        meta: { color: colorFerme }
      },
      {
        data: rescale(Object.assign({}, ...prepareTravelData(dataFilteredTonnage))),
        meta: { color: colorAll }
      }
    ]);  */
  }, [dataFilteredTonnage, dataFilteredTonnageFerme, checkedTypeButton]);

  useEffect(() => {
    const displayData = _.filter(radioAggType, d => {
      return d.id === checkedTypeButton;
    })[0].data
    setRadarData([...displayData])
  }, [travelData, tonnageData, checkedTypeButton]);

  let allFermeTravelsCount
  if (checkedValue === "Toutes fermes") {
    allFermeTravelsCount = data.length
  }
  else {
    allFermeTravelsCount = _.filter(
      data,
      ({ ferme_bureau }) => (ferme_bureau === checkedValue)
    ).length
  }
  const ratio1 = Math.round(dataFilteredTonnageFerme.length / dataFilteredTonnage.length * 100, 2);
  const ratio3 = Math.round(dataFilteredTonnageFerme.length / allFermeTravelsCount * 100, 2);

  console.log(ratio3)


  if (!data) {
    return null;
  }
  return (
    <div className="RadarWrapper">


      {/* <p>Légende : en <span style={{color:"blue"}}>bleu</span> les valeurs pour l'ensemble des bureaux de ferme, en <span style={{color:"red"}}>rouge</span> les valeurs pour le bureau de ferme sélectionné</p> */}
      {radarData.length > 0 &&
        !_.isEmpty(radarData[0].data) &&
        !_.isEmpty(destCaptions) &&

        <RadarPlot
          captions={destCaptions}
          data={radarData}
          size={minified ? globalWidth * .3 : globalWidth * .7}
        />
      }


      <div className="controls-container">
        <div>
          {
            checkedTypeButton && checkedTypeButton === 1 &&
            <div className="slider-container">
              <p>Filtrer les voyages par intervalles de tonnage</p>
              <SliderRange
                min={lowerSlider}
                max={upperSlider}
                value={valueSlider}
                onChange={value => [setValueSlider(value)]}
              />
            </div>
          }

        </div>
        <div>
          <p><b>Bureau de ferme de départ</b></p>
          <select value={checkedValue} onChange={(e) => [setIsChecked(e.target.value)]}>
            {fermeCaptions.map(item => (
              <option value={item}>{item}</option>
            ))}
          </select>
        </div>


        <div>
          <fieldset>
            <ul>
              {radioAggType.map(el =>
                <li key={el.id}>
                  <RadioButton
                    type="radio"
                    key={el.id}
                    id={el.id}
                    name="radioGroup"
                    label={el.label}
                    checked={checkedTypeButton === el.id}
                    onChange={() => [setIsCheckedTypeButton(el.id)]}
                  />
                </li>
              )}
            </ul>
          </fieldset>
        </div>
      </div>


    </div >
  )
}

export default RadarWrapper;