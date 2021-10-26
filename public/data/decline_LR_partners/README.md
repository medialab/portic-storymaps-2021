
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
  