import csv
from operator import itemgetter
from lib import get_online_csv, write_csv, logger, write_readme

"""
Produits dont les valeurs d'exports sont les plus importantes en 1789 : comparaison de La Rochelle à la moyenne française
"""
def compute_top_shared_toflit18_products(flows):
    logger.info('start | compute_top_shared_toflit18_products')
    total_exports_per_direction = {}
    total_imports_per_direction = {}

    # calcul de la part de chaque produit dans les exports totaux
    total_exports_la_rochelle_1789 = 0
    total_exports_toute_france_1789 = 0
    total_exports_la_rochelle_1789_without_ports_francs = 0
    total_exports_toute_france_1789_without_ports_francs = 0

    # normalizes toflit flow to have it as La Rochelle or France
    def prepare_flow(flow):
        f = flow.copy()
        if f['export_import'] == 'Imports' or f['export_import'] == 'import':
            f['export_import'] = 'Imports'
        elif f['customs_region'] == '' or f['customs_region'] == 'National':
            f['customs_region_simpl'] = 'National'
        if f['customs_region'] == 'La Rochelle':
            f['customs_region_simpl'] = 'La Rochelle'
        else:
            f['customs_region_simpl'] = 'Autre direction'
        f['value'] = float(f['value']) if f['value'] != '' else 0
        return f

    def clean_flow(flow):
        f = flow.copy()
        abs_map = total_exports_per_direction if f['export_import'] == 'Exports' else total_imports_per_direction
        f['value_rel_per_direction'] = f['value'] / \
            abs_map[f['customs_region_simpl']]
        return f

    def aggregate_exports_by_product(flows):
        flows_aggregated_by_product = {}
        # je veux construire un dict par produit, en distinguant LR / pas LR

        for flow in flows:
            if flow['product_revolutionempire'] not in flows_aggregated_by_product:
                flows_aggregated_by_product[flow['product_revolutionempire']] = {
                    'product': flow['product_revolutionempire'],
                    'exports_la_rochelle': 0,
                    'exports_toute_france': 0,
                }
        # à la fin pour chaque produit je sommerais le total export pour calculer du relatif
            if flow['customs_region_simpl'] == 'La Rochelle' and flow['export_import'] == 'Exports':
                flows_aggregated_by_product[flow['product_revolutionempire']
                                            ]['exports_la_rochelle'] += float(flow['value'])
            flows_aggregated_by_product[flow['product_revolutionempire']
                                        ]['exports_toute_france'] += float(flow['value'])

        return flows_aggregated_by_product

    def aggregate_exports_by_product_removing_ports_francs(flows):
        flows_aggregated_by_product = {}
        # je veux construire un dict par produit, en distinguant LR / pas LR

        for flow in flows:
            if flow['product_revolutionempire'] not in flows_aggregated_by_product:
                flows_aggregated_by_product[flow['product_revolutionempire']] = {
                    'product': flow['product_revolutionempire'],
                    'exports_la_rochelle': 0,
                    'exports_toute_france': 0,
                }
        # à la fin pour chaque produit je sommerais le total export pour calculer du relatif
            if flow['partner_grouping'] != 'France' and flow['export_import'] == 'Exports':
                if flow['customs_region_simpl'] == 'La Rochelle':
                    flows_aggregated_by_product[flow['product_revolutionempire']
                                                ]['exports_la_rochelle'] += float(flow['value'])
                flows_aggregated_by_product[flow['product_revolutionempire']
                                            ]['exports_toute_france'] += float(flow['value'])

        return flows_aggregated_by_product

    for f in flows:
        flow = prepare_flow(f)
        if flow['export_import'] == 'Imports':
            if flow['customs_region_simpl'] not in total_imports_per_direction:
                total_imports_per_direction[flow['customs_region_simpl']] = 0
            total_imports_per_direction[flow['customs_region_simpl']
                                        ] += float(flow['value'])
        else:
            if flow['customs_region_simpl'] not in total_exports_per_direction:
                total_exports_per_direction[flow['customs_region_simpl']] = 0
            total_exports_per_direction[flow['customs_region_simpl']
                                        ] += float(flow['value'])

    flows = [clean_flow(prepare_flow(f)) for f in flows]

    # aggregation des flux par produit
    product_exports_values_per_direction_1789 = aggregate_exports_by_product(
        flows)
    product_exports_values_per_direction_1789_without_ports_francs = aggregate_exports_by_product_removing_ports_francs(
        flows)

    for product, values in product_exports_values_per_direction_1789.items():
        total_exports_la_rochelle_1789 += values['exports_la_rochelle']
        total_exports_toute_france_1789 += values['exports_toute_france']

    for product, values in product_exports_values_per_direction_1789.items():
        values['exports_rel_la_rochelle'] = values['exports_la_rochelle'] / \
            total_exports_la_rochelle_1789
        values['exports_rel_toute_france'] = values['exports_toute_france'] / \
            total_exports_toute_france_1789

    for product, values in product_exports_values_per_direction_1789_without_ports_francs.items():
        total_exports_la_rochelle_1789_without_ports_francs += values['exports_la_rochelle']
        total_exports_toute_france_1789_without_ports_francs += values['exports_toute_france']

    for product, values in product_exports_values_per_direction_1789_without_ports_francs.items():
        values['exports_rel_la_rochelle'] = values['exports_la_rochelle'] / \
            total_exports_la_rochelle_1789_without_ports_francs
        values['exports_rel_toute_france'] = values['exports_toute_france'] / \
            total_exports_toute_france_1789_without_ports_francs

    # ordonner en mettant en premier les produits les plus importants pour La Rochelle
    sorted_product_exports_values_per_direction_1789 = sorted(
        product_exports_values_per_direction_1789.values(), key=itemgetter('exports_rel_la_rochelle'), reverse=True)
    sorted_product_exports_values_per_direction_1789_without_ports_francs = sorted(
        product_exports_values_per_direction_1789_without_ports_francs.values(), key=itemgetter('exports_rel_la_rochelle'), reverse=True)

    # reformatter les données sous la forme d'un ensemble de dicts : un dict par produit pour La Rochelle et un dict par produit pour l'ensemble de la France
    final_vega_data_1789 = []
    i = 0
    for values in sorted_product_exports_values_per_direction_1789:

        final_vega_data_1789.append({
            "product": values['product'],
            "entity": 'direction des fermes de La Rochelle',
            "value_rel_per_direction": values['exports_rel_la_rochelle'],
            "order": i
        })

        final_vega_data_1789.append({
            "product": values['product'],
            "entity": "France (moyenne)",
            "value_rel_per_direction": values['exports_rel_toute_france'],
            "order": i
        })

        i += 1

    final_vega_data_1789_without_ports_francs = []
    i = 0
    for values in sorted_product_exports_values_per_direction_1789_without_ports_francs:

        final_vega_data_1789_without_ports_francs.append({
            "product": values['product'],
            "entity": 'direction des fermes de La Rochelle',
            "value_rel_per_direction": values['exports_rel_la_rochelle'],
            "order": i
        })

        final_vega_data_1789_without_ports_francs.append({
            "product": values['product'],
            "entity": "France (moyenne)",
            "value_rel_per_direction": values['exports_rel_toute_france'],
            "order": i
        })

        i += 1
    info = """
`comparison_products_exports_part_la_rochelle.csv` documentation
===

# What is the original data ? 

toflit18 flows from [`bdd courante.csv`](https://github.com/medialab/toflit18_data/blob/master/base/bdd%20courante.csv.zip) file

# What does a line correspond to ?

One product exported by either France or La Rochelle customs direction.

# Filters

- source "Best Guess customs region prod x partner" (best_guess_region_prodxpart == 1)
- we exclude ports francs ("product_grouping" != "France")

# Aggregation/computation info

- flows geographic attribution is done according to 3 classes : La Rochelle (customs_direction = "La Rochelle"), National (customs_direection = "National" or "") and "Autre direction"
- France means metrics per products are derivated from all flows, La Rochelle comes from La Rochelle flows only
- products classes are from "revolution & empire" classification
- values aggregated by cumulated value in livre tournois

# Notes/warning

One should wonder if using both national and direction-level for France means might cause duplicates (?).
However it might not matter so much as we are calculating a means of products shares (?).
  """
    write_readme("comparison_products_exports_part_la_rochelle/README.md", info)
    write_csv("comparison_products_exports_part_la_rochelle/comparison_products_exports_part_la_rochelle.csv", final_vega_data_1789_without_ports_francs)
    logger.debug('done | compute_top_shared_toflit18_products')

