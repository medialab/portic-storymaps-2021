/* DOCUMENTATION : API de ce GéoComponent

  Principe :
    Composants réutilisable pour toutes les cartes utilisés sur les sites PORTIC
    cartographie en SVG
    -> permet de faire des cartes choroplèthes, de représenter des ports, des flux de navires, ...

  Paramètres : 
    * width : largeur de la carte (par défaut à 1500 px)
    * height : hauteur de la carte (par défaut à 1500 px)

    * layers : différentes couches de la carte ('choropleth', 'points', 'flows', 'custom'), à chaque layer il faut donner un fichier de données (stocké dans public/data) pour construire le objets qui le constituent, les couleurs, tailles, labels de ces objets sont paramètrables 
        si layer 'custom' choisi, il faut passer au layer une fonction d'affichage des données :
        - renderObject : donner un objet de donnée en paramètre, la fonction s'occupe de construire sa représentation SVG et de la positionner individuellement sur la carte
        - renderObjects : donner un dataset, la fonction s'occupe de construire une représentation SVG de l'ensemble des objets, et de gérer leurs positionnement sur la carte (souvent adapté quand le positionnement n'est pas géographique, qu'on a besoin de gérer les espacements entre objets ...)

    * projectionTemplate : configuration de carte utilisée fréquemment ('France', 'coast from Nantes to Bordeaux', 'Poitou', 'rotated Poitou')
    * projectionConfig: configuration de carte customisée (ce paramètre prime sur projectionTemplate si les 2 sont données en même temps)

    * debug : permet d'ajuster manuellement la configuration de la carte quand true (les paramètres de zoom, les coordonnées du centre, la rotation et les translations sont ajustables)
    
  @TODO : documenter ce component de manière standardisée
  */


import React, { useState, useMemo, useEffect } from 'react';
import ReactTooltip from 'react-tooltip';
import { geoEqualEarth } from "d3-geo";
import ChoroplethLayer from './ChoroplethLayer';
import PointsLayer from './PointsLayer';
import FlowsLayer from './FlowsLayer';
import CustomObjectLayer from './CustomObjectLayer';
// import TriangleChart from '../TriangleChart/TriangleChart';
import Button from './Button';
import Input from './Input';
import Legend from './Legend';

import './GeographicMapChart.scss'
import { fixSvgDimension } from '../../helpers/misc';


