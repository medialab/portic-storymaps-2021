
`part_2_toflit_viz_data.csv` documentation
===

# What is the original data ? 

toflit18 flows from [`bdd courante.csv`](https://github.com/medialab/toflit18_data/blob/master/base/bdd%20courante.csv.zip) file

# What does a line correspond to ?

An aggregation of toflit18 flows for 1789, corresponding to :

- 1 bureau des fermes in particular
- 1 class of partner in particular
- 1 type of product in particular

# Filters

- source "Best Guess customs region prod x partner" (best_guess_region_prodxpart == 1)
- year : 1789
- customs_region : La Rochelle

# Aggregation/computation info

- values aggregated by cumulated value in livre tournois
- partner column is made from a custom classification to see directly in the datascript `datascripts/part_2_toflit18.py`
- product column is made from a custom classification to see directly in the datascript `datascripts/part_2_toflit18.py`

# Notes/warning

- Products weights are quite rarely specified in flows
  