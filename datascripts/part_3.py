"""
@author : Cécile Asselin
DOCUMENTATION DE CE SCRIPT 

Ce qu'il fait ? ==> Ecriture de csv de données pour nourrir les visualisations de la partie 3 du site

(csv 0 de localisation de tous les ports de la DFLR dans leurs bureaux_map, provinces, amirautés, directions ... pour nourrir les cartes de l'intro)
pour chaque port DFLR en 1789 :
- nom du port
- coordonnées géographiques
- entités administratives d'appartenance (bureau, provinve, amirauté, direction)


csv pour nourrir les différentes étapes de la visualisation principale de la partie 3 :

step 1 / csv 1 (données Navigo) :
pour chaque port DFLR en 1789 :
- nombre de bateaux sortis du port
- tonnage moyen de ces bateaux

step 2 / gexf :
nourrir les réseaux de flux entre les ports
- de la DFLR
- des directions de Nantes et Bordeaux (comparaison)


step 3 / csv 3.1 (données Navigo sur les ports) et 3.2 (données Toflit sur les bureaux) :

csv 3.1
en 1789, pour chaque port DFLR + en 1787 pour chaque port de Bordeaux, Le Havre, Nantes (données Navigo):
- tonnage cumulé à destination de l’extérieur de la région
- tonnage cumulé à destination de l’hinterland de la région

csv 3.2
en 1789 pour tous bureaux DFLR + Bordeaux, Le Havre, Nantes (données Toflit):
- valeur cumulée exports produits d'origine extérieure à la région
- valeur cumulée exports produits originaires de l’hinterland (PASA)


************** UTILS *******************
- fonction clean_names : permet de standardiser certains noms de ports / bureaux (basé sur le champ toponyme_fr de Navigo)
- fonction correct_localities_alignment : permet de renvoyer les bureaux d'appartenance de certains ports à donner en entrée (correction des differences d'alignement entre l'API Portic et celles sur lesquels nous nous etions accordés sur le spreadsheet d'alignement) 
- variable chosen_year (peut être mise à 1787 si vous voulez avoir les données Navigo en 1787 pour DFLR et pas que autres régions)


*********** REMARQUES / A GARDER A L'ESPRIT ******************
step 3 :
- pour les données Navigo sur Nantes, Bordeaux et Le Havre, j'ai choisi de prendre l'année 1787 car on n'avait que très peu de données en 1789, et que les tonnages du Havre n'étaient pas mentionnés
  (j'ai gardé néanmoins les données DFLR à 1789 pour être alignés aux données Toflit sur lesquelles on ne peut prendre que l'année 1789, l'année 1787 n'ayant pas de données)
- pour les données Navigo portant sur la DFLR en 1789, on utilise les objets pointcalls et pas flows, car les flows de 1789 n'étaient pas encore correctement stabilisés sur l'API Portic au moment de l'écriture de ce script
- au niveau de la force de la visualisation pour argumenter "port de La Rochelle dominant mais pas structurant" : ça marche bien avec les données Toflit, c'est moins évident avec Navigo selon les données choisies 
  (attention au bureau de Saint Martin de-Ré : encore plus tourné vers l'exterieur de la région que La Rochelle en termes de tonnages cumulés qui sortent du bureau, mais on a peu de données sur ce bureau donc peu représentatif
   pour Marennes c'est le seul qui donne des gros tonnages vers l'extérieur) 
"""

import networkx as nx
import csv
from random import random
from lib import ensure_dir, logger, write_readme

logger.info('start | part 3 main viz datasets')


ports_dflr = set()
PORTS_FOR_COMPARISON = {'Bordeaux', 'Nantes', 'Le Havre'}
# je laisse Oléron dans les bureaux_map car c'est un bureau selon Navigo, mais étrange car n'en est pas un selon Toflit
UNIQUE_BUREAUX = {'Bordeaux', 'Nantes', 'Le Havre', 'La Rochelle', 'Marans', 'Saint-Martin-de-Ré', "Les Sables-d'Olonne",
    'Tonnay-Charente', 'Rochefort', 'Marennes', 'undefined customs office', 'ile de Bouin : hors DFLR'}

