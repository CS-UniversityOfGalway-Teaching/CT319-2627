"use strict";

const assert = require("node:assert/strict");

require("./problems.js");
require("./search.js");
require("./hill-climbing.js");

const lab = globalThis.CT319;
const defaultProblem = lab.PROBLEMS.find((problem) => problem.id === "ct319");

assert.equal(defaultProblem.rows, 7);
assert.equal(defaultProblem.cols, 9);
assert.deepEqual(defaultProblem.start, [0, 0]);
assert.deepEqual(defaultProblem.goal, [6, 8]);
assert.equal(defaultProblem.walls.size, 22);
assert.deepEqual(
  [...defaultProblem.walls].sort(),
  [
    "0,2",
    "1,0", "1,2", "1,4", "1,5", "1,6", "1,8",
    "2,6",
    "3,1", "3,2", "3,3", "3,4", "3,6", "3,7",
    "4,4",
    "5,0", "5,1", "5,2", "5,4", "5,5", "5,6", "5,8",
  ].sort(),
);
assert.deepEqual(lab.DEFAULT_ORDER, ["UP", "DOWN", "LEFT", "RIGHT"]);
assert.equal(lab.manhattan(defaultProblem, [0, 0]), 14);
assert.equal(lab.manhattan(defaultProblem, [4, 7]), 3);
assert.equal(lab.manhattan(defaultProblem, [5, 7]), 2);
assert.equal(lab.manhattan(defaultProblem, [4, 8]), 2);
assert.equal(lab.manhattan(defaultProblem, [6, 8]), 0);

assert.deepEqual(
  lab.neighbours(defaultProblem, [2, 3], lab.DEFAULT_ORDER),
  [
    { action: "UP", state: [1, 3] },
    { action: "LEFT", state: [2, 2] },
    { action: "RIGHT", state: [2, 4] },
  ],
);

assert.deepEqual(
  lab.neighbours(defaultProblem, [4, 7], lab.DEFAULT_ORDER),
  [
    { action: "DOWN", state: [5, 7] },
    { action: "LEFT", state: [4, 6] },
    { action: "RIGHT", state: [4, 8] },
  ],
);
assert.equal(lab.isLegal(defaultProblem, [5, 8]), false);
assert.deepEqual(
  lab.neighbours(defaultProblem, [4, 8], lab.DEFAULT_ORDER),
  [
    { action: "UP", state: [3, 8] },
    { action: "LEFT", state: [4, 7] },
  ],
);

const decisionCandidates = lab.evaluateHillNeighbours(defaultProblem, [4, 7], lab.DEFAULT_ORDER);
assert.deepEqual(
  decisionCandidates.filter((candidate) => candidate.improving).map((candidate) => [candidate.action, candidate.key, candidate.heuristic]),
  [
    ["DOWN", "5,7", 2],
    ["RIGHT", "4,8", 2],
  ],
);
assert.equal(lab.preferredImprovingNeighbour(decisionCandidates).action, "DOWN");

function permutations(values) {
  if (values.length === 1) return [values];
  return values.flatMap((value, index) => {
    const rest = [...values.slice(0, index), ...values.slice(index + 1)];
    return permutations(rest).map((permutation) => [value, ...permutation]);
  });
}

const allOrders = permutations([...lab.DEFAULT_ORDER]);
const breadthResults = allOrders.map((order) => lab.solve(defaultProblem, "BFS", order));
const depthResults = allOrders.map((order) => lab.solve(defaultProblem, "DFS", order));

[...breadthResults, ...depthResults].forEach((session) => {
  assert.equal(session.status, lab.FOUND);
  assert.ok(session.statesExpanded <= defaultProblem.rows * defaultProblem.cols);
  assert.equal(lab.pathIsLegal(session), true);
});

lab.PROBLEMS.forEach((problem) => {
  ["BFS", "DFS"].forEach((strategy) => {
    const session = lab.solve(problem, strategy, lab.DEFAULT_ORDER);
    assert.equal(session.status, lab.FOUND, `${strategy} should find the goal on ${problem.id}.`);
    assert.equal(lab.pathIsLegal(session), true);
  });
});