const GeographicMapChart = ({
  width: inputWidth = 1500,
  height: inputHeight = 1500,
  title,
  layers = [],
  projectionTemplate: initialProjectionTemplate,
  projectionConfig: inputProjectionConfig, // customed config that will overwrite a template (optional argument) 
  debug = false, // @TODO : à réparer
  withLegend,
}) => {
  const width = fixSvgDimension(inputWidth);
  const height = fixSvgDimension(inputHeight);
  // viz params variables
  const [scale, setScale] = useState(200)
  const [rotation, setRotation] = useState(0)
  const [translationX, setTranslationX] = useState(width / 2)
  const [translationY, setTranslationY] = useState(height / 2)
  const [centerX, setCenterX] = useState(-1.7475027) // -1.7475027 pour centrer sur région
  const [centerY, setCenterY] = useState(46.573642) // 46.573642

  const [projectionTemplate, setProjectionTemplate] = useState(initialProjectionTemplate)

  // trick for nice animations
  useEffect(() => {
    // setTimeout(() => {
      setProjectionTemplate(initialProjectionTemplate);
    // })
  }, [initialProjectionTemplate])


  // define a default map Config
  const defaultProjectionConfig = useMemo(() => {
    return {
      rotationDegree: 0,
      centerX: 2.4486203,
      centerY: 46.8576176,
      scale: height * 5
    };
  }, [height]) // repsonsive : se fait en fonction de la height de l'écran

  /**
   * d3 projection making
   */
  const projection = useMemo(() => { // def les bonnes valeurs pour la config de la projection // enregistrer dans le state // les appliquer dans la projection

    let projectionConfig = { ...defaultProjectionConfig } // casser la référence à defaultProj pour respecter principe react qu'on ne modifie pas un objet reçu en argument

    let projection = geoEqualEarth()

    switch (projectionTemplate) {
      case 'World':
        projectionConfig = {
          ...projectionConfig,
          scale: height * .5,
          centerX: -1,
          centerY:  15,
          // translationX: width * 0.4,
          // translationY: height * 0.28
        }
        break;
      case 'coast from Nantes to Bordeaux':
        projectionConfig = {
          ...projectionConfig,
          scale: height * 24,
          centerX: -1.7475027,
          centerY: 46.573642,
          translationX: width * 0.4,
          translationY: height * 0.28
        }
        break;
      case 'Poitou':
        projectionConfig = {
          ...projectionConfig,
          scale: height * 30,
          centerX: -1.7475927,
          // centerY: 46.573872,
          centerY: 47.4,
          // translationX: width * 0.4,
          translationX: width * 0.45,
          translationY: 0
        }
        break;
      case 'Poitou zoomed':
        projectionConfig = {
          ...projectionConfig,
          scale: height * 23,
          centerX: -1.7475927,
          // centerY: 46.573872,
          centerY: 47.4,
          // translationX: width * 0.4,
          translationX: width * 0.45,
          translationY: 0
        }
        break;
      case 'rotated Poitou':
        projectionConfig = {
          ...projectionConfig,
          rotationDegree: 58,
          scale: height * 32,
          centerX: -1.7475027,
          centerY: 46.573642,
          translationX: width * 0.29,
          translationY: height * 0.25
        }
        break;
      case 'France':
      default: // as France config 
        // console.log('projection config in dry version', projectionConfig);
        // console.log(`we are taking the config as specified in config parameters ===> if not specified, the view should correspond to France`);
        break;
    }

    if (inputProjectionConfig !== undefined) {
      projectionConfig = {
        ...projectionConfig,
        ...inputProjectionConfig
      }
    }

    // update the config
    setScale(projectionConfig.scale)

    setRotation(projectionConfig.rotationDegree)

    setCenterX(projectionConfig.centerX)
    setCenterY(projectionConfig.centerY)

    if (projectionConfig.translationX !== undefined) {
      setTranslationX(projectionConfig.translationX)
      setTranslationY(projectionConfig.translationY)
    }
    else {
      projectionConfig.translationX = width / 2;
      projectionConfig.translationY = height / 2;
      setTranslationX(width / 2)
      setTranslationY(height / 2)
    }

    projection
      .scale(projectionConfig.scale)

    projection.center([projectionConfig.centerX, projectionConfig.centerY])

    if (projectionConfig.rotationDegree) {
      projection.angle(projectionConfig.rotationDegree)
    }

    projection.translate([projectionConfig.translationX, projectionConfig.translationY])

    return projection;
  }, [width, height, defaultProjectionConfig, inputProjectionConfig, projectionTemplate]) 



  // const [xCenterPoint, yCenterPoint] = projection([centerX, centerY]);
  return (
    <div className="GeographicMapChartWrapper">

      {title ? <h5 className="visualization-title">{title}</h5> : null}

      {
        debug ?
          <>
            <h2>scale: {scale}, rotation: {rotation}, translationX: {translationX}, translationY: {translationY}, centerX: {centerX}, centerY: {centerY}</h2>
            <div className="table">
              <ul id="horizontal-list">
                <li>
                  <ul>
                    <li>
                      <Button onMouseDown={() => setScale(scale * 1.6)}>scale+</Button>
                    </li>
                    <li>
                      <Button onMouseDown={() => setScale(scale / 1.6)}>scale-</Button>
                    </li>
                    <li>
                      <Input value={scale} placeHolder={"entrez une valeur pour la scale"} onBlur={(str) => {
                        const val = isNaN(+str) ? scale : +str
                        setScale(val)
                      }} />
                    </li>
                  </ul>
                </li>
                <li>
                  <ul>
                    <li>
                      <Button onMouseDown={() => { console.log("DOWN !!"); setRotation(rotation + 2) }}>rotation+</Button>
                    </li>
                    <li>
                      <Button onMouseDown={() => setRotation(rotation - 2)}>rotation-</Button>
                    </li>
                  </ul>
                </li>
                <li>
                  <ul>
                    <li>
                      <Button onMouseDown={() => setTranslationX(translationX * 1.2)}>translationX+</Button>
                    </li>
                    <li>
                      <Button onMouseDown={() => setTranslationX(translationX * 0.8)}>translationX-</Button>
                    </li>
                    <li>b
                      <Button onMouseDown={() => setTranslationY(translationY * 1.2)}>translationY+</Button>
                    </li>
                    <li>
                      <Button onMouseDown={() => setTranslationY(translationY * 0.8)}>translationY-</Button>
                    </li>
                  </ul>
                </li>
                <li>
                  <ul>
                    <li>
                      <Button onMouseDown={() => setCenterX(centerX + 0.3)}>centerX+</Button>
                    </li>
                    <li>
                      <Button onMouseDown={() => setCenterX(centerX - 0.3)}>centerX-</Button>
                    </li>
                    <li>b
                      <Button onMouseDown={() => setCenterY(centerY + 0.3)}>centerY+</Button>
                    </li>
                    <li>
                      <Button onMouseDown={() => setCenterY(centerY - 0.3)}>centerY-</Button>
                    </li>
                    <li>
                      <Input value={centerX} placeHolder={"entrez une valeur pour la latitude"} onBlur={(str) => {
                        const val = isNaN(+str) ? centerX : +str
                        setCenterX(val)
                      }} />
                    </li>
                    <li>
                      <Input value={centerY} placeHolder={"entrez une valeur pour la longitude"} onBlur={(str) => {
                        const val = isNaN(+str) ? centerY : +str
                        setCenterY(val)
                      }} />
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </>
          : null
      }

      <svg className="GeographicMapChart" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>

        {
          layers.map((layer, layerIndex) => {

            switch (layer.type) {
              case 'choropleth':
                return <ChoroplethLayer
                  key={layerIndex}
                  layer={layer}
                  projection={projection}
                  width={width}
                  height={height}
                  reverseColors={layer.reverseColors}
                />

              case 'points':
                return <PointsLayer
                  key={layerIndex}
                  layer={layer}
                  projection={projection}
                  width={width}
                  height={height}
                />

              case 'flows': 
                return <FlowsLayer
                  key={layerIndex}
                  layer={layer}
                  projection={projection}
                  width={width}
                  height={height}
                  projectionTemplate={projectionTemplate}
                />

              case 'custom':
                return <CustomObjectLayer
                  key={layerIndex}
                  layer={layer}
                  projection={projection}
                  projectionTemplate={projectionTemplate}
                  width={width}
                  height={height}
                />

              default:
                return <g key={layerIndex}><text>Unsupported layer type</text></g>
            }
          })
        }
        {/* <circle cx={xCenterPoint} cy={yCenterPoint} r={5} fill={'red'} />
        <rect x="58%" y="78%" width={width * 0.4} height={height * 0.2} rx="15" ry="15" fill={'white'} opacity={0.5} /> */}
      </svg>
      {
        withLegend ?
        <Legend layers={layers} position={withLegend} />
        : null
      }
      <ReactTooltip id="geo-tooltip" />
    </div>
  )
}

