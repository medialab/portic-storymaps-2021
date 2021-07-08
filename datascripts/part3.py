
"""
écriture des csv de données pour nourrir les différentes étapes de la visualisation principale de la partie 3

step 1 / csv 1 (données Navigo) : 
pour chaque port DFLR en 1789 :
- nombre de bateaux sortis du port 
- tonnage moyen de ces bateaux

step 2 / gexf :
A FAIRE

step 3 / csv 3 (données Navigo + Toflit) : 
en 1789, pour chaque port DFLR + ports de Bordeaux, Le Havre, Nantes (données Navigo): 
- tonnage cumulé à destination de l’extérieur de la région
- tonnage cumulé à destination de l’hinterland de la région

en 1789 pour tous bureaux DFLR + Bordeaux, Le Havre, Nantes (données Toflit): 
- valeur cumulée exports produits d'origine extérieure à la région
- valeur cumulée exports produits originaires de l’hinterland (PASA)

@TODO
step 3 : attention on n'a pas les noms standardisés fr des bureaux de fermes associés aux flows navigo collectés, donc à corriger plus tard dans le csv, ou faire attention bien agréger les orthographes différentes ensemble au moment des agrégations par bureau de ferme dans la viz
step 3 : essayer de voir pourquoi en choisissant les flows Navigo plutot que les pointcalls on perd de vue des sorties des ports de La Tranche-sur-Mer, La Tremblade, Saint-Michel-enl'Herm, Mortagne
step 3 : vérifier si la comparaison avec les ports de Nantes, Bordeaux, Le Havre n'est pas plus pertinentes avec les données 87 de Navigo (données 89 bien renseignées que pour la DFLR) => si besoin utiliser à la fois données 87 pour Toflit et Navigo pour la partie comparative exter region (LR / LH / Nantes / Bordeaux)
"""


import csv
from operator import itemgetter

# PORTS_DFLR = {"Saint-Denis d'Oléron", 'Saint-Gilles-sur-Vie', 'Noirmoutier', 'La Rochelle', 'Beauvoir-sur-Mer', 'Marans', 'Esnandes', 'Saint-Martin-de-Ré', 'La Tremblade', "Les Sables-d'Olonne", 'Tonnay-Charente', 'Rochefort', 'La Tranche-sur-Mer', "Saint-Michel-en-l'Herm", 'Marennes', 'Ribérou', 'Mortagne', 'Moricq', 'Royan', "Le Château-d'Oléron", 'La Perrotine', 'Soubise', 'Ars-en-Ré', 'Champagné-les-Marais', 'La Flotte-en-Ré'}
ports_dflr = set()
PORTS_FOR_COMPARISON = {'Bordeaux', 'Nantes', 'Le Havre'}
# je laisse Oléron dans les bureaus car c'est un bureau selon Navigo, mais étrange car n'en est pas un selon Toflit
BUREAUS = {'Bordeaux', 'Nantes', 'Le Havre', 'La Rochelle', 'Marans', 'Saint-Martin-de-Ré', "Les Sables-d'Olonne", 'Tonnay-Charente', 'Rochefort', 'Marennes', 'undefined customs office', 'Oléron'}


def clean_names(name):
    if (name == "Les Sables d'Olonne" or name == "Sables d'Olonne"):
        return "Les Sables-d'Olonne"
    elif (name == 'Aligre' or name == 'Alligre'):
        return 'Marans' # j'ai un doute là dessus mais c'est bien le toponyme_fr
    elif name == 'Charente':
        return 'Tonnay-Charente'
    elif name == 'Saint-Martin île de Ré':
        return 'Saint-Martin-de-Ré'
    elif name == 'Charente':
        return 'Tonnay-Charente'
    elif name == '':
        return 'undefined customs office'
    else:
        return name

# 1. write csv file to feed step 1 of the viz

OUTPUT1 = "../public/data/part_3_step1_viz_data.csv" 

relevant_pointcalls = []
# retrieve relevant pointcalls
with open('../data/navigo_all_pointcalls_1789.csv', 'r') as f:
    pointcalls = csv.DictReader(f)
    # pointcalls_fieldnames = pointcalls.fieldnames
    for pointcall in pointcalls:
      if pointcall['ferme_direction'] is not None and pointcall['ferme_direction'] == 'La Rochelle' and pointcall['pointcall_action'] == 'Out': # par défaut dans le csv on a déjà que des pointcalls de 1789
        relevant_pointcalls.append(pointcall)
        ports_dflr.add(pointcall['toponyme_fr'])
