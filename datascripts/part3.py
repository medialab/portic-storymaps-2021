"""
Ecriture de csv de données pour nourrir les visualisations

(csv 0 de localisation de tous les ports de la DFLR dans leurs bureaus, provinces, amirautés, directions ... pour nourrir les cartes de l'intro)
pour chaque port DFLR en 1789 :
- nom du port
- coordonnées géographiques
- entités administratives d'appartenance (bureau, provinve, amirauté, direction)


écriture des csv de données pour nourrir les différentes étapes de la visualisation principale de la partie 3 :

step 1 / csv 1 (données Navigo) :
pour chaque port DFLR en 1789 :
- nombre de bateaux sortis du port
- tonnage moyen de ces bateaux

step 2 / gexf :
A FAIRE

step 3 / csv 3.1 (données Navigo sur les ports) et 3.2 (données Toflit sur les bureaux) :

csv 3.1
en 1789, pour chaque port DFLR + ports de Bordeaux, Le Havre, Nantes (données Navigo):
- tonnage cumulé à destination de l’extérieur de la région
- tonnage cumulé à destination de l’hinterland de la région

csv 3.2
en 1789 pour tous bureaux DFLR + Bordeaux, Le Havre, Nantes (données Toflit):
- valeur cumulée exports produits d'origine extérieure à la région
- valeur cumulée exports produits originaires de l’hinterland (PASA)

@TODO
step 3 : attention on n'a pas les noms standardisés fr des bureaux de fermes associés aux flows navigo collectés, donc à corriger plus tard dans le csv, ou faire attention bien agréger les orthographes différentes ensemble au moment des agrégations par bureau de ferme dans la viz
step 3 : essayer de voir pourquoi en choisissant les flows Navigo plutot que les pointcalls on perd de vue des sorties des ports de La Tranche-sur-Mer, La Tremblade, Saint-Michel-enl'Herm, Mortagne
step 3 : vérifier si la comparaison avec les ports de Nantes, Bordeaux, Le Havre n'est pas plus pertinentes avec les données 87 de Navigo (données 89 bien renseignées que pour la DFLR) => si besoin utiliser à la fois données 87 pour Toflit et Navigo pour la partie comparative exter region (LR / LH / Nantes / Bordeaux)
"""

import networkx as nx
import csv
from operator import itemgetter
from random import random

# PORTS_DFLR = {"Saint-Denis d'Oléron", 'Saint-Gilles-sur-Vie', 'Noirmoutier', 'La Rochelle', 'Beauvoir-sur-Mer', 'Marans', 'Esnandes', 'Saint-Martin-de-Ré', 'La Tremblade', "Les Sables-d'Olonne", 'Tonnay-Charente', 'Rochefort', 'La Tranche-sur-Mer', "Saint-Michel-en-l'Herm", 'Marennes', 'Ribérou', 'Mortagne', 'Moricq', 'Royan', "Le Château-d'Oléron", 'La Perrotine', 'Soubise', 'Ars-en-Ré', 'Champagné-les-Marais', 'La Flotte-en-Ré'}
ports_dflr = set()
PORTS_FOR_COMPARISON = {'Bordeaux', 'Nantes', 'Le Havre'}
# je laisse Oléron dans les bureaus car c'est un bureau selon Navigo, mais étrange car n'en est pas un selon Toflit
BUREAUS = {'Bordeaux', 'Nantes', 'Le Havre', 'La Rochelle', 'Marans', 'Saint-Martin-de-Ré', "Les Sables-d'Olonne",
    'Tonnay-Charente', 'Rochefort', 'Marennes', 'undefined customs office', 'ile de Bouin : hors DFLR'}


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

# test
# for port in ['Beauvoir-sur-Mer','Champagné-les-Marais', 'Tonnay-Charente', "Saint-Denis d’Oléron", "Le Château-d'Oléron", 'Île d’Oléron', "île d'Oléron", 'La Brée', 'île de Bouin']:
#    print("bureau de ", port, " : ", correct_localities_alignment(clean_names(port)))

# 1. write csv files :
# OUTPUT 0 : aims to feed intro maps (ports located in their bureaus, and provinces, and admiralties)
# OUTPUT1 : aims to feed step 1 of the main viz of part3


OUTPUT0 = "../public/data/ports_locations_data.csv"
OUTPUT1 = "../public/data/part_3_step1_viz_data.csv"

