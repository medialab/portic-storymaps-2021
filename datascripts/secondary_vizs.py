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


def compute_hierarchy_country_group (country):
  switcher = {
    "France": "France",
    "France (région PASA)": "France",
    "Indéterminé": "Autre",
    "": "Autre",
    "zone maritime": "Autre",
    "multi-Etat": "Autre",
    "France (hors région PASA)": "France",
    "Hambourg": "Europe centrale",
    "Duché d'Oldenbourg": "Europe centrale",
    "Prusse": "Europe centrale",
    "Lubeck": "Europe centrale",
    "Brême": "Europe centrale",
    "Mecklenbourg": "Europe centrale",
    "Duché de Mecklenbourg": "Europe centrale",
    "Autriche": "Europe centrale",
    "Grande-Bretagne": "Europe du Nord",
    "Provinces-Unies": "Europe du Nord",
    "Danemark": "Europe du Nord",
    "Etats-Unis d'Amérique": "Amérique",
    "Pologne": "Europe de l'Est",
    "Russie": "Europe de l'Est",
    "Espagne": "Europe du Sud",
    "Portugal": "Europe du Sud",
  }
  if country in switcher:
    return switcher[country]
  else:
    print('oups', country)


def compute_hierarchy_of_homeports_of_boats_from_region (pointcalls):
  print('compute_hierarchy_of_homeports_of_boats_from_region')
  homeports = {}
  admiralties = ['La Rochelle', "Sables d'Olonne", "Marennes", "Sables-d’Olonne"]
  for pointcall in pointcalls:
    tonnage = int(pointcall["tonnage"]) if pointcall["tonnage"] != "" else 0
    homeport = pointcall["homeport_toponyme_fr"]
    homeport = homeport if homeport != "" and homeport != "port pas identifié" and homeport != "pas identifié" else "Indéterminé"
    if homeport in homeports:
      homeports[homeport]["nb_pointcalls"] += 1
      homeports[homeport]["tonnage"] += tonnage
    else:
      country = pointcall["homeport_state_1789_fr"]
      category_1 = "France" if country == "France" else "étranger"
      category_2 = country if country != "France" else "France (hors région PASA)"
      if country == "France" and pointcall["homeport_admiralty"] in admiralties:
        category_2 = "France (région PASA)"
      if category_2 == '':
        category_2 = 'Indéterminé'
      homeports[homeport] = {
        "nb_pointcalls": 1,
        "tonnage": 1,
        "category_1": category_1,
        "country_group": compute_hierarchy_country_group(country),
        "category_2": category_2,
      }
  output = [{"homeport": homeport, **vals} for homeport, vals in homeports.items()]
  write_csv("hierarchie_ports_dattache_des_navires_partant_de_la_region.csv", output)


def compute_hierarchy_of_homeports_of_boats_from_region_to_foreign (pointcalls):
  print('compute_hierarchy_of_homeports_of_boats_from_region_to_foreign')
  homeports = {}
  admiralties = ['La Rochelle', "Sables d'Olonne", "Marennes", "Sables-d’Olonne"]
  for pointcall in pointcalls:
    if pointcall["state_1789_fr"] == "France":
      continue;
    tonnage = int(pointcall["tonnage"]) if pointcall["tonnage"] != "" else 0
    homeport = pointcall["homeport_toponyme_fr"]
    homeport = homeport if homeport != "" and homeport != "port pas identifié" and homeport != "pas identifié" else "Indéterminé"
    if homeport in homeports:
      homeports[homeport]["nb_pointcalls"] += 1
      homeports[homeport]["tonnage"] += tonnage
    else:
      country = pointcall["homeport_state_1789_fr"]
      category_1 = "France" if country == "France" else "étranger"
      category_2 = country if country != "France" else "France (hors région PASA)"
      if country == "France" and pointcall["homeport_admiralty"] in admiralties:
        category_2 = "France (région PASA)"
      if category_2 == '':
        category_2 = 'Indéterminé'
      homeports[homeport] = {
        "nb_pointcalls": 1,
        "tonnage": 1,
        "country_group": compute_hierarchy_country_group(country),
        "category_1": category_1,
        "category_2": category_2,
      }
  output = [{"homeport": homeport, **vals} for homeport, vals in homeports.items()]
  write_csv("hierarchie_destinations_des_navires_partant_de_la_region_vers_letranger.csv", output)

