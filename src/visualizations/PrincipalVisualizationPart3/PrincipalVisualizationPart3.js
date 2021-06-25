
import cx from 'classnames';

import SigmaComponent from '../../components/SigmaComponent';
import GeoComponent from '../../components/GeoComponent/GeoComponent';
import TriangleComponent from '../../components/TriangleComponent/TriangleComponent';

import './PrincipalVisualizationPart3.scss';


const renderLabel = (datum, x, y) => { // fonction à adapter pour donner le double triangle + cercle qui va bien de la partie 3
  // console.log("datum : ",datum)
  return (
    <g transform={`translate(${x},${y})`}>
      <text>{datum.label}</text>
    </g>);
}

const renderStep3Object = (datum, x, y, { width }) => {

    let sizeCoef = width * 0.05;
    const totalTonnage = parseFloat(datum.else.cumulated_tonnage_in_region) + parseFloat(datum.else.cumulated_tonnage_out_region)
    // console.log("tonnage total : ",totalTonnage)

    if (datum.else.type_of_object === "port") {
      // définition des coefficients de taille des triangles en 3 classes distinctes (pour l'instant la définition des classes est expérimentale)

      // se gérerait bien avec un switch
      if (totalTonnage<1000){
        sizeCoef = width * 0.025
      }
      else {
        if (totalTonnage>5000){
          sizeCoef = width * 0.075
        }
      }
    }

    const leftTriangleHeight = parseFloat(datum.else.cumulated_tonnage_out_region) / totalTonnage * sizeCoef;
    const rightTriangleHeight = parseFloat(datum.else.cumulated_tonnage_in_region) / totalTonnage * sizeCoef;

    if (datum.else.type_of_object === 'customs_office') {
      <path d="M70 110 C 70 140, 110 140, 110 110" stroke="black" fill="transparent"/>
    }

    return (
      <g className='double-triangle' transform={`translate(${x},${y})`}>

        <path className='left-triangle' fill='rgb(39, 129, 141)'
          d={`M ${0} ${0}
              V ${leftTriangleHeight / 2}
              L ${-Math.pow(5, 0.5) * leftTriangleHeight / 2} ${0}
              L ${0} ${-leftTriangleHeight / 2}
              Z
              `}
        />

        <path className='right-triangle' fill='rgb(44, 74, 156)'
          d={`M ${0} ${0}
              V ${rightTriangleHeight / 2}
              L ${Math.pow(5, 0.5) * rightTriangleHeight / 2} ${0}
              L ${0} ${-rightTriangleHeight / 2}
              Z
              `}
        />
        <>
        {
          datum.else.type_of_object === "customs_office" ?
          <>
          <path 
            d={`M ${0} ${0} 
                C ${70} ${140}, ${110} ${140}, ${110} ${110}
                `}  
            stroke="black" fill="transparent"/>

          <path 
            d={`M ${0} ${0} 
            C ${120} ${80}, ${180} ${80}, ${170} ${60}
            `} 
            stroke="red" fill="transparent"/>
          </>
          : null
        }
        </>
      </g>);
  }





const PrincipalVisualizationPart3 = ({ step, width, height }) => {
  return (
    <div className="PrincipalVisualizationPart3" height={height}>
      <div className={cx('step', { 'is-visible': step === 1 })}>
        <GeoComponent
          backgroundFilename="cartoweb_france_1789_geojson.geojson"
          dataFilename="part_3_step1_viz_data.csv"
          height={height * 0.7} // @TODO à changer quand je combin erais en un seul SVG ou component custom
          label="port"
          width={width} // j'aurais besoin de responsive
          showLabels
          centerOnRegion
          rotationDegree={58}
          renderObject={renderLabel}
        // debug
        />
        <TriangleComponent
          dataFilename="part_3_step1_viz_data.csv"
          totalWidth={width} // @TODO adapter la height
          numberOfColumns={25}
          rowHeight={height * 0.3}
        />
      </div>
      <div className={cx('step', { 'is-visible': step === 2 })}>
        <SigmaComponent
          data="toflit_aggregate_1789_only_out.gexf"
          nodeColor={`admiralty`}
          nodeSize={`inside_degree`}
          labelDensity={0.5}
        />
        <img alt="step-3.2" src={`${process.env.PUBLIC_URL}/maquettes/comparaison_centralite-0.png`} />
        <img alt="step-3.2" src={`${process.env.PUBLIC_URL}/maquettes/comparaison_centralite-1.png`} />

      </div>
      <div className={cx('step', { 'is-visible': step === 3 })} height={height}>
        <GeoComponent
          backgroundFilename="cartoweb_france_1789_geojson.geojson"
          dataFilename="part_3_step3_viz_customs_offices_data.csv"
          width={width}
          height={height * 0.99}
          // markerColor="type_of_object"
          markerSize="type_of_object"
          label="name"
          showLabels
          centerOnRegion
          renderObject={renderStep3Object}
        // debug="true"
        />
      </div>
    </div>
  )
}

export default PrincipalVisualizationPart3;