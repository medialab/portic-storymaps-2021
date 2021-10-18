
`part_3_step3_viz_ports_data.csv` documentation
===

# What is the original data ? 

Navigo flows from raw flows' API endpoint

# What does a line correspond to ?

A specific port and its related data for 1787 or 1789 depending on the port.

# Filters

- for all flows : only flows coming out of the studied port (vs flows entering the port which are not taken into account)
- for La Rochelle Data : 
  - year : 1789
  - pointcall_function : 'O'
- for Bordeaux, Nantes and Le Havre data :
  - year : 1787

# Aggregation/computation info

- we distinguish tonnages for travels inside PASA, and travels outside PASA

# Notes/warning

- we use different years depending on data availability for PASA region and compared ports
