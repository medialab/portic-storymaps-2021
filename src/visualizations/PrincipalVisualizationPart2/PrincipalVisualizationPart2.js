import CircularAlluvialComponent from "../../components/CircularAlluvialComponent/CircularAlluvialComponent";

import './PrincipalVisualizationPart2.scss';

const PrincipalVisualizationPart2 = ({width, height, datasets, showOnlyToflit, ...props}) => {
  const {step} = props;
  let alluvialFilters = [];
  let sumToflitBy = 'value';
  switch(step) {
    case 2:
      alluvialFilters = [
        {
          key: 'product',
          value: `produit colonial ('Café', 'Sucre', 'Indigo', 'Coton non transformé')`
        },
        {
          key: 'partner',
          value: `Afrique`
        },
        {
          key: 'partner',
          value: `Colonies`
        }
      ];
      break;
    case 3:
      alluvialFilters = [
        {
          key: 'product',
          value: `eau-de-vie et vins divers`
        }
      
      ];
      break;
    case 4:
      alluvialFilters = [{
        key: 'product',
        value: `sel`
      }];
      sumToflitBy = 'product_weight_kg'
      break;
    default:
      break;
  }
  console.log('sumToflitBy', sumToflitBy)
  return (
    <div className="PrincipalVisualizationPart2">
     <div>
        <CircularAlluvialComponent
          data={datasets['part_2_toflit_viz_data.csv']}
          width={showOnlyToflit ? width : width / 2}
          height={height}
          sumBy={sumToflitBy}
          filters={alluvialFilters}
          steps={[
            {
              field: "customs_office",
              labels: {
                fr: 'bureau des fermes',
                en: 'customs office'
              },
              filters: [{key: 'flow_type', value: 'export'}]
            },
            {
              field: "product",
              labels: {
                fr: 'type de produit',
                en: 'product type'
              },
              filters: [{key: 'flow_type', value: 'export'}]
            },
            {
              field: "partner",
              labels: {
                fr: 'partenaire du commerce extérieur',
                en: 'external trade partner'
              },
              filters: [{key: 'flow_type', value: 'export'}]
            },
            {
              field: "partner",
              labels: {
                fr: 'partenaire du commerce extérieur',
                en: 'external trade partner'
              },
              filters: [{key: 'flow_type', value: 'import'}]
            },
            {
              field: "product",
              labels: {
                fr: 'type de produit',
                en: 'product type'
              },
              filters: [{key: 'flow_type', value: 'import'}]
            },
            {
              field: "customs_office",
              labels: {
                fr: 'bureau des fermes',
                en: 'customs office'
              },
              filters: [{key: 'flow_type', value: 'import'}]
            },
          ]}
        />
     </div>
     <div className="radar-container">
       <img src={`${process.env.PUBLIC_URL}/maquettes/part2-radar.jpg`} />
     </div>
    </div>
  )
}

export default PrincipalVisualizationPart2;