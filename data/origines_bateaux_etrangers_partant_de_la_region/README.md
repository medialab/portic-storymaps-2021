
`origines_bateaux_etrangers_partant_de_la_region.csv` documentation
===

# What is the original data ? 

Navigo pointcalls from pointcalls API endpoint

# What does a line correspond to ?

A specific state appartenance for boats getting out of PASA

# Filters

- year : 1789
- pointcall_function : 'O'
- homeport_state_1789_fr != 'France'
- admiralty in ['La Rochelle', "Marennes", "Sables-d’Olonne"]
- poincall_action: 'Out'

# Aggregation/computation info

- aggregation is done by number of pointcalls and cumulated tonnage

# Notes/warning

/
