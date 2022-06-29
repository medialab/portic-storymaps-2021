import csv
from lib import write_csv, logger, write_readme


def compute_out_with_salt_from_marennes (flows):
  logger.info('start | compute_out_with_salt_from_marennes')
  ports = {}
  countries = {}
  for flow in flows:
    if flow['departure_function'] != 'O' or flow['departure_fr'] != 'Marennes':
      continue
    commodity_fields = ['commodity_standardized_fr', 'commodity_standardized2_fr', 'commodity_standardized3_fr', 'commodity_standardized4_fr']
    has_salt = False
    for field in commodity_fields:
      if flow[field] == 'Sel':
        has_salt = True
    if has_salt is False:
      continue
    tonnage = int(flow["tonnage"]) if flow["tonnage"] != "" else 0
    port = flow['destination_fr']
    country = flow['destination_state_1789_fr'] if flow['destination_state_1789_fr'] != '' else 'Autre'
    latitude = flow['destination_latitude']
    longitude = flow['destination_longitude']
    if port not in ports:
      new_port = {
        "port": port,
        "country": country,
        "latitude": latitude,
        "longitude": longitude,
        "tonnage": tonnage,
        "nb_flows": 1
      }
      ports[port] = new_port
    else:
      ports[port]["tonnage"] += tonnage
      ports[port]["nb_flows"] += 1
  ports = [port for _port_name, port in ports.items()]    
  write_csv("sorties-de-marennes-avec-sel-destinations/sorties-de-marennes-avec-sel-destinations.csv", ports)
  logger.debug('end | compute_out_with_salt_from_marennes')


def compute_sorties_from_marennes(flows_from_marennes):
  logger.info('start | compute_sorties_from_marennes')
  countries = {}
  admiralties = ['La Rochelle', "Sables d'Olonne", "Marennes", "Sables-d’Olonne"]
  for flow in flows_from_marennes:
    tonnage = int(flow["tonnage"]) if flow["tonnage"] != "" else 0
    country = flow['destination_state_1789_fr'] if flow['destination_state_1789_fr'] != '' else 'Indéterminé'
    if country == 'France':
      admiralty = flow['destination_admiralty']
      if admiralty in admiralties:
        country = 'France (région PASA)'
      else:
        country = 'France (hors région PASA)'
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
  info = """
`sorties-de-marennes.csv` documentation
===

# What is the original data ? 

Navigo flows from the `raw_flows` API endpoint.

# What does a line correspond to ?

One destination for boats that moved from Marennes port to another location in 1789.

# Filters

- year = 1789

# Aggregation/computation info

- aggregation is done by country, except for France for which we divide France (région PASA) and France (hors PASA) based on the admiralty of destination
- aggregation is done by number of travels and cumulated tonnage

# Notes/warning

/
  """
  write_readme("sorties-de-marennes/README.md", info)
  write_csv("sorties-de-marennes/sorties-de-marennes.csv", countries)
  logger.debug('done | compute_sorties_from_marennes')


def compute_ports_from_larochelle_to_pasa(flows_from_la_rochelle_to_pasa):
  logger.info('start | compute_ports_from_larochelle_to_pasa')
  # computing destinations from la rochelle
  ports = {}
  for flow in flows_from_la_rochelle_to_pasa:
    tonnage = int(flow["tonnage"]) if flow["tonnage"] != "" else 0
    port = flow['destination_fr']
    if port not in ports:
      ports[port] = {
        "port": port,
        "nb_flows": 1,
        "tonnage": tonnage
      }
    else:
      ports[port]["nb_flows"] += 1
      ports[port]["tonnage"] += tonnage
  ports = [payload for _name, payload in ports.items()]
  info = """
`ports-from-larochelle-to-pasa.csv` documentation
===

# What is the original data ? 

Navigo flows from the `raw_flows` API endpoint.

# What does a line correspond to ?

One destination for boats that moved from La Rochelle port to another location in 1789 in the PASA region.

# Filters

- year = 1789
- departure_function = 'O'
- port departure = "La Rochelle"
- destination_admiralty in ['La Rochelle', "Sables d'Olonne", "Marennes", "Sables-d’Olonne"]

# Aggregation/computation info

- aggregation is done by number of travels and cumulated tonnage

# Notes/warning

/
  """
  write_readme("ports-from-larochelle-to-pasa/README.md", info)
  write_csv("ports-from-larochelle-to-pasa/ports-from-larochelle-to-pasa.csv", ports)
  logger.debug('done | compute_ports_from_larochelle_to_pasa')



