import React, { useState, useEffect, useMemo } from 'react';
import { csvParse } from 'd3-dsv';
import get from 'axios';
import { geoEqualEarth, geoPath } from "d3-geo";
import { uniq } from 'lodash';
import { scaleLinear } from 'd3-scale';
import { extent } from 'd3-array';

import { generatePalette } from '../../helpers/misc';
// import { resetIdCounter } from 'vega-lite';

import './GeoComponent.css'

/* DOCUMENTATION : API de ce GéoComponent

  Principe :
    Composants réutilisable pour toutes les cartes utilisés sur les sites PORTIC
    cartographie en SVG
    -> permet de faire des cartes choroplètes, de représenter des ports, des flux de navires, ...

  Paramètres : 
    dataFilename : données à afficher sur la carte
    backgroundFilename : données du fond de cartes
    renderObject : fonction d'affichage des données (par défaut les objets affichés sont des cercles, mais peut se changer en passant une autre fonction)
    projectionTemplate : configuration de carte utilisée fréquemment ('France', 'coast from Nantes to Bordeaux', 'Poitou', 'rotated Poitou')
    projectionConfig: configuration de carte customisée (ce paramètre prime sur projectionTemplate si les 2 sont données en même temps)
    debug : permet d'ajuster manuellement la configuration de la carte quand true (les paramètres de zoom, les coordonnées du centre, la rotation et les translations sont ajustables)
*/

const Input = ({
  value: inputValue,
  onBlur,
  ...props
}) => {
  const [value, setValue] = useState(inputValue)
  useEffect(() => {
    setValue(inputValue)
  }, [inputValue])

  return <input
    value={value}
    onChange={(e) => {
      setValue(e.target.value)
    }}
    onBlur={(e) => {
      onBlur(e.target.value)
    }}
  />
}

const Button = ({
  children,
  onMouseDown,
  ...props
}) => {
  const [isMouseDown, setState] = useState(false)

  useEffect(() => {
    let interval
    if (isMouseDown) {
      console.log("setInterval")
      interval = setInterval(onMouseDown, 100)
    }
    return () => {
      console.log("clearInterval")
      clearInterval(interval)
    }
  }, [isMouseDown, onMouseDown])

  return <button
    {...props}
    onMouseDown={() => {
      setState(true)
    }}
    onMouseUp={() => {
      setState(false)
    }}
    style={{ background: isMouseDown ? 'red' : undefined }}
  >
    {children}
  </button>
}

let defaultProjectionConfig = {
  rotationDegree: 0, 
  centerX: -1.7475027, 
  centerY: 46.573642, 
  scale: 200};