relevant_pointcalls = []
# retrieve relevant pointcalls
with open('../data/navigo_all_pointcalls_1789.csv', 'r') as f:
    pointcalls = csv.DictReader(f)
    # pointcalls_fieldnames = pointcalls.fieldnames
    for pointcall in pointcalls:
      # par défaut dans le csv on a déjà que des pointcalls de 1789
      if pointcall['ferme_direction'] is not None and pointcall['ferme_direction'] == 'La Rochelle' and pointcall['pointcall_action'] == 'Out':
        relevant_pointcalls.append(pointcall)
        ports_dflr.add(pointcall['toponyme_fr'])
# print("nombre de pointcalls sortis des ports de la DFLR en 1789  :", len(relevant_pointcalls))

# aggregate data by port

# init port objects
ports = {}

for p in ports_dflr:
    ports[p] = {
        "port": p,
        "nb_pointcalls_out": 0,
        "cumulated_tonnage": 0,
        "mean_tonnage": 0
    }

# fill port objects with cumulated data, and ports coord
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

# write datasets
with open(OUTPUT0, "w", newline='') as csvfile:
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

with open(OUTPUT1, "w", newline='') as csvfile:
    fieldnames = ['port', 'nb_pointcalls_out', 'mean_tonnage',
        'cumulated_tonnage', 'latitude', 'longitude', 'customs_office']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

    writer.writeheader()
    for port in ports.values():
        writer.writerow({'port': port["port"], 'nb_pointcalls_out': port["nb_pointcalls_out"], 'mean_tonnage': port["mean_tonnage"],
                        'cumulated_tonnage': port["cumulated_tonnage"], 'latitude': port["latitude"], 'longitude': port["longitude"], 'customs_office': port["customs_office"]})



# 3. write csv file to feed step 3 of the viz
OUTPUT3_PORTS = "../public/data/part_3_step3_viz_ports_data.csv"
OUTPUT3_OFFICES = "../public/data/part_3_step3_viz_customs_offices_data.csv"

# choose the year you want to work with (seems there is not a lot of data for Nantes, Bordeaux and Le Havre in 1789)
chosen_year = 1789

# beginning of 1787 option *****************************************************************************

if chosen_year == 1787:

    i = 0
    j = 0

    relevant_navigo_flows = []
    # retrieve relevant flows
    with open('../data/navigo_all_flows_'+str(chosen_year)+'.csv', 'r') as f:
        flows = csv.DictReader(f)
        for flow in flows:
            if flow['departure_ferme_direction'] == 'La Rochelle':
                relevant_navigo_flows.append(flow)
                ports_dflr.add(flow['departure_fr'])
                i += 1
            elif flow['departure_fr'] in ['Bordeaux', 'Nantes', 'Le Havre']:
                relevant_navigo_flows.append(flow)
                j += 1

    # print("ports de la DFLR (noms standardisés) : ", ports_dflr)
    print("nombre de flows navigo partis de la DFLR en "+str(chosen_year)+"  :", i)
    print("nombre de flows navigo partis de Nantes, Bordeaux, Le Havre en " +
        str(chosen_year)+"  :", j)

# end of 1787 option / beginning of 1789 option *****************************************************************************

