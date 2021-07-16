/*
DOCUMENTATION : sommaires des fonctions

- renderLabel (renderObject)
positionner geographiquement des labels

- renderStep3Object (renderObject)
création d'un double triangle et d'un cercle autour (deux courbes de bézier), positionné géographiquement
(objet associé à un bureau de ferme)

- fonction renderStep3SmallMultiples (renderObjects)
création des objets double triangle et cercles pour les small multiples de la viz 3.3, positionnés en bas à droite du SVG
+ un objet de légende

- renderTriangles (renderObjects)
création des triangles pour la viz 3.1, reliés par une courbe pointillée à des points positionnés géographiquement
+ un triangle de légende

@TODO : compléter la fonction step3Object (ou créer une nouvelle fonction), pour gérer l'apparition des doubles triangles pour chaque port
-  cette fonctionnalité est déjà prévue dans la fonction renderStep3Object (dans la boucle   if (datum.type_of_object === "port") { ...}) mais en l'état les objets ports sont positionnés géographiquement
- il faudrait adapter pour positionner les objets ports en colonne, sur la gauche du SVG, et qu'ils aient par défaut une opacité à 0% sauf au hover de l'objet bureau des fermes correspondant => apparition

*/


import TriangleComponent from '../../components/TriangleComponent/TriangleComponent';
import colorsPalettes from '../../colorPalettes';

export function renderLabel(datum, projection, { width }) { // à terme on pourrait mettre un objet 

  const [x, y] = projection([+datum.longitude, +datum.latitude])

  return (
    <g transform={`translate(${x},${y})`}>
      <text size={width * 0.05}>{datum.label}</text>
    </g>);
}


export function renderStep3Object({ datum, projection, width, height }) { // à priori plus besoin de datum et de width qui sont déjà passés au composant CustomObjectLayer

  const [x, y] = projection([+datum.longitude, +datum.latitude])

  let sizeCoef = width * 0.05;
  const totalTonnage = parseFloat(datum.cumulated_tonnage_out_region) + parseFloat(datum.cumulated_tonnage_in_region)
  // console.log("tonnage total : ",totalTonnage)

  if (datum.type_of_object === "port") {
    // définition des coefficients de taille des triangles en 3 classes distinctes (pour l'instant la définition des classes est expérimentale)

    // se gérerait bien avec un switch
    if (totalTonnage < 1000) { // * 1000
      sizeCoef = width * 0.025
    }
    else {
      if (totalTonnage > 5000) {
        sizeCoef = width * 0.075
      }
    }
  }

  const leftTriangleHeight = parseFloat(datum.cumulated_tonnage_out_region) / totalTonnage * sizeCoef;
  const rightTriangleHeight = parseFloat(datum.cumulated_tonnage_in_region) / totalTonnage * sizeCoef; // je pourrais déduire cette donnée de la taille du triangle gauche

  let leftPath = null
  let rightPath = null

  if (datum.type_of_object === "customs_office") {

    const totalValue = parseFloat(datum.cumulated_exports_value_from_region) + parseFloat(datum.cumulated_exports_value_from_ext)
    const inPercentage = parseFloat(datum.cumulated_exports_value_from_region) / totalValue * 100
    // console.log("inPercentage ", datum.label," : ", inPercentage)

    const partialCircle = require('svg-partial-circle')

    let start = null
    let end = null
    // let transformGeo = {`translate(${x},${y})`} // ce serzit param qui se mmodifie en attribue de positionnement réparti en bas à droite si co sans coords

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

    rightPath = partialCircle(
      0, 0,             // center X and Y
      leftTriangleHeight + rightTriangleHeight,                  // radius
      start,              // start angle in radians --> Math.PI / 4
      end - 2 * Math.PI   // end angle in radians --> Math.PI * 7 / 4
    )
      .map((command) => command.join(' '))
      .join(' ')

  }

  // handle overlap 
  let noOverlapTransform = undefined
  if (datum.name === 'Tonnay-Charente') {
    noOverlapTransform = `translate(${x + width * 0.03},${y})`
  }
  else if ((datum.name === 'Rochefort')) {
    noOverlapTransform = `translate(${x - width * 0.03},${y})`
  }
  else {
    noOverlapTransform = `translate(${x},${y})` // mettre entre accolades ??
  }

  return (
    <g
      className='double-triangle'
      transform={noOverlapTransform}
    // { datum.longitude === 0 ? x=1 : null }
    >

      <path className='left-triangle' fill={colorsPalettes.generic.accent2}
        d={`M ${0} ${0}
                V ${leftTriangleHeight / 2}
                L ${-Math.pow(5, 0.5) * leftTriangleHeight / 2} ${0}
                L ${0} ${-leftTriangleHeight / 2}
                Z
                `}
      />

      <path className='right-triangle' fill={colorsPalettes.ui.colorAccentBackground}
        d={`M ${0} ${0}
                V ${rightTriangleHeight / 2}
                L ${Math.pow(5, 0.5) * rightTriangleHeight / 2} ${0}
                L ${0} ${-rightTriangleHeight / 2}
                Z
                `}
      />

      <>
        {
          // datum.else.type_of_object === "customs_office" ?
          leftPath != null ?

            <>

              <path
                d={`${leftPath}
                  `}
                stroke={colorsPalettes.generic.accent2}
                stroke-width={width * 0.005} // à ajuster en fonction de la largeur de l'écran
                fill="transparent"
              />

              <path
                d={`${rightPath}
                  `}
                stroke={colorsPalettes.ui.colorAccentBackground}
                stroke-width={width * 0.005} // à ajuster en fonction de la largeur de l'écran
                fill="transparent"
              />
            </>
            :
            null
        }

        <text
          className='label'
          transform={`translate(${-Math.pow(5, 0.5) * (leftTriangleHeight + rightTriangleHeight) / 4}, ${(rightTriangleHeight + leftTriangleHeight) / 1.8})`}
          font-size={parseInt(height * 0.013)}
        >
          {datum.name}
        </text>
      </>
    </g>);
}



