
import cx from 'classnames';

import SigmaComponent from '../../components/SigmaComponent';
import GeoComponent from '../../components/GeoComponent/GeoComponent';
import TriangleComponent from '../../components/TriangleComponent/TriangleComponent';

import './PrincipalVisualizationPart3.scss';


const renderLabel = (datum, projection) => { // à terme on pourrait mettre un objet 
  // console.log("datum : ",datum)

  const [x, y] = projection([+datum.longitude, +datum.latitude])

  return (
    <g transform={`translate(${x},${y})`}>
      <text>{datum.label}</text>
    </g>);
}

const renderStep3Object = (datum, projection, { width }) => {

  const [x, y] = projection([+datum.longitude, +datum.latitude])
  
  let sizeCoef = width * 0.05;
  const totalTonnage = parseFloat(datum.else.cumulated_tonnage_out_region) + parseFloat(datum.else.cumulated_tonnage_in_region)
  // console.log("tonnage total : ",totalTonnage)

  if (datum.else.type_of_object === "port") {
    // définition des coefficients de taille des triangles en 3 classes distinctes (pour l'instant la définition des classes est expérimentale)

    // se gérerait bien avec un switch
    if (totalTonnage < 1000) {
      sizeCoef = width * 0.025
    }
    else {
      if (totalTonnage > 5000) {
        sizeCoef = width * 0.075
      }
    }
  }

  const leftTriangleHeight = parseFloat(datum.else.cumulated_tonnage_out_region) / totalTonnage * sizeCoef;
  const rightTriangleHeight = parseFloat(datum.else.cumulated_tonnage_in_region) / totalTonnage * sizeCoef; // je pourrais déduire cette donnée de la taille du triangle gauche

  let leftPath = null
  let rightPath = null

  if (datum.else.type_of_object === "customs_office") {

    const totalValue = parseFloat(datum.else.cumulated_exports_value_from_region) + parseFloat(datum.else.cumulated_exports_value_from_ext)
    const inPercentage = parseFloat(datum.else.cumulated_exports_value_from_region) / totalValue * 100
    // console.log("inPercentage ", datum.label," : ", inPercentage)

    const partialCircle = require('svg-partial-circle')

    let start = null
    let end = null

    // calcul des angles de départ et d'arrivée de l'arc de cercle, en fonction des données
    start = Math.PI / 2 + (inPercentage - 50) / 100 * Math.PI
    end = Math.PI * 3 / 2 - (inPercentage - 50) / 100 * Math.PI

    leftPath = partialCircle(
      0, 0,         // center X and Y
      leftTriangleHeight + rightTriangleHeight,              // radius
      start,          // start angle in radians --> Math.PI / 4
      end             // end angle in radians --> Math.PI * 7 / 4
    )
      .map((command) => command.join(' '))
      .join(' ')
    // console.log(`<path d="${leftPath}" />`)

    rightPath = partialCircle(
      0, 0,             // center X and Y
      leftTriangleHeight + rightTriangleHeight,                  // radius
      start,              // start angle in radians --> Math.PI / 4
      end - 2 * Math.PI   // end angle in radians --> Math.PI * 7 / 4
    )
      .map((command) => command.join(' '))
      .join(' ')
    // console.log(`<path d="${rightPath}" />`)

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

      <text font-size="smaller"> {datum.label} </text>
      
      <>
        {
          // datum.else.type_of_object === "customs_office" ?
          leftPath != null ?

            <>

              <path
                d={`${leftPath}
                `}
                stroke="blue"
                stroke-width={width*0.005} // à ajuster en fonction de la largeur de l'écran
                fill="transparent"
              />

              <path
                d={`${rightPath}
                `}
                stroke="red"
                stroke-width={width*0.005} // à ajuster en fonction de la largeur de l'écran
                fill="transparent"
              />
            </>
            :
            null
        }
      </>
    </g>);
}



const PrincipalVisualizationPart3 = ({ step, width, height }) => {
  console.log(process.env.NODE_ENV)
  return (
    <div className="PrincipalVisualizationPart3" height={height}>
      <div className={cx('step', { 'is-visible': step === 1 })}>
        {process.env.NODE_ENV === 'development' ?
          <>
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
              rowHeight={height * 0.3}
            />
          </>
          :
          <img alt="step-3.1" src={`${process.env.PUBLIC_URL}/maquettes/VIZ_3.1.svg`} />
        }
      </div>
      <div className={cx('step', { 'is-visible': step === 2 })}>
        {process.env.NODE_ENV === 'development' ?
          <>
            <SigmaComponent
              data="toflit_aggregate_1789_only_out.gexf"
              nodeColor={`admiralty`}
              nodeSize={`inside_degree`}
              labelDensity={0.5}
            />
            <img alt="step-3.2" src={`${process.env.PUBLIC_URL}/maquettes/comparaison_centralite-0.png`} />
            <img alt="step-3.2" src={`${process.env.PUBLIC_URL}/maquettes/comparaison_centralite-1.png`} />
          </>
          :
          <>
            <SigmaComponent
              data="toflit_aggregate_1789_only_out.gexf"
              nodeColor={`admiralty`}
              nodeSize={`inside_degree`}
              labelDensity={0.5}
            />
            <img alt="step-3.2" src={`${process.env.PUBLIC_URL}/maquettes/comparaison_centralite-0.png`} />
            <img alt="step-3.2" src={`${process.env.PUBLIC_URL}/maquettes/comparaison_centralite-1.png`} />
          </>

        }
      </div>
      <div className={cx('step', { 'is-visible': step === 3 })} height={height}>
        {process.env.NODE_ENV === 'development' ?
          <>
            <GeoComponent
              backgroundFilename="cartoweb_france_1789_geojson.geojson"
              dataFilename="part_3_step3_viz_ports_data.csv"
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
          </>
          :
          <img alt="step-3.3" src={`${process.env.PUBLIC_URL}/maquettes/VIZ_3.3.svg`} />
        }
      </div>
    </div>
  )
}

export default PrincipalVisualizationPart3;