if chosen_year == 1789:
    relevant_navigo_out_pointcalls = []
    relevant_navigo_in_pointcalls = []
    relevant_navigo_flows_from_1787 = [] # used for small multiples
    set_pkids = set()
    i = 0
    j = 0

    # retrieve relevant pointcalls
    with open('../data/navigo_all_pointcalls_'+str(chosen_year)+'.csv', 'r') as f:
        pointcalls = csv.DictReader(f)
        for pointcall in pointcalls:
            if pointcall['ferme_direction'] is not None and pointcall['ferme_direction'] == 'La Rochelle' and pointcall['pointcall_action'] == 'Out': # par défaut dans le csv on a déjà que des pointcalls de 1787 ou 1789
                relevant_navigo_out_pointcalls.append(pointcall)
                set_pkids.add(str(pointcall['source_doc_id']))
                ports_dflr.add(pointcall['toponyme_fr'])
                i+=1

    with open('../data/navigo_all_flows_1787.csv', 'r') as f: # on va quand même prendre 1787 pour les small multiples : sinon les données ne sont pas représentatives, et on n'a pas les tonnages pour Le Havre
        flows = csv.DictReader(f)
        for flow in flows:
            if flow['departure_fr'] in ['Bordeaux', 'Nantes', 'Le Havre']:
                relevant_navigo_flows_from_1787.append(flow)
                j += 1
            # if pointcall['ferme_bureau'] in ['Bordeaux', 'Nantes', 'Le Havre'] and pointcall['pointcall_action'] == 'Out':
            #     relevant_navigo_out_pointcalls.append(pointcall)
            #     set_pkids.add(str(pointcall['source_doc_id']))
            #     j+=1

    with open('../data/navigo_all_pointcalls_'+str(chosen_year)+'.csv', 'r') as f:
        pointcalls = csv.DictReader(f)
        for pointcall in pointcalls:
            if str(pointcall['source_doc_id']) is not None:
                if str(pointcall['source_doc_id']) in set_pkids and pointcall['pointcall_action'] == 'In' or pointcall['pointcall_action'] == 'in':
                    relevant_navigo_in_pointcalls.append(pointcall)

    print("source_doc_ids au nombre de ", len(set_pkids))
    print("nombre de pointcalls navigo  partis de la DFLR en "+str(chosen_year)+"  :", i)
    print("nombre de pointcalls navigo  partis de Nantes, Bordeaux, Le Havre en "+str(chosen_year)+"  :", j)

    # reconstruct flows
    flows_navigo_reconstructed = []
    for pointcall_out in relevant_navigo_out_pointcalls :
        source_doc_id = pointcall_out['source_doc_id']
        for pointcall_in in relevant_navigo_in_pointcalls :
            if pointcall_in['source_doc_id'] == source_doc_id:
                flows_navigo_reconstructed.append({
                    "flow_source_doc_id": source_doc_id,
                    "pointcall_out": pointcall_out,
                    "pointcall_in": pointcall_in
                    })

    print("length of flows : ", len(flows_navigo_reconstructed))
# end of 1789 option *****************************************************************************


relevant_toflit_flows = []
# retrieve relevant flows
with open('../data/toflit18_all_flows.csv', 'r') as f:
    flows = csv.DictReader(f)
    for flow in flows:
        if flow['year'] == '1789' and flow['export_import'] == 'Exports' and flow['customs_office'] in ['La Rochelle', 'Marennes', 'Rochefort', 'Saint-Martin-de-Ré', "Les Sables d'Olonne", 'Aligre', 'Charente', 'Le Havre', 'Bordeaux', 'Nantes']:
            relevant_toflit_flows.append(flow)
print("nombre d'exports des bureaux de la DFLR + Nantes, Bordeaux, Le Havre en ",
      chosen_year, "  :", len(relevant_toflit_flows))


# aggregate data by port

# init port and bureaus objects
ports = {}
bureaus = {}

 # gérer les ports dont on a des données mais dont on ne veut pas dans la viz
ports_dflr.add('other ports not from region => to be erased from data')

for p in list(ports_dflr)+list(PORTS_FOR_COMPARISON):
    ports[p] = {
        "port": p,
        "nb_navigo_flows_taken_into_account": 0,
        "cumulated_tonnage_in_region": 0,
        "cumulated_tonnage_out_region": 0
    }

for b in list(BUREAUS):
    bureaus[b] = {
        "bureau": b,
        "nb_navigo_flows_taken_into_account": 0,
        "nb_toflit_flows_taken_into_account": 0,
        "cumulated_tonnage_in_region": 0,
        "cumulated_tonnage_out_region": 0,
        "cumulated_exports_value_from_region": 0,
        "cumulated_exports_value_from_ext": 0
    }

# beginning of 1787 option ***************************************************************************************

if chosen_year == 1787:
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
                bureaus[bureau]['cumulated_tonnage_in_region'] += tonnage
            else:
                # print("f['destination_ferme_direction'] : ", f['destination_ferme_direction'])
                ports[port]['cumulated_tonnage_out_region'] += tonnage
                bureaus[bureau]['cumulated_tonnage_out_region'] += tonnage
        elif f['departure_province'] is not None: # dans ce cas là notre flow ne part pas de La Rochelle, besoin de distinguer cas bordeaux, nantes, le havre
            if f['departure_province'] == f['destination_province']:
                ports[port]['cumulated_tonnage_in_region'] += tonnage
                bureaus[bureau]['cumulated_tonnage_in_region'] += tonnage
            else:
                ports[port]['cumulated_tonnage_out_region'] += tonnage
                bureaus[bureau]['cumulated_tonnage_out_region'] += tonnage
        else:
            print("on n'a rien ajouté")
        ports[port]['nb_navigo_flows_taken_into_account'] += 1
        bureaus[bureau]['nb_navigo_flows_taken_into_account'] += 1
        if 'latitude' not in ports[port].keys():
            ports[port]['latitude'] = f['departure_latitude']
            ports[port]['longitude'] = f['departure_longitude']
            ports[port]['customs_office'] = bureau
            ports[port]['customs_region'] = f['departure_ferme_direction']
        if 'latitude' not in bureaus[bureau].keys():
            bureaus[bureau]['latitude'] = f['departure_latitude']
            bureaus[bureau]['longitude'] = f['departure_longitude']
            bureaus[bureau]['customs_region'] = f['departure_ferme_direction']

