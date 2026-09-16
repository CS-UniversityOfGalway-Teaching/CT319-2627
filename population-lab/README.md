# CT319 Population Lab

This static teaching artefact shows two population-based searches side by side: a genetic algorithm on the CT319 five-bit knapsack, and ant colony optimisation on a small route graph. It is the Week 6 companion to the Weeks 2–5 Search Lab.

Open `index.html` directly, or serve the repository root and visit `/population-lab/`:

```sh
python3 -m http.server 8000
```

No build or dependencies are required. To run the checks:

```sh
node population-lab/test-population.js
```

The implementation is split by responsibility:

- `knapsack.js` contains the items, capacity, feasibility rule, fitness and the seeded generator.
- `evolution.js` contains selection, one-point crossover, bit-flip mutation and the diversity measures.
- `colony.js` contains the route graph, pheromone, probabilistic route choice, reinforcement and evaporation.
- `app.js` contains only the browser controls and rendering.

## The knapsack instance

Items `A B C D E` with weights `12 2 1 1 4` and values `4 2 2 1 10`, as used in the formal CT319 knapsack example, with a **capacity of 12** stated here so every fitness value can be checked by hand. The best feasible candidate is `01111` — items B, C, D and E, weight 8, value 15.

**Feasibility is handled by rejection, not silently.** A candidate over the capacity keeps a fitness of `0`, which leaves it visible in the population table (marked over capacity, with no share of the selection wheel) while making it unselectable. The interface states this and the "over capacity" metric counts it.

The genetic algorithm also carries **the single best candidate over unchanged** each generation, so the best-fitness trace never falls. This is stated in the interface.

## Reproducibility

Both views are seeded. A given seed replays the same run, so a classroom demonstration does not depend on luck.

- Evolution, seed `39`, mutation rate `0`: the population collapses to eight copies of `01101` by generation 13 and stops on "no improvement", holding 14 when 15 was reachable. Mean pairwise Hamming distance reaches 0.
- Evolution, seed `39`, mutation rate `0.06`: the same starting population reaches 15 in 8 generations and never loses its diversity.
- Colony, seed `21`, evaporation `0.30`: pheromone concentrates on `NEST → C → Y → FOOD`, the cheapest of six routes at cost 5. With evaporation `0` the colony still finds it but stays undecided for far longer.

## Scope

The lab exposes search mechanisms for teaching. It is not a production optimiser, and it contains no Week 7 or later material.
