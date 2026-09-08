(function initialiseHillClimbing(global) {
  "use strict";

  const lab = global.CT319;
  if (!lab || !lab.SEARCHING) {
    throw new Error("problems.js and search.js must be loaded before hill-climbing.js");
  }

  const STUCK = "stuck";
  const NO_IMPROVING_NEIGHBOUR = "NO IMPROVING NEIGHBOUR";

  function manhattan(problem, state) {
    return Math.abs(state[0] - problem.goal[0]) + Math.abs(state[1] - problem.goal[1]);
  }

  function evaluateHillNeighbours(problem, state, successorOrder = lab.DEFAULT_ORDER) {
    const currentHeuristic = manhattan(problem, state);
    return lab.neighbours(problem, state, successorOrder).map(({ action, state: neighbour }) => ({
      action,
      state: neighbour,
      key: lab.keyOf(neighbour),
      heuristic: manhattan(problem, neighbour),
      improving: manhattan(problem, neighbour) < currentHeuristic,
    }));
  }

  function preferredImprovingNeighbour(candidates) {
    return candidates.reduce((preferred, candidate) => {
      if (!candidate.improving) return preferred;
      if (preferred === null || candidate.heuristic < preferred.heuristic) return candidate;
      return preferred;
    }, null);
  }

  function createHillSession(problem, successorOrder = lab.DEFAULT_ORDER) {
    if (!problem) throw new Error("A problem definition is required.");

    const startKey = lab.keyOf(problem.start);
    const atGoal = lab.isGoal(problem, problem.start);
    const session = {
      problem,
      strategy: "HILL",
      successorOrder: [...successorOrder],
      frontier: [],
      reached: new Set([startKey]),
      explored: [startKey],
      current: startKey,
      path: [startKey],
      finalPath: atGoal ? [startKey] : [],
      status: atGoal ? lab.FOUND : lab.SEARCHING,
      movesMade: 0,
      statesExpanded: 0,
      maximumFrontier: 0,
      lastGenerated: 0,
      lastAction: null,
      stopReason: null,
      candidates: [],
      preferredKey: null,
    };

    if (!atGoal) refreshHillCandidates(session);
    return session;
  }

  function refreshHillCandidates(session) {
    const currentState = lab.stateOf(session.current);
    session.candidates = evaluateHillNeighbours(
      session.problem,
      currentState,
      session.successorOrder,
    );
    const preferred = preferredImprovingNeighbour(session.candidates);
    session.preferredKey = preferred ? preferred.key : null;
    session.lastGenerated = session.candidates.length;
    return preferred;
  }

  function stepHillSession(session) {
    if (session.status !== lab.SEARCHING) return session;

    session.statesExpanded += 1;
    const preferred = refreshHillCandidates(session);
    if (preferred === null) {
      session.status = STUCK;
      session.stopReason = NO_IMPROVING_NEIGHBOUR;
      return session;
    }

    session.lastAction = preferred.action;
    session.current = preferred.key;
    session.path.push(preferred.key);
    session.reached.add(preferred.key);
    session.explored.push(preferred.key);
    session.movesMade += 1;

    if (lab.isGoal(session.problem, preferred.state)) {
      session.status = lab.FOUND;
      session.finalPath = [...session.path];
      session.candidates = [];
      session.preferredKey = null;
      session.lastGenerated = 0;
      return session;
    }

    refreshHillCandidates(session);
    return session;
  }

  function solveHill(problem, successorOrder = lab.DEFAULT_ORDER) {
    const session = createHillSession(problem, successorOrder);
    const maximumPossibleMoves = problem.rows + problem.cols;

    while (session.status === lab.SEARCHING && session.movesMade <= maximumPossibleMoves) {
      stepHillSession(session);
    }

    if (session.status === lab.SEARCHING) {
      throw new Error("Strict hill climbing exceeded the Manhattan-distance bound.");
    }
    return session;
  }

  function hillPathIsLegal(session) {
    if (session.strategy !== "HILL" || session.path.length === 0) return false;
    if (session.path[0] !== lab.keyOf(session.problem.start)) return false;

    return session.path.every((stateKey, index) => {
      if (index === 0) return true;
      const previous = lab.stateOf(session.path[index - 1]);
      const legalNextKeys = lab.neighbours(session.problem, previous, lab.DEFAULT_ORDER)
        .map(({ state }) => lab.keyOf(state));
      const previousH = manhattan(session.problem, previous);
      const currentH = manhattan(session.problem, lab.stateOf(stateKey));
      return legalNextKeys.includes(stateKey) && currentH < previousH;
    });
  }

  global.CT319 = Object.assign(lab, {
    STUCK,
    NO_IMPROVING_NEIGHBOUR,
    manhattan,
    evaluateHillNeighbours,
    preferredImprovingNeighbour,
    createHillSession,
    stepHillSession,
    solveHill,
    hillPathIsLegal,
  });
}(globalThis));