def compute_hierarchy_of_directions_of_boats_from_region (pointcalls):
  print('compute_hierarchy_of_directions_of_boats_from_region')
  directions = {}
  admiralties = ['La Rochelle', "Sables d'Olonne", "Marennes", "Sables-d’Olonne"]
  for pointcall in pointcalls:
    if pointcall["state_1789_fr"] == "France":
      continue;
    tonnage = int(pointcall["tonnage"]) if pointcall["tonnage"] != "" else 0
    port = pointcall["toponyme_fr"]
    port = port if port != "" and port != "port pas identifié" and port != "pas identifié" and port != "illisible" else "Indéterminé"
    if port in directions:
      directions[port]["nb_pointcalls"] += 1
      directions[port]["tonnage"] += tonnage
    else:
      country = pointcall["state_1789_fr"]
      category_1 = "France" if country == "France" else "étranger"
      category_2 = country if country != "France" else "France (hors région PASA)"
      if country == "France" and pointcall["pointcall_admiralty"] in admiralties:
        category_2 = "France (région PASA)"
      if category_2 == '':
        category_2 = 'Indéterminé'
      directions[port] = {
        "nb_pointcalls": 1,
        "tonnage": 1,
        "country_group": compute_hierarchy_country_group(country),
        "category_1": category_1,
        "category_2": category_2,
      }
  output = [{"port": port, **vals} for port, vals in directions.items()]
  write_csv("hierarchie_destinations_des_navires_partant_de_la_region.csv", output)

def compute_french_fleat_part (pointcalls):
  print('compute_french_fleat_part')
  ports = {}
  countries = {}
  for pointcall in pointcalls:
    if pointcall['pointcall_function'] != 'O':
      continue
    # if pointcall["homeport_province"] not in ["Aunis", "Poitou", "Saintonge", "Angoumois"] and pointcall["homeport_state_1789_fr"] != "France":
    country = "french" if pointcall["homeport_state_1789_fr"] == "France" else "foreign"
    tonnage = int(pointcall["tonnage"]) if pointcall["tonnage"] != "" else 0
    port = pointcall['toponyme_fr']
    if port not in ports:
      new_port = {
        "port": port,
        "latitude": pointcall["latitude"],
        "longitude": pointcall["longitude"],
        "tonnage": tonnage,
        "tonnage_by_country": {
          "french": 0,
          "foreign": 0
        }
      }
      ports[port] = new_port
    else:
      ports[port]["tonnage"] += tonnage
    
    ports[port]["tonnage_by_country"][country] += tonnage
  ports = [port for port_name, port in ports.items()]
  for port in ports:
    tonnage_french = port["tonnage_by_country"]["french"]
    tonnage_foreign = port["tonnage_by_country"]["foreign"]
    port["tonnage_french"] = tonnage_french
    port["tonnage_foreign"] = tonnage_foreign
    tonnage_part_of_french = tonnage_french / port["tonnage"] * 100
    if tonnage_part_of_french == 100:
      tonnage_part_of_french = "100%"
    elif tonnage_part_of_french >= 75:
      tonnage_part_of_french = "75% ou plus"
    else:
      tonnage_part_of_french = "moins de 75%"
    port["tonnage_part_of_french"] = tonnage_part_of_french
    del port["tonnage_by_country"]
    port["tonnage"] = round(port["tonnage"] / 1000, 1)
  write_csv("part_navigation_fr.csv", ports)

def compute_out_with_salt (pointcalls):
  print('compute_out_with_salt')
  ports = {}
  countries = {}
  for pointcall in pointcalls:
    if pointcall['pointcall_function'] != 'O':
      continue
    commodity_fields = ['commodity_standardized_fr', 'commodity_standardized2_fr', 'commodity_standardized3_fr', 'commodity_standardized4_fr']
    has_salt = False
    for field in commodity_fields:
      if pointcall[field] == 'Sel':
        has_salt = True
    if has_salt is False:
      continue
    # if pointcall["homeport_province"] not in ["Aunis", "Poitou", "Saintonge", "Angoumois"] and pointcall["homeport_state_1789_fr"] != "France":
    tonnage = int(pointcall["tonnage"]) if pointcall["tonnage"] != "" else 0
    port = pointcall['toponyme_fr']
    if port not in ports:
      new_port = {
        "port": port,
        "latitude": pointcall["latitude"],
        "longitude": pointcall["longitude"],
        "tonnage": tonnage,
        "nb_pointcalls": 1
      }
      ports[port] = new_port
    else:
      ports[port]["tonnage"] += tonnage
      ports[port]["nb_pointcalls"] += 1
  ports = [port for port_name, port in ports.items()]    
  write_csv("out_with_salt_by_port.csv", ports)