export function renderStep3SmallMultiples({ data, width, height, projection }) {
  // could be parametered in props too
  const legendWidth = width / 6
  // const margins = {
  //   left: 0.05,
  //   right: 0.05
  // }

  // console.log("data : layder.data ", data)
  const numberOfColumns = 3
  // const columnWidth = (width * (1 - legendWidth - margins.left - margins.right)) / numberOfColumns
  const columnWidth = (width * 0.8) / numberOfColumns
  const numberOfRows = 1
  const rowHeight = height / 6
  const totalHeight = numberOfRows * rowHeight
  // const fontSize = totalHeight * 0.05

  // console.log({ width, numberOfColumns, columnWidth, numberOfRows, rowHeight, totalHeight, fontSize })


  // create object for legend
  const legendCustomOffice = {
    name: 'Légende',
    cumulated_tonnage_in_region: 60,
    cumulated_tonnage_out_region: 40,
    cumulated_exports_value_from_region: 70,
    cumulated_exports_value_from_ext: 30
  }

  // @TODO : rendre la légend interactive : on n'a pas la place d'afficher le texte => se fera on hover

  const legendSizeCoef = width * 0.05;
  const legendTotalTonnage = parseFloat(legendCustomOffice.cumulated_tonnage_out_region) + parseFloat(legendCustomOffice.cumulated_tonnage_in_region)
  // console.log("tonnage total : ", totalTonnage)

  const legendLeftTriangleHeight = parseFloat(legendCustomOffice.cumulated_tonnage_out_region) / legendTotalTonnage * legendSizeCoef;
  const legendRightTriangleHeight = parseFloat(legendCustomOffice.cumulated_tonnage_in_region) / legendTotalTonnage * legendSizeCoef; // je pourrais déduire cette donnée de la taille du triangle gauche

  let legendLeftPath = null
  let legendRightPath = null

  const legendTotalValue = parseFloat(legendCustomOffice.cumulated_exports_value_from_region) + parseFloat(legendCustomOffice.cumulated_exports_value_from_ext)
  const legendInPercentage = parseFloat(legendCustomOffice.cumulated_exports_value_from_region) / legendTotalValue * 100
  // console.log("inPercentage ", datum.label," : ", inPercentage)

  const legendPartialCircle = require('svg-partial-circle')

  let legendStart = null
  let legendEnd = null

  // calcul des angles de départ et d'arrivée de l'arc de cercle, en fonction des données
  legendStart = Math.PI / 2 + (legendInPercentage - 50) / 100 * Math.PI
  legendEnd = Math.PI * 3 / 2 - (legendInPercentage - 50) / 100 * Math.PI

  legendLeftPath = legendPartialCircle(
    0, 0,         // center X and Y
    legendLeftTriangleHeight + legendRightTriangleHeight,              // radius
    legendStart,          // start angle in radians --> Math.PI / 4
    legendEnd             // end angle in radians --> Math.PI * 7 / 4
  )
    .map((command) => command.join(' '))
    .join(' ')

  legendRightPath = legendPartialCircle(
    0, 0,             // center X and Y
    legendLeftTriangleHeight + legendRightTriangleHeight,                  // radius
    legendStart,              // start angle in radians --> Math.PI / 4
    legendEnd - 2 * Math.PI   // end angle in radians --> Math.PI * 7 / 4
  )
    .map((command) => command.join(' '))
    .join(' ')


  return (
    <g className="small-multiples-and-legend-and-title" width={width} height={totalHeight} style={{ border: '1px solid lightgrey' }}>

      <text
      className='title'
      transform={`translate(${width * 0.1}, ${height * 0.025})`}
      // style={{
      //   font-size: '12'
      //   font-weight: 'bold'}}
      > Comparaison des profils de bureaux de Fermes : tournés vers l'extérieur / l'intérieur de leur région </text>

      <g className='legend-object' width={legendWidth} transform={`translate(${width * 0.55}, ${height * 0.9})`}>

        <path className='legend-left-triangle' fill='grey'
          d={`M ${0} ${0}
                          V ${legendLeftTriangleHeight / 2}
                          L ${-Math.pow(5, 0.5) * legendLeftTriangleHeight / 2} ${0}
                          L ${0} ${-legendLeftTriangleHeight / 2}
                          Z
                          `}
        />

        <path className='legend-right-triangle' fill='black'
          d={`M ${0} ${0}
                          V ${legendRightTriangleHeight / 2}
                          L ${Math.pow(5, 0.5) * legendRightTriangleHeight / 2} ${0}
                          L ${0} ${-legendRightTriangleHeight / 2}
                          Z
                          `}
        />

        <>
          {
            legendLeftPath != null ?

              <>
                <path
                  d={`${legendLeftPath}`}
                  stroke='grey'
                  stroke-width={width * 0.005} // à ajuster en fonction de la largeur de l'écran
                  fill="transparent"
                />

                <path
                  d={`${legendRightPath}`}
                  stroke="black"
                  stroke-width={width * 0.005} // à ajuster en fonction de la largeur de l'écran
                  fill="transparent"
                />
              </>
              :
              null
          }
        </>
        <text
          className='label'
          transform={`translate(${-Math.pow(5, 0.5) * (legendLeftTriangleHeight + legendRightTriangleHeight) / 6}, ${- (legendRightTriangleHeight + legendLeftTriangleHeight) / 1.8})`}
          font-size={parseInt(height * 0.013)}
        >
          {legendCustomOffice.name}
        </text>

      </g>


      <g className="small-multiples" width={width * 0.5} height={totalHeight}>

        {
          data.filter(({ name }) => name === 'Le Havre' || name === 'Nantes' || name === 'Bordeaux')

            .map((custom_office, index) => {

              const xIndex = index % numberOfColumns;

              let sizeCoef = width * 0.05;
              const totalTonnage = parseFloat(custom_office.cumulated_tonnage_out_region) + parseFloat(custom_office.cumulated_tonnage_in_region)
              // console.log("tonnage total : ",totalTonnage)

              const leftTriangleHeight = parseFloat(custom_office.cumulated_tonnage_out_region) / totalTonnage * sizeCoef;
              const rightTriangleHeight = parseFloat(custom_office.cumulated_tonnage_in_region) / totalTonnage * sizeCoef; // je pourrais déduire cette donnée de la taille du triangle gauche

              let leftPath = null
              let rightPath = null

              const totalValue = parseFloat(custom_office.cumulated_exports_value_from_region) + parseFloat(custom_office.cumulated_exports_value_from_ext)
              const inPercentage = parseFloat(custom_office.cumulated_exports_value_from_region) / totalValue * 100
              // console.log("inPercentage ", datum.label," : ", inPercentage)

              const partialCircle = require('svg-partial-circle')

              let start = null
              let end = null
              // let transformGeo = {`translate(${x},${y})`} // ce serzit param qui se mmodifie en attribue de positionnement réparti en bas à droite si co sans coords

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

              rightPath = partialCircle(
                0, 0,             // center X and Y
                leftTriangleHeight + rightTriangleHeight,                  // radius
                start,              // start angle in radians --> Math.PI / 4
                end - 2 * Math.PI   // end angle in radians --> Math.PI * 7 / 4
              )
                .map((command) => command.join(' '))
                .join(' ')


              return (
                <g className={`${custom_office.name}-small-multiple`} width={columnWidth} transform={`translate(${width * 0.7}, ${height * 0.9})`}>

                  <g className='double-triangle-and-circle'
                    key={index}
                    // transform={`translate(${(index) * (columnWidth)}, ${height * .33 + (index%3)*(rowHeight)})`}
                    // transform={`translate(${xTransform}, ${yTransform})`}
                    transform={`translate(${xIndex * width * 0.12}, ${0})`}
                  >

                    {/* <circle
                      cx={0}
                      cy={0}
                      r={2}
                      fill='red'
                    /> */}

                    <path className='left-triangle' fill={colorsPalettes.generic.accent2}
                      d={`M ${0} ${0}
                V ${leftTriangleHeight / 2}
                L ${-Math.pow(5, 0.5) * leftTriangleHeight / 2} ${0}
                L ${0} ${-leftTriangleHeight / 2}
                Z
                `}
                    />

                    <path className='right-triangle' fill={colorsPalettes.ui.colorAccentBackground}
                      d={`M ${0} ${0}
                V ${rightTriangleHeight / 2}
                L ${Math.pow(5, 0.5) * rightTriangleHeight / 2} ${0}
                L ${0} ${-rightTriangleHeight / 2}
                Z
                `}
                    />

                    <>
                      {
                        // datum.else.type_of_object === "customs_office" ?
                        leftPath != null ?

                          <>

                            <path
                              d={`${leftPath}
                  `}
                              stroke={colorsPalettes.generic.accent2}
                              stroke-width={width * 0.005} // à ajuster en fonction de la largeur de l'écran
                              fill="transparent"
                            />

                            <path
                              d={`${rightPath}
                  `}
                              stroke={colorsPalettes.ui.colorAccentBackground}
                              stroke-width={width * 0.005} // à ajuster en fonction de la largeur de l'écran
                              fill="transparent"
                            />
                          </>
                          :
                          null
                      }

                      <text
                        className='label'
                        transform={`translate(${-Math.pow(5, 0.5) * (leftTriangleHeight + rightTriangleHeight) / 4}, ${(rightTriangleHeight + leftTriangleHeight) / 1.8})`}
                        font-size={parseInt(height * 0.013)}
                      >
                        {custom_office.name}
                      </text>
                    </>
                  </g>



                </g>);

            })
        }

      </g>
    </g>

  );

}

