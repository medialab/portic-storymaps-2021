from poitousprint import Toflit
from vega import VegaLite
import pandas as pd
from operator import itemgetter # to sort lists

toflit_client = Toflit()

def prepare_flow(flow):
    f = flow.copy()
    if f['export_import'] == 'Imports' or f['export_import'] == 'import':
        f['export_import'] = 'Imports'
    elif f['customs_region'] == '' or f['customs_region'] == 'National':
        f['customs_region_simpl'] = 'National'
    if f['customs_region'] == 'La Rochelle':
        f['customs_region_simpl'] = 'La Rochelle'
    else:
        f['customs_region_simpl'] = 'Autre direction'
    f['value'] = float(f['value']) if f['value'] != '' else 0
    return f

def clean_flow(flow):
    f = flow.copy()
    abs_map = total_exports_per_direction if f['export_import'] == 'Exports' else total_imports_per_direction
    f['value_rel_per_direction'] = f['value'] / abs_map[f['customs_region_simpl']]
    return f   

def aggregate_flows_by_product(flows):
    flows_aggregated_by_product = {}
    # je veux construire un dict par produit, en distinguant LR / pas LR
    
    for flow in flows:
        if flow['product_revolutionempire'] not in flows_aggregated_by_product:
            flows_aggregated_by_product[flow['product_revolutionempire']] = {
                'product':flow['product_revolutionempire'],
                'exports_la_rochelle': 0,
                'exports_toute_france':0,
                }
    # à la fin pour chaque produit je sommerais le total export pour calculer du relatif  
        if flow['partner_grouping'] != 'France':
            if flow['customs_region_simpl'] == 'La Rochelle':
                flows_aggregated_by_product[flow['product_revolutionempire']]['exports_la_rochelle'] += flow['value']
            flows_aggregated_by_product[flow['product_revolutionempire']]['exports_toute_france'] += flow['value']

    return flows_aggregated_by_product


def format_data_for_gouped_bar_chart_vega(flows):
    total_exports_per_direction = {}
    total_imports_per_direction = {}

    for f in flows:
        flow = prepare_flow(f)
        if flow['export_import'] == 'Imports':
            if flow['customs_region_simpl'] not in total_imports_per_direction:
                total_imports_per_direction[flow['customs_region_simpl']] = 0
            total_imports_per_direction[flow['customs_region_simpl']] += flow['value']
        else:
            if flow['customs_region_simpl'] not in total_exports_per_direction:
                total_exports_per_direction[flow['customs_region_simpl']] = 0
            total_exports_per_direction[flow['customs_region_simpl']] += flow['value']

    flows = [clean_flow(prepare_flow(f)) for f in flows]

    # aggregation des flux par produit
    product_exports_values_per_direction = aggregate_flows_by_product(flows)

    # calcul de la part de chaque produit dans les exports totaux
    total_exports_la_rochelle = 0
    total_exports_toute_france = 0

    for product, values in product_exports_values_per_direction.items():
        total_exports_la_rochelle += values['exports_la_rochelle']
        total_exports_toute_france += values['exports_toute_france']

    for product, values in product_exports_values_per_direction.items():
        values['exports_rel_la_rochelle'] = values['exports_la_rochelle'] / total_exports_la_rochelle
        values['exports_rel_toute_france'] = values['exports_toute_france'] / total_exports_toute_france

    # ordonner en mettant en premier les produits les plus importants pour La Rochelle
    sorted_product_exports_values_per_direction = sorted(product_exports_values_per_direction.values(), key=itemgetter('exports_rel_la_rochelle'), reverse=True)

    # reformatter les données sous la forme d'un ensemble de dicts : un dict par produit pour La Rochelle et un dict par produit pour l'ensemble de la France
    final_vega_data = []
    i = 0
    for values in sorted_product_exports_values_per_direction:
        
        final_vega_data.append({
            "product" : values['product'],
            "direction_des_fermes" : 'La Rochelle',
            "value_rel_per_direction" : values['exports_rel_la_rochelle'],
            "order":i
        })
        
        final_vega_data.append({
            "product" : values['product'],
            "direction_des_fermes" : "Total France",
            "value_rel_per_direction" : values['exports_rel_toute_france'],
            "order":i
        })
        
        i += 1


flows_1750  = toflit_client.get_flows(year=1750, best_guess_region_prodxpart='1')
data_1750_for_bar_chart_component = format_data_for_gouped_bar_chart_vega(flows_1750)

flows_1789 = toflit_client.get_flows(year=1789, best_guess_region_prodxpart='1')
data_1789_for_bar_chart_component = format_data_for_gouped_bar_chart_vega(flows_1789)

# but de return objet avec un dict par année ? (à voir en fonction de comment le component est construit)