def compute_global_la_rochelle_evolution (flows_national, flows_regional):
  logger.info('start | compute_global_la_rochelle_evolution')
  years_list = [y + 1720 for y in range(1789 - 1720 + 1)]
  flows_national = [f for f in flows_national if int(f["year"].split('.')[0]) >= 1720 and int(f["year"].split('.')[0]) <= 1789]
  flows_regional = [f for f in flows_regional if int(f["year"].split('.')[0]) >= 1720 and int(f["year"].split('.')[0]) <= 1789]
  years = {}
  for y in years_list:
      years[y] = {
          "year": y,
          "france_total": 0,
          "france_export": 0,
          "france_import": 0,
          
          "la_rochelle_total": 0,
          "la_rochelle_export": 0,
          "la_rochelle_import": 0,
      }
  
  for f in flows_national:
      year = int(str(f['year'].split('.')[0]))
      value = float(f['value']) if f['value'] != '' else 0
      itype = f['export_import'] if f['export_import'] != 'import' else 'Imports'

      detailed_field = 'france_import' if itype == 'Imports' else 'france_export'
      years[year]['france_total'] = years[year]['france_total'] + value        
      years[year][detailed_field] = years[year][detailed_field] + value      
  for f in flows_regional:
      year = int(str(f['year'].split('.')[0]))
      value = float(f['value']) if f['value'] != '' else 0
      itype = f['export_import'] if f['export_import'] != 'import' else 'Imports'
      from_larochelle = f['customs_region'] == 'La Rochelle'
      if from_larochelle:
          detailed_field = 'la_rochelle_import' if itype == 'Imports' else 'la_rochelle_export'
          years[year]['la_rochelle_total'] += value     
          years[year][detailed_field] += value
  part_by_year = []
  for year, values in years.items():
      part_by_year.append({
          "year": year,
          "type": "import",
          "portion": values['la_rochelle_import'] / values['france_total'] if  values['france_total'] > 0 else 0
      })
      part_by_year.append({
          "year": year,
          "type": "export",
          "portion": values['la_rochelle_export'] / values['france_total'] if  values['france_total'] > 0 else 0
      })
  info = """
`global_evolution_la_rochelle_imports_exports.csv` documentation
===

# What is the original data ? 

toflit18 flows from [`bdd courante.csv`](https://github.com/medialab/toflit18_data/blob/master/base/bdd%20courante.csv.zip) file

# What does a line correspond to ?

One year of import or export for La Rochelle, with attached metrics about share of trade against france total trade.

# Filters

- for La Rochelle numbers : source "Best Guess customs region prod x partner" (best_guess_region_prodxpart == 1)
- for national numbers : source "best guess national partner" (best_guess_national_partner == 1)
- we exclude ports francs ("product_grouping" != "France")

# Aggregation/computation info

- values aggregated by cumulated value in livre tournois

# Notes/warning

/
  """
  write_readme("global_evolution_la_rochelle_imports_exports/README.md", info)
  write_csv("global_evolution_la_rochelle_imports_exports/global_evolution_la_rochelle_imports_exports.csv", part_by_year)
  logger.debug('done | compute_global_la_rochelle_evolution')



