import json
from lib import get_online_csv

LIST_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR65herfDXGXCgMTJt020TqjIVnAyLiDB-IkcpShhd9rZysqAt0sMGvXOAHgItSkTKqvB1TWXMuDQZR/pub?output=csv'

TARGET = '../src/visualizationsList.json'

list = get_online_csv(LIST_URL)
f = open(TARGET, "w")
list = [l for l in list if l["id"].strip() != '']
f.write(json.dumps(list))
f.close()