(function initialiseSearch(global) {
  "use strict";

  const lab = global.CT319;
  if (!lab) throw new Error("problems.js must be loaded before search.js");

  const SEARCHING = "searching";
  const FOUND = "found";
  const EXHAUSTED = "exhausted";

  function createSession(problem, strategy, successorOrder = lab.DEFAULT_ORDER) {
    if (!problem) throw new Error("A problem definition is required.");
    if (strategy !== "BFS" && strategy !== "DFS") {
      throw new Error(`Unknown strategy: ${strategy}`);
    }

    const startKey = lab.keyOf(problem.start);
    return {
      problem,
      strategy,
      successorOrder: [...successorOrder],
      frontier: [startKey],
      reached: new Set([startKey]),
      parents: new Map([[startKey, null]]),
      parentActions: new Map(),
      explored: [],
      current: null,
      finalPath: [],
      status: SEARCHING,
      statesExpanded: 0,
      maximumFrontier: 1,
      lastGenerated: 0,
    };
  }

  function removeNext(session) {
    return session.strategy === "BFS" ? session.frontier.shift() : session.frontier.pop();
  }

  function reconstructPath(session, goalKey) {
    const path = [];
    let stateKey = goalKey;

    while (stateKey !== null) {
      path.push(stateKey);
      stateKey = session.parents.get(stateKey);
    }

    return path.reverse();
  }

  function stepSession(session) {
    if (session.status !== SEARCHING) return session;

    if (session.frontier.length === 0) {
      session.status = EXHAUSTED;
      session.current = null;
      return session;
    }

    const currentKey = removeNext(session);
    const currentState = lab.stateOf(currentKey);
    session.current = currentKey;
    session.explored.push(currentKey);
    session.statesExpanded += 1;
    session.lastGenerated = 0;

    if (lab.isGoal(session.problem, currentState)) {
      session.status = FOUND;
      session.finalPath = reconstructPath(session, currentKey);
      return session;
    }

    lab.neighbours(session.problem, currentState, session.successorOrder).forEach(({ action, state }) => {
      const nextKey = lab.keyOf(state);
      if (session.reached.has(nextKey)) return;

      session.reached.add(nextKey);
      session.parents.set(nextKey, currentKey);
      session.parentActions.set(nextKey, action);
      session.frontier.push(nextKey);
      session.lastGenerated += 1;
    });

    session.maximumFrontier = Math.max(session.maximumFrontier, session.frontier.length);
    if (session.frontier.length === 0) session.status = EXHAUSTED;
    return session;
  }

  function frontierInRemovalOrder(session) {
    return session.strategy === "BFS" ? [...session.frontier] : [...session.frontier].reverse();
  }

  function solve(problem, strategy, successorOrder = lab.DEFAULT_ORDER) {
    const session = createSession(problem, strategy, successorOrder);
    const maximumPossibleExpansions = (problem.rows * problem.cols) + 1;

    while (session.status === SEARCHING && session.statesExpanded <= maximumPossibleExpansions) {
      stepSession(session);
    }

    if (session.status === SEARCHING) {
      throw new Error("Search exceeded the finite graph bound.");
    }
    return session;
  }

  function pathIsLegal(session) {
    if (session.status !== FOUND || session.finalPath.length === 0) return false;
    if (session.finalPath[0] !== lab.keyOf(session.problem.start)) return false;
    if (session.finalPath.at(-1) !== lab.keyOf(session.problem.goal)) return false;

    return session.finalPath.every((stateKey, index) => {
      if (index === 0) return true;
      const previous = lab.stateOf(session.finalPath[index - 1]);
      const legalNextKeys = lab.neighbours(session.problem, previous, lab.DEFAULT_ORDER)
        .map(({ state }) => lab.keyOf(state));
      return legalNextKeys.includes(stateKey);
    });
  }

  global.CT319 = Object.assign(lab, {
    SEARCHING,
    FOUND,
    EXHAUSTED,
    createSession,
    stepSession,
    frontierInRemovalOrder,
    solve,
    pathIsLegal,
  });
}(globalThis));