# end of 1787 option / beginning of 1789 option ************************************************************************

if chosen_year == 1789:

    # fill objects with navigo data from DFLR
    for f in flows_navigo_reconstructed : 
        port = f['pointcall_out']['toponyme_fr'] if (f['pointcall_out']['ferme_direction'] == 'La Rochelle' and f['pointcall_out']['toponyme_fr'] not in ['Nantes', 'Bordeaux', 'Le Havre']) else 'other ports not from region => to be erased from data'
        # print("port : ", port)
        bureau = clean_names(correct_localities_alignment(f['pointcall_out']['toponyme_fr'])) if port in ['Beauvoir-sur-Mer','Champagné-les-Marais', 'Tonnay-Charente', "Saint-Denis d'Oléron", "Le Château-d'Oléron", 'Île d’Oléron', 'La Brée', "île d'Oléron", 'île de Bouin'] else clean_names(f['pointcall_out']['ferme_bureau']) 
    
        if f['pointcall_out']['tonnage'] != '': 
            tonnage = int(f['pointcall_out']['tonnage']) 
        else:
            tonnage = 0
        if f['pointcall_out']['ferme_direction'] == 'La Rochelle':
            if f['pointcall_in']['ferme_direction'] == 'La Rochelle':
                ports[port]['cumulated_tonnage_in_region'] += tonnage  
                bureaus[bureau]['cumulated_tonnage_in_region'] += tonnage  
            else:
                # print("f['destination_ferme_direction'] : ", f['destination_ferme_direction'])
                ports[port]['cumulated_tonnage_out_region'] += tonnage  
                bureaus[bureau]['cumulated_tonnage_out_region'] += tonnage  
        # elif f['pointcall_out']['pointcall_province'] is not None: # dans ce cas là notre flow ne part pas de La Rochelle, besoin de distinguer cas bordeaux, nantes, le havre
        #     if f['pointcall_out']['pointcall_province'] == f['pointcall_in']['pointcall_province']:
        #         ports[port]['cumulated_tonnage_in_region'] += tonnage
        #         bureaus[bureau]['cumulated_tonnage_in_region'] += tonnage  
        #     else:
        #         ports[port]['cumulated_tonnage_out_region'] += tonnage
        #         bureaus[bureau]['cumulated_tonnage_out_region'] += tonnage  
        else:
            print("on n'a rien ajouté")
        ports[port]['nb_navigo_flows_taken_into_account'] += 1  
        bureaus[bureau]['nb_navigo_flows_taken_into_account'] += 1  
        # if (bureau) == 'Le Havre':
        #     print("\nflow associé au bureau du Havre de source doc id: ", f['pointcall_out']['source_doc_id'])
        #     print("province de départ : ", f['pointcall_out']['pointcall_province'], " / d'arrivée : ", f['pointcall_in']['pointcall_province'])
        #     print("(port de départ : ", f['pointcall_out']['toponyme_fr'], " / d'arrivée : ", f['pointcall_in']['toponyme_fr'], ")")
        #     print("tonnage erenseigné départ : ", f['pointcall_out']['tonnage'], " / à l'arrivée : ", f['pointcall_in']['tonnage'], " ==> ce qui donne tonnage = ", tonnage)

        if 'latitude' not in ports[port].keys():
            ports[port]['latitude'] = f['pointcall_out']['latitude']  
            ports[port]['longitude'] = f['pointcall_out']['longitude']
            ports[port]['customs_office'] = bureau  
            ports[port]['customs_region'] = f['pointcall_out']['ferme_direction']
        if 'latitude' not in bureaus[bureau].keys():
            bureaus[bureau]['latitude'] = f['pointcall_out']['latitude']  
            bureaus[bureau]['longitude'] = f['pointcall_out']['longitude']
            bureaus[bureau]['customs_region'] = f['pointcall_out']['ferme_direction']
    
    # fill objects with Navgio data from small multiples (Nantes, Bordeaux, Le Havre)
    for f in relevant_navigo_flows_from_1787 :
        port = f['departure_fr']
        bureau = clean_names(correct_localities_alignment(f['departure_fr'])) if port in ['Beauvoir-sur-Mer','Champagné-les-Marais', 'Tonnay-Charente', "Saint-Denis d'Oléron", "Le Château-d'Oléron", 'Île d’Oléron', "île d'Oléron", 'La Brée', 'île de Bouin'] else clean_names(f['departure_ferme_bureau'])

        if f['tonnage'] != '':
            tonnage = int(f['tonnage'])
        else:
            tonnage = 0
        # if f['departure_ferme_direction'] == 'La Rochelle':
        #     if f['destination_ferme_direction'] == 'La Rochelle':
        #         ports[port]['cumulated_tonnage_in_region'] += tonnage
        #         bureaus[bureau]['cumulated_tonnage_in_region'] += tonnage
        #     else:
        #         # print("f['destination_ferme_direction'] : ", f['destination_ferme_direction'])
        #         ports[port]['cumulated_tonnage_out_region'] += tonnage
        #         bureaus[bureau]['cumulated_tonnage_out_region'] += tonnage
        if f['departure_province'] is not None: # dans ce cas là notre flow ne part pas de La Rochelle, besoin de distinguer cas bordeaux, nantes, le havre
            if f['departure_province'] == f['destination_province']:
                ports[port]['cumulated_tonnage_in_region'] += tonnage
                bureaus[bureau]['cumulated_tonnage_in_region'] += tonnage
            else:
                ports[port]['cumulated_tonnage_out_region'] += tonnage
                bureaus[bureau]['cumulated_tonnage_out_region'] += tonnage
        else:
            print("on n'a rien ajouté")
        ports[port]['nb_navigo_flows_taken_into_account'] += 1
        bureaus[bureau]['nb_navigo_flows_taken_into_account'] += 1
        if 'latitude' not in ports[port].keys():
            ports[port]['latitude'] = f['departure_latitude']
            ports[port]['longitude'] = f['departure_longitude']
            ports[port]['customs_office'] = bureau
            ports[port]['customs_region'] = f['departure_ferme_direction']
        if 'latitude' not in bureaus[bureau].keys():
            bureaus[bureau]['latitude'] = f['departure_latitude']
            bureaus[bureau]['longitude'] = f['departure_longitude']
            bureaus[bureau]['customs_region'] = f['departure_ferme_direction']

