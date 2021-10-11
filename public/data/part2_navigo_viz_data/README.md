
`part_2_navigo_viz_data.csv` documentation
===

# What is the data ? 

Navigo flows for 1789

# What does a line correspond to ?

One travel for a boat that sailed from La Rochelle in 1789, with extra information aimed at serving the corresponding visualization.

# Filters

- pointcall_function : 'O'
- year : 1789
- departure_ferme_direction : 'La Rochelle'

# Aggregation/computation info

- destinations classes are made on the go in the data script (see `datascripts/part_2_navigo.py`)

# Notes/warning

- the "bureau des fermes" associated to the travel departure is modified/cleaned on the go in the datascript (see `datascripts/part_2_navigo.py`), this could be resolved upstream at some point.
  