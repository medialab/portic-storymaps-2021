
`hierarchie_ports_dattache_des_navires_partant_de_la_region.csv` documentation
===

# What is the original data ? 

Navigo pointcalls from pointcalls API endpoint

# What does a line correspond to ?

A specific homeport for PASA departures and related metrics

# Filters

- year : 1789
- pointcall_function : 'O'
- admiralty in ['La Rochelle', "Marennes", "Sables-d’Olonne"]
- poincall_action: 'Out'

# Aggregation/computation info

- aggregation is done by number of pointcalls and cumulated tonnage
- an additional custom geographic grouping is added for visualization purposes
- France homeports are divided between "France (région PASA)" and "France (hors région PASA)"

# Notes/warning

/
