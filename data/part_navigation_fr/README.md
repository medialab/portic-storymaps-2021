
`part_navigation_fr.csv` documentation
===

# What is the original data ? 

Navigo pointcalls from pointcalls API endpoint

# What does a line correspond to ?

A specific port of the PASA region, with data about the share of foreign and french boats (based on homeport)

# Filters

- year : 1789
- pointcall_function : 'O'
- admiralty in ['La Rochelle', "Marennes", "Sables-d’Olonne"]
- poincall_action: 'Out'

# Aggregation/computation info

- aggregation is done by number of pointcalls and cumulated tonnage
- french/foreign state is decided based on the `homeport_state_1789_fr` field

# Notes/warning

/
