
`part_3_step3_viz_customs_offices_data.csv` documentation
===

# What is the original data ? 

- Toflit18 flows taken from `bdd_base_courante.csv` dataset.
- Navigation data from Navigo `raw_flows` endpoint

# What does a line correspond to ?

Navigation data for 1789 related to a specific *bureau des fermes* (thanks to bureaux-ports alignments)

# Filters

- for Toflit18 :
  - year : 1789
  - type of flow : exports
  - targeted customs offices : ['La Rochelle', 'Marennes', 'Rochefort', 'Saint-Martin-de-Ré', "Les Sables d'Olonne", "Tonnay-Charente", 'Aligre', 'Charente', 'Le Havre', 'Bordeaux', 'Nantes']
- for navigo data : 
  - year : 1789
  - pointcall_function : 'O'
  - only data from ports attached to PASA's customs offices/bureaux des fermes


# Aggregation/computation info

- we distinguish navigo's tonnages for travels inside PASA, and travels outside PASA grounding on flows' destination
- we distinguish toflit18's exports of PASA products and exports of not-PASA products, grounding on the flows "origin" field

# Notes/warning

/