# normalizes names
def clean_names(name):
    if (name in ["Les Sables d'Olonne", "Sables d'Olonne"]):
        return "Les Sables-d'Olonne"
    elif (name in ['Aligre', 'Alligre']):
        return 'Marans'  # j'ai un doute là dessus mais c'est bien le toponyme_fr
    elif name == 'Saint-Martin île de Ré':
        return 'Saint-Martin-de-Ré'
    elif name == 'Charente':
        return 'Tonnay-Charente'
    elif name == '':
        return 'undefined customs office'
    else:
        return name

# fonction de correction d'incohérence observées dans les données Navigo, qui se base sur cet alignement : https://docs.google.com/spreadsheets/d/1_lg15b21Y6eA60dj7CmHvfcYkAd8riy7PCYxCFKTRR8/edit#gid=1003102058
def correct_localities_alignment(port):
    if port in ['Beauvoir-sur-Mer', 'Champagné-les-Marais']:
        # (pas Beauvoir-sur-Mer et Champagné-les-Marais)
        return "Les Sables-d'Olonne"
    elif port == 'Tonnay-Charente':
        return 'Tonnay-Charente'  # (pas Marennes)
    # Île d’Oléron et La Brée semblent être même cas que les autres même si pas mentionné dans le tableau d’alignement : pas Oléron) @TODO: vérification avec team Navigo x Toflit
    elif port in ["Saint-Denis d'Oléron", "Le Château-d'Oléron", 'Île d’Oléron', "île d'Oléron", 'La Brée']:
        return 'Marennes'
    elif port == 'île de Bouin':
        return 'ile de Bouin : hors DFLR'

# 1. write csv files

# ports_location_data_filepath : aims to feed intro maps (ports located in their bureaux, and provinces, and admiralties)
ports_location_data_filepath = "../public/data/ports_locations_data/ports_locations_data.csv"
# ports_tonnages_part3_data_filepath : aims to feed step 1 of the main viz of part3
part_3_step1_viz_data_filepath = "../public/data/part_3_step1_viz_data/part_3_step1_viz_data.csv"
ensure_dir("../public/data/ports_locations_data/")
ensure_dir("../public/data/part_3_step1_viz_data/")

"""
VIZ 3.1 PREPARATION
"""
relevant_pointcalls = []
# retrieve relevant pointcalls
with open('../data/navigo_all_pointcalls_1789.csv', 'r') as f:
    pointcalls = csv.DictReader(f)
    # pointcalls_fieldnames = pointcalls.fieldnames
    for pointcall in pointcalls:
      # par défaut dans le csv on a déjà que des pointcalls de 1789
      if pointcall['ferme_direction'] is not None and pointcall['ferme_direction'] == 'La Rochelle' and pointcall['pointcall_action'] == 'Out' and pointcall['pointcall_function'] == 'O':
        relevant_pointcalls.append(pointcall)
        ports_dflr.add(pointcall['toponyme_fr'])

# aggregate data by port
# init ports dict for aggregation
ports = {}
# initialize each port dict
for p in ports_dflr:
    ports[p] = {
        "port": p,
        "nb_pointcalls_out": 0,
        "cumulated_tonnage": 0,
        "mean_tonnage": 0
    }

# fill port objects with cumulated data, and ports coordinates
for p in relevant_pointcalls:
    port = p['toponyme_fr']
    if p['tonnage'] != '':
        tonnage = int(p['tonnage'])
    else:
        tonnage = 0
    ports[port]['cumulated_tonnage'] += tonnage
    ports[port]['nb_pointcalls_out'] += 1
    if 'latitude' not in ports[port].keys():
        ports[port]['latitude'] = p['latitude']
        ports[port]['longitude'] = p['longitude']
        ports[port]['customs_office'] = correct_localities_alignment(p['toponyme_fr']) if port in ['Beauvoir-sur-Mer', 'Champagné-les-Marais', 'Tonnay-Charente',
                                                                     "Saint-Denis d'Oléron", "Le Château-d'Oléron", 'Île d’Oléron', "île d'Oléron", 'La Brée', 'île de Bouin'] else clean_names(p['ferme_bureau'])
        ports[port]['province'] = p['pointcall_province']
        ports[port]['admiralty'] = p['pointcall_admiralty']
        ports[port]['customs_region'] = p['ferme_direction']

