
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

PORTS_DFLR = {"Saint-Denis d'Oléron", 'Saint-Gilles-sur-Vie', 'Noirmoutier', 'La Rochelle', 'Beauvoir-sur-Mer', 'Marans', 'Esnandes', 'Saint-Martin-de-Ré', 'La Tremblade', "Les Sables-d'Olonne", 'Tonnay-Charente', 'Rochefort', 'La Tranche-sur-Mer', "Saint-Michel-en-l'Herm", 'Marennes', 'Ribérou', 'Mortagne', 'Moricq', 'Royan', "Le Château-d'Oléron", 'La Perrotine', 'Soubise', 'Ars-en-Ré', 'Champagné-les-Marais', 'La Flotte-en-Ré'}
PORTS_FOR_COMPARISON = {'Bordeaux', 'Nantes', 'Le Havre'}


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
# print("nombre de pointcalls sortis des ports de la DFLR en 1789  :", len(relevant_pointcalls))

# aggregate data by port

# init port objects
ports = {}

for p in PORTS_DFLR:
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

# write dataset
with open(OUTPUT1, "w", newline='') as csvfile:
    fieldnames = ['port','nb_pointcalls_out','mean_tonnage','cumulated_tonnage', 'latitude', 'longitude']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

    writer.writeheader()
    for port, values in ports.items(): # port est une key, values est un dictionnaire python
        writer.writerow(values)


# 3. write csv file to feed step 3 of the viz
OUTPUT3 = "../public/data/part_3_step3_viz_data.csv" 

relevant_navigo_flows = []
# retrieve relevant flows
with open('../data/navigo_all_flows_1789.csv', 'r') as f:
    flows = csv.DictReader(f)
    for flow in flows:
      if flow['departure_ferme_direction'] == 'La Rochelle' or flow['departure_fr'] in ['Bordeaux', 'Nantes', 'Le Havre']:
        relevant_navigo_flows.append(flow)
print("nombre de flows navigo partis de la DFLR + Nantes, Bordeaux, Le Havre en 1789  :", len(relevant_navigo_flows))

relevant_toflit_flows = []
# retrieve relevant flows
with open('../data/toflit18_all_flows.csv', 'r') as f:
    flows = csv.DictReader(f)
    for flow in flows:
      if flow['year'] == '1789' and flow['export_import'] == 'Exports' and flow['customs_office'] in ['La Rochelle', 'Marennes', 'Rochefort', 'Saint-Martin-de-Ré',"Les Sables d'Olonne",'Aligre', 'Charente', 'Le Havre', 'Bordeaux', 'Nantes']: 
        relevant_toflit_flows.append(flow)
print("nombre d'exports des bureaux de la DFLR + Nantes, Bordeaux, Le Havre en 1789  :", len(relevant_toflit_flows))



# aggregate data by port

# init port objects
ports = {}

for p in list(PORTS_DFLR)+list(PORTS_FOR_COMPARISON):
    ports[p] = {
        "port": p,
        "nb_navigo_flows_taken_into_account": 0,
        "nb_toflit_flows_taken_into_account": 0,
        "cumulated_tonnage_in_region": 0,
        "cumulated_tonnage_out_region": 0,
        "cumulated_exports_value_from_region": 0,
        "cumulated_exports_value_from_ext": 0
    }

# fill port objects with cumulated data from navigo, and ports coord
for f in relevant_navigo_flows : 
    port = f['departure_fr']
    if f['tonnage'] != '': # voir si ne pose pas de soucis, sinon != ''
        tonnage = int(f['tonnage']) 
    else:
        tonnage = 0
    if f['departure_ferme_direction'] == 'La Rochelle':
        if f['destination_ferme_direction'] == 'La Rochelle':
            ports[port]['cumulated_tonnage_in_region'] += tonnage  
        else:
            ports[port]['cumulated_tonnage_out_region'] += tonnage  
    elif f['departure_province'] is not None: # dans ce cas là notre flow ne part pas de La Rochelle, besoin de distinguer cas bordeaux, nantes, le havre
        if f['departure_province'] == f['destination_province']:
            ports[port]['cumulated_tonnage_in_region'] += tonnage
        else:
            ports[port]['cumulated_tonnage_out_region'] += tonnage
    else:
        print("on n'a rien ajouté")
    ports[port]['nb_navigo_flows_taken_into_account'] += 1  
    if 'latitude' not in ports[port].keys():
        ports[port]['latitude'] = f['departure_latitude']  
        ports[port]['longitude'] = f['departure_longitude']
        ports[port]['customs_office'] = f['departure_ferme_bureau']  # attention on n'a pas les noms standardisés fr donc à corriger plus tard dans le csv, ou bien agréger les orthographes différentes ensemble
        ports[port]['customs_region'] = f['departure_ferme_direction']