const GeoComponent = ({
  dataFilename,
  backgroundFilename,
  width = 1800,
  height = 1500,
  label,
  renderObject, // fonction : par défaut la représentation des données est sous forme de cercles, mais peut se changer en passant une autre fonction
  markerSize, // TODO : permettre de paramétrer le type d'objet rendu (callback function ? => appeler un component par exemple)
  markerColor,
  showLabels,
  projectionTemplate, // de base centerOnRegion, // @TODO : rendre centerOnRegion et RotationDegree moins spécifique aux 2 configs existantes sur le site pour l'instant (enlever la France par défaut je pense)
  projectionConfig: inputProjectionConfig = defaultProjectionConfig, // customed config that will overwrite a template (optional argument) 
  debug = false
}) => {

  let projectionConfig = { ...inputProjectionConfig } // casser la référence à defaultProj pour respecter principe react qu'on ne modifie pas un objet reçu en argument
  
  // viz params variables
  
  const [scale, setScale] = useState(200)
  const [rotation, setRotation] = useState(0)
  const [translationX, setTranslationX] = useState(width / 2)
  const [translationY, setTranslationY] = useState(height / 2)
  const [centerX, setCenterX] = useState(-1.7475027) // -1.7475027 pour centrer sur région
  const [centerY, setCenterY] = useState(46.573642) // 46.573642

  // raw marker data
  const [data, setData] = useState(null);
  // map background data
  const [backgroundData, setBackgroundData] = useState(null);
  const [colorsMap, setColorsMap] = useState(null);

  const [loadingData, setLoadingData] = useState(true);
  const [loadingBackground, setLoadingBackground] = useState(true);

  let inputCenterX = { ...centerX }
  let inputCenterY = { ...centerY }
  let inputTranslationX = { ...translationX }
  let inputTranslationY = { ...translationY }
  /**
   * Marker data loading
   */
  useEffect(() => {
    if (dataFilename) {
      const dataURL = `${process.env.PUBLIC_URL}/data/${dataFilename}`;
      get(dataURL)
        .then(({ data: csvString }) => {
          const newData = csvParse(csvString);

          setData(newData);
          setLoadingData(false);
        })
        .catch((err) => {
          setLoadingData(false);
        })
    }

  }, [dataFilename])

  /**
   * Data aggregation for viz (note : could be personalized if we visualize other things than points)
   */
  const markerData = useMemo(() => {
    if (data) {
      // regroup data by coordinates
      const coordsMap = {};
      data.forEach(datum => {
        const mark = datum.latitude + ',' + datum.longitude;
        if (!coordsMap[mark]) {
          coordsMap[mark] = {
            label: showLabels && label ? datum[label] : undefined,
            latitude: datum.latitude,
            longitude: datum.longitude,
            color: datum[markerColor],
            size: isNaN(+datum[markerSize]) ? 0 : +datum[markerSize],
            else: datum // à changer mais pour l'instant je ne sais pas faire autrement
          }
        } else {
          coordsMap[mark].size += (isNaN(+datum[markerSize]) ? 0 : +datum[markerSize])
        }
      })
      let grouped = Object.entries(coordsMap).map(([_mark, datum]) => datum);
      const colorValues = uniq(grouped.map(g => g.color));
      const palette = generatePalette('map', colorValues.length);
      const thatColorsMap = colorValues.reduce((res, key, index) => ({
        ...res,
        [key]: palette[index]
      }), {});
      setColorsMap(thatColorsMap);

      const sizeExtent = extent(grouped.map(g => g.size));
      const sizeScale = scaleLinear().domain(sizeExtent).range([1, width / 100])
      grouped = grouped.map(datum => ({
        ...datum,
        color: thatColorsMap[datum.color],
        size: sizeScale(datum.size)
      }))
      return grouped;
    }
  }, [data, markerColor, markerSize, width, label, showLabels])

  /**
   * Map background data loading
   */
  useEffect(() => {
    if (backgroundFilename) {
      const backgroundURL = `${process.env.PUBLIC_URL}/data/${backgroundFilename}`;
      get(backgroundURL)
        .then(({ data: bgData }) => {
          setBackgroundData(bgData);
          setLoadingBackground(false);
        })
        .catch((err) => {
          setLoadingBackground(false);
        })
    }

  }, [backgroundFilename])


  /**
   * d3 projection making
   */
  const projection = useMemo(() => {
    setTranslationX(width/2)
    setTranslationY(height/2) 

    let projection = geoEqualEarth()

    projection // ce qui vaut dans tous les cas ...
    .scale(scale)

    if (backgroundData) { // que si center on region
      
      switch (projectionTemplate) {
        case 'France':
          return projection.fitSize([width, height], backgroundData)
        case 'coast from Nantes to Bordeaux':
          projectionConfig = { 
            ...projectionConfig,
            scale: height*24, 
            translationX: translationX * 0.8, 
            translationY: translationY * 0.56
          }
          break;
        case 'Poitou':
          projectionConfig = { 
            ...projectionConfig,
            scale: height*45, 
            translationX: translationX * 0.8, 
            translationY: translationY * 0.1
          }
          break;
        case 'rotated Poitou':
          projectionConfig = { 
            ...projectionConfig,
            rotationDegree: 58,
            scale: height*50, 
            translationX: translationX * 0.58, 
            translationY: translationY * 0.6 // 0.364 au départ
          }
          break;
        default: // as France config ??
          console.log(`we are taking the config as specified in config parameters ===> if not specified, the view should correspond to France`);
          break;
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

      projection.center([centerX, centerY])

      if (projectionConfig.rotationDegree) {
        projection.angle(rotation)
      }

      projection.translate([translationX, translationY]) // put the center of the map at the center of the box in which the map takes place ?

    }
    return projection;
  }, [backgroundData, width, height, scale, rotation]) // avant j'avais centerOnRegion et RotationDegree translationX, translationY, centerX, centerY
  // , inputCenterX, inputCenterY, inputTranslationX, inputTranslationY =< m'empêche de compiler


  if (loadingBackground || loadingData) {
    return (
      <div>Chargement des données ...</div>
    )
  } else if (!backgroundData || !data) {
    return (
      <div>Erreur ...</div>
    )
  }

  const [xCenterPoint, yCenterPoint] = projection([centerX, centerY]);

  return (
    <div>

      {
        debug ?
          <>
            <h2>scale: {scale}, rotation: {rotation}, translationX: {translationX}, translationY: {translationY}, centerX: {centerX}, centerY: {centerY}</h2>
            <div class="table">
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

      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ border: '1px solid lightgrey' }}>
        <g className="background">
          {
            backgroundData.features.map((d, i) => {
              return (
                <path
                  key={`path-${i}`}
                  d={geoPath().projection(projection)(d)}
                  className="geopart"
                  fill={`rgba(38,50,56,${1 / backgroundData.features.length * i})`}
                  stroke="#FFFFFF"
                  strokeWidth={0.5}
                />
              )
            })
          }
        </g>
        <g className="markers">
          {
            markerData
              .filter(({ latitude, longitude }) => latitude && longitude && !isNaN(latitude) && !isNaN(longitude))
              .map((datum, index) => {
                // console.log("datum : ",datum)
                const { latitude, longitude, size, color, label } = datum;
                const [x, y] = projection([+longitude, +latitude]);
                return (
                  <>
                  {
                    typeof renderObject === "function" ? // si la fonction est définie je veux l'utiliser dans mon render, sinon (si j'ai pas ce paramètre je veux rendre cercles par défaut) 
                    // je veux un élément html
                    renderObject(datum, projection, {width})
                        :
                  <g transform={`translate(${x},${y})`}>
                          <circle
                            key={index}
                            cx={0}
                            cy={0}
                            r={size}
                            fill={color}
                            className="marker"
                          />
                          {
                            label ?
                              <text
                                x={size + 5}
                                y={size / 2}
                              >
                                {label}
                              </text>
                              : null
                          }
                        </g>
                      }
                </>);
                 })
          }
        </g>
        {
          colorsMap ?
            <g className="legend" transform={`translate(${width * .85}, ${height - (Object.keys(colorsMap).length + 1) * 20})`}>
              <g>
                <text style={{ fontWeight: 800 }}>
                  {markerColor}
                </text>
              </g>
              {
                Object.entries(colorsMap)
                  .map(([label, color], index) => {
                    return (
                      <g transform={`translate(0, ${(index + 1) * 20})`}>
                        <rect
                          x={0}
                          y={-8}
                          width={10}
                          height={10}
                          fill={color}
                        />
                        <text x={15} y={0}>
                          {label || 'Indéterminé'}
                        </text>
                      </g>
                    )
                  })
              }
            </g>
            : null
        }
        <circle cx={xCenterPoint} cy={yCenterPoint} r={5} fill={'red'} />
      </svg>
    </div>
  )
}

export default GeoComponent;


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






  switch (projectionTemplate) {
    case 'France':
      projectionConfig = {rotationDegree=0, centerX=-1.7475027, centerY=46.573642, scale=200} // je ne sais pas si on peut modifier un param comme ça
      break;
    case 'coast from Nantes to Bordeaux':
    case 'Poitou':
      console.log('Mangoes and papayas are $2.79 a pound.');
      // expected output: "Mangoes and papayas are $2.79 a pound."
      break;
    default:
      console.log(`Sorry, we are out of ${expr}.`);
  }

*/
