from collections import defaultdict
import csv
from typing import Counter, DefaultDict
from operator import itemgetter


def write_csv(filename, data):
  final_path = "../public/data/" + filename;
  with open(final_path, "w") as of:
    output_csv = csv.DictWriter(
        of, data[0].keys())
    output_csv.writeheader()
    output_csv.writerows(data)


"""
(partie 1)
Produits dont les valeurs d'exports sont les plus importantes en 1789 : comparaison de La Rochelle à la moyenne française
"""
def compute_top_shared_toflit18_products(flows):
    print('compute_top_shared_toflit18_products')
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

    # def remove_ports_francs_from_flows(flows):
    #     # return [f for f in flows if f['partner_grouping'] != 'France']
    #     flows_without_ports_francs = []
    #     i = 0
    #     for flow in flows:
    #         if flow['partner_grouping'] != 'France':
    #             i += 1
    #             flows_without_ports_francs.append(flow)
    #     print("nombre de pas ports francs trouvés : ", i)
    #     return flows_without_ports_francs

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

    # print("product_exports_values_per_direction_1789_without_ports_francs :", product_exports_values_per_direction_1789_without_ports_francs)

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
    write_csv("comparison_products_exports_part_la_rochelle.csv", final_vega_data_1789_without_ports_francs)

def compute_global_la_rochelle_evolution (flows_national, flows_regional):
  print('compute_global_la_rochelle_evolution')
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
  write_csv("global_evolution_la_rochelle_imports_exports.csv", part_by_year)

def compute_foreign_homeports (pointcalls):
  print('compute_foreign_homeports')
  countries = {}
  for pointcall in pointcalls:
    if pointcall["homeport_province"] not in ["Aunis", "Poitou", "Saintonge", "Angoumois"] and pointcall["homeport_state_1789_fr"] != "France":
      country = pointcall["homeport_state_1789_fr"]
      tonnage = int(pointcall["tonnage"]) if pointcall["tonnage"] != "" else 0
      if country in countries :
        countries[country]["nb_outs"] += 1;
        countries[country]["tonnage"] += tonnage;
      else:
        countries[country] = {
          "nb_outs" : 1,
          "tonnage": tonnage
        }
  output = [{"country": country, **values} for country,values in countries.items() if country != ""]
  write_csv("origines_bateaux_etrangers_partant_de_la_region.csv", output)

def compute_exports_colonial_products(flows):
  print('compute_exports_colonial_products')

  output = []
  origins = set()
  pasa_provinces = ['Aunis', 'Poitou', 'Saintonge', 'Angoumois']
  customs_offices = {}

  for f in [f for f in flows if f["customs_region"] == "La Rochelle"] :
    product_viz = ''
    product_viz_alt = ''
    product = f['product_revolutionempire']
    customs_office = f['customs_office'];
    if (customs_office not in customs_offices):
      customs_offices[customs_office] = {
        "autres produits": 0,
        "produits coloniaux": 0,
        "produits de la région PASA" : 0
      }

    value = str(f['value']).split('.')[0] if str(f['value']).split('.')[0] != '' else 0
    # f['value'] = float(value)
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
  write_csv("comparaison_exports_coloniaux.csv", output)


"""
  Data reading and building functions calls
"""
with open('../data/toflit18_all_flows.csv', 'r') as f:
    toflit18_flows = csv.DictReader(f)
    # fill relevant flows
    flows_1789_by_region = []
    flows_1789_national = []
    flows_national_all_years = []
    flows_regional_all_years = []
    for flow in toflit18_flows:
      # filtering out ports francs
        if flow["year"] == "1789":
          if flow["best_guess_region_prodxpart"] == "1" and flow["partner_grouping"] != "France":
            flows_1789_by_region.append(flow)
        if flow["best_guess_region_prodxpart"] == "1" and flow["partner_grouping"] != "France":
            flows_regional_all_years.append(flow)
        if flow["best_guess_national_partner"] == "1":
          flows_national_all_years.append(flow)

    compute_top_shared_toflit18_products(flows_1789_by_region)
    compute_global_la_rochelle_evolution(flows_national_all_years, flows_regional_all_years)
    compute_exports_colonial_products(flows_1789_by_region)

with open('../data/navigo_all_pointcalls_1789.csv', 'r') as f:
  pointcalls = csv.DictReader(f)
  admiralties = ['La Rochelle', "Sables d'Olonne", "Marennes"]
  out_from_region = []
  for pointcall in pointcalls:
    if pointcall["pointcall_admiralty"] in admiralties and pointcall["pointcall_action"] == "Out":
      out_from_region.append(pointcall)
  compute_foreign_homeports(out_from_region)