# end of 1789 option *********************************************************************************

# fill port objects with cumulated data from toflit, (customs_office scaled data)
for f in relevant_toflit_flows:
    bureau = clean_names(f['customs_office'])

    if f['value'] is not None and f['value'] != '':
        value = float(f['value'])
    else:
        value = 0
    if f['customs_region'] == 'La Rochelle': # à priori tous les flux de 89 venant d'un bureau de la DFLR ont bien cet attribut
        if f['origin_province'] in ['Aunis', 'Poitou', 'Saintonge', 'Angoumois']:
            bureaus[bureau]['cumulated_exports_value_from_region'] += value  
        else:
            bureaus[bureau]['cumulated_exports_value_from_ext'] += value
    else: # dans ce cas on est censés avoir un flux pas dans la DFLR
        if f['customs_office'] == 'Le Havre':
            if f['origin_province'] == 'Normandie':
                bureaus[bureau]['cumulated_exports_value_from_region'] += value  
            else:
                bureaus[bureau]['cumulated_exports_value_from_ext'] += value
        elif f['customs_office'] == 'Bordeaux':
            if f['origin_province'] == 'Guyenne':
                bureaus[bureau]['cumulated_exports_value_from_region'] += value  
            else:
                bureaus[bureau]['cumulated_exports_value_from_ext'] += value
        elif f['customs_office'] == 'Nantes':
            if f['origin_province'] == 'Bretagne' or f['origin_province'] == 'anjou' or f['origin_province'] == 'Touraine' or f['origin_province'] == 'Maine' or f['origin_province'] == 'Orléanais':
                bureaus[bureau]['cumulated_exports_value_from_region'] += value  
            else:
                bureaus[bureau]['cumulated_exports_value_from_ext'] += value
    bureaus[bureau]['nb_toflit_flows_taken_into_account'] += 1 


