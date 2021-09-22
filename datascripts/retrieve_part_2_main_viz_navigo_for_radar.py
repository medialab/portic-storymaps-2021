'''
Created on 20 july 2021
@author: cplumejeaud
ANR PORTIC : used to build a file used to draw a radar plot for destinations of ships starting in 1789 from the direction "ferme de la Rochelle"
This requires :
1. to have loaded data/navigo_raw_flows_1789.csv into data using load_data.sh that query the api : data.portic.fr/api/rawflows/?date=1789&format=csv
curl -o data/navigo_raw_flows_1789.csv "data.portic.fr/api/rawflows/?date=1789&format=csv"
'''

import csv
import sys
from collections import defaultdict
import os

def ensure_dir(path):
  if not os.path.exists(path):
      os.makedirs(path)

OUTPUT = "../public/data/part_2_navigo_viz_data/part_2_navigo_viz_data.csv"
ensure_dir("../public/data/part_2_navigo_viz_data/")

def clean_bureau_name(name, departure):
  if departure == "Tonnay-Charente":
      return 'Tonnay-Charente'
  if (name in ["Les Sables d'Olonne", "Sables d'Olonne"]):
      return "Les Sables-d'Olonne"
  elif (name in ['Aligre', 'Alligre']):
      return 'Marans'  # j'ai un doute là dessus mais c'est bien le toponyme_fr
  elif name == 'Saint-Martin île de Ré':
      return 'Saint-Martin-de-Ré'
  elif name == 'Charente':
      return 'Tonnay-Charente'
  elif name == "Oléron":
    return "Marennes"
  # elif name == '':
  #     return 'undefined customs office'
  else:
      return name

relevant_flows = []
# retrieve relevant flows
with open('../data/navigo_raw_flows_1789.csv', 'r', encoding='utf-8') as f:
    navigo_flows = csv.DictReader(f)
    flows_fieldnames = navigo_flows.fieldnames
    for flow in navigo_flows:
      if flow['departure_ferme_direction'] == 'La Rochelle' and flow['departure_function'] == 'O':
        relevant_flows.append(flow)


#print(sys.getdefaultencoding())
#print(sys.stdout.encoding)

for f in relevant_flows :
    destination_radar='Unknown'
    if f['destination_partner_balance_supp_1789']=='Sénégal et Guinée':
        destination_radar = 'Afrique'
    elif f['destination_partner_balance_supp_1789']=='colonies françaises':
        destination_radar =  'Colonies' 
    elif f['destination_partner_balance_supp_1789']=='France' and f['destination_ferme_direction'] != 'La Rochelle' and  (f['destination_fr'] not in ('Dunkerque', 'Bayonne', 'Marseille', 'Lorient', 'Noirmoutier', 'Ile de Bouin')):    
        destination_radar = 'France'
    elif (f['destination_fr']  in ('Dunkerque', 'Bayonne', 'Marseille', 'Lorient', 'Noirmoutier', 'Ile de Bouin')):    
        destination_radar = 'Ports francs et petites îles'
    elif f['destination_ferme_direction'] == 'La Rochelle':
        destination_radar = 'Local'
    elif f['destination_state_1789_fr'] == 'Grande-Bretagne':
        destination_radar = 'Grande-Bretagne'
    elif f['destination_state_1789_fr'] == 'Etats-Unis d\'Amérique':
        destination_radar = 'Reste du monde'
    elif f['destination_state_1789_fr'] not in ('Grande-Bretagne','Etats-Unis d\'Amérique', 'France' ):
        destination_radar = 'Europe'
    

    if (destination_radar=='Unknown'):
        print(f['destination_partner_balance_supp_1789'])
        print(f['destination_partner_balance_supp_1789'].encode("utf8"))
    #Create and assign a new column named destination_radar
    f['destination_radar'] = destination_radar


    #idem for **homeport_destination_radar**
    homeport_destination_radar='Unknown'
    if f['homeport_substate_1789_fr']=='colonies françaises en Afrique' or f['homeport_toponyme_fr'] in ('Côte d\'Afrique [de l\'Ouest]', 'Côte d\'Or', 'Gambie', 'Bonny', 'Calabar'):        
        #Dirty because we are missing homeport_partner_balance_supp_1789 attribute
        homeport_destination_radar = 'Afrique'
    elif f['homeport_substate_1789_fr'] in ('colonies françaises d\'Amérique', 'colonies françaises en Asie'):
        #Dirty because we are missing homeport_partner_balance_supp_1789 attribute
        homeport_destination_radar =  'Colonies' 
    elif f['homeport_state_1789_fr']=='France' and f['homeport_province'] not in  ('Aunis', 'Saintonge', 'Poitou') and  (f['homeport_toponyme_fr'] not in ('Dunkerque', 'Bayonne', 'Marseille', 'Lorient', 'Noirmoutier', 'Ile de Bouin')):    
        #Dirty because we are missing homeport_partner_balance_supp_1789 and homeport_ferme_direction attributes
        homeport_destination_radar = 'France'
    elif (f['homeport_toponyme_fr']  in ('Dunkerque', 'Bayonne', 'Marseille', 'Lorient', 'Noirmoutier', 'Ile de Bouin')):    
        homeport_destination_radar = 'Ports francs et petites îles'
    elif f['homeport_province'] in  ('Aunis', 'Saintonge', 'Poitou'):
        #Dirty because we are missing homeport_ferme_direction attributes
        #Petite surestimation car beauvoir-sur-mer est un port de Poitou qui n'est pas dans la ferme de La Rochelle
        homeport_destination_radar = 'Local'
    elif f['homeport_state_1789_fr'] == 'Grande-Bretagne':
        homeport_destination_radar = 'Grande-Bretagne'
    elif f['homeport_state_1789_fr'] == 'Etats-Unis d\'Amérique':
        homeport_destination_radar = 'Reste du monde'
    elif f['homeport_state_1789_fr'] not in ('Grande-Bretagne','Etats-Unis d\'Amérique', 'France' ):
        homeport_destination_radar = 'Europe'

    #Check all is assigned
    if (homeport_destination_radar=='Unknown'):
        print(f['homeport_substate_1789_fr'])
        print(f['homeport_substate_1789_fr'].encode("utf8"))
    #Create and assign a new column named homeport_destination_radar
    f['homeport_destination_radar'] = homeport_destination_radar

def format_for_viz(f):
    '''
    Filter to retain only used attributes for radar plot : a line per departure, with the destination and homeport of the mentionned ship
    departure_fr, destination_fr, ship_id, ship_name, departure_action, destination_action, departure_out_date, destination_in_date, source_doc_id are just optionnal
    we can remove them if required for lighten the file
    '''
    return {
        "destination_radar": f['destination_radar'],
        "homeport_destination_radar": f["homeport_destination_radar"],
        "ferme_bureau": clean_bureau_name(f["departure_ferme_bureau"], f['departure_fr']),
        "tonnage": f["tonnage"],
        "departure_fr": f["departure_fr"],
        "destination_fr": f['destination_fr'],
        "ship_id": f["ship_id"],
        "ship_name": f['ship_name'],
        "departure_action": f["departure_action"],
        "destination_action": f['destination_action'],        
        "departure_out_date": f["departure_out_date"],
        "destination_in_date": f['destination_in_date'],   
        "source_doc_id": f['source_doc_id']   
   }

initial_flows_viz = [format_for_viz(f) for f in relevant_flows]
# write dataset
with open(OUTPUT, "w", newline='') as csvfile:
  fieldnames = initial_flows_viz[0].keys()
  writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

  writer.writeheader()
  for f in initial_flows_viz:
      writer.writerow(f)