def compute_exports_colonial_products(flows):
  print('compute_exports_colonial_products')

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

def compute_region_ports_general (pointcalls):
  ports = {}
  for pointcall in pointcalls:
    if pointcall['pointcall_function'] != 'O':
      continue
    port = pointcall['toponyme_fr']
    if port not in ports:
      new_port = {
        "port": port,
        "latitude": pointcall["latitude"],
        "longitude": pointcall["longitude"],
        "customs_office": pointcall["ferme_bureau"],
        "province": pointcall["pointcall_province"],
        "admiralty": pointcall["pointcall_admiralty"],
        "customs_region": pointcall["ferme_direction"],
        "nb_pointcalls": 1
      }
      ports[port] = new_port
    else:
      ports[port]["nb_pointcalls"] += 1
  output = []
  for port in ports.values():
    output.append(port)
  print("compute ports_locations_data_intro.csv")
  write_csv("ports_locations_data_intro.csv", output)

# The following is computed because deprecated as we don't need anymore to use pointcalls to reconstruct flows
# def compute_flows_from_boats_of_la_rochelle_1787(pointcalls_out, pointcalls_in):
#   admiralties = ["Sables-d'Olonne", "Les Sables d'Olonne", "Les Sables-d'Olonne", "La Rochelle", "Marennes"]
#   print("nombre de pointcalls Out ou In-Out (départs et étapes) trouvés pour des navires du port de La Rochelle:", len(pointcalls_out))
#   print("Nombre de pointcalls In trouvés entre 1787 et 1788 : ", len(pointcalls_in))
#   # collecte de leurs source_doc_id
#   pointcalls_departures_source_doc_ids = set()

#   for p in pointcalls_out:
#       pointcalls_departures_source_doc_ids.add(p['source_doc_id'])
#   print("Nombre de source_doc_id trouvés : ", len(pointcalls_departures_source_doc_ids))
#   # retrouver les destinations : 2 etape de filtrage des pointcalls In considérés comme destination des Out sortant de Marennes avec du sel (même pkid)
#   pointcalls_destinations_la_rochelle_homeport = []
#   for p in pointcalls_in:
#       if (str(p['source_doc_id']) in pointcalls_departures_source_doc_ids):
#           pointcalls_destinations_la_rochelle_homeport.append(p)

#   print("Nombre de destinations pertinentes trouvées : ", len(pointcalls_destinations_la_rochelle_homeport))
#   flows_la_rochelle_homeport_1787 = {}
#   ## but de reconstruire dicts qui mettent en relation les trajets qui ont le même source doc id mais je ne sais comment gérer les etapes
#   #{
#   #    'source_doc_id':
#   #    { 'lat_dep':
#   #      'lon_dep':
#   #      'lat_step': # après vérification on a au max 1 escale dans les données qu'on utilise
#   #      'lon_step': 
#   #      'lat_dest':
#   #      'lon_dest':
#   #      'tonnage':
#   #    }
#   #}

#   for p in pointcalls_out:
#       port = p['pointcall']
#       tonnage = int(p['tonnage']) if p['tonnage'] is not None else 0
#       lat = float(p['latitude']) if p['latitude'] is not None else None
#       lon = float(p['longitude']) if p['longitude'] is not None else None
      
#       if p['source_doc_id'] not in flows_la_rochelle_homeport_1787:
#           if p['pointcall_action']=='Out':
#               flows_la_rochelle_homeport_1787[p['source_doc_id']] = {
#                   'latitude_dep':lat,
#                   'longitude_dep':lon,
#                   'port_dep':port,
#                   'tonnage':tonnage,
#                   'category': 'région PASA' if p['pointcall_admiralty'] in admiralties else 'France'
#               }
#           else:
#               flows_la_rochelle_homeport_1787[p['source_doc_id']] = {
#                   'latitude_step':lat,
#                   'longitude_step':lon,
#                   'port_step':port,
#                   'tonnage':tonnage,
#                   'category': 'région PASA' if p['pointcall_admiralty'] in admiralties else 'France'
#               }
#       else:
#           if p['pointcall_action']=='Out':
#               flows_la_rochelle_homeport_1787[p['source_doc_id']]['port_dep'] = port
#               flows_la_rochelle_homeport_1787[p['source_doc_id']]['latitude_dep'] = lat
#               flows_la_rochelle_homeport_1787[p['source_doc_id']]['longitude_dep'] = lon
#           else:
#               flows_la_rochelle_homeport_1787[p['source_doc_id']]['port_step'] = port
#               flows_la_rochelle_homeport_1787[p['source_doc_id']]['latitude_step'] = lat
#               flows_la_rochelle_homeport_1787[p['source_doc_id']]['longitude_step'] = lon

