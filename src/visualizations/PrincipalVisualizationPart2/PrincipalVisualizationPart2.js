import CircularAlluvialComponent from "../../components/CircularAlluvialComponent/CircularAlluvialComponent";

import './PrincipalVisualizationPart2.scss';

const PrincipalVisualizationPart2 = ({width, height, datasets, ...props}) => {
  const {step} = props;
  let alluvialFilters = [];
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
      break;
    default:
      break;
  }
  return (
    <div className="PrincipalVisualizationPart2">
     <div>
        <CircularAlluvialComponent
          data={datasets['part_2_toflit_viz_data.csv']}
          width={width}
          height={height}
          sumBy="value"
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
     <div>
       Radar à venir ici
     </div>
    </div>
  )
}

export default PrincipalVisualizationPart2;