# write dataset
with open(OUTPUT3_PORTS, 'w', newline='') as csvfile1:
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
        writer1.writerow({'type_of_object': 'port', 'name': values['port'], 'cumulated_tonnage_in_region': values['cumulated_tonnage_in_region'], 'cumulated_tonnage_out_region': values['cumulated_tonnage_out_region'], 'nb_navigo_flows_taken_into_account': values['nb_navigo_flows_taken_into_account'], 'customs_office': bureau, 'customs_region': direction, 'latitude': values['latitude'] if 'latitude' in values.keys() else 'ERROR', 'longitude': values['longitude'] if 'longitude' in values.keys() else 'ERROR'})     
            

with open(OUTPUT3_OFFICES, 'w', newline='') as csvfile2:
    fieldnames2 = ['type_of_object', 'name', 'cumulated_tonnage_in_region', 'cumulated_tonnage_out_region', 'nb_navigo_flows_taken_into_account', 'cumulated_exports_value_from_region', 'cumulated_exports_value_from_ext', 'nb_toflit_flows_taken_into_account','customs_office', 'customs_region', 'latitude', 'longitude']
    writer2 = csv.DictWriter(csvfile2, fieldnames=fieldnames2)
    writer2.writeheader()

    direction = None

    for bureau, values in bureaus.items():
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

        writer2.writerow({'type_of_object': 'customs_office', 'name': values['bureau'], 'cumulated_tonnage_in_region': values['cumulated_tonnage_in_region'], 'cumulated_tonnage_out_region': values['cumulated_tonnage_out_region'], 'nb_navigo_flows_taken_into_account': values['nb_navigo_flows_taken_into_account'], 'cumulated_exports_value_from_region': values['cumulated_exports_value_from_region'] if 'cumulated_exports_value_from_region' in values.keys() else 'ERROR', 'cumulated_exports_value_from_ext': values['cumulated_exports_value_from_ext'] if 'cumulated_exports_value_from_ext' in values.keys() else 'ERROR', 'nb_toflit_flows_taken_into_account': values['nb_toflit_flows_taken_into_account'] if 'nb_toflit_flows_taken_into_account' in values.keys() else 'ERROR', 'customs_office': bureau, 'customs_region': direction, 'latitude': values['latitude'] if 'latitude' in values.keys() else 'ERROR', 'longitude': values['longitude'] if 'longitude' in values.keys() else 'ERROR'})
    
"""
PART 3.2
"""

relevant_navigo_flows = []
# retrieve relevant flows
with open('../data/navigo_all_flows_1787.csv', 'r') as f:
    flows = csv.DictReader(f)
    for flow in flows:
        relevant_navigo_flows.append(flow)

def build_graph(name, flows, admiralties):
    graph = nx.DiGraph()

    def add_node(g, name, admiralty=None, peche=0, flow=None):
        if admiralty is None:
            admiralty = 'n/a'
        g.add_node(
            name,
            admiralty=admiralty,
            internal= 'interne à la région' if admiralty in admiralties else 'externe à la région',
            degree=0,
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
    # print(degrees)
    for (node, val) in degrees:
      graph.node[node]["degree"] = val


    nx.write_gexf(graph, '../public/data/%s.gexf' % name)  
    return graph

def build_centrality_metrics(flows):
  metrics = []
  # page_ranks = []
  # betweenness_centralities = []
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
      graph = build_graph("flows_1787_around_" + port, flows, admiralties)
      page_rank = nx.pagerank(graph)
      betweenness_centrality =  nx.betweenness_centrality(graph)
      metrics.append({
          "port": port,
          "metrics_type": "PageRank",
          "score": page_rank[port],
      })
      # page_ranks += [{"group": port, "port": p, "page_rank": value} for (p, value) in page_rank.items() if graph.nodes[p]['internal'] == True]
      metrics.append({
          "port": port,
          "metrics_type": "betweenness centrality",
          "score": betweenness_centrality[port]
      })
      # betweenness_centralities += [{"group": port, "port": p, "betweenness_centrality": value} for (p, value) in betweenness_centrality.items()if graph.nodes[p]['internal'] == True]
  
  with open('../public/data/part_3_centralite_comparaison.csv', 'w', newline='') as csvfile:
    fieldnames = metrics[0].keys()
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

    writer.writeheader()
    for m in metrics:
        writer.writerow(m)

build_centrality_metrics(relevant_navigo_flows)
