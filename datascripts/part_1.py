from collections import defaultdict
import csv
from typing import Counter, DefaultDict
import os
from lib import ensure_dir, logger, write_readme


logger.info('start | part 1 main viz datasets')

products_names_translations = {
  "Café": "Coffee",
  "Cordonnerie et sellerie": "Shoemaking and upholstery",
  "Cuirs, peaux et pelleterie": "Hides, skins and furs",
  "Eaux-de-vie et liqueurs": "Brandies and liqueurs",
  "Farine, gruau, biscuits et pâtes": "Flour, oatmeal, cookies and pasta",
  "Indigo": "Indigo",
  "Mercerie": "Haberdashery",
  "Objets d'art et d'histoire naturelle": "Works of art and natural history",
  "Ouvrages métalliques": "Metallic works",
  "Quincaillerie": "Hardware store",
  "Sel": "Salt",
  "Sucre": "Sugar",
  "Toiles de chanvre et de lin": "Hemp and linen fabrics",
  "Toiles de coton": "Cotton fabrics",
  "Vins de Bordeaux": "Bordeaux wines",
  "Vins divers": "Diverse wines",
  "Étoffes de laine": "Woolen fabrics",
  "Étoffes de soie": "Silk fabrics",
  "Toiles diverses" : "Various clothes"
}

def output_row(region, year, region_trade, region_products, total_trade):
  sum_imports = sum(value.get(
      'Imports') for value in region_products[year].values() if value.get('Imports'))
  sum_exports = sum(value.get(
      'Exports') for value in region_products[year].values() if value.get('Exports'))
  return {
      'region': region,
      'year': year,
      'Exports': region_trade[year].get('Exports'),
      'Imports': region_trade[year].get('Imports'),
      'Imports_share': region_trade[year]['Imports']/total_trade['Imports'] if region_trade[year].get('Imports') else None,
      'Exports_share': region_trade[year]['Exports']/total_trade['Exports'] if region_trade[year].get('Exports') else None,
      'product_revolutionempire_imports_herfindahl': sum(pow(value['Imports']/sum_imports, 2) for value in region_products[year].values()) if sum_imports != 0 else None,
      'product_revolutionempire_exports_herfindahl': sum(pow(value['Exports']/sum_exports, 2) for value in region_products[year].values()) if sum_exports != 0 else None,
      'product_revolutionempire_total_herfindahl': sum(pow((value['Imports']+value['Exports'])/(sum_imports + sum_exports), 2) for value in region_products[year].values()) if sum_imports != 0 or sum_exports != 0 else None
  }

