
`out_with_salt_by_port.csv` documentation
===

# What is the original data ? 

Navigo pointcalls from pointcalls API endpoint

# What does a line correspond to ?

A specific port of the PASA region, with data about the share of salt coming out of it

# Filters

- year : 1789
- pointcall_function : 'O'
- admiralty in ['La Rochelle', "Marennes", "Sables-d’Olonne"]
- poincall_action: 'Out'
- 'sel' in one of these fields : ['commodity_standardized_fr', 'commodity_standardized2_fr', 'commodity_standardized3_fr', 'commodity_standardized4_fr']

# Aggregation/computation info

- aggregation is done by number of pointcalls and cumulated tonnage
- french/foreign state is decided based on the `homeport_state_1789_fr` field

# Notes/warning

Some boats might not have only salt on board. And they could not be fully filled of salt. So the quantification is highly uncertain, it just gives an order of magnitude.
