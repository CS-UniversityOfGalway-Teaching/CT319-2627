(function initialiseProblems(global) {
  "use strict";

  const MOVES = Object.freeze({
    UP: Object.freeze([-1, 0]),
    DOWN: Object.freeze([1, 0]),
    LEFT: Object.freeze([0, -1]),
    RIGHT: Object.freeze([0, 1]),
  });

  const DEFAULT_ORDER = Object.freeze(["UP", "DOWN", "LEFT", "RIGHT"]);

  function keyOf(state) {
    return `${state[0]},${state[1]}`;
  }

  function stateOf(key) {
    return key.split(",").map(Number);
  }

  function problemFromRows(id, name, description, rows) {
    if (!Array.isArray(rows) || rows.length === 0) {
      throw new Error(`Problem ${id} must contain at least one row.`);
    }

    const width = rows[0].length;
    const walls = new Set();
    let start = null;
    let goal = null;

    rows.forEach((row, rowIndex) => {
      if (row.length !== width) {
        throw new Error(`Problem ${id} has rows of different widths.`);
      }

      [...row].forEach((cell, columnIndex) => {
        const state = [rowIndex, columnIndex];
        if (cell === "#") walls.add(keyOf(state));
        if (cell === "S") start = state;
        if (cell === "G") goal = state;
      });
    });

    if (!start || !goal) {
      throw new Error(`Problem ${id} must contain one start and one goal.`);
    }

    return Object.freeze({
      id,
      name,
      description,
      rows: rows.length,
      cols: width,
      start: Object.freeze(start),
      goal: Object.freeze(goal),
      walls,
    });
  }

  const PROBLEMS = Object.freeze([
    problemFromRows(
      "ct319",
      "CT319 maze (default)",
      "The exact Week 2 maze: 7 × 9, START (0,0), GOAL (6,8), and the same walls.",
      [
        "S.#......",
        "#.#.###.#",
        "......#..",
        ".####.##.",
        "....#....",
        "###.###.#",
        "........G",
      ],
    ),
    problemFromRows(
      "dfs-friendly",
      "Open grid — DFS-friendly",
      "With the Week 2 order, DFS follows a fortunate outer-edge route while BFS still explores by depth.",
      [
        "S........",
        ".........",
        ".........",
        ".........",
        ".........",
        ".........",
        "........G",
      ],
    ),
    problemFromRows(
      "dfs-unfortunate",
      "Open grid — DFS-unfortunate",
      "The goal is shallow, but the Week 2 order sends DFS across the grid before it returns to it.",
      [
        "S........",
        ".........",
        ".........",
        ".........",
        ".........",
        ".........",
        "G........",
      ],
    ),
  ]);

  function isLegal(problem, state) {
    const [row, column] = state;
    const insideGrid = row >= 0 && row < problem.rows && column >= 0 && column < problem.cols;
    return insideGrid && !problem.walls.has(keyOf(state));
  }

  function isGoal(problem, state) {
    return keyOf(state) === keyOf(problem.goal);
  }

  function neighbours(problem, state, order = DEFAULT_ORDER) {
    const [row, column] = state;
    const result = [];

    order.forEach((action) => {
      const movement = MOVES[action];
      if (!movement) throw new Error(`Unknown move: ${action}`);
      const candidate = [row + movement[0], column + movement[1]];
      if (isLegal(problem, candidate)) {
        result.push({ action, state: candidate });
      }
    });

    return result;
  }

  global.CT319 = Object.assign(global.CT319 || {}, {
    MOVES,
    DEFAULT_ORDER,
    PROBLEMS,
    keyOf,
    stateOf,
    isLegal,
    isGoal,
    neighbours,
  });
}(globalThis));