const breadthPathLengths = new Set(breadthResults.map((session) => session.finalPath.length - 1));
assert.equal(breadthPathLengths.size, 1, "Every BFS tie order should return a minimum-depth path.");
assert.equal([...breadthPathLengths][0], 14);

const depthExpansionOrders = new Set(depthResults.map((session) => session.explored.join("|")));
assert.ok(depthExpansionOrders.size > 1, "Successor order should visibly change DFS traversal.");

const firstSession = lab.createSession(defaultProblem, "BFS", lab.DEFAULT_ORDER);
const initialSnapshot = {
  current: firstSession.current,
  frontier: [...firstSession.frontier],
  reached: [...firstSession.reached],
  statesExpanded: firstSession.statesExpanded,
  maximumFrontier: firstSession.maximumFrontier,
};
lab.stepSession(firstSession);
lab.stepSession(firstSession);
const resetSession = lab.createSession(defaultProblem, "BFS", lab.DEFAULT_ORDER);
assert.deepEqual(
  {
    current: resetSession.current,
    frontier: [...resetSession.frontier],
    reached: [...resetSession.reached],
    statesExpanded: resetSession.statesExpanded,
    maximumFrontier: resetSession.maximumFrontier,
  },
  initialSnapshot,
);

const initialHill = lab.createHillSession(defaultProblem, lab.DEFAULT_ORDER);
const initialHillSnapshot = {
  current: initialHill.current,
  path: [...initialHill.path],
  status: initialHill.status,
  movesMade: initialHill.movesMade,
  candidates: initialHill.candidates.map((candidate) => [candidate.action, candidate.key, candidate.heuristic]),
};
lab.stepHillSession(initialHill);
lab.stepHillSession(initialHill);
const resetHill = lab.createHillSession(defaultProblem, lab.DEFAULT_ORDER);
assert.deepEqual(
  {
    current: resetHill.current,
    path: [...resetHill.path],
    status: resetHill.status,
    movesMade: resetHill.movesMade,
    candidates: resetHill.candidates.map((candidate) => [candidate.action, candidate.key, candidate.heuristic]),
  },
  initialHillSnapshot,
);

const defaultBfs = lab.solve(defaultProblem, "BFS", lab.DEFAULT_ORDER);
const defaultDfs = lab.solve(defaultProblem, "DFS", lab.DEFAULT_ORDER);
const successfulHill = lab.solveHill(defaultProblem, lab.DEFAULT_ORDER);
const trappedOrder = ["UP", "RIGHT", "DOWN", "LEFT"];
const trappedHill = lab.solveHill(defaultProblem, trappedOrder);

assert.equal(successfulHill.status, lab.FOUND);
assert.equal(successfulHill.current, "6,8");
assert.equal(lab.hillPathIsLegal(successfulHill), true);
assert.deepEqual(successfulHill.path.slice(-4), ["4,7", "5,7", "6,7", "6,8"]);

assert.equal(trappedHill.status, lab.STUCK);
assert.equal(trappedHill.current, "4,8");
assert.equal(trappedHill.stopReason, "NO IMPROVING NEIGHBOUR");
assert.equal(lab.hillPathIsLegal(trappedHill), true);
assert.deepEqual(trappedHill.candidates.map((candidate) => [candidate.action, candidate.key, candidate.heuristic, candidate.improving]), [
  ["UP", "3,8", 3, false],
  ["LEFT", "4,7", 3, false],
]);

for (const session of [successfulHill, trappedHill]) {
  const values = session.path.map((key) => lab.manhattan(defaultProblem, lab.stateOf(key)));
  values.slice(1).forEach((value, index) => {
    assert.ok(value < values[index], "Strict hill climbing must never accept an equal or worse move.");
  });
}

console.log("CT319 Search Lab checks passed.");
console.log(`Default BFS: ${defaultBfs.statesExpanded} expanded, frontier max ${defaultBfs.maximumFrontier}, path ${defaultBfs.finalPath.length - 1}.`);
console.log(`Default DFS: ${defaultDfs.statesExpanded} expanded, frontier max ${defaultDfs.maximumFrontier}, path ${defaultDfs.finalPath.length - 1}.`);
console.log(`Checked BFS and DFS across ${allOrders.length} successor orders.`);
console.log(`Strict hill climbing: default order reaches the goal; RIGHT-before-DOWN stops at (${trappedHill.current}).`);
