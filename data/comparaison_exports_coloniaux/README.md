
`comparaison_exports_coloniaux.csv` documentation
===

# What is the original data ? 

toflit18 flows from [`bdd courante.csv`](https://github.com/medialab/toflit18_data/blob/master/base/bdd%20courante.csv.zip) file

# What does a line correspond to ?

One class of product for one customs office (direction des fermes) with its value.

# Filters

- year = 1789
- source "Best Guess customs region prod x partner" (best_guess_region_prodxpart == 1)
- we exclude ports francs ("product_grouping" != "France")

# Aggregation/computation info

- products are classed along three categories:
  - "produit colonial" if product revolution&empire class is in ['Café', 'Sucre', 'Indigo', 'Coton non transformé']
  - "produit de la région PASA" if "origin_province" is in ['Aunis', 'Poitou', 'Saintonge', 'Angoumois']
  - "autre produit" for all the rest
- values are aggregated by cumulated value in livre tournois

# Notes/warning

/
  