def compute_exports_colonial_products(flows):
  logger.info('start | compute_exports_colonial_products')
  output = []
  origins = set()
  pasa_provinces = ['Aunis', 'Poitou', 'Saintonge', 'Angoumois']
  # Starting with sables d'Olonne as they are not in the data
  customs_offices = {
    "Les Sables d'Olonne": {
        "autres produits": 0,
        "produits coloniaux": 0,
        "produits de la région PASA" : 0
    }
  }

  for f in [f for f in flows if f["customs_region"] == "La Rochelle"] :
    product_viz = ''
    product_viz_alt = ''
    product = f['product_revolutionempire']
    customs_office = f['customs_office'] if f['customs_office'] != 'Aligre' else 'Marans';
    if (customs_office not in customs_offices):
      customs_offices[customs_office] = {
        "autres produits": 0,
        "produits coloniaux": 0,
        "produits de la région PASA" : 0
      }

    value = str(f['value']).split('.')[0] if str(f['value']).split('.')[0] != '' else 0
    flow_type = f['export_import']
    local_origin = True if f['origin_province'] in pasa_provinces else False
    
    if product in ['Café', 'Sucre', 'Indigo', 'Coton non transformé']:
        product_viz = "produits coloniaux"
        product_viz_alt = "produits coloniaux"
    else:
        product_viz = "autres produits"
        if local_origin == True:
            product_viz_alt = "produits de la région PASA"
        else:
            product_viz_alt = "autres produits"
    if f["export_import"] == "Exports":
      customs_offices[customs_office][product_viz_alt] += float(value)

  for customs_office, products in customs_offices.items():
    for product, value in products.items():
      output.append({
        "value": value,
        "customs_office": customs_office,
        "type": product
      })
  output = sorted(output, key=lambda v : -v["value"])
  info = """
`comparaison_exports_coloniaux.csv` documentation
===

# What is the original data ? 

toflit18 flows from [`bdd courante.csv`](https://github.com/medialab/toflit18_data/blob/master/base/bdd%20courante.csv.zip) file

# What does a line correspond to ?

One class of product for one customs office (direction des fermes) with its value.

# Filters

- year = 1789
- source "Best Guess customs region prod x partner" (best_guess_region_prodxpart == 1)
- we exclude ports francs ("product_grouping" != "France")

# Aggregation/computation info

- products are classed along three categories:
  - "produit colonial" if product revolution&empire class is in ['Café', 'Sucre', 'Indigo', 'Coton non transformé']
  - "produit de la région PASA" if "origin_province" is in ['Aunis', 'Poitou', 'Saintonge', 'Angoumois']
  - "autre produit" for all the rest
- values are aggregated by cumulated value in livre tournois

# Notes/warning

/
  """
  write_readme("comparaison_exports_coloniaux/README.md", info)
  write_csv("comparaison_exports_coloniaux/comparaison_exports_coloniaux.csv", output)
  logger.debug('done | compute_exports_colonial_products')

