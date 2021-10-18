
`ports-from-larochelle-to-pasa.csv` documentation
===

# What is the original data ? 

Navigo flows from the `raw_flows` API endpoint.

# What does a line correspond to ?

One destination for boats that moved from La Rochelle port to another location in 1789 in the PASA region.

# Filters

- year = 1789
- departure_function = 'O'
- port departure = "La Rochelle"
- destination_admiralty in ['La Rochelle', "Sables d'Olonne", "Marennes", "Sables-d’Olonne"]

# Aggregation/computation info

- aggregation is done by number of travels and cumulated tonnage

# Notes/warning

/
  