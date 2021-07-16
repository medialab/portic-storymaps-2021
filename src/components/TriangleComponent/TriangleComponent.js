<<<<<<< HEAD
/* DOCUMENTATION : API de ce TriangleComponent

  Principe :
    Composant conçu spécifiquement pour les triangles de la viz 3.1, mais pourrait être décliné
    -> permet de produire une série d'objets en SVG, qui se disposent dans une grille en fonction de la longueur du dataset, et les dimensions de cette grille sont paramètrables

  Paramètres : 
    data : données à afficher sur la carte,
    totalWidth : largeur totale du composant (1 objet de légende + grille d'objets) (par défaut à 1200 px)
    legendWidth : largeur de la légende (par défaut à un dizième de la largeur totale)
    margins : marges de gauche (entre l'objet de la légende et la grille) et de froite (entr la droite de la grille et l'extrémité droite de l'écran)
    rowHeight : hauteur d'une ligne de la grille (par défaut à 200px)
    projection : on passe en paramètre la projection de d3 geo pour pouvoir donner accès au positionnement géographique sur une carte (permet dans le cas de la viz 3.1 de lier les triangles au point de localisation géographique du port qu'ils représentent => point et triangle sont nesté dans un même objet, ce qui permet d'établir une courbe pointillée entre eux et gérer l'interaction avec des jeux d'opacité au hover)

  Pistes d'amélioration : 
  - filtrer les objets à l'entrée ? (par exemple pour la viz 3.1 on pourrait choisir d'afficher le triangle associé à un port que si les dimensions dépassent un certain seuil) => cela permettrait d'alléger la carte, en affichant seulement les ports pour lesquels on a des données représentatives

  @TODO : documenter ce component de maière standardisée
  */

import React from 'react';
import { scaleLinear } from 'd3-scale';
import { max } from 'd3-array';

import './TriangleComponent.scss'
import colorsPalettes from '../../colorPalettes';


