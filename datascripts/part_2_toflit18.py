import csv
from collections import defaultdict
from lib import ensure_dir, logger, write_readme


logger.info('start | part 2 main viz toflit18 data')
relevant_flows = []
# retrieve relevant flows
with open('../data/toflit18_all_flows.csv', 'r') as f:
    toflit18_flows = csv.DictReader(f)
    flows_fieldnames = toflit18_flows.fieldnames
    for flow in toflit18_flows:
      if flow['year'] == '1789' and flow['customs_region'] == 'La Rochelle' and flow['best_guess_region_prodxpart'] == '1' and flow['partner_grouping'] != 'France':
        relevant_flows.append(flow)

# format flows
africa_products = {
    "Exports": {},
    "Imports": {}
}
colonies_products = {
    "Exports": {},
    "Imports": {}
}
for f in relevant_flows :
    product_weight_kg = 0
    # @todo a lot of products are flushed out when doing the following
    if f['quantity_unit_metric'] and f['quantity_unit_metric'] == 'kg':
      product_weight_kg = float(f['quantities_metric'] if f['quantities_metric'] else 0)
    f['product_weight_kg'] = product_weight_kg
    product_viz = ''
    product_viz_en = ''
    product = f['product_revolutionempire']
    value = f['value'].split('.')[0] if f['value'].split('.')[0] != '' else 0
    flow_type = f['export_import']

    if (f['partner_grouping'] == 'Afrique'):
        africa_products[flow_type][product] = int(africa_products[flow_type][product]) + int(value) if f['product_simplification'] in africa_products[flow_type] else int(value)
    elif (f['partner_grouping'] == 'Amériques' or f['partner_grouping'] == 'Asie'):
        colonies_products[flow_type][product] = int(colonies_products[flow_type][product]) + int(value) if product in colonies_products[flow_type] else int(value)
    
    if product in ['Café', 'Sucre', 'Indigo', 'Coton non transformé']:
        product_viz = "produits coloniaux"
        product_viz_en = "colonial products"
    elif (product == 'Sel'):
        product_viz = 'sel'
        product_viz_en = "salt"
    elif (product == 'Eaux-de-vie et liqueurs' or product == 'Vins divers'):
        product_viz = 'eau-de-vie et vins divers'
        product_viz_en = 'brandies and diverse wines'
    else :
        product_viz = 'autres produits'
        product_viz_en = 'other products'
    f['product_viz'] = product_viz
    f['product_viz_fr'] = product_viz
    f['product_viz_en'] = product_viz_en
    
    partner_viz = ''
    partner_viz_en = ''
    if (f['partner_simplification'] == 'Monde hors colonies'):
        # partner_viz = 'Indéterminé (supposé réexportations vers Europe)'
        partner_viz = 'Indéterminé supposé Europe'
        partner_viz_en = 'Indetermined supposed Europe'
    elif (f['partner_grouping'] == 'France'):
        partner_viz = 'Ports francs et petites îles'
        partner_viz_en = 'Free ports and small islands'
    elif (f['partner_grouping'] in ['Flandre et autres états de l\'Empereur', 'Nord', 'Flandres', 'Hollande', 'Espagne', 'Portugal', 'Allemagne']):
        partner_viz = 'Europe'
        partner_viz_en = 'Europe'
    elif (f['partner_grouping'] == 'Angleterre'):
        partner_viz = 'Grande Bretagne'
        partner_viz_en = 'Great Britain'
    elif (f['partner_grouping'] == 'Afrique'):
        partner_viz = 'Afrique'
        partner_viz_en = 'Africa'
    elif (f['partner_grouping'] == 'Amériques' or f['partner_grouping'] == 'Asie'):
        # partner_viz = 'Colonies (Saint-Domingue, Indes, îles fr de l\'Amérique)'
        partner_viz = 'Colonies'
        partner_viz_en = 'Colonies'
    else:
        partner_viz = 'Reste du monde (USA)'
        partner_viz_en = 'Rest of the world (USA)'
        
    f['partner_viz'] = partner_viz
    f['partner_viz_fr'] = partner_viz
    f['partner_viz_en'] = partner_viz_en
    f['customs_office'] = f['customs_office'] if f['customs_office'] != 'Aligre' else 'Marans'

def format_for_viz(f):
    flow_type = 'export' if f['export_import'] == 'Exports' else 'import'
    return {
        "flow_type": flow_type,
        "customs_office": f['customs_office'],
        "product": f["product_viz"],
        "product_fr": f["product_viz_fr"],
        "product_en": f["product_viz_en"],
        "partner": f["partner_viz"],
        "partner_fr": f["partner_viz_fr"],
        "partner_en": f["partner_viz_en"],
        "value": f["value"],
        "product_weight_kg": f['product_weight_kg']
    }

initial_flows_viz = [format_for_viz(f) for f in relevant_flows]
uniques = defaultdict(lambda: ({"value": 0, "product_weight_kg": 0}))
for flow in initial_flows_viz:
  identity = (flow["flow_type"], flow["customs_office"], flow["product"], flow["partner"])
  # if identity in uniques:
  uniques[identity]["value"] += (float(flow["value"]) if flow["value"] else 0)
  uniques[identity]["product_weight_kg"] += (float(flow["product_weight_kg"]) if flow["product_weight_kg"] else 0)
  uniques[identity]["flow_type"] = flow["flow_type"]
  uniques[identity]["customs_office"] = flow["customs_office"]
  uniques[identity]["product"] = flow["product"]
  uniques[identity]["product_fr"] = flow["product_fr"]
  uniques[identity]["product_en"] = flow["product_en"]
  uniques[identity]["partner"] = flow["partner"]
  uniques[identity]["partner_fr"] = flow["partner_fr"]
  uniques[identity]["partner_en"] = flow["partner_en"]
  """
  else:
    uniques[identity] = {
      "value": flow["value"],
      "product_weight_kg": flow["product_weight_kg"]
    }
    """
flows_viz = list(uniques.values())

# write and document dataset
info = """
`part_2_toflit_viz_data.csv` documentation
===

# What is the original data ? 

toflit18 flows from [`bdd courante.csv`](https://github.com/medialab/toflit18_data/blob/master/base/bdd%20courante.csv.zip) file

# What does a line correspond to ?

An aggregation of toflit18 flows for 1789, corresponding to :

- 1 bureau des fermes in particular
- 1 class of partner in particular
- 1 type of product in particular

# Filters

- source "Best Guess customs region prod x partner" (best_guess_region_prodxpart == 1)
- year : 1789
- customs_region : La Rochelle

# Aggregation/computation info

- values aggregated by cumulated value in livre tournois
- partner column is made from a custom classification to see directly in the datascript `datascripts/part_2_toflit18.py`
- product column is made from a custom classification to see directly in the datascript `datascripts/part_2_toflit18.py`

# Notes/warning

- Products weights are quite rarely specified in flows
  """
dataset_filepath = "../public/data/part_2_toflit_viz_data/part_2_toflit_viz_data.csv"
ensure_dir("../public/data/part_2_toflit_viz_data/")
write_readme("part_2_toflit_viz_data/README.md", info)
with open(dataset_filepath, "w") as csvfile:
  fieldnames = flows_viz[0].keys()
  writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

  writer.writeheader()
  for f in flows_viz:
      writer.writerow(f)
  logger.debug('done | part 2 main viz toflit18 data')