#   for p in pointcalls_destinations_la_rochelle_homeport:
#       port = p['pointcall']
#       tonnage = int(p['tonnage']) if p['tonnage'] is not None else 0
#       lat = float(p['latitude'] if p['latitude'] != "" else 0) if p['latitude'] is not None else None
#       lon = float(p['longitude'] if p['longitude'] != "" else 0 ) if p['longitude'] is not None else None
      
#       if p['source_doc_id'] not in flows_la_rochelle_homeport_1787:
#           print("soucis") # on ne devrait pas avoir de source_doc_id inexistant
#       else:
#           flows_la_rochelle_homeport_1787[p['source_doc_id']]['port_dest'] = port
#           flows_la_rochelle_homeport_1787[p['source_doc_id']]['latitude_dest'] = lat
#           flows_la_rochelle_homeport_1787[p['source_doc_id']]['longitude_dest'] = lon

#   for key, values in flows_la_rochelle_homeport_1787.items():
#       if 'latitude_step' not in values:
#           flows_la_rochelle_homeport_1787[key]['port_step'] = None
#           flows_la_rochelle_homeport_1787[key]['latitude_step'] = None
#           flows_la_rochelle_homeport_1787[key]['longitude_step'] = None
      
#   # print(flows_la_rochelle_homeport_1787)

#   unique_flows = {} # but de pouvoir cumuler le nombre de flows / le tonnage sur un même trajet (même trajet si même départ et même destination)
#   # un trajet unique est identifié par 'lat_dep_lon_dep_lat_dest_lon_dest'
#   for source_doc_id, values in flows_la_rochelle_homeport_1787.items():
#       # j'ai 3 flows avec Err dans les coords de destination, et un 4e flow avec ces coords à None => a solutionner si temps
#       if ('latitude_dep' in values and 'longitude_dep' in values and 'latitude_dest' in values and 'longitude_dest' in values):
#           if str(values['latitude_dep'])+'_'+str(values['longitude_dep'])+'_'+str(values['latitude_dest'])+'_'+str(values['longitude_dest']) not in unique_flows:
#               unique_flows[str(values['latitude_dep'])+'_'+str(values['longitude_dep'])+'_'+str(values['latitude_dest'])+'_'+str(values['longitude_dest'])] = {
#                   'port_dep':values['port_dep'],
#                   'port_dest':values['port_dest'],
#                   'latitude_dep':values['latitude_dep'],
#                   'longitude_dep':values['longitude_dep'],
#                   'latitude_dest':values['latitude_dest'],
#                   'longitude_dest':values['longitude_dest'],
#                   'category': values['category'],
#                   'nb_flows': 1,
#                   'tonnages_cumulés':values['tonnage']
#               }
#           else:
#               unique_flows[str(values['latitude_dep'])+'_'+str(values['longitude_dep'])+'_'+str(values['latitude_dest'])+'_'+str(values['longitude_dest'])]['nb_flows'] += 1
#               unique_flows[str(values['latitude_dep'])+'_'+str(values['longitude_dep'])+'_'+str(values['latitude_dest'])+'_'+str(values['longitude_dest'])]['tonnages_cumulés'] += values['tonnage']

#   flows_la_rochelle_homeport_1787 = [{'source_doc_id': source_doc_id, **vals} for source_doc_id, vals in flows_la_rochelle_homeport_1787.items()]
#   unique_flows = [{
#     'flow_id': flow_id, 
#     **vals,
#     "category": vals["category"] if vals["category"] != '' else 'Étranger'
#     } for flow_id, vals in unique_flows.items()]
#   # print(unique_flows)
#   write_csv("voyages-bateaux-homeport-larochelle-1787.csv", unique_flows)

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
  admiralties = ['La Rochelle', "Sables d'Olonne", "Marennes", "Sables-d’Olonne"]
  out_from_region = []
  in_from_region = []
  all_pointcalls_1789 = []
  for pointcall in pointcalls:
    if pointcall["pointcall_admiralty"] in admiralties:
      all_pointcalls_1789.append(pointcall)
    if pointcall["pointcall_admiralty"] in admiralties and pointcall["pointcall_action"] == "Out" and pointcall["pointcall_function"] == "O":
      out_from_region.append(pointcall)
    if pointcall["source_subset"] == "Poitou_1789" and pointcall["pointcall_action"] == "In":
      in_from_region.append(pointcall)
  compute_hierarchy_of_homeports_of_boats_from_region(out_from_region)
  compute_hierarchy_of_homeports_of_boats_from_region_to_foreign(in_from_region)
  compute_hierarchy_of_directions_of_boats_from_region(in_from_region)
  compute_french_fleat_part(out_from_region)
  compute_out_with_salt(out_from_region)
  compute_region_ports_general(all_pointcalls_1789)