def compute_eau_de_vie_datasets(flows):
  logger.info('start | compute_eau_de_vie_datasets')
  eau_de_vie_types = get_online_csv("https://docs.google.com/spreadsheets/d/e/2PACX-1vQI3rLZXqFtiqO4q8Pbp5uGH8fon-hYrd-LnJGtsYMe6UWWCwubvanKZY4FW1jI6eJ5OJ_GA8xUxYQf/pub?output=csv")
  eau_de_vie_types_map = {}
  for item in eau_de_vie_types:
    eau_de_vie_types_map[item['product_simplification']] = item['type_edv']
  la_rochelle_exports_by_year = {}
  export_slices = {
    "1750": {
      "La Rochelle": 0,
      "Bordeaux": 0,
      "Nantes": 0,
      "Bayonne": 0,
      "Montpellier": 0
    },
    "1770": {
      "La Rochelle": 0,
      "Bordeaux": 0,
      "Nantes": 0,
      "Bayonne": 0,
      "Montpellier": 0
    },
    "1789": {
      "La Rochelle": 0,
      "Bordeaux": 0,
      "Nantes": 0,
      "Bayonne": 0,
      "Montpellier": 0
    }
  }
  origins = {}
  for flow in flows:
    value = float(flow['value']) if flow['value'] != '' else 0
    year = flow['year']
    customs_region = flow['customs_region']
    origin = flow['origin'] if flow['origin'] != '' else 'inconnu'
    if flow['export_import'] == 'Exports':
      if year in export_slices:
        if customs_region in export_slices[year]:
          export_slices[year][customs_region] += value
      if customs_region == 'La Rochelle':
        if year not in la_rochelle_exports_by_year:
          la_rochelle_exports_by_year[year] = value
        else:
          la_rochelle_exports_by_year[year] += value
        if year == '1789':
          if origin not in origins:
            origins[origin] = {
              "total": 0,
              "EDV simple": 0,
              "EDV double": 0
            }
          origins[origin]['total'] += value
          origins[origin][eau_de_vie_types_map[flow['product_simplification']]] += value
  origins_map = {}
  for origin, types in origins.items():
    for that_type, value in types.items():
      resolved_type = 'eau-de-vie simple' if that_type == 'EDV simple' else 'eau-de-vie double'
      if origin not in origins_map:
        origins_map[origin] = {}
      if resolved_type not in origins_map[origin]:
        origins_map[origin][resolved_type] = 0
      origins_map[origin][resolved_type] += float(value)
  origins_list = []
  for origin, types in origins_map.items():
    for that_type, value in types.items():
      origins_list.append({
        "origin": origin,
        "type": that_type,
        "value": value
      })
  export_slices_array = []
  for year, values in export_slices.items():
    for region, local_value in values.items():
      export_slices_array.append({
        "year": year,
        "customs_region": region,
        "value": local_value
      })
  la_rochelle_exports_by_year = [{"year": year, "value": value} for year, value in la_rochelle_exports_by_year.items()]
  info = """
`exports_eau_de_vie_la_rochelle_longitudinal.csv` documentation
===

# What is the original data ? 

toflit18 flows from [`bdd courante.csv`](https://github.com/medialab/toflit18_data/blob/master/base/bdd%20courante.csv.zip) file

# What does a line correspond to ?

One year of eau-de-vie exports from La Rochelle.

# Filters

- source "Best Guess customs region prod x partner" (best_guess_region_prodxpart == 1)
- we exclude ports francs ("product_grouping" != "France")
- customs_direction = "La Rochelle"
- type = exports
- filtering eau-de-vie products : flow["product_revolutionempire"] == "Eaux-de-vie et liqueurs" or flow["product_simplification"] == "vin et eau-de-vie" or flow["product_simplification"] == "vin et eau-de-vie de vin"

# Aggregation/computation info

- values are aggregated by cumulated value in livre tournois

# Notes/warning

/
  """
  write_readme("exports_eau_de_vie_la_rochelle_longitudinal/README.md", info)
  write_csv("exports_eau_de_vie_la_rochelle_longitudinal/exports_eau_de_vie_la_rochelle_longitudinal.csv", la_rochelle_exports_by_year)
  info = """
`exports_eau_de_vie_comparaison_directions_des_fermes.csv` documentation
===

# What is the original data ? 

toflit18 flows from [`bdd courante.csv`](https://github.com/medialab/toflit18_data/blob/master/base/bdd%20courante.csv.zip) file

# What does a line correspond to ?

One year of eau-de-vie exports for one specific customs direction (direction des fermes).

# Filters

- source "Best Guess customs region prod x partner" (best_guess_region_prodxpart == 1)
- we exclude ports francs ("product_grouping" != "France")
- customs_direction = "La Rochelle" or "Bordeaux" or "Nantes" or "Bayonne" or "Montpellier"
- type = exports
- filtering eau-de-vie products : flow["product_revolutionempire"] == "Eaux-de-vie et liqueurs" or flow["product_simplification"] == "vin et eau-de-vie" or flow["product_simplification"] == "vin et eau-de-vie de vin"

# Aggregation/computation info

- values are aggregated by cumulated value in livre tournois

# Notes/warning

/
  """
  write_readme("exports_eau_de_vie_comparaison_directions_des_fermes/README.md", info)
  write_csv("exports_eau_de_vie_comparaison_directions_des_fermes/exports_eau_de_vie_comparaison_directions_des_fermes.csv", export_slices_array)
  info = """
`origines_exports_eau_de_vie_1789_la_rochelle.csv` documentation
===

# What is the original data ? 

toflit18 flows from [`bdd courante.csv`](https://github.com/medialab/toflit18_data/blob/master/base/bdd%20courante.csv.zip) file

# What does a line correspond to ?

One type of eau-de-vie, for one type of origin.

# Filters

- year = 1789
- source "Best Guess customs region prod x partner" (best_guess_region_prodxpart == 1)
- we exclude ports francs ("product_grouping" != "France")
- customs_direction = "La Rochelle" or "Bordeaux" or "Nantes" or "Bayonne" or "Montpellier"
- type = exports
- filtering eau-de-vie products : flow["product_revolutionempire"] == "Eaux-de-vie et liqueurs" or flow["product_simplification"] == "vin et eau-de-vie" or flow["product_simplification"] == "vin et eau-de-vie de vin"

# Aggregation/computation info

- eau-de-vie are classified as simple or double against [the following classification](https://docs.google.com/spreadsheets/d/e/2PACX-1vQI3rLZXqFtiqO4q8Pbp5uGH8fon-hYrd-LnJGtsYMe6UWWCwubvanKZY4FW1jI6eJ5OJ_GA8xUxYQf/pub?output=csv)
- values are aggregated by cumulated value in livre tournois

# Notes/warning

/
  """
  write_readme("origines_exports_eau_de_vie_1789_la_rochelle/README.md", info)
  write_csv("origines_exports_eau_de_vie_1789_la_rochelle/origines_exports_eau_de_vie_1789_la_rochelle.csv", origins_list)
  logger.debug('done | compute_eau_de_vie_datasets')


