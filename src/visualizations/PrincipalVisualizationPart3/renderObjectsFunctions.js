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
import { useMemo, useState } from 'react';

import colorsPalettes from '../../colorPalettes';

import ExtraversionObject from './ExtraversionObject';

import TriangleChart from '../../components/TriangleChart/TriangleChart';
import { fixSvgDimension } from '../../helpers/misc';

export function Label(datum, projection, { width }) { // à terme on pourrait mettre un objet 

  const [x, y] = projection([+datum.longitude, +datum.latitude])

  return (
    <g transform={`translate(${x},${y})`}>
      <text size={width * 0.05}>{datum.label}</text>
    </g>);
}

function Step3Object({
  datum,
  projection,
  width: inputWidth,
  height: inputHeight,
  projectionTemplate,
  isActive,
  isMinified,
  onClick
}) { // à priori plus besoin de datum et de width qui sont déjà passés au composant CustomObjectLayer
  const width = fixSvgDimension(inputWidth);
  const height = fixSvgDimension(inputHeight);
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
  if (projectionTemplate.includes('Poitou')) {
    if (datum.name === 'Tonnay-Charente') {
      noOverlapTransform = `translate(${x + width * 0.15},${y})`
    }
    else if ((datum.name === 'Rochefort')) {
      noOverlapTransform = `translate(${x + width * 0.04},${y - height * 0.0})`
    }
    else if ((datum.name === 'Marennes')) {
      noOverlapTransform = `translate(${x - width * 0.03},${y + height * 0.05})`
    }
    else if ((datum.name === 'Marans')) {
      noOverlapTransform = `translate(${x + width * 0.03},${y - height * 0.05})`
    }
    else if ((datum.name === 'Saint-Martin-de-Ré')) {
      noOverlapTransform = `translate(${x - width * 0.06},${y})`
    }
    else if ((datum.name === `Les Sables-d'Olonne`)) {
      noOverlapTransform = `translate(${x - width * 0.01},${y - height * 0.03})`
    }
  }
  

  const transformGroup = projectionTemplate === 'France' ? noOverlapTransform + ' scale(0.1)' : noOverlapTransform + ` scale(${isMinified ? 0.5 : 1})`;
  return (
    <ExtraversionObject
      {
      ...{
        transformGroup,
        navigoValues: [navigoMetric1, navigoMetric2],
        toflitPct: !isNaN(inPercentage) ? inPercentage : 100,
        circleRadius,
        width,
        height,
        name: datum.name,
        isActive,
        isMinified,
        onClick
      }
      }
    />
  )
}