# calculate mean tonnage by port
for port, values in ports.items():
    values['mean_tonnage'] = values['cumulated_tonnage'] / values['nb_pointcalls_out'] if values['nb_pointcalls_out'] != 0 else 0

# write and document datasets
info = """
`ports_location_data.csv` documentation
===

# What is the original data ? 

Navigo pointcalls from pointcalls API endpoint

# What does a line correspond to ?

A specific port from PASA and its related general informations.

# Filters

- year : 1789
- pointcall_function : 'O'
- ferme_direction : 'La Rochelle'
- poincall_action: 'Out'

# Aggregation/computation info

/

# Notes/warning

/
"""
write_readme("ports_location_data/README.md", info)
with open(ports_location_data_filepath, "w", newline='') as csvfile:
    fieldnames = ['port', 'latitude', 'longitude',
        'customs_office', 'province', 'admiralty', 'customs_region']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

    writer.writeheader()
    for port in ports.values():
        writer.writerow({
            'port': port["port"],
            'latitude': port["latitude"],
            'longitude': port["longitude"],
            'customs_office': port["customs_office"],
            'province': port["province"],
            'admiralty': port["admiralty"],
            'customs_region': port["customs_region"]
        })

# ports_tonnages_part3_data_filepath : aims to feed step 1 of the main viz of part3
info = """
`part_3_step1_viz_data.csv` documentation
===

# What is the original data ? 

Navigo pointcalls from pointcalls API endpoint

# What does a line correspond to ?

A specific port from PASA and its related tonnage and travels data for 1789.

# Filters

- year : 1789
- pointcall_function : 'O'
- ferme_direction : 'La Rochelle'
- poincall_action: 'Out'

# Aggregation/computation info

/

# Notes/warning

/
"""
write_readme("part_3_step1_viz_data/README.md", info)
with open(part_3_step1_viz_data_filepath, "w", newline='') as csvfile:
    fieldnames = ['port', 'nb_pointcalls_out', 'mean_tonnage',
        'cumulated_tonnage', 'latitude', 'longitude', 'customs_office']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

    writer.writeheader()
    for port in ports.values():
        writer.writerow({
          'port': port["port"], 
          'nb_pointcalls_out': port["nb_pointcalls_out"], 
          'mean_tonnage': port["mean_tonnage"],
          'cumulated_tonnage': port["cumulated_tonnage"], 
          'latitude': port["latitude"], 
          'longitude': port["longitude"], 
          'customs_office': 
          port["customs_office"]
        })

# 3. write csv file to feed step 3 of the viz
part_3_step3_viz_ports_data_filepath = "../public/data/part_3_step3_viz_ports_data/part_3_step3_viz_ports_data.csv"
part_3_step3_viz_customs_offices_data_filepath = "../public/data/part_3_step3_viz_customs_offices_data/part_3_step3_viz_customs_offices_data.csv"
ensure_dir("../public/data/part_3_step3_viz_ports_data/")
ensure_dir("../public/data/part_3_step3_viz_customs_offices_data/")

def build_relevant_navigo_flows():
  i = 0
  j = 0
  results = []
  with open('../data/navigo_raw_flows_1789.csv', 'r') as f:
        flows = csv.DictReader(f)
        for flow in flows:
            if flow['departure_ferme_direction'] == 'La Rochelle' and flow['departure_function'] == 'O':
              results.append(flow)
              ports_dflr.add(flow['departure_fr'])
              i += 1
  with open('../data/navigo_raw_flows_1787.csv', 'r') as f:
        flows = csv.DictReader(f)
        for flow in flows:
            if flow['departure_fr'] in ['Bordeaux', 'Nantes', 'Le Havre']:
              results.append(flow)
              j += 1
  # print("nombre de flows navigo partis de la DFLR en 1789 : ", i)
  # print("nombre de flows navigo partis de Nantes, Bordeaux, Le Havre en 1787 : ", j)
  return results

