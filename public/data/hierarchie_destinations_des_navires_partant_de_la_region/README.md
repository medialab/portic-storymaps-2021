
`hierarchie_destinations_des_navires_partant_de_la_region.csv` documentation
===

# What is the original data ? 

Navigo pointcalls from pointcalls API endpoint

# What does a line correspond to ?

A specific destination port for boats coming from the region to foreign destinations.

# Filters

- year : 1789
- pointcall_function : 'O'
- poincall_action: 'In'
- source_subset == "Poitou_1789"

# Aggregation/computation info

- aggregation is done by number of pointcalls and cumulated tonnage
- an additional custom geographic grouping is added for visualization purposes
- France homeports are divided between "France (région PASA)" and "France (hors région PASA)"

# Notes/warning

/
