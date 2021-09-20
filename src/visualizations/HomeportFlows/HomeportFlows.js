import GeographicMapChart from "../../components/GeographicMapChart/GeographicMapChart"
import { fixSvgDimension } from "../../helpers/misc";

const HomeportFlows = ({
  datasets,
  atlasMode,
  dimensions,
}) => {
  // const [currentProjectionTemplate, setCurrentProjectionTemplate] = useState('World');
  const totalHeight = atlasMode ? window.innerHeight * .9 : fixSvgDimension(dimensions.height);
  return (
    <div className="HomeportFlows">
      <div className="column">
        <GeographicMapChart
          title={'Voyages des bateaux rattachés au port de La Rochelle en 1787'}
          layers={[
            {
              type: 'choropleth',
              data: datasets['map_france_1789.geojson'],// currentProjectionTemplate === 'World' ? datasets['map_world_1789.geojson'] : datasets['map_france_1789.geojson'],
              reverseColors: atlasMode ? undefined : true,
            },

            {
              type: 'flows',
              data: datasets['voyages-bateaux-homeport-larochelle-1787.csv'],
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
              data: datasets['voyages-bateaux-homeport-larochelle-1787.csv']
                .map(d => ({ ...d, longitude: d.longitude_dep, latitude: d.latitude_dep })),
              size: {
                field: 'tonnages_cumulés',
                title: 'tonnage cumulé'
              },
              color: {
                field: 'category',
                title: 'Port de départ',
                // palette: colorPalettes.provinces,
                // labelsColor: props.atlasMode ? undefined : 'white'
              },
              // tooltip: d => `${d.rawSize} départs de navires ont été observés par le port de ${d.label} en 1789`,
              label: {
                field: 'port_dep',
                // position: 'left'
              }
            },
          ]}
          projectionTemplate={'coast from Nantes to Bordeaux'}
          width={fixSvgDimension(dimensions.width / 2)}
          height={totalHeight}
        />
      </div>
      <div className="column">
        <GeographicMapChart
          title={'Voyages des bateaux rattachés au port de La Rochelle en 1787'}
          layers={[
            {
              type: 'choropleth',
              // data: datasets['world_test.geojson'],
              data: datasets['map_france_1789.geojson'], // currentProjectionTemplate === 'World' ? datasets['map_world_1789.geojson'] : datasets['map_france_1789.geojson'],
              reverseColors: atlasMode ? undefined : true,
              // color:{
              //   field: 'shortname',
              //   palette: colorPalettes.provinces
              // }
            },
            {
              type: 'flows',
              data: datasets['voyages-bateaux-homeport-larochelle-1787.csv'],
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
          title={'Voyages des bateaux rattachés au port de La Rochelle en 1787'}
          layers={[
            {
              type: 'choropleth',
              // data: datasets['world_test.geojson'],
              data: datasets['map_world_1789.geojson'],// currentProjectionTemplate === 'World' ? datasets['map_world_1789.geojson'] : datasets['map_france_1789.geojson'],
              reverseColors: atlasMode ? undefined : true,
              // color:{
              //   field: 'shortname',
              //   palette: colorPalettes.provinces
              // }
            },
            {
              type: 'flows',
              data: datasets['voyages-bateaux-homeport-larochelle-1787.csv'],
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
          withLegend={'bottom left'}
        />
      </div>
      {/* <div
        style={{
          position: 'absolute',
          right: '1rem',
          bottom: '1rem'
        }}
      >
        <button onClick={() => setCurrentProjectionTemplate(currentProjectionTemplate === 'World' ? 'France' : 'World')}>
          Monde/France
        </button>
      </div> */}
    </div>
  )
}

export default HomeportFlows