
import cx from 'classnames';

import SigmaComponent from '../../components/SigmaComponent';
import GeoComponent from '../../components/GeoComponent/GeoComponent';
import TriangleComponent from '../../components/TriangleComponent/TriangleComponent';

import './PrincipalVisualizationPart3.scss';

const PrincipalVisualizationPart3 = ({step}) => {
  return (
    <div className="PrincipalVisualizationPart3">
      <div className={cx('step', {'is-visible': step === 1})}>
        <GeoComponent 
          backgroundFilename="cartoweb_france_1789_geojson.geojson" 
          dataFilename="part_3_step1_viz_data.csv"
          markerColor="null"
          markerSize="null"
          label="port"
          showLabels
          centerOnRegion
          rotationDegree={58}
          // debug="true"
        /> 
        <TriangleComponent 
          dataFilename="part_3_step1_viz_data.csv"
          numberOfColumns={15}
        />
      </div>
      <div className={cx('step', {'is-visible': step === 2})}>
        <SigmaComponent 
          data="toflit_aggregate_1789_only_out.gexf" 
          nodeColor={`admiralty`}
          nodeSize={`inside_degree`}
          labelDensity={0.5}
        />
        <img alt="step-3.2" src={`${process.env.PUBLIC_URL}/maquettes/comparaison_centralite-0.png`} />
        <img alt="step-3.2" src={`${process.env.PUBLIC_URL}/maquettes/comparaison_centralite-1.png`} />

      </div>
        <GeoComponent 
            backgroundFilename="cartoweb_france_1789_geojson.geojson" 
            dataFilename="part_3_step3_viz_data.csv"
            markerColor="null"
            markerSize="null"
            label="name"
            showLabels
            centerOnRegion
            // debug="true"
          /> 
    </div>
  )
}

export default PrincipalVisualizationPart3;