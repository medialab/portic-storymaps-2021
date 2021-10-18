
`global_evolution_la_rochelle_imports_exports.csv` documentation
===

# What is the original data ? 

toflit18 flows from [`bdd courante.csv`](https://github.com/medialab/toflit18_data/blob/master/base/bdd%20courante.csv.zip) file

# What does a line correspond to ?

One year of import or export for La Rochelle, with attached metrics about share of trade against france total trade.

# Filters

- for La Rochelle numbers : source "Best Guess customs region prod x partner" (best_guess_region_prodxpart == 1)
- for national numbers : source "best guess national partner" (best_guess_national_partner == 1)
- we exclude ports francs ("product_grouping" != "France")

# Aggregation/computation info

- values aggregated by cumulated value in livre tournois

# Notes/warning

/
  