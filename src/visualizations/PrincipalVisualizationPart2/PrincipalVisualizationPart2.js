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
  const colorsPalettes = {
    'product': {
      'sel': '#FEEA3B',
      'eau-de-vie et vins divers': '#A07BEE',
      'autres produits': '#E0E3E6',
      'produit colonial (\'Café\', \'Sucre\', \'Indigo\', \'Coton non transformé\')': '#FEA43B',
        },
    'partner': {
      'Afrique': '#875E2E',
      'Reste du monde (USA)': '#E0E3E6',
      'Grande Bretagne': '#542AAD',
      'Europe': '#A07BEE',
      'Ports francs et petites îles': '#72808D',
      'Colonies (Saint-Domingue, Indes, îles fr de l\'Amérique)': '#E5881A',
      'Indéterminé (supposé réexportations vers Europe)': '#A07BEE'
    },
    'customs_office': {
      'La Rochelle': '#41BEA3',
      'Rochefort': '#349883',
      'Saint-Martin-de-Ré': '#277262',
      'Charente': '#5AD0F4',
      'Aligre': '#67CBB6',
      'Les Sables d\'Olonne': '#668EDB',
      'Marennes': '#A7E6F9',
    }
  }
  return (
    <div className="PrincipalVisualizationPart2">
     <div>
        <CircularAlluvialComponent
          data={datasets['part_2_toflit_viz_data.csv']}
          width={showOnlyToflit ? width : width / 2}
          height={height}
          sumBy={sumToflitBy}
          filters={alluvialFilters}
          colorsPalettes={colorsPalettes}
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