export default GeographicMapChart;


// old GeoComp handling for configs


/*
const projection = useMemo(() => {
  setTranslationX(width/2)
  setTranslationY(height/2)

 let projection = geoEqualEarth() // ce qui vaut dans tous les cas ...
   .scale(scale)
   .translate([translationX, translationY]) // put the center of the map at the center of the box in which the map takes place ?

 if (backgroundData) { // que si center on region
   if (centerOnRegion) {
     setScale(height*24); // 500000 //*24
     setCenterX(-1.7475027);
     setCenterY(46.573642);
     projection
       .scale(scale) // 50000 for a centered map
       .center([centerX, centerY]) // -1.7475027, 46.573642 for a centered map
       .translate([translationX * 0.8, translationY * 0.56]) // @TODO : stabiliser avec coefficients calculés (pour l'instant c'est du bricolage : j'essaie de cadrer entre Nantes et Bordeaux)
   } else {
     // if bg data is available fit on whole geometry
     projection
       .fitSize([width, height], backgroundData)
   }
   if (rotationDegree !== 0) { // seul cas où on veut une carte tournée pour le moment c'est dans le cas step 1 main viz part 3
     setScale(width*28)
     setRotation(rotationDegree);
     projection
       .angle(rotation)
       .translate([translationX * 0.65, translationY * 0.65]) // dans ce cas besoin de décaler la carte vers la droite et vers le haut :  @TODO stabiliser avec coefficients calculés (pour l'instant c'est du bricolage)
   }

 }
 return projection;
}, [backgroundData, width, height, centerOnRegion, scale, rotation, translationX, translationY, centerX, centerY, rotationDegree])

*/