with open('../data/toflit18_all_flows.csv', 'r') as f:
  toflit18_flows = csv.DictReader(f)
  flows_fieldnames = toflit18_flows.fieldnames

  france_trade = DefaultDict(Counter)
  LaRochelle_trade = DefaultDict(Counter)
  Bordeaux_trade = DefaultDict(Counter)

  Bordeaux_products = DefaultDict(
      lambda: DefaultDict(Counter))
  LaRochelle_products = DefaultDict(
      lambda: DefaultDict(Counter))
  LaRochelle_partners = DefaultDict(
      lambda: DefaultDict(Counter))
  for flow in toflit18_flows:
      # ATTENTION we filter out Ports Francs
      if flow['partner_grouping'] == 'France':
          continue
      # longitudinal absolute and share trade
      year = flow['year'].split(
          '.')[0] if "." in flow['year'] else flow['year']
      if flow['best_guess_national_partner'] == "1" and flow['value'] != "":
          france_trade[year][flow['export_import']
                              ] += float(flow['value'])
      if flow['best_guess_region_prodxpart'] == "1" and flow['value'] != "":
          try:

              if flow['customs_region'] == "La Rochelle":
                  LaRochelle_trade[year
                                    ][flow['export_import']] += float(flow['value'])
              if flow['customs_region'] == "Bordeaux":
                  Bordeaux_trade[year
                                  ][flow['export_import']] += float(flow['value'])
          except ValueError as e:
              logger.warning(flow['value'])
          except KeyError as e:
              pass
      # product and partner top for La Rochelle
      if flow['best_guess_region_prodxpart'] == "1" and flow['value'] != "":
          if flow['customs_region'] == "La Rochelle":
              LaRochelle_products[year][flow['product_revolutionempire']
                                        ][flow['export_import']] += float(flow['value'])
              LaRochelle_partners[year
                                  ][flow['partner_simplification']][flow['export_import']] += float(flow['value'])
          if flow['customs_region'] == "Bordeaux":
              Bordeaux_products[year][flow['product_revolutionempire']
                                      ][flow['export_import']] += float(flow['value'])
  
  logger.info('start | part 1 main viz : longitudinal data')
  info = """
`decline_longitudinal_data.csv` documentation
===

# What is the original data ? 

toflit18 flows from [`bdd courante.csv`](https://github.com/medialab/toflit18_data/blob/master/base/bdd%20courante.csv.zip) file

# What does a line correspond to ?

One "direction des fermes" in particular during one year in particular, for which we compute exports and imports cumulated values (in absolute and relative to France). 

# Filters

- for direction-level data: source "Best Guess customs region prod x partner" (best_guess_region_prodxpart == 1)
- for france-level data : source "Best guess national partner" (best_guess_national_partner=1)
- products are taken from the "revolution & empire" toflit18 classification

# Aggregation/computation info

- values aggregated by cumulated value in livre tournois
- direction-level data is normalized against France level to compute shares for each product
- Herfindahl metrics are computed with the "revolution & empire" toflit18 classification. See https://en.wikipedia.org/wiki/Herfindahl%E2%80%93Hirschman_Index for more info about this indicator

# Notes/warnings

- we do not have data for all years
  """

  ensure_dir("../public/data/decline_longitudinal_data")
  write_readme("decline_longitudinal_data/README.md", info)
  with open("../public/data/decline_longitudinal_data/decline_longitudinal_data.csv", "w") as of:
      output_csv = csv.DictWriter(
          of, ['region', 'year', 'Exports', 'Imports', 'Exports_share', 'Imports_share', 'product_revolutionempire_imports_herfindahl', 'product_revolutionempire_exports_herfindahl', 'product_revolutionempire_total_herfindahl'])
      output_csv.writeheader()
      for year, value in sorted(france_trade.items(), key=lambda yv: yv[0]):

          output_csv.writerow(output_row(
              "La Rochelle", year, LaRochelle_trade, LaRochelle_products, value))
          output_csv.writerow(output_row(
              "Bordeaux", year, Bordeaux_trade, Bordeaux_products, value))
          output_csv.writerow({
              'region': 'France',
              'year': year,
              'Exports': value['Exports'],
              'Imports': value['Imports'],
              'Imports_share': 100,
              'Exports_share': 100
          })
      logger.debug('done | part 1 main viz : longitudinal data')
      

  logger.info('start | part 1 main viz : LR products')
  info = """
`decline_LR_products.csv` documentation
===

# What is the original data ? 

toflit18 flows from [`bdd courante.csv`](https://github.com/medialab/toflit18_data/blob/master/base/bdd%20courante.csv.zip) file

# What does a line correspond to ?

One product exported by La Rochelle, with its absolute and relative value in livres tournois.

# Filters

- source "Best Guess customs region prod x partner" (best_guess_region_prodxpart == 1)
- for france-level data : source "Best guess national partner" (best_guess_national_partner=1)
- products names and classes are taken from the "revolution & empire" toflit18 classification.

# Aggregation/computation info

- values aggregated by cumulated value in livre tournois
- direction-level data is normalized against France level to compute shares

# Notes/warning

/
  """
  ensure_dir("../public/data/decline_LR_products")
  write_readme("decline_LR_products/README.md", info)
  with open("../public/data/decline_LR_products/decline_LR_products.csv", "w") as of:
      output_csv = csv.DictWriter(
          of, ['product', 'product_fr', 'product_en', 'year', 'Exports', 'Imports'])
      output_csv.writeheader()
      output_csv.writerows({
        'product': product, 
        'product_fr': product, 
        'product_en': products_names_translations[product] if product in products_names_translations else product,
        'year': year, 
        'Exports': value.get("Exports"), 
        'Imports': value.get("Imports")
      } for year, products in LaRochelle_products.items() if year in ['1750', '1789'] for product, value in products.items())
      logger.debug('done | part 1 main viz : LR products')

  logger.info('start | part 1 main viz : LR partners')
  info = """
`decline_LR_partners.csv` documentation
===

# What is the original data ? 

toflit18 flows from [`bdd courante.csv`](https://github.com/medialab/toflit18_data/blob/master/base/bdd%20courante.csv.zip) file

# What does a line correspond to ?

One partner of imports and exports with La Rochelle's direction des fermes, with its absolute value in livres tournois.

# Filters

- source "Best Guess customs region prod x partner" (best_guess_region_prodxpart == 1)
- partners names and classes are taken from the "partner_simplification" toflit18 classification.

# Aggregation/computation info

- values aggregated by cumulated value in livre tournois

# Notes/warning

/
  """
  ensure_dir("../public/data/decline_LR_partners")
  write_readme("decline_LR_partners/README.md", info)
  with open("../public/data/decline_LR_partners/decline_LR_partners.csv", "w") as of:
      output_csv = csv.DictWriter(
          of, ['partner', 'year', 'Exports', 'Imports'])
      output_csv.writeheader()
      output_csv.writerows({'partner': partner, 'year': year, 'Imports': value.get('Imports'), 'Exports': value.get('Exports')} for year, partners in LaRochelle_partners.items(
      ) if year in ['1750', '1789'] for partner, value in partners.items())
      logger.debug('done | part 1 main viz : LR partners')
logger.debug('done | part 1 main viz datasets')
