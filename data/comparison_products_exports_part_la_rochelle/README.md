
`comparison_products_exports_part_la_rochelle.csv` documentation
===

# What is the original data ? 

toflit18 flows from [`bdd courante.csv`](https://github.com/medialab/toflit18_data/blob/master/base/bdd%20courante.csv.zip) file

# What does a line correspond to ?

One product exported by either France or La Rochelle customs direction.

# Filters

- source "Best Guess customs region prod x partner" (best_guess_region_prodxpart == 1)
- we exclude ports francs ("product_grouping" != "France")

# Aggregation/computation info

- flows geographic attribution is done according to 3 classes : La Rochelle (customs_direction = "La Rochelle"), National (customs_direection = "National" or "") and "Autre direction"
- France means metrics per products are derivated from all flows, La Rochelle comes from La Rochelle flows only
- products classes are from "revolution & empire" classification
- values aggregated by cumulated value in livre tournois

# Notes/warning

One should wonder if using both national and direction-level for France means might cause duplicates (?).
However it might not matter so much as we are calculating a means of products shares (?).
  