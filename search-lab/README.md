# CT319 Search Lab

This static teaching artefact compares breadth-first search, depth-first search and strict hill climbing on the exact CT319 Week 2 maze. The Week 4 view can overlay Manhattan heuristic values without changing the maze or the blind-search behaviour.

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
- `app.js` contains only the browser controls and rendering.

The page is suitable for GitHub Pages at `/CT319-2627/search-lab/`.
