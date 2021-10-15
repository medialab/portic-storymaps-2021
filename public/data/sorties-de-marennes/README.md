
`sorties-de-marennes.csv` documentation
===

# What is the original data ? 

Navigo flows from the `raw_flows` API endpoint.

# What does a line correspond to ?

One destination for boats that moved from Marennes port to another location in 1789.

# Filters

- year = 1789

# Aggregation/computation info

- aggregation is done by country, except for France for which we divide France (région PASA) and France (hors PASA) based on the admiralty of destination
- aggregation is done by number of travels and cumulated tonnage

# Notes/warning

/
  