def build_relevant_toflit_flows():
  results = []
  with open('../data/toflit18_all_flows.csv', 'r') as f:
    flows = csv.DictReader(f)
    for flow in flows:
        if flow['year'] == '1789' and flow['export_import'] == 'Exports' and flow['customs_office'] in ['La Rochelle', 'Marennes', 'Rochefort', 'Saint-Martin-de-Ré', "Les Sables d'Olonne", "Tonnay-Charente", 'Aligre', 'Charente', 'Le Havre', 'Bordeaux', 'Nantes']:
          results.append(flow)
  # print("nombre d'exports des bureaux de la DFLR + Nantes, Bordeaux, Le Havre en 1789 : ", len(results))
  return results



relevant_navigo_flows = build_relevant_navigo_flows()
relevant_toflit_flows = build_relevant_toflit_flows()

# aggregate data by port

# init port and bureaux objects
ports = {}
bureaux_map = {}

 # gérer les ports dont on a des données mais dont on ne veut pas dans la viz
ports_dflr.add('other ports not from region => to be erased from data')

for p in list(ports_dflr)+list(PORTS_FOR_COMPARISON):
    ports[p] = {
        "port": p,
        "nb_navigo_flows_taken_into_account": 0,
        "cumulated_tonnage_in_region": 0,
        "cumulated_tonnage_out_region": 0
    }

for b in list(UNIQUE_BUREAUX):
    bureaux_map[b] = {
        "bureau": b,
        "nb_navigo_flows_taken_into_account": 0,
        "nb_toflit_flows_taken_into_account": 0,
        "cumulated_tonnage_in_region": 0,
        "cumulated_tonnage_out_region": 0,
        "cumulated_exports_value_from_region": 0,
        "cumulated_exports_value_from_ext": 0
    }

# fill objects with cumulated data from navigo, and ports coord
for f in relevant_navigo_flows :
    port = f['departure_fr']
    bureau = clean_names(correct_localities_alignment(f['departure_fr'])) if port in ['Beauvoir-sur-Mer','Champagné-les-Marais', 'Tonnay-Charente', "Saint-Denis d'Oléron", "Le Château-d'Oléron", 'Île d’Oléron', "île d'Oléron", 'La Brée', 'île de Bouin'] else clean_names(f['departure_ferme_bureau'])

    if f['tonnage'] != '':
        tonnage = int(f['tonnage'])
    else:
        tonnage = 0
    if f['departure_ferme_direction'] == 'La Rochelle':
        if f['destination_ferme_direction'] == 'La Rochelle':
            ports[port]['cumulated_tonnage_in_region'] += tonnage
            bureaux_map[bureau]['cumulated_tonnage_in_region'] += tonnage
        else:
            ports[port]['cumulated_tonnage_out_region'] += tonnage
            bureaux_map[bureau]['cumulated_tonnage_out_region'] += tonnage
    elif f['departure_province'] is not None: # dans ce cas là notre flow ne part pas de La Rochelle, besoin de distinguer cas bordeaux, nantes, le havre
        if f['departure_province'] == f['destination_province']:
            ports[port]['cumulated_tonnage_in_region'] += tonnage
            bureaux_map[bureau]['cumulated_tonnage_in_region'] += tonnage
        else:
            ports[port]['cumulated_tonnage_out_region'] += tonnage
            bureaux_map[bureau]['cumulated_tonnage_out_region'] += tonnage
    else:
        logger.warning("on n'a rien ajouté")
    ports[port]['nb_navigo_flows_taken_into_account'] += 1
    bureaux_map[bureau]['nb_navigo_flows_taken_into_account'] += 1
    if 'latitude' not in ports[port].keys():
        ports[port]['latitude'] = f['departure_latitude']
        ports[port]['longitude'] = f['departure_longitude']
        ports[port]['customs_office'] = bureau
        ports[port]['customs_region'] = f['departure_ferme_direction']
    if 'latitude' not in bureaux_map[bureau].keys() and bureau == port:
        bureaux_map[bureau]['latitude'] = f['departure_latitude']
        bureaux_map[bureau]['longitude'] = f['departure_longitude']
        bureaux_map[bureau]['customs_region'] = f['departure_ferme_direction']

