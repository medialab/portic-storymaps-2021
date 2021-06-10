import { max, sortBy, sum } from "lodash";

const MIN_LABEL_SIZE = 0.5;
const MAX_LABEL_SIZE = 2.5;

// TODO:
// - click on products highlight same product on all years ?
// - click on products make label bigger for small ones ?

export const ProductsDistributionChart = ({
  data,
  field,
  partTreshold,
  height,
  barWidth,
  labelFirst,
  color,
}) => {
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
  const maxValue = +dataTillTreshold[0][field];

  const scaleValue = (value) => {
    const v = (value / totalValue) * height;
    return v;
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyItems: "start",
      }}
    >
      {dataTillTreshold &&
        dataTillTreshold.map((d, i) => (
          <div
            key={d.product}
            style={{
              paddingBottom: "2px",
              boxSizing: "border-box",
              height: `${scaleValue(d[field])}px`,
              display: "flex",
              alignItems: "center",
              flexDirection: labelFirst ? "row-reverse" : "row",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${barWidth}px`,
                backgroundColor: color,
              }}
            ></div>
            <span
              className="label"
              style={{
                float: "right",
                fontSize: `${max([
                  MAX_LABEL_SIZE * (d[field] / maxValue),
                  MIN_LABEL_SIZE,
                ])}rem`,
                margin: "0 1rem",
              }}
            >
              {d.product}
            </span>
          </div>
        ))}
    </div>
  );
};
