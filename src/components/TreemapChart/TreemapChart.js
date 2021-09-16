
import { useRef, useState, useEffect, useMemo } from 'react';
import {nest} from 'd3-collection';
import Tooltip from 'react-tooltip';
import { uniq } from 'lodash';
import {
  treemap, 
  hierarchy, 
  // treemapResquarify,
  treemapBinary,
} from 'd3-hierarchy';

import { fixSvgDimension, generatePalette } from '../../helpers/misc';

const formatNestResults = (input) => {
  if (Array.isArray(input)) {
    return {
      name: 'root',
      children: input.map(formatNestResults)
    }
  } else if (input.key && input.values) {
    return {
      name: input.key,
      children: input.values.map(formatNestResults)
    }
  } else return input;
}

/**
 * LineChart component - returns a <figure> containing a svg linechart
 * 
 * @param {array} data
 * @param {string} title 
 * @param {width} number 
 * @param {height} number 
 * 
 * @param {object} color
 * @param {string} color.field
 * @param {string} color.title
 * @param {object} color.palette
 * 
 * @param {array} fieldsHierarchy
 * @param {object} leaf
 * @param {string} leaf.labelField
 * @param {number} leaf.countField

 * 
 * @param {object} margins
 * @param {number} margins.left
 * @param {number} margins.top
 * @param {number} margins.right
 * @param {number} margins.bottom
 * 
 * @param {function} tooltip
 * 
 * @returns {react}
 */
const TreemapChart = ({
  data,
  fieldsHierarchy = [],
  title,
  width : initialWidth = 1000,
  height: initialHeight = 400,
  leaf: {
    labelField,
    countField,
  },
  color,
  tooltip,
  margins: inputMargins = {},
}) => {
  const [headersHeight, setHeadersHeight] = useState(0);
  const [legendWidth, setLegendWidth] = useState(0);

  const legendRef = useRef(null);
  const headerRef = useRef(null);
  
  const width = fixSvgDimension(initialWidth - legendWidth - 10);
  const height = fixSvgDimension(initialHeight - headersHeight);


  const margins = {
    left: 100,
    top: 30,
    bottom: 20,
    right: 20,
    ...inputMargins
  };

  const root = useMemo(() => {
    const res = nest()
    fieldsHierarchy.forEach((field) => {
      res.key((d) => d[field])
    })
    
    const visData = formatNestResults(res.entries(data))
    const result = hierarchy(visData).sum(d => +d[countField]);
    treemap()
    .size([width, height])
    .tile(treemapBinary)
    .round(true)
    (result);
    return result;
  }, [data, fieldsHierarchy, width, height, countField])



  useEffect(() => {
    setTimeout(() => {
      const newHeadersHeight = headerRef.current ?  headerRef.current.getBoundingClientRect().height : 0;
      const newLegendWidth = legendRef.current ?  legendRef.current.getBoundingClientRect().width : 0;
      setHeadersHeight(newHeadersHeight);
      setLegendWidth(newLegendWidth);
    })
    // return () => {
    //   setHeadersHeight(0);
    //   setLegendWidth(0);
    // };
  }, [width, height, color, data])

  useEffect(() => {
    Tooltip.rebuild();
  })
  

  let colorPalette;
  if (color && color.palette) {
    colorPalette = color.palette;
  } else if (color) {
    const colorModalities = uniq(data.map(d => d[color.field]));
    const colorValues = generatePalette(color.field, colorModalities.length);
    colorPalette = colorModalities.reduce((res, modality, index) => ({
      ...res,
      [modality]: colorValues[index]
    }), {})
  }

  return (
    <>
      <figure style={{width: initialWidth, height: initialHeight}} className="TreemapChart GenericVisualization">
        <div ref={headerRef} className="row">
          {title ? <h5 className="visualization-title" >{title}</h5> : null}
        </div>
        <div className="row vis-row">
          <svg className="chart" width={width} height={height}>
            {
              root.leaves().map((datum, datumIndex) => {
                const {x0, y0, x1, y1} = datum;
                const rectWidth = x1 - x0;
                const rectHeight = y1 - y0;
                const labelText = `${datum.data[labelField]} (${datum.data[countField]})`;
                const labelWidth = window.innerWidth * 0.003 * labelText.length;
                return (
                  <g 
                    key={`${x0}-${y0}`} 
                    transform={`translate(${x0},${y0})`}
                    data-for="treemap-tooltip"
                    data-tip={tooltip ? tooltip(datum.data) : undefined}
                  >
                    <rect
                      stroke="white"
                      x={0}
                      y={0}
                      width={rectWidth}
                      height={rectHeight}
                      fill={colorPalette[datum.data[color.field]]}
                    />
                    {
                      labelWidth < rectWidth && rectHeight > 10 ?
                        <text
                          x={rectWidth/2}
                          y={rectHeight / 2 + 5}
                          textAnchor="middle"
                        >
                          {labelText}
                        </text>
                      : null
                    }
                  </g>
                )
              })
            }
          </svg>
          {
            color ?
              <div
                className="ColorLegend"
                ref={legendRef}
                style={{
                  top: headersHeight + margins.top
                }}
              >
                <h5>{color.title || 'Légende'}</h5>
                <ul className="color-legend">
                  {
                    Object.entries(colorPalette)
                      .map(([genre, color], genreIndex) => (
                        <li
                          key={genre}
                        >
                          <span className="color-box"
                            style={{ background: color }}
                          />
                          <span className="color-label">
                            {genre}
                          </span>
                        </li>
                      ))
                  }
                </ul>
              </div>
              : null
          }
        </div>
      </figure>
      <Tooltip id="treemap-tooltip" />
    </>
  )
}
export default TreemapChart;