import {useRef, useState, useEffect, useMemo} from 'react';
import { sortBy, sum } from "lodash";
import { scaleLinear, scalePow } from 'd3-scale';
import {extent} from 'd3-array';
import cx from 'classnames';
import ReactTooltip from 'react-tooltip';
import translate from '../../i18n/translate'

import colorsPalettes from "../../colorPalettes";
import { fixSvgDimension } from '../../helpers/misc';

// TODO:
// - click on products highlight same product on all years ?
// - click on products make label bigger for small ones ?


/**
 * Displays a comparison of exported products totalizing n% of total shares of exports
 * @param {array} data
 * @param {array} tradeData
 * @param {string} field
 * @param {number} partTreshold - limit of the total cumulated share of exports from which to display products - in [0,1]
 * @param {number} height
 * @param {number} barWidth
 * @param {string} herfindhalField
 * @param {array} years - two years to compare
 * @param {number} width
 * @param {string} title
 * @param {object} margins
 * @param {function} productTooltipFn
 * @param {boolean} compareFrom
 * @returns {React.ReactElement} - React component
 */
const ProductsDistributionChart = ({
  data: allData,
  tradeData = [],
  field,
  partTreshold,
  height: wholeHeight,
  barWidth,
  herfindhalField,
  years,
  lang,
  width,
  title,
  margins,
  productTooltipFn,
  compareFrom
}) => {
  const titleRef = useRef(null);
  const svgRef = useRef(null);
  const yearsRef = useRef(new Array(years.length))

  useEffect(() => {
    setTimeout(() => {
      ReactTooltip.rebuild();
    })
  }, [wholeHeight])

  const [hoveredProduct, setHoveredProduct] = useState(undefined);
  let height = fixSvgDimension(wholeHeight);
  const yearLabelHeight = height / 20 + 10;

  if (titleRef && titleRef.current) {
    height = wholeHeight - titleRef.current.getBoundingClientRect().height - yearLabelHeight;
  }
  const finalData= useMemo(() => {
    if (compareFrom) {
      const lastYear = years[years.length - 1];
      const lastYearData =  allData.filter(datum => datum.year + '' === lastYear + '');
      const lastYearTotalValue = sum(lastYearData.map((d) => +d[field])); 
      let partAcc = 0;
      // Sort by trade value and keep only the top products which totalizes partTreshold of share
      const dataTillTreshold = sortBy(lastYearData, (d) => -d[field])
      .filter((d) => {
        partAcc += +d[field];
        return partAcc <= partTreshold * lastYearTotalValue;
      });
      const topProducts = dataTillTreshold.map(d => d.product);
      // group the long tail of low value (under the part Treshold) products as one aggregated misc
      const aggregatedMiscProducts = {
        [field]: lastYearTotalValue - sum(dataTillTreshold.map((d) => +d[field])),
        product: `${lastYearData.length - dataTillTreshold.length} autres types de produits`,
      };
      dataTillTreshold.push(aggregatedMiscProducts);
    return years.reduce((dict, year) => {

        if (year === lastYear) {
          return {
            ...dict,
            [year]: dataTillTreshold
          }
        }
        const thisData = allData.filter(datum => datum.year + '' === year + '');
        const thisTotalValue =  sum(thisData.map((d) => +d[field]));
        const thisYearData = thisData.filter(d => topProducts.includes(d.product))
        .sort((a, b) => {
          if (+a[field] > +b[field]) {
            return -1;
          }
          return 1;
        })
        thisYearData.push({
          [field]: thisTotalValue - sum(thisYearData.map((d) => +d[field])),
          product: `${thisData.length - thisYearData.length} autres types de produits`,
        })
        return {
          ...dict,
          [year]: thisYearData
        }
      });
    }
    return years.reduce((dict, year) => {
      const thisYearData =  allData.filter(datum => datum.year + '' === year + '');
      const totalValue = sum(thisYearData.map((d) => +d[field])); 
      let partAcc = 0;
      // Sort by trade value and keep only the top products which totalizes partTreshold of share
      const dataTillTreshold = sortBy(thisYearData, (d) => -d[field])
      .filter((d) => {
        partAcc += +d[field];
        return partAcc <= partTreshold * totalValue;
      });
      // const topProducts = dataTillTreshold.map(d => d.product);
      // group the long tail of low value (under the part Treshold) products as one aggregated misc
      const aggregatedMiscProducts = {
        [field]: totalValue - sum(dataTillTreshold.map((d) => +d[field])),
        // product: translate('viz-principale-partie-1', 'other_product', lang, { number: thisYearData.length - dataTillTreshold.length }),
        ['product_' + lang]: translate('viz-principale-partie-1', 'other_product', lang, { number: thisYearData.length - dataTillTreshold.length }),
      };
      dataTillTreshold.push(aggregatedMiscProducts);
      return {
        ...dict,
        [year]: dataTillTreshold
      }
    }, {})

  }, [years, JSON.stringify(allData)])/* eslint react-hooks/exhaustive-deps : 0 */

  const links = useMemo(() => {
    const yearsToLink = years.filter((y, i) => i < years.length - 1)

    return yearsToLink
    .map((year, i) => {
      const nextYear = years[i + 1];
      const thisData = finalData[year + ''];
      const nextData = finalData[nextYear + ''];
      if (!nextData) {
        return null;
      }

      const thisYearTotalValue = sum(thisData.map((d) => +d[field]));    
      const thisYearScaleValue = (value) => {
        const v = (value / thisYearTotalValue) * height;
        return v;
      };
      const nextYearTotalValue = sum(nextData.map((d) => +d[field]));    
      const nextYearScaleValue = (value) => {
        const v = (value / nextYearTotalValue) * height;
        return v;
      };
      let thisYearOffset = 0;
      // const thisYearLabelScale = scaleLinear().domain(extent(thisData, datum => +datum[field])).range([height / 100, height / 15])

      return thisData.reduce((res, datum, datumIndex) => {
        let otherOffset = 0;
        let otherHeight;
        let thisHeight = thisYearScaleValue(datum[field]);
        /* @todo if label adjust
        let thisFontSize =  i === thisData.length - 1 ? 10 : thisYearLabelScale(+datum[field]);
        if (isHighlighted && thisFontSize < 10) {
          thisFontSize = 10;
        }
        */
        thisYearOffset += thisHeight;
        const hasNext = nextData.find(otherDatum => {
          otherHeight = nextYearScaleValue(otherDatum[field]);
          otherOffset += otherHeight;
          if (otherDatum.product === datum.product) {
            return true;
          }
          return false;
        });
        if (hasNext) {
          return [
            ...res,
            {
              product: datum.product,
              y1: thisYearOffset/* + thisFontSize*/,
              height1: thisHeight,
              y2: otherOffset - otherHeight,
              height2: otherHeight,
            }
          ]
        } else {
          return res;
        }
      }, [])
    })
      
  }, [finalData, years, height]);
  

  const herfindhalColorScale = scalePow()
    .domain(extent(tradeData, (d) => +d[herfindhalField]))
    .range([colorsPalettes.generic.accent2, 'grey']);
  const svgOffset = yearsRef.current && yearsRef.current.length && yearsRef.current[0] ? yearsRef.current[0].parentNode.offsetTop : undefined;
  return (
    <div className="ProductsDistributionChart">
      <h3  className="visualization-title" style={{marginLeft: margins.left}} ref={titleRef}>{title}</h3>
      <div 
        className={cx("years-container", {'has-highlights': hoveredProduct !== undefined})}
        style={{
          marginLeft: margins.left + 5,
          marginRight: margins.right + width * .002,
        }}
      >
      <svg 
        ref={svgRef} 
        className={cx("links-container", {'has-highlights': hoveredProduct})} 
        style={{top: svgOffset}} 
        width={width} 
        height={height}
      >
        {
          links.map((yearLinks, i) => {
            const ref1 = yearsRef.current && yearsRef.current.length >= i && yearsRef.current[i] && yearsRef.current[i];
            const ref2 = yearsRef.current && yearsRef.current.length >= i + 1 && yearsRef.current[i + 1] && yearsRef.current[i + 1];
            const x1 = ref1 ? yearsRef.current[i].getBoundingClientRect().width : 0;
            const x2 = ref2 && svgRef.current ? yearsRef.current[i + 1].getBoundingClientRect().x - svgRef.current.getBoundingClientRect().x : width;
            return (
            <g className="year-links" key={i}>
              {
                yearLinks.map(({product, y1: initialY1, height1, y2: initialY2, height2}, index) => {
                  const y1= initialY1 - height1 / 2;
                  const y2= initialY2 + height2/2;
                  const isHighlighted = hoveredProduct === product;
                  return (
                    <path
                      key={index}
                      d={`M ${x1} ${y1} C ${x1 + (x2 - x1) * .5} ${y1} ${x1 + (x2 - x1) * .5} ${y2} ${x2} ${y2}`}
                      className={cx('link', {'is-highlighted': isHighlighted})}
                    />
                  );
                })
              }
            </g>
          )})
        }
      </svg>
      {
        years.map((year, yearIndex) => {
          const data = allData.filter(datum => datum.year + '' === year + '');
          const flows = tradeData.filter((d) => d.year === year + '');
          const her = flows && +flows[0][herfindhalField];
          const color = her
          ? herfindhalColorScale(+her) // d3.rgb(200, 50, 0, herfindhalScale(+her))
          : "lightgrey";
          const totalValue = sum(data.map((d) => +d[field]));    
          
          const scaleValue = (value) => {
            const v = (value / totalValue) * height;
            return v;
          };
          const dataTillTreshold = finalData[year + ''];

          const labelScale = scaleLinear().domain(extent(data, datum => +datum[field])).range([height / 100, height / 10])

          return (
            <div
            key={yearIndex}
            className="year-column"
          >
            <h4 className="year-label">
              <span>{year}</span>
            </h4>
            <div 
            
            className="year-items">
              <div className="dimensions-placeholder"
                ref={(element) => {yearsRef.current[yearIndex] = element}}
                style={{
                  width: `${barWidth}px`, height: 0,
                  position: 'absolute',
                  top: 0,
                  left: yearIndex === years.length - 1 ? undefined : 0,
                  right: yearIndex === years.length - 1 ? 0 : undefined,
                }}
              />
            {dataTillTreshold &&
              dataTillTreshold.map((d, i) => {
                const isHighlighted = hoveredProduct === d.product;
                let fontSize =  i === dataTillTreshold.length - 1 ? 10 : labelScale(+d[field]);
                if (isHighlighted && fontSize < 10) {
                  fontSize = 10;
                }
                return (
                <div
                  key={d.product}
                  style={{
                    height: `${scaleValue(d[field])}px`,
                  }}
                  className={cx("product-group", {'is-highlighted': isHighlighted})}
                  onClick={() => {
                    if (hoveredProduct !== d.product && i !== dataTillTreshold.length - 1) {
                      setHoveredProduct(d.product);
                    } else {
                      setHoveredProduct(undefined);
                    }
                  }}
                  data-tip={productTooltipFn && i !== dataTillTreshold.length - 1 ? 
                    productTooltipFn(year, d['product_' + lang], (d[field] / totalValue * 100).toFixed(2))
                    : undefined}
                  data-for={'product-tooltip'}
                  data-html={true}
                  data-class="bar-tooltip"
                  data-place={yearIndex === 0 ? 'right' : 'left'}
                  data-effect="solid"
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${barWidth}px`,
                      maxWidth: `${barWidth}px`,
                      minWidth: `${barWidth}px`,
                      backgroundColor: color,
                    }}
                    className="bar"
                  ></div>
                  <span
                    className="label"
                    style={{
                      fontSize
                    }}
                  >
                    {d['product_' + lang]}
                  </span>
                </div>
              )
              })}
              </div>
          </div>
          )
        })
      }
      </div>
      <ReactTooltip id={'product-tooltip'} />
    </div>
  );
};

export default ProductsDistributionChart;