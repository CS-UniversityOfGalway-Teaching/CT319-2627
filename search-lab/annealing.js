(function initialiseAnnealing(global) {
  "use strict";

  const lab = global.CT319;
  if (!lab || !lab.manhattan) {
    throw new Error("problems.js, search.js and hill-climbing.js must be loaded before annealing.js");
  }

  const COOLED = "cooled";
  const COOLED_WITHOUT_GOAL = "COOLED WITHOUT REACHING THE GOAL";

  const ANNEAL_DEFAULTS = Object.freeze({
    seed: 743,
    initialTemperature: 5,
    coolingFactor: 0.94,
    minimumTemperature: 0.02,
    maximumSteps: 300,
  });

  // mulberry32: one integer of state, so the same seed always replays the same run.
  function createRandom(seed) {
    let state = seed >>> 0;
    return function nextRandom() {
      state = (state + 0x6d2b79f5) >>> 0;
      let value = state;
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  }

  function acceptanceProbability(delta, temperature) {
    if (delta < 0) return 1;
    if (temperature <= 0) return 0;
    return Math.exp(-delta / temperature);
  }

  function createAnnealSession(problem, successorOrder = lab.DEFAULT_ORDER, settings = {}) {
    if (!problem) throw new Error("A problem definition is required.");

    const schedule = { ...ANNEAL_DEFAULTS, ...settings };
    const startKey = lab.keyOf(problem.start);
    const atGoal = lab.isGoal(problem, problem.start);

    const session = {
      problem,
      strategy: "ANNEAL",
      successorOrder: [...successorOrder],
      schedule,
      random: createRandom(schedule.seed),
      frontier: [],
      reached: new Set([startKey]),
      explored: [startKey],
      current: startKey,
      path: [startKey],
      finalPath: atGoal ? [startKey] : [],
      status: atGoal ? lab.FOUND : lab.SEARCHING,
      temperature: schedule.initialTemperature,
      movesMade: 0,
      statesExpanded: 0,
      maximumFrontier: 0,
      lastGenerated: 0,
      lastAction: null,
      stopReason: null,
      candidates: [],
      preferredKey: null,
      proposal: null,
      stepsTaken: 0,
      worseMovesAccepted: 0,
      worseMovesRejected: 0,
    };

    if (!atGoal) {
      session.candidates = lab.evaluateHillNeighbours(problem, problem.start, session.successorOrder);
      session.lastGenerated = session.candidates.length;
    }
    return session;
  }

  function stepAnnealSession(session) {
    if (session.status !== lab.SEARCHING) return session;

    const currentState = lab.stateOf(session.current);
    const currentHeuristic = lab.manhattan(session.problem, currentState);
    session.candidates = lab.evaluateHillNeighbours(session.problem, currentState, session.successorOrder);
    session.lastGenerated = session.candidates.length;
    session.statesExpanded += 1;
    session.stepsTaken += 1;

    const chosen = session.candidates[Math.floor(session.random() * session.candidates.length)];
    const delta = chosen.heuristic - currentHeuristic;
    const probability = acceptanceProbability(delta, session.temperature);
    const draw = delta < 0 ? null : session.random();
    const accepted = delta < 0 || draw < probability;

    session.proposal = {
      action: chosen.action,
      key: chosen.key,
      state: chosen.state,
      heuristic: chosen.heuristic,
      currentHeuristic,
      delta,
      temperature: session.temperature,
      probability,
      draw,
      accepted,
    };
    session.preferredKey = chosen.key;

    if (accepted) {
      session.lastAction = chosen.action;
      session.current = chosen.key;
      session.path.push(chosen.key);
      session.reached.add(chosen.key);
      session.explored.push(chosen.key);
      session.movesMade += 1;
      if (delta > 0) session.worseMovesAccepted += 1;
    } else if (delta > 0) {
      session.worseMovesRejected += 1;
    }

    session.temperature = Math.max(
      session.schedule.minimumTemperature,
      session.temperature * session.schedule.coolingFactor,
    );

    if (accepted && lab.isGoal(session.problem, chosen.state)) {
      session.status = lab.FOUND;
      session.finalPath = [...session.path];
      session.candidates = [];
      session.preferredKey = null;
      session.lastGenerated = 0;
      return session;
    }

    if (session.stepsTaken >= session.schedule.maximumSteps) {
      session.status = COOLED;
      session.stopReason = COOLED_WITHOUT_GOAL;
    }
    return session;
  }

  function solveAnneal(problem, successorOrder = lab.DEFAULT_ORDER, settings = {}) {
    const session = createAnnealSession(problem, successorOrder, settings);
    while (session.status === lab.SEARCHING) stepAnnealSession(session);
    return session;
  }

  function annealPathIsLegal(session) {
    if (session.strategy !== "ANNEAL" || session.path.length === 0) return false;
    if (session.path[0] !== lab.keyOf(session.problem.start)) return false;

    return session.path.every((stateKey, index) => {
      if (index === 0) return true;
      const previous = lab.stateOf(session.path[index - 1]);
      return lab.neighbours(session.problem, previous, lab.DEFAULT_ORDER)
        .map(({ state }) => lab.keyOf(state))
        .includes(stateKey);
    });
  }

  global.CT319 = Object.assign(lab, {
    COOLED,
    COOLED_WITHOUT_GOAL,
    ANNEAL_DEFAULTS,
    createRandom,
    acceptanceProbability,
    createAnnealSession,
    stepAnnealSession,
    solveAnneal,
    annealPathIsLegal,
  });
}(globalThis));
