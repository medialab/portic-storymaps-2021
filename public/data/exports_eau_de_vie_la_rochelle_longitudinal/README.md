
`exports_eau_de_vie_la_rochelle_longitudinal.csv` documentation
===

# What is the original data ? 

toflit18 flows from [`bdd courante.csv`](https://github.com/medialab/toflit18_data/blob/master/base/bdd%20courante.csv.zip) file

# What does a line correspond to ?

One year of eau-de-vie exports from La Rochelle.

# Filters

- source "Best Guess customs region prod x partner" (best_guess_region_prodxpart == 1)
- we exclude ports francs ("product_grouping" != "France")
- customs_direction = "La Rochelle"
- type = exports
- filtering eau-de-vie products : flow["product_revolutionempire"] == "Eaux-de-vie et liqueurs" or flow["product_simplification"] == "vin et eau-de-vie" or flow["product_simplification"] == "vin et eau-de-vie de vin"

# Aggregation/computation info

- values are aggregated by cumulated value in livre tournois

# Notes/warning

/
  