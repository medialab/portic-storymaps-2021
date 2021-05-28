from collections import defaultdict
import csv
from typing import DefaultDict

with open('../data/toflit18_all_flows.csv', 'r') as f:
    toflit18_flows = csv.DictReader(f)
    flows_fieldnames = toflit18_flows.fieldnames

    france_trade = DefaultDict(lambda: {"Imports": 0, "Exports": 0})
    LaRochelle_trade = DefaultDict(lambda: {"Imports": 0, "Exports": 0})
    Bordeaux_trade = DefaultDict(lambda: {"Imports": 0, "Exports": 0})

    Bordeaux_products = DefaultDict(
        lambda: DefaultDict(lambda: {"Imports": 0, "Exports": 0}))
    LaRochelle_products = DefaultDict(
        lambda: DefaultDict(lambda: {"Imports": 0, "Exports": 0}))
    LaRochelle_partners = DefaultDict(
        lambda: DefaultDict(lambda: {"Imports": 0, "Exports": 0}))
    for flow in toflit18_flows:
        # longitudinal absolute and share trade
        year = '1787' if flow['year'] == '1787.2' else flow['year']
        if flow['best_guess_national_region'] == "1" and flow['value'] != "":
            try:
                france_trade[year][flow['export_import']
                                   ] += float(flow['value'])
                if flow['customs_region'] == "La Rochelle":
                    LaRochelle_trade[year
                                     ][flow['export_import']] += float(flow['value'])
                if flow['customs_region'] == "Bordeaux":
                    Bordeaux_trade[year
                                   ][flow['export_import']] += float(flow['value'])
            except ValueError as e:
                print(flow['value'])
            except KeyError as e:
                pass
        # product and partner top for La Rochelle
        if flow['best_guess_region_prodxpart'] == "1" and flow['value'] != "":
            if flow['customs_region'] == "La Rochelle":
                LaRochelle_products[year][flow['product_revolutionempire']
                                          ][flow['export_import']] += float(flow['value'])
                if year in ['1750, 1789']:
                    LaRochelle_partners[year
                                        ][flow['partner_grouping']][flow['export_import']] += float(flow['value'])
            if flow['customs_region'] == "Bordeaux":
                Bordeaux_products[year][flow['product_revolutionempire']
                                        ][flow['export_import']] += float(flow['value'])

    with open("../public/data/decline_longitudinal_data.csv", "w") as of:
        output_csv = csv.DictWriter(
            of, ['region', 'year', 'Exports', 'Imports', 'Exports_share', 'Imports_share', 'product_revolutionempire_imports_herfindahl', 'product_revolutionempire_exports_herfindahl', 'product_revolutionempire_total_herfindahl'])
        output_csv.writeheader()
        for year, value in france_trade.items():

            output_csv.writerow({
                'region': 'La Rochelle',
                'year': year,
                'Exports': LaRochelle_trade[year]['Exports'],
                'Imports': LaRochelle_trade[year]['Imports'],
                'Imports_share': LaRochelle_trade[year]['Imports']/value['Imports'],
                'Exports_share': LaRochelle_trade[year]['Exports']/value['Exports'],
                'product_revolutionempire_imports_herfindahl': sum(pow(value['Imports']/LaRochelle_trade[year]['Imports'], 2) for value in LaRochelle_products[year].values()),
                'product_revolutionempire_exports_herfindahl': sum(pow(value['Exports']/LaRochelle_trade[year]['Exports'], 2) for value in LaRochelle_products[year].values()),
                'product_revolutionempire_total_herfindahl': sum(pow((value['Imports']+value['Exports'])/(LaRochelle_trade[year]['Imports']+LaRochelle_trade[year]['Exports']), 2) for value in LaRochelle_products[year].values())
            })
            output_csv.writerow({
                'region': 'Bordeaux',
                'year': year,
                'Exports': Bordeaux_trade[year]['Exports'],
                'Imports': Bordeaux_trade[year]['Imports'],
                'Imports_share': Bordeaux_trade[year]['Imports']/value['Imports'],
                'Exports_share': Bordeaux_trade[year]['Exports']/value['Exports'],
                'product_revolutionempire_imports_herfindahl': sum(pow(value['Imports']/Bordeaux_trade[year]['Imports'], 2) for value in Bordeaux_products[year].values()),
                'product_revolutionempire_exports_herfindahl': sum(pow(value['Exports']/Bordeaux_trade[year]['Exports'], 2) for value in Bordeaux_products[year].values()),
                'product_revolutionempire_total_herfindahl': sum(pow((value['Imports']+value['Exports'])/(Bordeaux_trade[year]['Imports']+Bordeaux_trade[year]['Exports']), 2) for value in Bordeaux_products[year].values())
            })
            output_csv.writerow({
                'region': 'France',
                'year': year,
                'Exports': value['Exports'],
                'Imports': value['Imports'],
                'Imports_share': 100,
                'Exports_share': 100
            })
    with open("../public/data/decline_LR_products.csv", "w") as of:
        output_csv = csv.DictWriter(of, ['product', 'year', 'value'])
        output_csv.writerows({'product': product, 'year': year, 'value': value} for year, products in LaRochelle_products.items(
        ) if year in ['1750', '1789'] for product, value in products.items())

    with open("../public/data/decline_LR_partners.csv", "w") as of:
        output_csv = csv.DictWriter(of, ['partner', 'year', 'value'])
        output_csv.writerows({'partner': partner, 'year': year, 'value': value} for year, partners in LaRochelle_partners.items(
        ) if year in ['1750', '1789'] for partner, value in partners.items())
