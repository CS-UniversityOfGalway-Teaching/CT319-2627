# CT319 Search Lab

This static teaching artefact compares breadth-first search, depth-first search, strict hill climbing and simulated annealing on the exact CT319 Week 2 maze. The Week 4 view can overlay Manhattan heuristic values without changing the maze or the blind-search behaviour. The Week 5 view adds an acceptance rule that can take a worse move.

Open `index.html` directly, or serve the repository root and visit `/search-lab/`:

```sh
python3 -m http.server 8000
```

No build or dependencies are required. To run the search checks:

```sh
node search-lab/test-search.js
```

The implementation is split by responsibility:

- `problems.js` contains the maze definitions, moves, goal test and `neighbours()` behaviour.
- `search.js` contains the shared graph-search session and the FIFO/LIFO frontier policies.
- `hill-climbing.js` contains Manhattan distance and strict-improvement hill climbing.
- `annealing.js` contains the seeded generator, the cooling schedule and the `exp(-Δ/T)` acceptance rule.
- `app.js` contains only the browser controls and rendering.

Annealing runs are reproducible: a given seed and successor order always replay the same
trajectory, so a classroom demonstration does not depend on luck. Seed `743` on the default
maze reaches `(4,8)` — the Week 4 hill-climbing trap — rejects one worse move there, accepts
the next, and reaches the goal in 16 moves.

The page is suitable for GitHub Pages at `/CT319-2627/search-lab/`.
