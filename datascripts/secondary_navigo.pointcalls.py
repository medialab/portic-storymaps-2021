import csv
from lib import write_csv, logger

def compute_hierarchy_country_group (country, port):
  if port == 'Côte d\'Angole' or port == 'Côte d\'Or':
    return 'Afrique'
  if port == 'Mer Baltique':
    return 'Europe de l\'Est'
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
    logger.warning('oups', country)


def compute_hierarchy_of_homeports_of_boats_from_region (pointcalls):
  logger.info('start | compute_hierarchy_of_homeports_of_boats_from_region')
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
      country = country if country != "Duché de Mecklenbourg" else "Mecklenbourg"
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
        "country_group": compute_hierarchy_country_group(country, homeport),
        "category_2": category_2,
      }
  output = [{"homeport": homeport, **vals} for homeport, vals in homeports.items()]
  write_csv("hierarchie_ports_dattache_des_navires_partant_de_la_region/hierarchie_ports_dattache_des_navires_partant_de_la_region.csv", output)
  logger.debug('done | compute_hierarchy_of_homeports_of_boats_from_region')


def compute_hierarchy_of_homeports_of_boats_from_region_to_foreign (pointcalls):
  logger.info('start | compute_hierarchy_of_homeports_of_boats_from_region_to_foreign')
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
      country = country if country != "Duché de Mecklenbourg" else "Mecklenbourg"
      category_1 = "France" if country == "France" else "étranger"
      category_2 = country if country != "France" else "France (hors région PASA)"
      if country == "France" and pointcall["homeport_admiralty"] in admiralties:
        category_2 = "France (région PASA)"
      if category_2 == '':
        category_2 = 'Indéterminé'
      homeports[homeport] = {
        "nb_pointcalls": 1,
        "tonnage": 1,
        "country_group": compute_hierarchy_country_group(country, homeport),
        "category_1": category_1,
        "category_2": category_2,
      }
  output = [{"homeport": homeport, **vals} for homeport, vals in homeports.items()]
  write_csv("hierarchie_destinations_des_navires_partant_de_la_region_vers_letranger/hierarchie_destinations_des_navires_partant_de_la_region_vers_letranger.csv", output)
  logger.debug('done | compute_hierarchy_of_homeports_of_boats_from_region_to_foreign')

def compute_hierarchy_of_destinations_of_boats_from_region (pointcalls):
  logger.info('start | compute_hierarchy_of_destinations_of_boats_from_region')
  directions = {}
  admiralties = ['La Rochelle', "Sables d'Olonne", "Marennes", "Sables-d’Olonne"]
  for pointcall in pointcalls:
    if pointcall["state_1789_fr"] == "France":
      continue;
    tonnage = int(pointcall["tonnage"]) if pointcall["tonnage"] != "" else 0
    port = pointcall["toponyme_fr"]
    port = port if port != "" and port != "port pas identifié" and port != "pas identifié" and port != "illisible" and port != "pas mentionné" else "Indéterminé"
    if port in directions:
      directions[port]["nb_pointcalls"] += 1
      directions[port]["tonnage"] += tonnage
    else:
      country = pointcall["state_1789_fr"]
      country = country if country != "Duché de Mecklenbourg" else "Mecklenbourg"
      category_1 = "France" if country == "France" else "étranger"
      category_2 = country if country != "France" else "France (hors région PASA)"
      if country == "France" and pointcall["pointcall_admiralty"] in admiralties:
        category_2 = "France (région PASA)"
      if category_2 == '':
        category_2 = 'Indéterminé'
      directions[port] = {
        "nb_pointcalls": 1,
        "tonnage": 1,
        "country_group": compute_hierarchy_country_group(country, port),
        "category_1": category_1,
        "category_2": category_2,
      }
  output = [{"port": port, **vals} for port, vals in directions.items()]
  write_csv("hierarchie_destinations_des_navires_partant_de_la_region/hierarchie_destinations_des_navires_partant_de_la_region.csv", output)
  logger.debug('done | compute_hierarchy_of_destinations_of_boats_from_region')

def compute_french_fleat_part (pointcalls):
  logger.info('start | compute_french_fleat_part')
  ports = {}
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
  write_csv("part_navigation_fr/part_navigation_fr.csv", ports)
  logger.debug('done | compute_french_fleat_part')


def compute_out_with_salt (pointcalls):
  logger.info('start | compute_out_with_salt')
  ports = {}
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
  ports = [port for _port_name, port in ports.items()]    
  write_csv("out_with_salt_by_port/out_with_salt_by_port.csv", ports)
  logger.debug('done | compute_out_with_salt')


def compute_foreign_homeport_state (pointcalls):
  logger.info('start | compute_foreign_homeport_state')
  countries = {}
  for pointcall in pointcalls:
    if pointcall['pointcall_function'] != 'O' or pointcall['homeport_state_1789_fr'] == 'France' or pointcall['homeport_state_1789_fr'] == '':
      continue
    tonnage = int(pointcall["tonnage"]) if pointcall["tonnage"] != "" else 0
    country = pointcall['homeport_state_1789_fr']
    if country not in countries:
      new_country = {
        "country": country,
        "latitude": pointcall["latitude"],
        "longitude": pointcall["longitude"],
        "tonnage": tonnage,
        "nb_pointcalls": 1
      }
      countries[country] = new_country
    else:
      countries[country]["tonnage"] += tonnage
      countries[country]["nb_pointcalls"] += 1
  countries = [country for _, country in countries.items()]    
  write_csv("origines_bateaux_etrangers_partant_de_la_region/origines_bateaux_etrangers_partant_de_la_region.csv", countries)
  logger.debug('done | compute_foreign_homeport_state')

def compute_region_ports_general (pointcalls):
  logger.info('start | compute_region_ports_general');
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
  write_csv("ports_locations_data_intro/ports_locations_data_intro.csv", output)
  logger.debug('done | compute_region_ports_general');



with open('../data/navigo_all_pointcalls_1789.csv', 'r') as f:
  logger.debug('retrieving data from ' + 'data/navigo_all_pointcalls_1789.csv')
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
  compute_hierarchy_of_destinations_of_boats_from_region(in_from_region)
  compute_french_fleat_part(out_from_region)
  compute_out_with_salt(out_from_region)
  compute_foreign_homeport_state(out_from_region)
  compute_region_ports_general(all_pointcalls_1789)

