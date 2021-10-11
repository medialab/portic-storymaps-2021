
# What is the data ? 

toflit18 flows

# What does a line correspond to ?

One partner of exports by La Rochelle, with its absolute and relative value in livres tournois.

# Filters: 

- source "Best Guess customs region prod x partner" (best_guess_region_prodxpart == 1)
- for france-level data : source "Best guess national partner" (best_guess_national_partner=1)
- partners names and classes are taken from the "partner_simplification" toflit18 classification.

# Aggregation/computation info:

- values aggregated by cumulated value in livre tournois
- direction-level data is normalized against France level to compute shares
  