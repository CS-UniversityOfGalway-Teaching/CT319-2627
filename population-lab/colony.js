(function initialiseColony(global) {
  "use strict";

  const lab = global.CT319Population;
  if (!lab || !lab.createRandom) throw new Error("knapsack.js must be loaded before colony.js");

  // A small layered route graph. Every ant makes two probabilistic choices:
  // NEST -> A|B|C, then that node -> X|Y. The last hop into FOOD is forced.
  //
  // The costs give six routes with six distinct totals (5, 8, 13, 14, 15, 16).
  // NEST->C starts both the cheapest route (5, via Y) and one of the most
  // expensive (15, via X), so no single edge cost tells you what a route is
  // worth. Pheromone starts equal on every edge regardless of cost, and only
  // whole completed routes change it.
  const NODES = Object.freeze([
    Object.freeze({ id: "NEST", label: "Nest", x: 60, y: 190, layer: 0 }),
    Object.freeze({ id: "A", label: "A", x: 250, y: 70, layer: 1 }),
    Object.freeze({ id: "B", label: "B", x: 250, y: 190, layer: 1 }),
    Object.freeze({ id: "C", label: "C", x: 250, y: 310, layer: 1 }),
    Object.freeze({ id: "X", label: "X", x: 470, y: 120, layer: 2 }),
    Object.freeze({ id: "Y", label: "Y", x: 470, y: 260, layer: 2 }),
    Object.freeze({ id: "FOOD", label: "Food", x: 660, y: 190, layer: 3 }),
  ]);

  // labelT places an edge's label along the edge. The six middle edges share a
  // narrow band of the canvas, so they are pulled back from the midpoint to stop
  // their labels overlapping.
  const EDGES = Object.freeze([
    Object.freeze({ from: "NEST", to: "A", cost: 3 }),
    Object.freeze({ from: "NEST", to: "B", cost: 3 }),
    Object.freeze({ from: "NEST", to: "C", cost: 2 }),
    Object.freeze({ from: "A", to: "X", cost: 9, labelT: 0.32 }),
    Object.freeze({ from: "A", to: "Y", cost: 3, labelT: 0.32 }),
    Object.freeze({ from: "B", to: "X", cost: 6, labelT: 0.32 }),
    Object.freeze({ from: "B", to: "Y", cost: 9, labelT: 0.32 }),
    Object.freeze({ from: "C", to: "X", cost: 9, labelT: 0.32 }),
    Object.freeze({ from: "C", to: "Y", cost: 1, labelT: 0.32 }),
    Object.freeze({ from: "X", to: "FOOD", cost: 4 }),
    Object.freeze({ from: "Y", to: "FOOD", cost: 2 }),
  ]);

  const ACO_DEFAULTS = Object.freeze({
    seed: 21,
    ants: 6,
    initialPheromone: 1,
    evaporation: 0.3,
    deposit: 1,
    alpha: 1,
    beta: 1,
    roundLimit: 40,
  });

  const edgeKey = (from, to) => `${from}->${to}`;

  function edgesFrom(node) {
    return EDGES.filter((edge) => edge.from === node);
  }

  function allRoutes() {
    const routes = [];
    edgesFrom("NEST").forEach((first) => {
      edgesFrom(first.to).forEach((second) => {
        const third = edgesFrom(second.to)[0];
        routes.push({
          nodes: ["NEST", first.to, second.to, "FOOD"],
          label: `NEST → ${first.to} → ${second.to} → FOOD`,
          cost: first.cost + second.cost + third.cost,
        });
      });
    });
    return routes;
  }

  const ROUTES = Object.freeze(allRoutes().map(Object.freeze));

  function bestRoute() {
    return ROUTES.reduce((best, route) => (route.cost < best.cost ? route : best));
  }

  // Probability of taking an edge is proportional to (pheromone^alpha) x
  // (1/cost)^beta. Pheromone and cost are separate inputs: an edge is never
  // chosen just because it currently holds the most pheromone.
  function edgeWeights(session, node) {
    return edgesFrom(node).map((edge) => {
      const pheromone = session.pheromone.get(edgeKey(edge.from, edge.to));
      const attractiveness = pheromone ** session.options.alpha * (1 / edge.cost) ** session.options.beta;
      return { edge, pheromone, attractiveness };
    });
  }

  function choiceProbabilities(session, node) {
    const weights = edgeWeights(session, node);
    const total = weights.reduce((sum, entry) => sum + entry.attractiveness, 0);
    return weights.map((entry) => ({ ...entry, probability: total === 0 ? 1 / weights.length : entry.attractiveness / total }));
  }

  function chooseNext(session, node) {
    const options = choiceProbabilities(session, node);
    let ticket = session.random();
    for (const option of options) {
      ticket -= option.probability;
      if (ticket < 0) return option.edge;
    }
    return options[options.length - 1].edge;
  }

  function walkOneAnt(session) {
    const nodes = ["NEST"];
    const edges = [];
    let current = "NEST";
    let cost = 0;

    while (current !== "FOOD") {
      const available = edgesFrom(current);
      const edge = available.length === 1 ? available[0] : chooseNext(session, current);
      edges.push(edge);
      cost += edge.cost;
      current = edge.to;
      nodes.push(current);
    }

    return { nodes, edges, cost, label: `NEST → ${nodes[1]} → ${nodes[2]} → FOOD` };
  }

  function createColonySession(settings = {}) {
    const options = { ...ACO_DEFAULTS, ...settings };
    const pheromone = new Map();
    EDGES.forEach((edge) => pheromone.set(edgeKey(edge.from, edge.to), options.initialPheromone));

    return {
      options,
      random: lab.createRandom(options.seed),
      pheromone,
      round: 0,
      tours: [],
      lastDeposits: new Map(),
      bestTour: null,
      history: [],
      optimum: bestRoute(),
      status: lab.RUNNING,
      stopReason: null,
    };
  }

  function stepRound(session) {
    if (session.status !== lab.RUNNING) return session;

    const { options } = session;
    const tours = [];
    for (let i = 0; i < options.ants; i += 1) tours.push(walkOneAnt(session));

    // Evaporate every edge first, then reinforce the edges the ants actually used.
    EDGES.forEach((edge) => {
      const key = edgeKey(edge.from, edge.to);
      session.pheromone.set(key, session.pheromone.get(key) * (1 - options.evaporation));
    });

    const deposits = new Map();
    tours.forEach((tour) => {
      const amount = options.deposit / tour.cost;
      tour.edges.forEach((edge) => {
        const key = edgeKey(edge.from, edge.to);
        deposits.set(key, (deposits.get(key) || 0) + amount);
        session.pheromone.set(key, session.pheromone.get(key) + amount);
      });
    });

    session.round += 1;
    session.tours = tours;
    session.lastDeposits = deposits;

    const roundBest = tours.reduce((best, tour) => (tour.cost < best.cost ? tour : best));
    if (session.bestTour === null || roundBest.cost < session.bestTour.cost) {
      session.bestTour = { label: roundBest.label, cost: roundBest.cost, round: session.round };
    }

    session.history.push({
      round: session.round,
      bestCost: session.bestTour.cost,
      averageCost: tours.reduce((sum, tour) => sum + tour.cost, 0) / tours.length,
    });

    if (session.round >= options.roundLimit) {
      session.status = lab.STOPPED;
      session.stopReason = `ROUND LIMIT · ${options.roundLimit}`;
    }

    return session;
  }

  function routeProbability(session, route) {
    const first = choiceProbabilities(session, "NEST").find((option) => option.edge.to === route.nodes[1]);
    const second = choiceProbabilities(session, route.nodes[1]).find((option) => option.edge.to === route.nodes[2]);
    return first.probability * second.probability;
  }

  function totalPheromone(session) {
    return [...session.pheromone.values()].reduce((sum, value) => sum + value, 0);
  }

  global.CT319Population = Object.assign(lab, {
    NODES,
    EDGES,
    ROUTES,
    ACO_DEFAULTS,
    edgeKey,
    edgesFrom,
    bestRoute,
    choiceProbabilities,
    walkOneAnt,
    createColonySession,
    stepRound,
    routeProbability,
    totalPheromone,
  });
}(globalThis));
