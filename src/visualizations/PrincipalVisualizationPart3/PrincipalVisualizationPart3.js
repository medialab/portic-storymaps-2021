
import cx from 'classnames';

import SigmaComponent from '../../components/SigmaComponent';
import GeoComponent from '../../components/GeoComponent/GeoComponent';
import TriangleComponent from '../../components/TriangleComponent/TriangleComponent';

import './PrincipalVisualizationPart3.scss';


const renderObject = (datum, x, y) => { // fonction à adapter pour donner le double triangle + cercle qui va bien de la partie 3
  console.log("datum : ",datum)
  return (
    <g transform={`translate(${x},${y})`}>
      <text>{datum.label}</text>
    </g>);
} 


const PrincipalVisualizationPart3 = ({step, width, height}) => {
  return (
    <div className="PrincipalVisualizationPart3" height={height}> 
      <div className={cx('step', {'is-visible': step === 1})}>
        <GeoComponent 
          backgroundFilename="cartoweb_france_1789_geojson.geojson" 
          dataFilename="part_3_step1_viz_data.csv"
          height = {height*0.7} // @TODO à changer quand je combin erais en un seul SVG ou component custom
          // markerColor="null"
          // markerSize="null"
          label="port"
          width={width} // j'aurais besoin de responsive
          showLabels
          centerOnRegion
          rotationDegree={58}
          renderObject = {renderObject} 
          // debug
        /> 
        <TriangleComponent 
          dataFilename="part_3_step1_viz_data.csv"
          totalWidth={width} // @TODO adapter la height
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