# fill port objects with cumulated data from toflit, (customs_office scaled data)
for f in relevant_toflit_flows:
    bureau = clean_names(f['customs_office'])
    if f['value'] is not None and f['value'] != '':
        value = float(f['value'])
    else:
        value = 0
    if f['customs_region'] == 'La Rochelle': # à priori tous les flux de 89 venant d'un bureau de la DFLR ont bien cet attribut
        if f['origin_province'] in ['Aunis', 'Poitou', 'Saintonge', 'Angoumois']:
            bureaux_map[bureau]['cumulated_exports_value_from_region'] += value  
        else:
            bureaux_map[bureau]['cumulated_exports_value_from_ext'] += value
    else: # dans ce cas on est censés avoir un flux pas dans la DFLR
        if f['customs_office'] == 'Le Havre':
            if f['origin_province'] == 'Normandie':
                bureaux_map[bureau]['cumulated_exports_value_from_region'] += value  
            else:
                bureaux_map[bureau]['cumulated_exports_value_from_ext'] += value
        elif f['customs_office'] == 'Bordeaux':
            if f['origin_province'] == 'Guyenne':
                bureaux_map[bureau]['cumulated_exports_value_from_region'] += value  
            else:
                bureaux_map[bureau]['cumulated_exports_value_from_ext'] += value
        elif f['customs_office'] == 'Nantes':
            if f['origin_province'] == 'Bretagne' or f['origin_province'] == 'anjou' or f['origin_province'] == 'Touraine' or f['origin_province'] == 'Maine' or f['origin_province'] == 'Orléanais':
                bureaux_map[bureau]['cumulated_exports_value_from_region'] += value  
            else:
                bureaux_map[bureau]['cumulated_exports_value_from_ext'] += value
    bureaux_map[bureau]['nb_toflit_flows_taken_into_account'] += 1 

# write and document dataset
info = """
`part_3_step3_viz_ports_data.csv` documentation
===

# What is the original data ? 

Navigo flows from raw flows' API endpoint

# What does a line correspond to ?

A specific port and its related data for 1787 or 1789 depending on the port.

# Filters

- for all flows : only flows coming out of the studied port (vs flows entering the port which are not taken into account)
- for La Rochelle Data : 
  - year : 1789
  - pointcall_function : 'O'
- for Bordeaux, Nantes and Le Havre data :
  - year : 1787

# Aggregation/computation info

- we distinguish tonnages for travels inside PASA, and travels outside PASA

# Notes/warning

- we use different years depending on data availability for PASA region and compared ports
"""
write_readme("part_3_step3_viz_ports_data/README.md", info)
with open(part_3_step3_viz_ports_data_filepath, 'w', newline='') as csvfile1:
    fieldnames1 = ['type_of_object', 'name', 'cumulated_tonnage_in_region', 'cumulated_tonnage_out_region', 'nb_navigo_flows_taken_into_account', 'customs_office', 'customs_region', 'latitude', 'longitude']
    writer1 = csv.DictWriter(csvfile1, fieldnames=fieldnames1)

    bureau = None
    direction = None
    writer1.writeheader()

    for port, values in ports.items(): # port est une key, values est un dictionnaire python
        bureau = values['customs_office'] if 'customs_office' in values.keys() else values['port']
        if 'customs_region' in values.keys():
            direction = values['customs_region'] 
        elif port == 'Le Havre':
            direction = 'Rouen'
        elif port == 'Nantes':
            direction = 'Nantes'
        elif port == 'Bordeaux':
            direction = 'Bordeaux'
        else:
            direction = 'La Rochelle'
        writer1.writerow({
          'type_of_object': 'port', 
          'name': values['port'], 
          'cumulated_tonnage_in_region': values['cumulated_tonnage_in_region'], 
          'cumulated_tonnage_out_region': values['cumulated_tonnage_out_region'], 
          'nb_navigo_flows_taken_into_account': values['nb_navigo_flows_taken_into_account'], 
          'customs_office': bureau, 
          'customs_region': direction, 
          'latitude': values['latitude'] if 'latitude' in values.keys() else 'ERROR', 
          'longitude': values['longitude'] if 'longitude' in values.keys() else 'ERROR'
        })     
            