export function renderTriangles({ data, width, height, projection }) {
  // console.log("data : layder.data ", data)
  return (<TriangleComponent
    data={data}
    totalWidth={width} // @TODO : il faudrait réduire cette width 
    rowHeight={height * 0.3}
    projection={projection}
  />);
}


// trash code
/* eslint-disable */
{/* { showLegend?
        // create an exemple object for the legend that has all required properties for the viz
        

        let sizeCoef = width * 0.05;
        // const totalTonnage = parseFloat(custom_office.cumulated_tonnage_out_region) + parseFloat(custom_office.cumulated_tonnage_in_region)
        // console.log("tonnage total : ",totalTonnage)

        // const leftTriangleHeight = parseFloat(custom_office.cumulated_tonnage_out_region) / totalTonnage * sizeCoef;
        // const rightTriangleHeight = parseFloat(custom_office.cumulated_tonnage_in_region) / totalTonnage * sizeCoef; // je pourrais déduire cette donnée de la taille du triangle gauche

        // let leftPath = null
        // let rightPath = null

        // const totalValue = parseFloat(custom_office.cumulated_exports_value_from_region) + parseFloat(custom_office.cumulated_exports_value_from_ext)
        // const inPercentage = parseFloat(custom_office.cumulated_exports_value_from_region) / totalValue * 100
        // // console.log("inPercentage ", datum.label," : ", inPercentage)

        // const partialCircle = require('svg-partial-circle')

        // let start = null
        // let end = null

        // // calcul des angles de départ et d'arrivée de l'arc de cercle, en fonction des données
        // start = Math.PI / 2 + (inPercentage - 50) / 100 * Math.PI
        // end = Math.PI * 3 / 2 - (inPercentage - 50) / 100 * Math.PI

        // leftPath = partialCircle(
        // 0, 0,         // center X and Y
        // leftTriangleHeight + rightTriangleHeight,              // radius
        //         start,          // start angle in radians --> Math.PI / 4
        //         end             // end angle in radians --> Math.PI * 7 / 4
        // )
        //         .map((command) => command.join(' '))
        // .join(' ')

        // rightPath = partialCircle(
        // 0, 0,             // center X and Y
        // leftTriangleHeight + rightTriangleHeight,                  // radius
        //         start,              // start angle in radians --> Math.PI / 4
        //         end - 2 * Math.PI   // end angle in radians --> Math.PI * 7 / 4
        // )
        //         .map((command) => command.join(' '))
        // .join(' ')

        :
        // console.log("hey ==> no legend");
        // return (
        //   <text> text </text>
        // )
        sizeCoef = 2;

        return(
          <g className='double-triangle-and-circle'
            key={index}
            // transform={`translate(${(index) * (columnWidth)}, ${height * .33 + (index%3)*(rowHeight)})`}
            // transform={`translate(${xTransform}, ${yTransform})`}
            transform={`translate(${xIndex * width * 0.12}, ${0})`}
            >

            {/* <circle
              cx={0}
              cy={0}
              r={2}
              fill='red'
            /> */}

{/* <path className='left-triangle' fill='rgb(39, 129, 141)'
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
                leftPath != null ?

                  <>
                    <path
                      d={`${leftPath}`}
                      stroke={colorsPalettes.generic.dark}
                      stroke-width={width * 0.005} // à ajuster en fonction de la largeur de l'écran
                      fill="transparent"
                    />

                    <path
                      d={`${rightPath}`}
                      stroke={colorsPalettes.generic.accent2}
                      stroke-width={width * 0.005} // à ajuster en fonction de la largeur de l'écran
                      fill="transparent"
                    />
                  </>
                  :
                  null
              }
            </>
          </g>

          );
        
        
        } */}