def compute_flows_homeport_larochelle(flows_of_boats_from_larochelle):
  logger.info("start | compute_flows_homeport_larochelle")
  unique_flows = {}
  for flow in flows_of_boats_from_larochelle:
    tonnage = float(flow['tonnage']) if flow['tonnage'] != '' else 0
    footprint = str(flow['departure_latitude'])+':'+str(flow['departure_longitude'])+';'+str(flow['destination_latitude'])+':'+str(flow['destination_longitude'])
    if footprint not in unique_flows:
      unique_flows[footprint] = {
          'port_dep':flow['departure_fr'],
          'port_dest':flow['destination_fr'],
          'port_dest_category': 'pasa' if (flow['destination_admiralty'] in admiralties) else 'France' if (flow['destination_state_1789_fr'] == 'France' and flow['destination_fr'] not in ['Saint-Marc', 'Saint-Pierre-et-Miquelon', 'Sénégal', 'île de France / île Maurice']) else 'étranger',
          'latitude_dep':flow['departure_latitude'],
          'longitude_dep':flow['departure_longitude'],
          'latitude_dest':flow['destination_latitude'],
          'longitude_dest':flow['destination_longitude'],
          'category_fr': 'région PASA' if flow['departure_admiralty'] in admiralties else 'France',
          'category_en': 'PASA region' if flow['departure_admiralty'] in admiralties else 'France',
          'nb_flows': 1,
          'tonnages_cumulés': tonnage
      }
    else:
      unique_flows[footprint]['nb_flows'] += 1
      unique_flows[footprint]['tonnages_cumulés'] += tonnage
  unique_flows = [{
    'flow_id': flow_id, 
    **vals,
    } for flow_id, vals in unique_flows.items()]
  info = """
`voyages-bateaux-homeport-larochelle-1787.csv` documentation
===

# What is the original data ? 

Navigo flows from the `raw_flows` API endpoint.

# What does a line correspond to ?

One travel/flow of a boat for which the homeport is La Rochelle port.

# Filters

- year = 1787
- homeport = "La Rochelle"

# Aggregation/computation info

- aggregation is done by number of travels and cumulated tonnage

# Notes/warning

/
  """
  write_readme("voyages-bateaux-homeport-larochelle-1787/README.md", info)
  write_csv("voyages-bateaux-homeport-larochelle-1787/voyages-bateaux-homeport-larochelle-1787.csv", unique_flows)
  logger.debug('done | compute_flows_homeport_larochelle')


with open('../data/navigo_raw_flows_1787.csv', 'r') as f:
  logger.debug('retrieving data from ' + 'data/navigo_raw_flows_1787.csv')
  flows = csv.DictReader(f)
  flows_of_boats_from_larochelle = []
  admiralties = ['La Rochelle', "Sables d'Olonne", "Marennes", "Sables-d’Olonne"]
  for flow in flows:
    if flow['homeport'] == 'La Rochelle':
      flows_of_boats_from_larochelle.append(flow)
  compute_flows_homeport_larochelle(flows_of_boats_from_larochelle)
  

with open('../data/navigo_raw_flows_1789.csv', 'r') as f:
  logger.debug('retrieving data from ' + 'data/navigo_raw_flows_1789.csv')
  flows = csv.DictReader(f)
  flows_from_marennes = []
  flows_from_la_rochelle_to_pasa = []
  admiralties = ['La Rochelle', "Sables d'Olonne", "Marennes", "Sables-d’Olonne"]
  for flow in flows:
    if flow['departure'] == 'Marennes':
      flows_from_marennes.append(flow)
    elif flow['departure'] == 'La Rochelle' and flow['departure_function'] == 'O' and flow['destination_admiralty'] in admiralties:
      flows_from_la_rochelle_to_pasa.append(flow)
  
  compute_sorties_from_marennes(flows_from_marennes)
  compute_out_with_salt_from_marennes(flows_from_marennes)
  compute_ports_from_larochelle_to_pasa(flows_from_la_rochelle_to_pasa)
