
`hierarchie_destinations_des_navires_partant_de_la_region_vers_letranger.csv` documentation
===

# What is the original data ? 

Navigo pointcalls from pointcalls API endpoint

# What does a line correspond to ?

A specific destination port for boats coming from the region to foreign destinations.

# Filters

- year : 1789
- pointcall_function : 'O'
- poincall_action: 'In'
- pointcall_state_1789 != France
- source_subset == "Poitou_1789"

# Aggregation/computation info

- aggregation is done by number of pointcalls and cumulated tonnage
- an additional custom geographic grouping is added for visualization purposes

# Notes/warning

/
