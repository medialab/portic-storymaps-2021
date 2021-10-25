/* DOCUMENTATION : API de ce TriangleChart

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

import { scaleLinear } from 'd3-scale';
import { max } from 'd3-array';
import cx from 'classnames';

import './TriangleChart.scss'
import colorsPalettes from '../../colorPalettes';

// import TriangleLegend from './TriangleLegend';
import PortGroup from './PortGroup';


/**
 * Returns triangles comparison visualization (for viz 3.1)
 * @param {array} data
 * @param {number} totalWidth
 * @param {number} legendWidth - portion in [0,1]
 * @param {object} margins
 * @param {number} rowHeight
 * @param {function} projection
 * @param {string} projectionTemplate
 * @param {boolean} atlasMode
 * @returns {React.ReactElement} - React component
 */
const TriangleChart = ({
  data,
  totalWidth = 1200,
  legendWidth = 0.1,
  margins: inputMargins,
  rowHeight = 200,
  projection,
  projectionTemplate,
  atlasMode
}) => {

  const margins = inputMargins ||  {
    left: totalWidth * .1,
    right: totalWidth * .1
  }
  // {
  //   left: 0.0,
  //   right: 0.09
  // }
  const numberOfColumns = data.length;
  const columnWidth = (totalWidth - margins.left - margins.right) / (numberOfColumns) // (totalWidth * (1 - legendWidth - margins.left - margins.right)) / numberOfColumns; // (totalWidth) / (numberOfColumns + 4) //
  const numberOfRows = data.length / numberOfColumns;
  const totalHeight = numberOfRows * rowHeight;
  const fontSize = totalHeight * 0.05;


  // scaleLinear<Range = number, Output = Range, Unknown = never>(range?: Iterable<Range>): ScaleLinear<Range, Output, Unknown> (+1 overload)
  const scaleX = scaleLinear().domain([
    0,
    max(
      data.map((port) => { // data.map : boucle fonctionelle
        // return +port[xVariable];
        return +port.nb_pointcalls_out;
      })
    )
    // ]).range([0, columnWidth * 5]); // @TODO : adapter pour permettre chevauchement => ne plus se limiter à la taille d'une colonne (+ centre de mon triangle à gérer)
  ]).range([5, columnWidth * 5]); // @TODO : adapter pour permettre chevauchement => ne plus se limiter à la taille d'une colonne (+ centre de mon triangle à gérer)

  const scaleY = scaleLinear().domain([
    0,
    max(
      data.map((port) => {
        return +port.mean_tonnage; // parseFloat(port.mean_tonnage);
      })
    )
  ]).range([5, rowHeight * 0.85]); // pour l'instant j'ai mis le max de longueur à 85% de la hauteur du rectangle conteneur 
  // je pourrais faire  range([0, rowHeight - place occupée par le texte]

  // const legendTriangleWidth = 35;
  // const legendTriangleHeight = 60;

  return (

    <g className={cx("TriangleChart", {'is-atlas-mode': atlasMode})}>

      <defs>
        <linearGradient id="TriangleGradient" x2='0%' y2='100%'>
          <stop offset="10%" stopColor={`rgb(100,100,100)`} stop-opacity={0.6} />
          <stop offset="100%" stopColor={colorsPalettes.generic.dark} />
          {/* <stop offset="20%" stopColor={colorsPalettes.generic.dark} />
          <stop offset="100%" stopColor={colorsPalettes.generic.dark} stop-opacity={0.3} /> */}
        </linearGradient>
      </defs>
      {/* <TriangleLegend
        {
        ...{
          legendWidth,
          totalWidth,
          totalHeight,
          legendTriangleWidth,
          legendTriangleHeight,
          rowHeight,
          fontSize,
        }
        }
      /> */}
      <g className="triangles">
        {
          // sorting groups regarding their projected projection on the horizontal axis (to avoid lines crossings)
          data.sort((a, b) => {
            const [xa] = projection([+a.longitude, +a.latitude]);
            const [xb] = projection([+b.longitude, +b.latitude]);

            if (xa > xb) {
              return 1;
            }
            return -1;
          })
            .map((port, index) => {

              return (
                <PortGroup
                  key={index}
                  {
                  ...{
                    numberOfColumns,
                    port,
                    scaleX,
                    scaleY,
                    legendWidth,
                    columnWidth,
                    totalHeight,
                    totalWidth,
                    projection,
                    index,
                    margins,
                    rowHeight,
                    fontSize,
                    projectionTemplate
                  }
                  }
                />
              )
            })

        }
        <defs>
            <marker id="triangle-left" viewBox="0 0 10 10"
              refX="1" refY="5"
              markerUnits="strokeWidth"
              markerWidth={legendWidth * totalWidth * 0.04} 
              markerHeight={rowHeight * 0.02}
              orient="auto">
              <path d="M 10 0 L 0 5 L 10 10 Z" fill="darkgrey" />
            </marker>
            <marker id="triangle-right" viewBox="-10 0 10 10"
              refX="1" refY="5"
              markerUnits="strokeWidth"
              markerWidth={legendWidth * totalWidth * 0.04} 
              markerHeight={rowHeight * 0.024}
              orient="auto">
              <path d="M -10 0 L 0 5 L -10 10 Z" fill="darkgrey" />
            </marker>
          </defs>
      </g>

    </g>
  )

}

export default TriangleChart;