info = """
`part_3_step3_viz_customs_offices_data.csv` documentation
===

# What is the original data ? 

- Toflit18 flows taken from `bdd_base_courante.csv` dataset.
- Navigation data from Navigo `raw_flows` endpoint

# What does a line correspond to ?

Navigation data for 1789 related to a specific *bureau des fermes* (thanks to bureaux-ports alignments)

# Filters

- for Toflit18 :
  - year : 1789
  - type of flow : exports
  - targeted customs offices : ['La Rochelle', 'Marennes', 'Rochefort', 'Saint-Martin-de-Ré', "Les Sables d'Olonne", "Tonnay-Charente", 'Aligre', 'Charente', 'Le Havre', 'Bordeaux', 'Nantes']
- for navigo data : 
  - year : 1789
  - pointcall_function : 'O'
  - only data from ports attached to PASA's customs offices/bureaux des fermes


# Aggregation/computation info

- we distinguish navigo's tonnages for travels inside PASA, and travels outside PASA grounding on flows' destination
- we distinguish toflit18's exports of PASA products and exports of not-PASA products, grounding on the flows "origin" field

# Notes/warning

/
"""
write_readme("part_3_step3_viz_customs_offices_data/README.md", info)
with open(part_3_step3_viz_customs_offices_data_filepath, 'w', newline='') as csvfile2:
    fieldnames2 = ['type_of_object', 'name', 'cumulated_tonnage_in_region', 'cumulated_tonnage_out_region', 'nb_navigo_flows_taken_into_account', 'cumulated_exports_value_from_region', 'cumulated_exports_value_from_ext', 'nb_toflit_flows_taken_into_account','customs_office', 'customs_region', 'latitude', 'longitude']
    writer2 = csv.DictWriter(csvfile2, fieldnames=fieldnames2)
    writer2.writeheader()

    direction = None

    for bureau, values in bureaux_map.items():
        if 'customs_region' in values.keys():
            direction = values['customs_region'] 
        elif bureau == 'Le Havre':
            direction = 'Rouen'
        elif bureau == 'Nantes':
            direction = 'Nantes'
        elif bureau == 'Bordeaux':
            direction = 'Bordeaux'
        else:
            direction = 'La Rochelle'

        writer2.writerow({
          'type_of_object': 'customs_office', 
          'name': values['bureau'], 
          'cumulated_tonnage_in_region': values['cumulated_tonnage_in_region'], 
          'cumulated_tonnage_out_region': values['cumulated_tonnage_out_region'], 
          'nb_navigo_flows_taken_into_account': values['nb_navigo_flows_taken_into_account'], 
          'cumulated_exports_value_from_region': values['cumulated_exports_value_from_region'] if 'cumulated_exports_value_from_region' in values.keys() else 'ERROR', 
          'cumulated_exports_value_from_ext': values['cumulated_exports_value_from_ext'] if 'cumulated_exports_value_from_ext' in values.keys() else 'ERROR', 
          'nb_toflit_flows_taken_into_account': values['nb_toflit_flows_taken_into_account'] if 'nb_toflit_flows_taken_into_account' in values.keys() else 'ERROR', 
          'customs_office': bureau, 
          'customs_region': direction, 
          'latitude': values['latitude'] if 'latitude' in values.keys() else 'ERROR', 
          'longitude': values['longitude'] if 'longitude' in values.keys() else 'ERROR'
        })

   
"""
PART 3.2
"""

def get_all_flows_from_1787():
  network_flows_all_from_1787 = []
  # retrieve relevant flows
  with open('../data/navigo_raw_flows_1787.csv', 'r') as f:
      flows = csv.DictReader(f)
      for flow in flows:
          network_flows_all_from_1787.append(flow)
  return network_flows_all_from_1787

