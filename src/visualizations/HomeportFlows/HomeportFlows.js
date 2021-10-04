import GeographicMapChart from "../../components/GeographicMapChart/GeographicMapChart"
import { fixSvgDimension } from "../../helpers/misc";

const HomeportFlows = ({
  datasets,
  atlasMode,
  dimensions,
}) => {
  const totalHeight = atlasMode ? window.innerHeight * .9 : fixSvgDimension(dimensions.height);
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
              data: datasets['voyages-bateaux-homeport-larochelle-1787/voyages-bateaux-homeport-larochelle-1787.csv'],
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
            {
              type: 'points',
              data: datasets['voyages-bateaux-homeport-larochelle-1787/voyages-bateaux-homeport-larochelle-1787.csv']
                .map(d => ({ ...d, longitude: d.longitude_dep, latitude: d.latitude_dep })),
              size: {
                field: 'tonnages_cumulés',
                title: 'tonnage cumulé'
              },
              color: {
                field: 'category',
                title: 'Port de départ',
              },
              label: {
                field: 'port_dep',
              }
            },
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
              data: datasets['voyages-bateaux-homeport-larochelle-1787/voyages-bateaux-homeport-larochelle-1787.csv'],
              size: {
                field: 'tonnages_cumulés',
                title: 'Flèches dimensionnées par tonnage cumulé'
              },
              label: {
                fields: ['port_dep', 'port_dest']
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
              data: datasets['voyages-bateaux-homeport-larochelle-1787/voyages-bateaux-homeport-larochelle-1787.csv'],
              size: {
                field: 'tonnages_cumulés',
                title: 'Flèches dimensionnées par tonnage cumulé'
              },
              label: {
                fields: ['port_dep', 'port_dest']
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