
`part_3_centralite_comparaison.csv` documentation
===

# What is the original data ? 

Navigo flows from API "raw flows" endpoint

# What does a line correspond to ?

A given centrality metric for the network of ports attached to a given admiralty or group of admiralty (for La Rochelle we include "La Rochelle", "Marennes" and "Sables d'Olonnes" admiralties).

# Filters

- year : 1787
- we filter to flows that contain a departure OR destination in the following admiralties : "Bordeaux", "Nantes", "La Rochelle", "Marennes" and "Sables d'Olonnes"
- each network is computed separately

# Aggregation/computation info

- the metric regards the main port of each network

# Notes/warning

/
  