# Deprecated version using pointcalls (deprecated because now flows are fine)
# with open('../data/navigo_all_pointcalls_1787.csv', 'r') as f:
#   pointcalls = csv.DictReader(f)
#   pointcalls_1787_of_boats_from_larochelle_out = []
#   pointcalls_1787_in = []
#   for pointcall in pointcalls:
#     if pointcall['homeport'] == 'La Rochelle' and pointcall['pointcall_action'] in ['Out', 'In-Out', 'In-out']:
#       pointcalls_1787_of_boats_from_larochelle_out.append(pointcall)
#     elif pointcall['pointcall_action'] in ['In', 'in']:
#       pointcalls_1787_in.append(pointcall)
#   compute_flows_from_boats_of_la_rochelle_1787(pointcalls_1787_of_boats_from_larochelle_out, pointcalls_1787_in)


with open('../data/navigo_raw_flows_1789.csv', 'r') as f:
  flows = csv.DictReader(f)
  flows_from_marennes = []
  for flow in flows:
    if flow['departure'] == 'Marennes':
      flows_from_marennes.append(flow)
  print('relevant flows for la Marennes', len(flows_from_marennes))
  countries = {}
  for flow in flows_from_marennes:
    tonnage = int(pointcall["tonnage"]) if pointcall["tonnage"] != "" else 0
    country = flow['destination_state_1789_fr'] if flow['destination_state_1789_fr'] != '' else 'Indéterminé'
    # country = flow['destination_fr'] if country == 'France' else country
    if country not in countries:
      countries[country] = {
        "country": country,
        "nb_pointcalls": 1,
        "tonnage": tonnage
      }
    else:
      countries[country]["nb_pointcalls"] += 1
      countries[country]["tonnage"] += tonnage
  countries = [payload for _name, payload in countries.items()]
  write_csv("sorties-de-marennes.csv", countries)


with open('../data/navigo_raw_flows_1787.csv', 'r') as f:
  flows = csv.DictReader(f)
  flows_of_boats_from_larochelle = []
  for flow in flows:
    if flow['homeport'] == 'La Rochelle':
      flows_of_boats_from_larochelle.append(flow)
  print('relevant flows for la rochelle', len(flows_of_boats_from_larochelle))
  unique_flows = {}
  for flow in flows_of_boats_from_larochelle:
    tonnage = float(flow['tonnage']) if flow['tonnage'] != '' else 0
    footprint = str(flow['departure_latitude'])+':'+str(flow['departure_longitude'])+';'+str(flow['destination_latitude'])+':'+str(flow['destination_longitude'])
    if footprint not in unique_flows:
      unique_flows[footprint] = {
          'port_dep':flow['departure_fr'],
          'port_dest':flow['destination_fr'],
          'latitude_dep':flow['departure_latitude'],
          'longitude_dep':flow['departure_longitude'],
          'latitude_dest':flow['destination_latitude'],
          'longitude_dest':flow['destination_longitude'],
          'category': 'région PASA' if flow['departure_admiralty'] in admiralties else 'France',
          'nb_flows': 1,
          'tonnages_cumulés': tonnage
      }
    else:
      unique_flows[footprint]['nb_flows'] += 1
      unique_flows[footprint]['tonnages_cumulés'] += tonnage
  unique_flows = [{
    'flow_id': flow_id, 
    **vals,
    # "category": vals["category"] if vals["category"] != '' else 'Étranger'
    } for flow_id, vals in unique_flows.items()]
  # print(unique_flows)
  write_csv("voyages-bateaux-homeport-larochelle-1787.csv", unique_flows)

"""
(partie 2)
carte de flux des navires de La Rochelle, aggregable par tonnages cumulés, ou nombre de trajets (interactivité)

@TODO le notebook est là : https://github.com/medialab/portic-datasprint-2021/blob/main/productions_post_sprint/carte-trajets-navires-homeport-la-rochelle-1787/carte-trajets-navires-homeport-la-rochelle-1787.ipynb
je n'ai juste pas eu le temps de transposer le script (Cécile)
"""