with open('../data/toflit18_all_flows.csv', 'r') as f:
    toflit18_flows = csv.DictReader(f)
    # fill relevant flows
    flows_1789_by_region = []
    flows_1789_national = []
    flows_national_all_years = []
    flows_regional_all_years = []
    flows_eau_de_vie = []
    for flow in toflit18_flows:
      # getting international exports of salt from La Rochelle
      if flow['customs_region'] in ['La Rochelle', 'Bordeaux', 'Bayonne', 'Nantes', 'Montpellier'] and (flow["product_revolutionempire"] == "Eaux-de-vie et liqueurs" or flow["product_simplification"] == "vin et eau-de-vie" or flow["product_simplification"] == "vin et eau-de-vie de vin") and flow["best_guess_region_prodxpart"] == "1" and flow["partner_grouping"] != "France":
        flows_eau_de_vie.append(flow)
      # filtering out ports francs
      if flow["year"] == "1789":
        if flow["best_guess_region_prodxpart"] == "1" and flow["partner_grouping"] != "France":
          flows_1789_by_region.append(flow)
      if flow["best_guess_region_prodxpart"] == "1" and flow["partner_grouping"] != "France":
          flows_regional_all_years.append(flow)
      if flow["best_guess_national_partner"] == "1" and flow["partner_grouping"] != "France":
        flows_national_all_years.append(flow)
    compute_top_shared_toflit18_products(flows_1789_by_region)
    compute_global_la_rochelle_evolution(flows_national_all_years, flows_regional_all_years)
    compute_exports_colonial_products(flows_1789_by_region)
    compute_eau_de_vie_datasets(flows_eau_de_vie)