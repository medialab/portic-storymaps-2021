import GeographicMapChart from "../../components/GeographicMapChart/GeographicMapChart"
import { fixSvgDimension } from "../../helpers/misc";

import './HomeportFlows.scss';

const HomeportFlows = ({
  datasets,
  atlasMode,
  dimensions,
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
          title={'Voyages des navires rattachés au port de La Rochelle en 1787'}
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
                title: 'Flèches dimensionnées par tonnage cumulé'
              },
              label: {
                fields: ['port_dep', 'port_dest'],
              },
              color: {
                field: 'category',
                title: 'Port de départ'
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
                title: 'Flèches dimensionnées par tonnage cumulé'
              },
              label: {
                fields: ['port_dep', 'port_dest'],
              },
              color: {
                field: 'category',
                title: 'Port de départ'
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
                title: 'Flèches dimensionnées par tonnage cumulé'
              },
              label: {
                fields: ['port_dep', 'port_dest'],
              },
              color: {
                field: 'category',
                title: 'Port de départ'
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