export function Step3Objects({
  data: { customsOffices = [], ports = [] },
  projection,
  width: inputWidth,
  height: inputHeight,
  projectionTemplate
}) {
  const width = fixSvgDimension(inputWidth);
  const height = fixSvgDimension(inputHeight);
  const [selectedBureau, setSelectedBureau] = useState(undefined);
  const handleClick = (name) => {
    if (name === selectedBureau) {
      setSelectedBureau(undefined);
    } else setSelectedBureau(name);
  }

  const visiblePorts = useMemo(() => {
    if (selectedBureau) {
      return ports.filter(d => d.customs_office === selectedBureau)
    }
    return [];
  }, [selectedBureau, ports])

  const partsSpaceStartX = 15;
  const portsSpaceStartY = height * 0.18;
  const portsSpaceHeight = height * 0.55;
  const portsSpaceWidth = width * .35;

  const portRowHeight = visiblePorts.length ?  portsSpaceHeight / visiblePorts.length : portsSpaceHeight;

  return (
    <g className="Step3Objects">
      {
        selectedBureau ?
          <g className="ports-details">
            <foreignObject
              x={0}
              y={0}
              width={width * .4}
              height={height / 2}
              className="ports-details-title"
            >
              <h5>Ports associés au bureau des fermes de {selectedBureau} ({visiblePorts.length})</h5>
            </foreignObject>
            <g
              className="ports-space"
              transform={`translate(${partsSpaceStartX}, ${portsSpaceStartY})`}
            >
              {/* <rect
                x={0}
                y={0}
                width={portsSpaceWidth}
                height={portsSpaceHeight}
                style={{ fill: 'red' }}
              /> */}
              {
                visiblePorts
                .sort((a, b) => {
                  const [_xA, yA] = projection([+a.longitude, +a.latitude]);/* eslint no-unused-vars : 0 */
                  const [_xB, yB] = projection([+b.longitude, +b.latitude]);/* eslint no-unused-vars : 0 */
                  if (yA > yB) {
                    return 1;
                  }
                  return -1;
                })
                .map((port, portIndex) => {
                  const [x, y] = projection([+port.longitude, +port.latitude]);
                  const initialCircleRadius = width * 0.05;
                  let circleRadius = initialCircleRadius;
                  const totalTonnage = parseFloat(port.cumulated_tonnage_out_region) + parseFloat(port.cumulated_tonnage_in_region)

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
                  const navigoMetric1 = parseFloat(port.cumulated_tonnage_out_region) / totalTonnage; // portion for left triangle
                  const navigoMetric2 = parseFloat(port.cumulated_tonnage_in_region) / totalTonnage; // portion for right triangle
                  const objectX = portsSpaceWidth / 2 - initialCircleRadius * 2 + (visiblePorts.length > 5 ? portIndex % 2 === 0 ? 0 : initialCircleRadius * 2 : 0);
                  const objectY = portRowHeight * portIndex;
                  // const transformGroup = projectionTemplate === 'France' ? `translate(${x},${y})` + ' scale(0.1)' : `translate(${x},${y})` + ` scale(1)`;
                  const transformGroup = `translate(${objectX}, ${objectY})`;
                  return (
                    <g className="port-group" key={port.name}>
                      <line
                        x1={objectX}
                        y1={objectY}
                        x2={x - partsSpaceStartX}
                        y2={y - portsSpaceStartY}
                      />
                      <circle
                        cx={x - partsSpaceStartX}
                        cy={y - portsSpaceStartY}
                        r={width * 0.002}
                        style={{ fill: colorsPalettes.generic.dark }}
                        className="marker"
                      />
                      <ExtraversionObject
                        {
                        ...{
                          transformGroup,
                          navigoValues: [navigoMetric1, navigoMetric2],
                          circleRadius,
                          width,
                          height,
                          name: port.name,
                        }
                        }
                      />
                    </g>
                  )
                })
              }
            </g>

          </g>
          : null
      }
      {
        customsOffices.map((datum, index) => (
          <Step3Object
            key={datum.name}
            {
            ...{
              datum,
              projection,
              width,
              height,
              projectionTemplate,
              onClick: handleClick,
              isActive: datum.name === selectedBureau,
              isMinified: selectedBureau && datum.name !== selectedBureau
            }
            }
          />
        ))
      }
    </g>
  )
}

export function SmallMultiples({ 
  data, 
  width: inputWidth, 
  height: inputHeight, 
  projection 
}) {
  const width = fixSvgDimension(inputWidth);
  const height = fixSvgDimension(inputHeight);
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
      {/* <foreignObject
        x={margin * 4}
        y={multiplesY - circleRadius * 4}
        width={circleRadius * 7}
        height={height}
        className="interaction-cta"
      >
        <div>
          cliquer sur un bureau des fermes pour voir le détail de ses ports
        </div>
      </foreignObject> */}
      <rect
        x={xObjectsStart + margin * 2}
        y={multiplesY - circleRadius * 3}
        width={width - xObjectsStart - margin * 4}
        height={height - multiplesY + circleRadius * 3 - margin / 2}
        style={{ fill: 'white' }}
        opacity={0.5}
      />
      <foreignObject
        x={xObjectsStart + circleRadius * 1.5}
        y={multiplesY - circleRadius * 3}
        width={(circleRadius * 2 + margin) * (bureaux.length - 1)}
        height={height}
      >
        <div style={{ position: 'relative' }}>
          <h5 className="visualization-title" style={{ position: 'absolute', left: 0, bottom: 0 }}>
            Comparaison avec les bureaux de fermes et ports dominants d'autres directions en 1787
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
                      transformGroup: `translate(${circleRadius * legendFactor * 4 + margin + index * (circleRadius * legendFactor + margin)}, ${multiplesY - (circleRadius * legendFactor - circleRadius)})`,
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

export function renderTriangles({ 
  data, 
  width: inputWidth, 
  height: inputHeight, 
  projection, 
  projectionTemplate, atlasMode 
}) {
  const width = fixSvgDimension(inputWidth);
  const height = fixSvgDimension(inputHeight);
  // console.log("data : layder.data ", data)
  return (
    <TriangleChart
      data={data}
      totalWidth={width} // @TODO : il faudrait réduire cette width 
      rowHeight={height * 0.3}
      projection={projection}
      projectionTemplate={projectionTemplate}
      atlasMode={atlasMode}
    />
  );
}