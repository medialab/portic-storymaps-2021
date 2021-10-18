
`origines_exports_eau_de_vie_1789_la_rochelle.csv` documentation
===

# What is the original data ? 

toflit18 flows from [`bdd courante.csv`](https://github.com/medialab/toflit18_data/blob/master/base/bdd%20courante.csv.zip) file

# What does a line correspond to ?

One type of eau-de-vie, for one type of origin.

# Filters

- year = 1789
- source "Best Guess customs region prod x partner" (best_guess_region_prodxpart == 1)
- we exclude ports francs ("product_grouping" != "France")
- customs_direction = "La Rochelle" or "Bordeaux" or "Nantes" or "Bayonne" or "Montpellier"
- type = exports
- filtering eau-de-vie products : flow["product_revolutionempire"] == "Eaux-de-vie et liqueurs" or flow["product_simplification"] == "vin et eau-de-vie" or flow["product_simplification"] == "vin et eau-de-vie de vin"

# Aggregation/computation info

- eau-de-vie are classified as simple or double against [the following classification](https://docs.google.com/spreadsheets/d/e/2PACX-1vQI3rLZXqFtiqO4q8Pbp5uGH8fon-hYrd-LnJGtsYMe6UWWCwubvanKZY4FW1jI6eJ5OJ_GA8xUxYQf/pub?output=csv)
- values are aggregated by cumulated value in livre tournois

# Notes/warning

/
  