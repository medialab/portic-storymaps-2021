import {useRef} from 'react';
import { sortBy, sum } from "lodash";
import * as d3 from "d3";
import { scaleLinear } from 'd3';
import { extent } from 'vega';

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
  color,
  herfindhalField,
  years,
  title,
}) => {
  const titleRef = useRef(null);
  let height = wholeHeight;
  const yearLabelHeight = height / 20 + 10;

  if (titleRef && titleRef.current) {
    height = wholeHeight - titleRef.current.getBoundingClientRect().height - yearLabelHeight;
  }

  const herfindhalScale = d3
    .scaleLinear()
    .domain(d3.extent(tradeData, (d) => +d[herfindhalField]))
    .range([0, 1]);

  return (
    <div className="ProductsDistributionChart">
      <h3 ref={titleRef}>{title}</h3>
      <div className="years-container">
      {
        years.map(year => {
          const data = allData.filter(datum => datum.year + '' === year + '');
          const flows = tradeData.filter((d) => d.year === year + '');
          const her = flows && +flows[0][herfindhalField];
          const color = her
          ? d3.rgb(200, 50, 0, herfindhalScale(+her))
          : "lightgrey";
          const totalValue = sum(data.map((d) => +d[field]));    
          let partAcc = 0;
          // Sort by trade value and keep only the top products which totalizes partTreshold of share
          const dataTillTreshold = sortBy(data, (d) => -d[field]).filter((d) => {
            partAcc += +d[field];
            return partAcc <= partTreshold * totalValue;
          });
          // group the long tail of low value (under the part Treshold) products as one aggregated misc
          const aggregatedMiscProducts = {
            [field]: totalValue - sum(dataTillTreshold.map((d) => +d[field])),
            product: `${data.length - dataTillTreshold.length} autre produits`,
          };
          dataTillTreshold.push(aggregatedMiscProducts);

          const scaleValue = (value) => {
            const v = (value / totalValue) * height;
            return v;
          };

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
              dataTillTreshold.map((d, i) => (
                <div
                  key={d.product}
                  style={{
                    height: `${scaleValue(d[field])}px`,
                  }}
                  className="product-group"
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${barWidth}px`,
                      backgroundColor: color,
                    }}
                    className="bar"
                  ></div>
                  <span
                    className="label"
                    style={{
                      fontSize: labelScale(+d[field])
                      // `${max([
                      //   MAX_LABEL_SIZE * (d[field] / maxValue),
                      //   MIN_LABEL_SIZE,
                      // ])}rem`,
                    }}
                  >
                    {d.product}
                  </span>
                </div>
              ))}
              </div>
          </div>
          )
        })
      }
      </div>
    </div>
  );
};

export default ProductsDistributionChart;