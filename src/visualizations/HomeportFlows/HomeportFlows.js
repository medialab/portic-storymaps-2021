import GeoComponent from "../../components/GeoComponent/GeoComponent"
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
      <GeoComponent
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
        width={fixSvgDimension(dimensions.width) }
        height={totalHeight / 2}
      />
      <GeoComponent
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
        width={fixSvgDimension(dimensions.width) }
        height={totalHeight / 2}
        withLegend={'bottom left'}
      />
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