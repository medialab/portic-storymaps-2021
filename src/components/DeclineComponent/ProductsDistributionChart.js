import {useRef, useState, useEffect, useMemo} from 'react';
import { sortBy, sum } from "lodash";
import { scaleLinear, scalePow } from 'd3-scale';
import {extent} from 'd3-array';
import cx from 'classnames';
import ReactTooltip from 'react-tooltip';

import colorsPalettes from "../../colorPalettes";

// TODO:
// - click on products highlight same product on all years ?
// - click on products make label bigger for small ones ?

const ProductsDistributionChart = ({
  data: allData,
  tradeData = [],
  field,
  partTreshold,
  height: wholeHeight,
  barWidth,
  herfindhalField,
  years,
  title,
  margins,
  productTooltipFn,
}) => {
  const titleRef = useRef(null);

  useEffect(() => {
    setTimeout(() => {
      ReactTooltip.rebuild();
    })
  }, [wholeHeight])

  const [hoveredProduct, setHoveredProduct] = useState(undefined);
  let height = wholeHeight;
  const yearLabelHeight = height / 20 + 10;

  if (titleRef && titleRef.current) {
    height = wholeHeight - titleRef.current.getBoundingClientRect().height - yearLabelHeight;
  }
  const finalData= useMemo(() => {
    // const lastYear = years[years.length - 1];
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
      product: `${lastYearData.length - dataTillTreshold.length} autre produits`,
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
        product: `${thisData.length - thisYearData.length} autre produits`,
      })
      return {
        ...dict,
        [year]: thisYearData
      }
    }, {})

  }, [years, JSON.stringify(allData)])/* eslint react-hooks/exhaustive-deps : 0 */
  

  const herfindhalColorScale = scalePow()
    .domain(extent(tradeData, (d) => +d[herfindhalField]))
    .range([colorsPalettes.generic.accent2, 'grey']);
  return (
    <div className="ProductsDistributionChart">
      <h3 ref={titleRef}>{title}</h3>
      <div 
        className={cx("years-container", {'has-highlights': hoveredProduct !== undefined})}
        style={{
          marginLeft: margins.left,
          marginRight: margins.right,
        }}
      >
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

          const labelScale = scaleLinear().domain(extent(data, datum => +datum[field])).range([height / 100, height / 15])

          return (
            <div
            key={year}
            className="year-column"
          >
            <h4 className="year-label">
              <span>{year}</span>
            </h4>
            <div className="year-items">
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
                    productTooltipFn(year, d.product, (d[field] / totalValue * 100).toFixed(2))
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
                    {d.product}
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