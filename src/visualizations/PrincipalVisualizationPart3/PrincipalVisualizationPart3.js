
import cx from 'classnames';

import SigmaComponent from '../../components/SigmaComponent';
import GeoComponent from '../../components/GeoComponent/GeoComponent';
import TriangleComponent from '../../components/TriangleComponent/TriangleComponent';

import './PrincipalVisualizationPart3.scss';

const PrincipalVisualizationPart3 = ({step, width, height}) => {
  return (
    <div className="PrincipalVisualizationPart3" height={height}> 
      <div className={cx('step', {'is-visible': step === 1})}>
        <GeoComponent 
          backgroundFilename="cartoweb_france_1789_geojson.geojson" 
          dataFilename="part_3_step1_viz_data.csv"
          height = {height*0.75}
          markerColor="null"
          markerSize="null"
          label="port"
          width={width} // j'aurais besoin de responsive
          // height={height}
          showLabels
          centerOnRegion
          rotationDegree={58}
          // debug
        /> 
        <TriangleComponent 
          dataFilename="part_3_step1_viz_data.csv"
          totalWidth={width}
          numberOfColumns={25}
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
      <div className={cx('step', {'is-visible': step === 3})}>
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
    </div>
  )
}

export default PrincipalVisualizationPart3;