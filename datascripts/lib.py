
import requests
import csv
import os
import coloredlogs, logging

logger = logging.getLogger(__name__)
coloredlogs.install(level='DEBUG')

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


def ensure_dir(path):
  if not os.path.exists(path):
      os.makedirs(path)

def write_csv(filename, data):
  logger.debug('write csv | ' + filename)
  parts = filename.split('/')
  if len(parts) > 1:
    folder = parts[0]
    folder_path = "../public/data/" + folder
    ensure_dir(folder_path)
  final_path = "../public/data/" + filename;
  with open(final_path, "w") as of:
    output_csv = csv.DictWriter(
        of, data[0].keys())
    output_csv.writeheader()
    output_csv.writerows(data)