const TriangleComponent = ({
  data,
  totalWidth = 1200,
  legendWidth = 0.1,
  margins = {
    left: 0.0,
    right: 0.09
  },
  rowHeight = 200,
  projection
}) => {

  const numberOfColumns = data.length
  const columnWidth = (totalWidth * (1 - legendWidth - margins.left - margins.right)) / numberOfColumns
  const numberOfRows = data.length / numberOfColumns
  const totalHeight = numberOfRows * rowHeight
  const fontSize = totalHeight * 0.05

  // scaleLinear<Range = number, Output = Range, Unknown = never>(range?: Iterable<Range>): ScaleLinear<Range, Output, Unknown> (+1 overload)
  const scaleX = scaleLinear().domain([
    0,
    max(
      data.map((port) => { // data.map : boucle fonctionelle
        // return +port[xVariable];
        return +port.nb_pointcalls_out;
      })
    )
  ]).range([0, columnWidth * 5]); // @TODO : adapter pour permettre chevauchement => ne plus se limiter à la taille d'une colonne (+ centre de mon triangle à gérer)

  const scaleY = scaleLinear().domain([
    0,
    max(
      data.map((port) => {
        return +port.mean_tonnage; // parseFloat(port.mean_tonnage);
      })
    )
  ]).range([0, rowHeight * 0.85]); // pour l'instant j'ai mis le max de longueur à 85% de la hauteur du rectangle conteneur 
  // je pourrais faire  range([0, rowHeight - place occupée par le texte]

  const legendTriangleWidth = 35;
  const legendTriangleHeight = 60;

  return (

    <g className="TriangleComponent" width={totalWidth} height={totalHeight} style={{ border: '1px solid lightgrey' }}>

      <defs>
        <linearGradient id="TriangleGradient" x2='0%' y2='100%'>
          <stop offset="20%" stop-color={colorsPalettes.generic.dark} />
          <stop offset="100%" stop-color={colorsPalettes.generic.dark} stop-opacity={0.3} />
        </linearGradient>
      </defs>
      <g className="TriangleLegend" width={legendWidth} transform={`translate(${legendWidth * totalWidth * 0.5}, ${totalHeight * 2.3})`} >
        <g classname="arrows">
          <path
            d={`M ${(legendWidth - legendTriangleWidth) / 2} ${(rowHeight - legendTriangleHeight) / 1.2} 
                        H ${(legendWidth - legendTriangleWidth) / 2 + legendTriangleWidth}
                        L ${legendWidth / 2} ${(rowHeight - legendTriangleHeight) / 1.2 + legendTriangleHeight}
                        Z
                        `}
          />

          <g className="top-arrow">
            <defs>
              <marker id="triangle-left" viewBox="0 0 10 10"
                refX="1" refY="5"
                markerUnits="strokeWidth"
                markerWidth={legendWidth * totalWidth * 0.08} markerHeight={rowHeight * 0.04}
                orient="auto">
                <path d="M 10 0 L 0 5 L 10 10 Z" fill="black" />
              </marker>
              <marker id="triangle-right" viewBox="-10 0 10 10"
                refX="1" refY="5"
                markerUnits="strokeWidth"
                markerWidth={legendWidth * totalWidth * 0.08} markerHeight={rowHeight * 0.04}
                orient="auto">
                <path d="M -10 0 L 0 5 L -10 10 Z" fill="black" />
              </marker>
            </defs>
            <path d={`M ${(legendWidth - legendTriangleWidth) / 2} ${(rowHeight - legendTriangleHeight) / 1.3}  
                    H ${(legendWidth - legendTriangleWidth) / 2 + legendTriangleWidth}
                    `} stroke="black" strokeWidth={1} marker-start="url(#triangle-left)" marker-end="url(#triangle-right)" />
          </g>

          <g className="left-arrow">
            <defs>
              <marker id="triangle-left" viewBox="-10 0 10 10"
                refX="1" refY="5"
                markerUnits="strokeWidth"
                markerWidth={legendWidth * totalWidth * 0.08} markerHeight={rowHeight * 0.04}
                orient="auto">
                <path d="M 0 0 L -10 5 L 0 10 Z" fill="black" />
              </marker>
              <marker id="triangle-right" viewBox="0 0 10 10"
                refX="1" refY="5"
                markerUnits="strokeWidth"
                markerWidth={legendWidth * totalWidth * 0.08} markerHeight={rowHeight * 0.04}
                orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 Z" fill="black" />
              </marker>
            </defs>
            <path d={`M ${(legendWidth - legendTriangleWidth) / 1.6} ${(rowHeight - legendTriangleHeight) / 1.2}  
                    V ${(rowHeight - legendTriangleHeight) / 1.2 + legendTriangleHeight}
                    `} stroke="black" strokeWidth={1} marker-start="url(#triangle-left)" marker-end="url(#triangle-right)" />
          </g>

        </g>

        <g className="textLegend">
          {/* <text className="legendTitle"
            // transformOrigin="top left"
            // transform="rotate (-45)"
            font-size={totalHeight * 0.07}
            font-weight="bold"
            // x={legendWidth / 2}
            x={0}
            y={(rowHeight - legendTriangleHeight) / 2}
          // text-anchor="left"
          > Légende </text> */}

          <g transform={`translate(${legendWidth / 2 + fontSize / 2}, ${(rowHeight - legendTriangleHeight) / 1.4})`}>
            <text className="legendContent"
              font-size={fontSize}
            > nombre de navires</text>
          </g>

          <g transform={`translate(${(legendWidth - legendTriangleWidth) / 1.2}, ${(rowHeight - legendTriangleHeight) / 1.2 + legendTriangleHeight / 2})`}>
            <text className="legendContent"
              font-size={fontSize}
            > tonnage moyen des navires </text>
          </g>
        </g>

      </g>
      <g className="triangles" width={totalWidth * (1 - margins.left - margins.right - legendWidth)}>
        {
          data.sort((a, b) => {
            const [xa] = projection([+a.longitude, +a.latitude]);
            const [xb] = projection([+b.longitude, +b.latitude]);

            if (xa > xb) {
              return 1;
            }
            return -1;

          })
          .map((port, index) => {

            const triangleWidth = scaleX(+port.nb_pointcalls_out)
            const triangleHeight = scaleY(+port.mean_tonnage)

            const xIndex = index % numberOfColumns;
            // const yIndex = (index - index % numberOfColumns) / numberOfColumns;
            const xTransform = xIndex * columnWidth + (legendWidth + margins.left) * totalWidth;
            const yTransform = totalHeight * 2.3;

            const [x, y] = projection([+port.longitude, +port.latitude]);

            return (
              <g className='port-point-and-triangle'>
                
                <line
                  x1={xTransform + columnWidth/2}
                  y1={yTransform + rowHeight / 7}
                  x2={x}
                  y2={y}
                  stroke='grey'
                  strokeDasharray='2, 8'
                  />

                <g className='port-point' transform={`translate(${x}, ${y})`}>
                  <circle
                    key={index}
                    cx={0}
                    cy={0}
                    r={totalHeight * 0.035}
                    style={{ fill: colorsPalettes.generic.dark }}
                    className="marker"
                  />
                </g>

                <g className='port-triangle'
                  key={index}
                  // transform={`translate(${(index) * (columnWidth)}, ${height * .33 + (index%3)*(rowHeight)})`}
                  transform={`translate(${xTransform}, ${yTransform})`}
                >
                  <rect
                    x={0}
                    y={0}
                    width={columnWidth}
                    height={rowHeight}
                  />

                  <path class='horizontalLine'
                    d={`M ${columnWidth / 2} ${(rowHeight - triangleHeight) / 1.2} 
                        V ${rowHeight / 7}
                        `}
                  />

                  <path className='triangle'
                    d={`M ${(columnWidth - triangleWidth) / 2} ${(rowHeight - triangleHeight) / 1.2} 
                        H ${(columnWidth - triangleWidth) / 2 + triangleWidth}
                        L ${columnWidth / 2} ${(rowHeight - triangleHeight) / 1.2 + triangleHeight}
                        Z
                        `}
                    fill="url(#TriangleGradient)"
                  />


                  <g className='label' transformOrigin="bottom left" transform={`translate(${columnWidth / 2}, ${rowHeight / 7 - totalHeight * 0.025})`}>

                    <text
                      transformOrigin="bottom left"
                      transform="rotate (-45)"
                      font-size={fontSize}
                      x={0}
                      y={0}
                      text-anchor="left"
                    > {port.port} </text>
                  </g>

                </g>
              </g>
            )
          })

        }
      </g>

    </g>
  )

}

export default TriangleComponent;