# incohérences orthographiques à gérer : Saint-Martin-de-Ré ≠ Saint Martin de Ré   Les Sables d'Olonne ≠ Sables d' Olonne    Aligre ≠ Aligre de Marans

# fill port objects with cumulated data from toflit, (customs_office scaled data)
for f in relevant_toflit_flows:
    bureau = f['customs_office']
    # corriger l'orthographe
    # incohérences orthographiques (entre écriture de Toflit et de Navigo) à gérer
    if bureau == "Les Sables d'Olonne":
        bureau = "Les Sables-d'Olonne"
    elif bureau == 'Aligre':
        bureau = 'Marans' # j'ai un doute là dessus mais c'est bien le toponyme_fr
    elif bureau == 'Charente':
        bureau = 'Tonnay-Charente'

    if f['value'] is not None and f['value'] != '':
        value = float(f['value'])
    else:
        value = 0
    if f['customs_region'] == 'La Rochelle': # j'espère que tous les flux de 89 venant d'un bureau de la DFLR ont cet attribut
        if f['origin_province'] in ['Aunis', 'Poitou', 'Saintonge', 'Angoumois']:
            ports[bureau]['cumulated_exports_value_from_region'] += value  
        else:
            ports[bureau]['cumulated_exports_value_from_ext'] += value
    else: # dans ce cas on est censés avoir un flux pas dans DFLR
        if f['customs_office'] in ['La Rochelle', 'Marennes', 'Rochefort', 'Saint-Martin-de-Ré',"Les Sables d'Olonne",'Aligre', 'Charente']:
            print("soucis") # si on a un flux DFLR c'est que filtre customs_region à changer
        if f['customs_office'] == 'Le Havre':
            if f['origin_province'] == 'Normandie':
                ports[bureau]['cumulated_exports_value_from_region'] += value  
            else:
                ports[bureau]['cumulated_exports_value_from_ext'] += value
        elif f['customs_office'] == 'Bordeaux':
            if f['origin_province'] == 'Guyenne':
                ports[bureau]['cumulated_exports_value_from_region'] += value  
            else:
                ports[bureau]['cumulated_exports_value_from_ext'] += value
        elif f['customs_office'] == 'Nantes':
            if f['origin_province'] == 'Bretagne':
                ports[bureau]['cumulated_exports_value_from_region'] += value  
            else:
                ports[bureau]['cumulated_exports_value_from_ext'] += value
    ports[bureau]['nb_toflit_flows_taken_into_account'] += 1  

# write dataset
with open(OUTPUT3, 'w', newline='') as csvfile:
        fieldnames = ['type_of_object',	'name',	'cumulated_in_region', 'cumulated_out_region', 'nb_objects_taken_into_account', 'customs_office', 'customs_region', 'latitude', 'longitude']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        
        bureau = None
        direction = None
        writer.writeheader()
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
            writer.writerow({'type_of_object': 'port', 'name': values['port'], 'cumulated_in_region': values['cumulated_tonnage_in_region'], 'cumulated_out_region': values['cumulated_tonnage_out_region'], 'nb_objects_taken_into_account': values['nb_navigo_flows_taken_into_account'], 'customs_office': bureau, 'customs_region': direction, 'latitude': values['latitude'] if 'latitude' in values.keys() else 'ERROR', 'longitude': values['longitude'] if 'longitude' in values.keys() else 'ERROR'})
            if port in ['La Rochelle', 'Marennes', 'Rochefort', 'Saint-Martin-de-Ré', "Les Sables-d'Olonne", 'Marans', 'Charente', 'Le Havre', 'Bordeaux', 'Nantes']:
                writer.writerow({'type_of_object': 'customs_office', 'name': values['port'], 'cumulated_in_region': values['cumulated_exports_value_from_region'], 'cumulated_out_region': values['cumulated_exports_value_from_ext'], 'nb_objects_taken_into_account': values['nb_toflit_flows_taken_into_account'], 'customs_office': port, 'customs_region': direction, 'latitude': 'not applicable', 'longitude': 'not applicable'})