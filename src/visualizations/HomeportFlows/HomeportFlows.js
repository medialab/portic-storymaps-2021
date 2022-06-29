import GeographicMapChart from "../../components/GeographicMapChart/GeographicMapChart"
import { fixSvgDimension } from "../../helpers/misc";

import translate from "../../i18n/translate";

import './HomeportFlows.scss';

/**
 * Displays the homport flows vis (multiple flow maps)
 * @param {object} datasets
 * @param {boolean} atlasMode
 * @param {object} dimensions
 * @returns {React.ReactElement} - React component
 */
const HomeportFlows = ({
  datasets,
  atlasMode,
  dimensions,
  lang
}) => {
  const totalHeight = atlasMode ? window.innerHeight * .9 : fixSvgDimension(dimensions.height);
  const hotFixedData = datasets['voyages-bateaux-homeport-larochelle-1787/voyages-bateaux-homeport-larochelle-1787.csv']
  .map(datum => {
    if (datum.port_dest.includes(`Côte d'Or`)) {
      return {
        ...datum,
        latitude_dest: 5,
        longitude_dest: -0.6107851
      }
    }
    return datum;
  })
  return (
    <div className="HomeportFlows">
      <div className="column">
        <GeographicMapChart
          title={translate('partie-2-carte-direction-bateaux-de-la-rochelle', 'title', lang)}
          layers={[
            {
              type: 'choropleth',
              data: datasets['map_backgrounds/map_france_1789.geojson'],// currentProjectionTemplate === 'World' ? datasets['map_world_1789.geojson'] : datasets['map_france_1789.geojson'],
              reverseColors: atlasMode ? undefined : true,
            },
            {
              type: 'flows',
              data: hotFixedData,
              size: {
                field: 'tonnages_cumulés',
                title: translate('partie-2-carte-direction-bateaux-de-la-rochelle', 'size', lang)
              },
              label: {
                fields: ['port_dep', 'port_dest'],
              },
              color: {
                field: 'category_' + lang,
                title: translate('partie-2-carte-direction-bateaux-de-la-rochelle', 'color', lang)
              },
              hideOverflowingFlows: true
            }
          ]}
          projectionTemplate={'coast from Nantes to Bordeaux'}
          width={fixSvgDimension(dimensions.width / 2)}
          withLegend={'bottom left'}
          legendLayerFilter={l => l.type === 'flows'}
          height={totalHeight}
        />
      </div>
      <div className="column">
        <GeographicMapChart
          layers={[
            {
              type: 'choropleth',
              data: datasets['map_backgrounds/map_france_1789.geojson'], // currentProjectionTemplate === 'World' ? datasets['map_world_1789.geojson'] : datasets['map_france_1789.geojson'],
              reverseColors: atlasMode ? undefined : true,
            },
            {
              type: 'flows',
              data: hotFixedData.filter(d => d.port_dest_category !== 'pasa'),
              hideOverflowingFlows: true,
              size: {
                field: 'tonnages_cumulés',
                title: translate('partie-2-carte-direction-bateaux-de-la-rochelle', 'size', lang)
              },
              label: {
                fields: ['port_dep', 'port_dest'],
              },
              color: {
                field: 'category_' + lang,
                title: translate('partie-2-carte-direction-bateaux-de-la-rochelle', 'color', lang)
              }
            },
          ]}
          projectionTemplate={'France'}
          width={fixSvgDimension(dimensions.width / 2)}
          height={totalHeight / 2}
        />
        <GeographicMapChart
          layers={[
            {
              type: 'choropleth',
              data: datasets['map_backgrounds/map_world_1789.geojson'],// currentProjectionTemplate === 'World' ? datasets['map_world_1789.geojson'] : datasets['map_france_1789.geojson'],
              reverseColors: atlasMode ? undefined : true,
            },
            {
              type: 'flows',
              data: hotFixedData.filter(d => d.port_dest_category === 'étranger'),
              // hideOverflowingFlows: true,
              size: {
                field: 'tonnages_cumulés',
                title: translate('partie-2-carte-direction-bateaux-de-la-rochelle', 'size', lang)
              },
              label: {
                fields: ['port_dep', 'port_dest'],
              },
              color: {
                field: 'category_' + lang,
                title: translate('partie-2-carte-direction-bateaux-de-la-rochelle', 'color', lang)
              }
            },
          ]}
          projectionTemplate={'World'}
          width={fixSvgDimension(dimensions.width / 2)}
          height={totalHeight / 2}
        />
      </div>
    </div>
  )
}

export default HomeportFlows