# print("nombre de pointcalls sortis des ports de la DFLR en 1789  :", len(relevant_pointcalls))

# aggregate data by port

# init port objects
ports = {}

for p in ports_dflr:
    ports[p] = {
        "port": p,
        "nb_pointcalls_out":0,
        "cumulated_tonnage": 0,
        "mean_tonnage":0
    }

# fill port objects with cumulated data, and ports coord
for p in relevant_pointcalls :
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

# calculate mean tonnage by port
for port, values in ports.items():
    values['mean_tonnage'] = values['cumulated_tonnage'] / values['nb_pointcalls_out'] if values['nb_pointcalls_out'] != 0 else 0
# sort data geographically
ports = sorted(ports.values(), key=itemgetter('longitude'), reverse=True) 

# write dataset
with open(OUTPUT1, "w", newline='') as csvfile:
    fieldnames = ['port','nb_pointcalls_out','mean_tonnage','cumulated_tonnage', 'latitude', 'longitude']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

    writer.writeheader()
    for port in ports:
        writer.writerow(port) 


# 3. write csv file to feed step 3 of the viz
OUTPUT3_PORTS = "../public/data/part_3_step3_viz_ports_data.csv" 
OUTPUT3_OFFICES = "../public/data/part_3_step3_viz_customs_offices_data.csv" 


relevant_navigo_flows = []
# retrieve relevant flows
with open('../data/navigo_all_flows_1789.csv', 'r') as f:
    flows = csv.DictReader(f)
    for flow in flows:
      if flow['departure_ferme_direction'] == 'La Rochelle' or flow['departure_fr'] in ['Bordeaux', 'Nantes', 'Le Havre']:
        relevant_navigo_flows.append(flow)
        ports_dflr.add(flow['departure_fr'])
# print("ports de la DFLR (noms standardisés) : ", ports_dflr)
print("nombre de flows navigo partis de la DFLR + Nantes, Bordeaux, Le Havre en 1789  :", len(relevant_navigo_flows))

toflit_cos = set()

relevant_toflit_flows = []
# retrieve relevant flows
with open('../data/toflit18_all_flows.csv', 'r') as f:
    flows = csv.DictReader(f)
    for flow in flows:
      if flow['year'] == '1789' and flow['export_import'] == 'Exports' and flow['customs_office'] in ['La Rochelle', 'Marennes', 'Rochefort', 'Saint-Martin-de-Ré',"Les Sables d'Olonne",'Aligre', 'Charente', 'Le Havre', 'Bordeaux', 'Nantes']: 
        relevant_toflit_flows.append(flow)
        toflit_cos.add(flow['customs_office'])
# print("bureaus de la DFLR selon toflit (noms pas standardisés) : ", toflit_cos)
print("nombre d'exports des bureaux de la DFLR + Nantes, Bordeaux, Le Havre en 1789  :", len(relevant_toflit_flows))



# aggregate data by port

# init port and bureaus objects
ports = {}
bureaus = {}

for p in list(ports_dflr)+list(PORTS_FOR_COMPARISON):
    ports[p] = {
        "port": p,
        "nb_navigo_flows_taken_into_account": 0,
        "cumulated_tonnage_in_region": 0,
        "cumulated_tonnage_out_region": 0
    }

for b in list(BUREAUS):
    bureaus[b] = {
        "bureau":b,
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
    bureau = clean_names(f['departure_ferme_bureau']) 
  
    if f['tonnage'] != '': 
        tonnage = int(f['tonnage']) 
    else:
        tonnage = 0
    if f['departure_ferme_direction'] == 'La Rochelle':
        if f['destination_ferme_direction'] == 'La Rochelle':
            ports[port]['cumulated_tonnage_in_region'] += tonnage  
            bureaus[bureau]['cumulated_tonnage_in_region'] += tonnage  
        else:
            ports[port]['cumulated_tonnage_out_region'] += tonnage  
            bureaus[bureau]['cumulated_tonnage_in_region'] += tonnage  
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
        if f['customs_office'] in ['La Rochelle', 'Marennes', 'Rochefort', 'Saint-Martin-de-Ré',"Les Sables d'Olonne",'Aligre', 'Charente']:
            print("soucis") # si on a un flux DFLR c'est que filtre customs_region à changer
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
            if f['origin_province'] == 'Bretagne':
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