def build_graph(name, flows, admiralties):
    graph = nx.DiGraph()

    def add_node(g, name, admiralty=None, peche=0, flow=None):
        if admiralty is None:
            admiralty = 'n/a'
        g.add_node(
            name,
            admiralty=admiralty,
            internal= 'interne à la région' if admiralty in admiralties else 'externe à la région',
            degree=1,
            # inside_degree=0,
            # outside_degree=0,
            x= flow["departure_latitude"] if flow else random(),
            y= flow["departure_longitude"] if flow else random()
        )

    def add_edge(g, source, target, tonnage):
        if g.has_edge(source, target):
            attr = g[source][target]
            attr['weight'] += 1
            attr['tonnage'] += tonnage
        else:
            g.add_edge(
                source,
                target,
                weight=1,
                tonnage=tonnage
            )

    for flow in flows:
        
        source = flow['departure']
        target = flow['destination']

        source_admiralty = flow['departure_admiralty']
        target_admiralty = flow['destination_admiralty']

        concerns_flow = source_admiralty in admiralties or target_admiralty in admiralties
        
        if not concerns_flow:
            continue
            
        tonnage = 0

        try:
            tonnage = int(flow['tonnage'] if flow['tonnage'] is not None else 0)
        except ValueError:
            pass

        # Macro graph
        if source == target:
            add_node(graph, source, source_admiralty, 1)
        else:
            add_node(graph, source, source_admiralty, flow=flow)
            add_node(graph, target, target_admiralty, flow=flow)
            add_edge(graph, source, target, tonnage)

    degrees = graph.degree()
    if type(degrees) is dict:
      for (node, val) in degrees.items():
        graph.node[node]["degree"] = val
    else:
      for id in graph.nodes():
        graph.nodes[id]["degree"] = graph.degree(id)
    info = """
`{}.gexf` documentation
===

# What is the original data ? 

Navigo flows from API "raw flows" endpoint

# Filters

- year : 1787
- we filter to flows that contain a departure OR destination in the following admiralties : {}

# Aggregation/computation info

- nodes `degree` is computed for each node
- nodes `weight` represents the number of flows

# Notes/warning

/
""".format(name, ', '.join(list(admiralties)))
    ensure_dir('../public/data/' + name + '/')
    nx.write_gexf(graph, '../public/data/' + name + '/' + name + '.gexf') 
    write_readme(name + "/" + "README.md", info) 
    return graph

def build_centrality_metrics(flows):
  metrics = []
  ports_to_compare = [
    {
        "main_port": "La Rochelle",
        "admiralties": ["Sables-d'Olonne", "Les Sables d'Olonne", "Les Sables-d'Olonne", "La Rochelle", "Marennes"]
        # "admiralties": [ "La Rochelle"]
    },
    {
        "main_port": "Nantes",
        "admiralties": ["Nantes"]
    },
    {
        "main_port": "Bordeaux",
        "admiralties": ["Bordeaux"]
    },
    {
        "main_port": "Le Havre",
        "admiralties": ["Le Havre", "Havre"]
    }
  ]

  for p in ports_to_compare:
      port, admiralties = p.values()
      logger.info('start | part 3 main viz :  build ' + port + ' network')
      graph = build_graph("flows_1787_around_" + port, flows, admiralties)
      logger.debug('end | part 3 main viz :  build ' + port + ' network')
      page_rank = nx.pagerank(graph)
      betweenness_centrality =  nx.betweenness_centrality(graph)
      metrics.append({
          "port": port,
          "metrics_type": "PageRank",
          "score": page_rank[port],
      })
      metrics.append({
          "port": port,
          "metrics_type": "betweenness centrality",
          "score": betweenness_centrality[port]
      })
  info = """
`part_3_centralite_comparaison.csv` documentation
===

# What is the original data ? 

Navigo flows from API "raw flows" endpoint

# What does a line correspond to ?

A given centrality metric for the network of ports attached to a given admiralty or group of admiralty (for La Rochelle we include "La Rochelle", "Marennes" and "Sables d'Olonnes" admiralties).

# Filters

- year : 1787
- we filter to flows that contain a departure OR destination in the following admiralties : "Bordeaux", "Nantes", "La Rochelle", "Marennes" and "Sables d'Olonnes"
- each network is computed separately

# Aggregation/computation info

- the metric regards the main port of each network

# Notes/warning

/
  """
  ensure_dir('../public/data/part_3_centralite_comparaison/')
  write_readme('part_3_centralite_comparaison/README.md', info)
  
  with open('../public/data/part_3_centralite_comparaison/part_3_centralite_comparaison.csv', 'w', newline='') as csvfile:
    fieldnames = metrics[0].keys()
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

    writer.writeheader()
    for m in metrics:
        writer.writerow(m)


logger.info('start | part 3 main viz : centrality metrics')
build_centrality_metrics(get_all_flows_from_1787())
logger.debug('done | part 3 main viz : centrality metrics')

logger.debug('done | part 3 main viz datasets')