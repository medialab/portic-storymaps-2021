import requests
import csv
import json

LIST_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR65herfDXGXCgMTJt020TqjIVnAyLiDB-IkcpShhd9rZysqAt0sMGvXOAHgItSkTKqvB1TWXMuDQZR/pub?output=csv'

TARGET = '../src/visualizationsList.json'

def get_online_csv(url):
  """
  Cette fonction permet de récupérer le contenu d'un csv en ligne.
  Pour les google spreadsheets: fichier > publier sur le web > format csv > copier le lien
  """
  results = []
  with requests.Session() as s:
      download = s.get(url)
      decoded_content = download.content.decode('utf-8')
      reader = csv.DictReader(decoded_content.splitlines(), delimiter=',')
      for row in reader:
        results.append(row)
  return results

list = get_online_csv(LIST_URL)
f = open(TARGET, "w")
f.write(json.dumps(list))
f.close()