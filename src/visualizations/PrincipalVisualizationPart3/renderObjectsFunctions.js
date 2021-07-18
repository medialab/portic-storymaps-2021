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

import ExtraversionObject from './ExtraversionObject';

import TriangleComponent from '../../components/TriangleComponent/TriangleComponent';

export function Label(datum, projection, { width }) { // à terme on pourrait mettre un objet 

  const [x, y] = projection([+datum.longitude, +datum.latitude])

  return (
    <g transform={`translate(${x},${y})`}>
      <text size={width * 0.05}>{datum.label}</text>
    </g>);
}


export function Step3Object({
  datum,
  projection,
  width,
  height,
  projectionTemplate
}) { // à priori plus besoin de datum et de width qui sont déjà passés au composant CustomObjectLayer

  const [x, y] = projection([+datum.longitude, +datum.latitude]);
  
  let circleRadius = width * 0.05;
  const totalTonnage = parseFloat(datum.cumulated_tonnage_out_region) + parseFloat(datum.cumulated_tonnage_in_region)

  if (datum.type_of_object === "port") {
    // définition des coefficients de taille des triangles en 3 classes distinctes (pour l'instant la définition des classes est expérimentale)
    // se gérerait bien avec un switch
    if (totalTonnage < 1000) { // * 1000
      circleRadius = width * 0.025
    }
    else {
      if (totalTonnage > 5000) {
        circleRadius = width * 0.075
      }
    }
  }

  const navigoMetric1 = parseFloat(datum.cumulated_tonnage_out_region) / totalTonnage; // portion for left triangle
  const navigoMetric2 = parseFloat(datum.cumulated_tonnage_in_region) / totalTonnage; // portion for right triangle
  let inPercentage = 0;
  if (datum.type_of_object === "customs_office") {
    const totalValue = parseFloat(datum.cumulated_exports_value_from_region) + parseFloat(datum.cumulated_exports_value_from_ext)
    inPercentage = parseFloat(datum.cumulated_exports_value_from_region) / totalValue * 100
    inPercentage = inPercentage === 100 ? 99.99 : inPercentage;
  }

  // handle overlap 
  let noOverlapTransform = `translate(${x},${y})` // mettre entre accolades ??
  if (datum.name === 'Tonnay-Charente') {
    noOverlapTransform = `translate(${x + width * 0.03},${y})`
  }
  else if ((datum.name === 'Rochefort')) {
    noOverlapTransform = `translate(${x - width * 0.03},${y})`
  }

  const transformGroup = projectionTemplate === 'France' ? noOverlapTransform + ' scale(0.1)' : noOverlapTransform + ' scale(1)';
  return (
    <ExtraversionObject
      {
        ...{
          transformGroup,
          navigoValues: [navigoMetric1, navigoMetric2],
          toflitPct: inPercentage,
          circleRadius,
          width,
          height,
          name: datum.name,
        }
      }
    />
  )
}

export function SmallMultiples({ data, width, height, projection }) {
  // could be parametered in props too
  const bureaux = data.filter(({ name }) => name === 'Le Havre' || name === 'Nantes' || name === 'Bordeaux' || name === 'La Rochelle')
  .sort((a, b) => {
    if (a.cumulated_exports_value_from_region > b.cumulated_exports_value_from_region) {
      return -1;
    }
    return 1;
  })
  const legendCustomOffice = {
    name: 'Légende',
    cumulated_tonnage_in_region: 60,
    cumulated_tonnage_out_region: 60,
    cumulated_exports_value_from_region: 50,
    cumulated_exports_value_from_ext: 50,
    legendMode: true
  }
  bureaux.unshift(legendCustomOffice)

  const margin = 15;
  let circleRadius = width * 0.05;
  const multiplesY = height - circleRadius - margin * 2;

  const legendFactor = 1;

  const columnWidth = (circleRadius * 2 + margin);

  const xObjectsStart = width * .4 // circleRadius * legendFactor + circleRadius + margin;

  return (
    <g className="small-multiples-and-legend-and-title">

      {/* <Legend
        {
        ...{
          width,
          height
        }
        }
      /> */}
      <rect
        x={xObjectsStart + margin * 2}
        y={multiplesY - circleRadius * 3}
        width={width - xObjectsStart - margin * 4}
        height={height - multiplesY + circleRadius * 3 - margin / 2}
        style={{fill: 'white'}}
        opacity={0.5}
      />
      <foreignObject
        x={xObjectsStart + circleRadius * 1.5}
        y={multiplesY - circleRadius * 3}
        width={(circleRadius * 2 + margin) * (bureaux.length - 1)}
        height={height}
      >
        <div style={{position: 'relative'}}>
          <h5 className="visualization-title" style={{position: 'absolute', left: 0, bottom: 0}}>
            Comparaison avec les bureaux de fermes et ports dominants d'autres directions
          </h5>
        </div>
      </foreignObject>
      <g className="small-multiples">
        {
          bureaux
            .map((custom_office, index) => {
              const totalTonnage = parseFloat(custom_office.cumulated_tonnage_out_region) + parseFloat(custom_office.cumulated_tonnage_in_region)

              const navigoMetric1 = parseFloat(custom_office.cumulated_tonnage_out_region) / totalTonnage; // portion for left triangle
              const navigoMetric2 = parseFloat(custom_office.cumulated_tonnage_in_region) / totalTonnage; // portion for right triangle

              const totalValue = parseFloat(custom_office.cumulated_exports_value_from_region) + parseFloat(custom_office.cumulated_exports_value_from_ext)
              const inPercentage = parseFloat(custom_office.cumulated_exports_value_from_region) / totalValue * 100
            
                return custom_office.legendMode ?
                (
                  <ExtraversionObject
                  {
                    ...{
                      transformGroup: `translate(${circleRadius * legendFactor * 4 + margin + index * (circleRadius * legendFactor + margin)}, ${multiplesY - (circleRadius * legendFactor  - circleRadius)})`,
                      navigoValues: [navigoMetric1, navigoMetric2],
                      toflitPct: inPercentage,
                      circleRadius: circleRadius * legendFactor,
                      width,
                      height,
                      name: custom_office.name,
                      legendMode: custom_office.legendMode
                    }
                  }
                />
                )
                : (
                  <ExtraversionObject
                  {
                    ...{
                      transformGroup: `translate(${xObjectsStart + index * columnWidth}, ${multiplesY})`,
                      navigoValues: [navigoMetric1, navigoMetric2],
                      toflitPct: inPercentage,
                      circleRadius,
                      width,
                      height,
                      name: custom_office.name,
                      legendMode: custom_office.legendMode
                    }
                  }
                />
                )
            })
        }

      </g>
      <defs>
        <marker id="triangle-end" viewBox="-10 0 10 10"
          refX="1" refY="5"
          markerUnits="strokeWidth"
          markerWidth={width * 0.01} 
          markerHeight={width * 0.01}
          orient="auto">
          <path d="M -10 0 L 0 5 L -10 10 Z" fill="darkgrey" />
        </marker>
      </defs>
    </g>
  );

}

export function renderTriangles({ data, width, height, projection, projectionTemplate }) {
  // console.log("data : layder.data ", data)
  return (
    <TriangleComponent
      data={data}
      totalWidth={width} // @TODO : il faudrait réduire cette width 
      rowHeight={height * 0.3}
      projection={projection}
      projectionTemplate={projectionTemplate}
    />
  );
}