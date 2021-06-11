import csv

OUTPUT = "../public/data/part_2_toflit_viz_data.csv"

relevant_flows = []
# retrieve relevant flows
with open('../data/toflit18_all_flows.csv', 'r') as f:
    toflit18_flows = csv.DictReader(f)
    flows_fieldnames = toflit18_flows.fieldnames
    for flow in toflit18_flows:
      if flow['year'] == '1789' and flow['customs_region'] == 'La Rochelle' and flow['best_guess_region_prodxpart'] == '1':
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
    # @todo a lot of products are flushed out when doing thing
    # print(f['quantities_metric'], f['quantity_unit_metric'])
    if f['quantity_unit_metric'] and f['quantity_unit_metric'] == 'kg':
      product_weight_kg = float(f['quantities_metric'] if f['quantities_metric'] else 0)
    f['product_weight_kg'] = product_weight_kg
    product_viz = ''
    product = f['product_revolutionempire']
    value = f['value'].split('.')[0] if f['value'].split('.')[0] != '' else 0
    flow_type = f['export_import']
    """
    if (f['product_simplification'] == 'guinée'):
        print(f['product_revolutionempire'], f['value'])
    """
    if (f['partner_grouping'] == 'Afrique'):
        africa_products[flow_type][product] = int(africa_products[flow_type][product]) + int(value) if f['product_simplification'] in africa_products[flow_type] else int(value)
    elif (f['partner_grouping'] == 'Amériques' or f['partner_grouping'] == 'Asie'):
        colonies_products[flow_type][product] = int(colonies_products[flow_type][product]) + int(value) if product in colonies_products[flow_type] else int(value)
    
    if product in ['Café', 'Sucre', 'Indigo', 'Coton non transformé']:
        product_viz = "produit colonial ('Café', 'Sucre', 'Indigo', 'Coton non transformé')"
    elif (product == 'Sel'):
        product_viz = 'sel'
    elif (product == 'Eaux-de-vie et liqueurs' or product == 'Vins divers'):
        product_viz = 'eau-de-vie et vins divers'
    else :
        product_viz = 'autres produits'
    f['product_viz'] = product_viz
    
    partner_viz = ''
    if (f['partner_simplification'] == 'Monde hors colonies'):
        partner_viz = 'Indéterminé (supposé réexportations vers Europe)'
    elif (f['partner_grouping'] == 'France'):
        partner_viz = 'Ports francs et petites îles'
    elif (f['partner_grouping'] in ['Flandre et autres états de l\'Empereur', 'Nord', 'Flandres', 'Hollande', 'Espagne', 'Portugal', 'Allemagne']):
        partner_viz = 'Europe'
    elif (f['partner_grouping'] == 'Angleterre'):
        partner_viz = 'Grande Bretagne'
    elif (f['partner_grouping'] == 'Afrique'):
        partner_viz = 'Afrique'
    elif (f['partner_grouping'] == 'Amériques' or f['partner_grouping'] == 'Asie'):
        partner_viz = 'Colonies (Saint-Domingue, Indes, îles fr de l\'Amérique)'
    else:
        partner_viz = 'Reste du monde (USA)'
        
    f['partner_viz'] = partner_viz

def format_for_viz(f):
    flow_type = 'export' if f['export_import'] == 'Exports' else 'import'
    return {
        "flow_type": flow_type,
        "customs_office": f['customs_office'],
        "product": f["product_viz"],
        "partner": f["partner_viz"],
        "value": f["value"],
        "product_weight_kg": f['product_weight_kg']
    }

# write dataset
with open(OUTPUT, "w") as csvfile:
  flows_viz = [format_for_viz(f) for f in relevant_flows]
  fieldnames = flows_viz[0].keys()
  writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

  writer.writeheader()
  for f in flows_viz:
      writer.writerow(f)