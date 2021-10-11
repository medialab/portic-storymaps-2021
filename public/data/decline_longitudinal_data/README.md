
# What is the data ? 

toflit18 flows

# What does a line correspond to ?

One "direction des fermes" in particular during one year in particular, for which we compute exports and imports cumulated values (in absolute and relative to France). 

# Filters: 

- for direction-level data: source "Best Guess customs region prod x partner" (best_guess_region_prodxpart == 1)
- for france-level data : source "Best guess national partner" (best_guess_national_partner=1)
- products are taken from the "revolution & empire" toflit18 classification

# Aggregation/computation info:

- values aggregated by cumulated value in livre tournois
- direction-level data is normalized against France level to compute shares for each product
- Herfindahl metrics are computed with the "revolution & empire" toflit18 classification. See https://en.wikipedia.org/wiki/Herfindahl%E2%80%93Hirschman_Index for more info about this indicator

# Notes/warnings:

- we do not have data for all years
  