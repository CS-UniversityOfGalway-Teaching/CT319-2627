"use strict";

const assert = require("node:assert/strict");

require("./knapsack.js");
require("./evolution.js");
require("./colony.js");

const lab = globalThis.CT319Population;

// --- 1. Representation matches the Wiki -------------------------------------

assert.equal(lab.GENOME_LENGTH, 5);
assert.deepEqual(lab.ITEMS.map((item) => item.id), ["A", "B", "C", "D", "E"]);
assert.deepEqual(lab.ITEMS.map((item) => item.weight), [12, 2, 1, 1, 4]);
assert.deepEqual(lab.ITEMS.map((item) => item.value), [4, 2, 2, 1, 10]);
assert.equal(lab.CAPACITY, 12);

// --- 2 & 3. Fitness and feasibility are consistent --------------------------

assert.equal(lab.totalWeight("01111"), 8);
assert.equal(lab.totalValue("01111"), 15);
assert.equal(lab.fitness("01111"), 15);
assert.equal(lab.totalWeight("01101"), 7);
assert.equal(lab.fitness("01101"), 14);
assert.equal(lab.totalWeight("00101"), 5);
assert.equal(lab.fitness("00101"), 12);
assert.equal(lab.totalWeight("10101"), 17);
assert.equal(lab.isFeasible("10101"), false);
assert.equal(lab.fitness("10101"), 0, "An over-capacity candidate is rejected with zero fitness.");
assert.equal(lab.fitness("10000"), 4, "Item A alone is exactly at the capacity.");
assert.equal(lab.fitness("00000"), 0);

lab.everyCandidate().forEach((bits) => {
  const candidate = lab.describe(bits);
  assert.equal(candidate.feasible, candidate.weight <= lab.CAPACITY);
  assert.equal(candidate.fitness, candidate.feasible ? candidate.value : 0);
});

const optimum = lab.bestPossible();
assert.equal(optimum.bits, "01111");
assert.equal(optimum.fitness, 15);
assert.equal(lab.everyCandidate().filter((bits) => lab.fitness(bits) === 15).length, 1, "The optimum is unique.");

// The example worked through in the Week 6 Wiki must hold exactly.
const crossed = lab.onePointCrossover("01101", "00111", () => 0.5);
assert.equal(crossed.point, 3);
assert.equal(crossed.childOne, "01111");
assert.equal(crossed.childTwo, "00101");
assert.equal(lab.fitness(crossed.childOne), 15);
assert.equal(lab.fitness(crossed.childTwo), 12);
assert.equal(lab.fitness("10101"), 0, "Mutating bit A of 00101 breaks the capacity constraint.");

// --- 4. Selection favours fitter candidates ---------------------------------

{
  const population = ["01111", "01101", "00110", "10101"]; // 15, 14, 3, 0
  const random = lab.createRandom(5);
  const counts = new Map();
  for (let i = 0; i < 20000; i += 1) {
    const picked = lab.rouletteSelect(population, random);
    counts.set(picked, (counts.get(picked) || 0) + 1);
  }
  assert.ok(counts.get("01111") > counts.get("01101"), "Fitness 15 should be picked more often than 14.");
  assert.ok(counts.get("01101") > counts.get("00110"), "Fitness 14 should be picked more often than 3.");
  assert.equal(counts.get("10101"), undefined, "A zero-fitness candidate has no slice of the wheel.");
  // Probabilistic, not deterministic: the fittest does not win every draw.
  assert.ok(counts.get("01111") < 20000);
}

assert.equal(
  lab.rouletteSelect(["10101", "11111"], lab.createRandom(2)).length,
  5,
  "An all-infeasible population must still return a candidate rather than dividing by zero.",
);

// --- 5. Crossover genuinely combines two parents ----------------------------

for (let seed = 1; seed <= 200; seed += 1) {
  const random = lab.createRandom(seed);
  const { point, childOne, childTwo } = lab.onePointCrossover("11111", "00000", random);
  assert.ok(point >= 1 && point <= 4, "The point must exchange at least one bit.");
  assert.equal(childOne, "1".repeat(point) + "0".repeat(5 - point));
  assert.equal(childTwo, "0".repeat(point) + "1".repeat(5 - point));
  assert.notEqual(childOne, "11111");
  assert.notEqual(childOne, "00000");
}

// --- 6 & 7. Mutation rate changes mutation frequency; zero is supported -----

function flipRate(rate, seed) {
  const random = lab.createRandom(seed);
  let flips = 0;
  for (let i = 0; i < 4000; i += 1) flips += lab.mutate("00000", rate, random).flipped.length;
  return flips / (4000 * 5);
}

assert.equal(flipRate(0, 3), 0, "A mutation rate of 0 must never flip a bit.");
assert.ok(Math.abs(flipRate(0.06, 3) - 0.06) < 0.01);
assert.ok(Math.abs(flipRate(0.3, 3) - 0.3) < 0.02);
assert.ok(flipRate(0.3, 3) > flipRate(0.06, 3));

// --- 8. Reset restores the initial population -------------------------------

{
  const first = lab.createEvolutionSession();
  const before = [...first.population];
  lab.stepGeneration(first);
  lab.stepGeneration(first);
  const fresh = lab.createEvolutionSession();
  assert.deepEqual(fresh.population, before, "The same seed must rebuild the same generation 0.");
  assert.equal(fresh.generation, 0);
  assert.deepEqual(first.initialPopulation, before, "The initial population is kept for comparison.");
}

// --- 9, 10, 11, 12. Metrics are accurate ------------------------------------

{
  const population = ["01111", "01101", "00110", "10101", "00000", "01111", "00101", "11111"];
  const metrics = lab.measure(population);
  const scores = population.map((bits) => lab.fitness(bits)); // 15,14,3,0,0,15,12,0
  assert.deepEqual(scores, [15, 14, 3, 0, 0, 15, 12, 0]);
  assert.equal(metrics.best, 15);
  assert.equal(metrics.average, 59 / 8);
  assert.equal(metrics.distinct, 7, "Two copies of 01111 count once.");
  assert.equal(metrics.infeasible, 2);

  let expected = 0;
  let pairs = 0;
  for (let i = 0; i < population.length; i += 1) {
    for (let j = i + 1; j < population.length; j += 1) {
      expected += lab.hammingDistance(population[i], population[j]);
      pairs += 1;
    }
  }
  assert.equal(pairs, 28);
  assert.equal(metrics.hamming, expected / 28);
}

assert.equal(lab.hammingDistance("01101", "01111"), 1, "The trap and the optimum are one bit apart.");
assert.equal(lab.meanPairwiseHamming(["10110", "10110", "10110"]), 0, "An identical population has zero diversity.");
assert.equal(lab.distinctCount(["10110", "10110", "10110"]), 1);

// --- 13. Premature convergence is demonstrable, not faked -------------------

const runA = lab.runEvolution({ mutationRate: 0 });
const runB = lab.runEvolution({ mutationRate: 0.06 });

assert.deepEqual(runA.initialPopulation, runB.initialPopulation, "Both runs start from the same population.");
assert.equal(runA.metrics.best, 14, "With no mutation the default seed converges one short of the optimum.");
assert.equal(runA.metrics.distinct, 1, "The population collapses to a single candidate.");
assert.equal(runA.metrics.hamming, 0);
assert.equal(new Set(runA.population).values().next().value, "01101");
assert.ok(runA.stopReason.startsWith("NO IMPROVEMENT"));

assert.equal(runB.metrics.best, 15, "A small mutation rate reaches the optimum from the same start.");
assert.ok(runB.metrics.distinct > 1);
assert.ok(runB.stopReason.startsWith("FITNESS THRESHOLD"));
assert.ok(runB.generation < runA.generation);

// Best fitness never falls, because the best candidate is carried over.
[runA, runB].forEach((run) => {
  run.history.slice(1).forEach((point, index) => {
    assert.ok(point.best >= run.history[index].best, "Elitism must keep the best-fitness trace monotonic.");
  });
});

// The effect is a property of the algorithm, not of one lucky seed.
{
  let collapsed = 0;
  let rescued = 0;
  for (let seed = 1; seed <= 120; seed += 1) {
    if (lab.runEvolution({ seed, mutationRate: 0 }).metrics.best < 15) collapsed += 1;
    if (lab.runEvolution({ seed, mutationRate: 0.06 }).metrics.best === 15) rescued += 1;
  }
  assert.ok(collapsed > 60, `Zero mutation should usually fall short; got ${collapsed}/120.`);
  assert.ok(rescued > 100, `A small mutation rate should usually reach 15; got ${rescued}/120.`);
}

// --- 14. Route costs are consistent -----------------------------------------

{
  const costs = lab.ROUTES.map((route) => route.cost).sort((a, b) => a - b);
  assert.equal(lab.ROUTES.length, 6);
  assert.deepEqual(costs, [5, 8, 13, 14, 15, 16]);
  assert.equal(new Set(costs).size, 6, "Six routes with six distinct totals.");
  assert.equal(lab.bestRoute().cost, 5);
  assert.deepEqual(lab.bestRoute().nodes, ["NEST", "C", "Y", "FOOD"]);

  lab.ROUTES.forEach((route) => {
    const legs = [
      lab.EDGES.find((e) => e.from === route.nodes[0] && e.to === route.nodes[1]),
      lab.EDGES.find((e) => e.from === route.nodes[1] && e.to === route.nodes[2]),
      lab.EDGES.find((e) => e.from === route.nodes[2] && e.to === route.nodes[3]),
    ];
    assert.equal(route.cost, legs.reduce((sum, leg) => sum + leg.cost, 0), "Route cost is the sum of its edges.");
  });

  // The cheapest first edge does not by itself identify a good route.
  const viaC = lab.ROUTES.filter((route) => route.nodes[1] === "C").map((route) => route.cost).sort((a, b) => a - b);
  assert.deepEqual(viaC, [5, 15], "NEST->C starts both the best and one of the worst routes.");
}

// --- 15. Pheromone is stored separately from route cost ---------------------

{
  const session = lab.createColonySession();
  lab.EDGES.forEach((edge) => {
    assert.equal(session.pheromone.get(lab.edgeKey(edge.from, edge.to)), session.options.initialPheromone);
  });
  assert.equal(new Set([...session.pheromone.values()]).size, 1, "Every edge starts equal, whatever it costs.");
  assert.ok(lab.EDGES.some((edge) => edge.cost !== lab.EDGES[0].cost), "Edge costs differ while pheromone does not.");
  assert.equal(Object.prototype.hasOwnProperty.call(lab.EDGES[0], "pheromone"), false);
}

// --- 16 & 17. Reinforcement and evaporation both work -----------------------

{
  // Reinforcement only: with no evaporation, used edges gain and unused edges hold.
  const session = lab.createColonySession({ evaporation: 0 });
  const before = new Map(session.pheromone);
  lab.stepRound(session);
  const used = new Set();
  session.tours.forEach((tour) => tour.edges.forEach((edge) => used.add(lab.edgeKey(edge.from, edge.to))));
  assert.ok(used.size > 0);
  lab.EDGES.forEach((edge) => {
    const key = lab.edgeKey(edge.from, edge.to);
    const delta = session.pheromone.get(key) - before.get(key);
    if (used.has(key)) assert.ok(delta > 0, `${key} was used and must gain pheromone.`);
    else assert.equal(delta, 0, `${key} was unused and must be unchanged when nothing evaporates.`);
  });
}

{
  // Evaporation only: with the deposit switched off, every edge decays by the rate.
  const session = lab.createColonySession({ evaporation: 0.25, deposit: 0 });
  lab.stepRound(session);
  lab.EDGES.forEach((edge) => {
    const value = session.pheromone.get(lab.edgeKey(edge.from, edge.to));
    assert.ok(Math.abs(value - 0.75) < 1e-12, "Every edge must lose exactly the evaporation share.");
  });
}

{
  // Reinforcement is proportional to route quality: the cheaper route deposits more.
  const cheap = lab.createColonySession();
  const dear = lab.createColonySession();
  assert.equal(cheap.options.deposit / 5, 0.2);
  assert.ok(cheap.options.deposit / 5 > dear.options.deposit / 16);
}

// --- 18. Route choice stays probabilistic -----------------------------------

{
  const session = lab.createColonySession();
  // Load one edge heavily, then confirm the others still have a real chance.
  session.pheromone.set(lab.edgeKey("NEST", "A"), 40);
  const options = lab.choiceProbabilities(session, "NEST");
  const total = options.reduce((sum, option) => sum + option.probability, 0);
  assert.ok(Math.abs(total - 1) < 1e-12, "Probabilities must sum to 1.");
  options.forEach((option) => assert.ok(option.probability > 0, `${option.edge.to} must keep a non-zero chance.`));

  const strongest = options.reduce((best, o) => (o.pheromone > best.pheromone ? o : best));
  assert.equal(strongest.edge.to, "A");

  const random = lab.createRandom(11);
  const walker = { ...session, random };
  const picked = new Set();
  for (let i = 0; i < 400; i += 1) picked.add(lab.walkOneAnt(walker).nodes[1]);
  assert.ok(picked.size > 1, "Ants must not deterministically take the strongest edge.");

  // Cost matters too: with equal pheromone, the cheaper edge is likelier.
  const even = lab.createColonySession();
  const first = lab.choiceProbabilities(even, "C");
  const cheapOption = first.find((o) => o.edge.to === "Y"); // cost 1
  const dearOption = first.find((o) => o.edge.to === "X"); // cost 9
  assert.equal(cheapOption.pheromone, dearOption.pheromone);
  assert.ok(cheapOption.probability > dearOption.probability, "1/cost must influence the choice.");
}

// --- 19. Reset restores initial pheromone -----------------------------------

{
  const session = lab.createColonySession();
  for (let i = 0; i < 8; i += 1) lab.stepRound(session);
  assert.ok(lab.totalPheromone(session) !== lab.EDGES.length * session.options.initialPheromone);
  const fresh = lab.createColonySession();
  assert.equal(fresh.round, 0);
  assert.equal(fresh.bestTour, null);
  assert.equal(lab.totalPheromone(fresh), lab.EDGES.length * fresh.options.initialPheromone);
}

// The colony finds the shortest route, and does so across seeds.
{
  let found = 0;
  for (let seed = 1; seed <= 25; seed += 1) {
    const session = lab.createColonySession({ seed });
    for (let round = 0; round < 25; round += 1) lab.stepRound(session);
    if (session.bestTour.cost === 5) found += 1;
    assert.ok(session.bestTour.cost >= 5, "No route can beat the graph optimum.");
  }
  assert.equal(found, 25, "Every seed should discover the cost-5 route within 25 rounds.");
}

// Evaporation sharpens the shared signal: without it, old information lingers.
{
  const best = lab.bestRoute();
  const concentration = (rho) => {
    let total = 0;
    for (let seed = 1; seed <= 10; seed += 1) {
      const session = lab.createColonySession({ seed, evaporation: rho, roundLimit: 200 });
      for (let round = 0; round < 30; round += 1) lab.stepRound(session);
      total += lab.routeProbability(session, best);
    }
    return total / 10;
  };
  const withoutEvaporation = concentration(0);
  const withEvaporation = concentration(0.3);
  assert.ok(withEvaporation > withoutEvaporation + 0.1, "Evaporation should concentrate the signal faster.");
  assert.ok(withoutEvaporation < 0.95, "With nothing forgotten the colony stays undecided for longer.");
}

// --- 20. No later-week material has leaked in -------------------------------

{
  const fs = require("node:fs");
  const forbidden = /grey\s*wolf|firefly|bat algorithm|cuckoo|frog leaping|flower pollination|multi-?objective|particle swarm/i;
  ["knapsack.js", "evolution.js", "colony.js", "app.js", "index.html", "styles.css"].forEach((file) => {
    const source = fs.readFileSync(`${__dirname}/${file}`, "utf8");
    assert.equal(forbidden.test(source), false, `${file} should not mention later-week or CA1 material.`);
  });
}

console.log("CT319 Population Lab checks passed.");
console.log(`Knapsack: ${lab.ITEMS.length} items, capacity ${lab.CAPACITY}, optimum ${optimum.bits} = ${optimum.fitness}.`);
console.log(`Run A (mutation 0):    best ${runA.metrics.best}, ${runA.generation} generations, ${runA.metrics.distinct} distinct, Hamming ${runA.metrics.hamming.toFixed(2)} — ${runA.stopReason}.`);
console.log(`Run B (mutation 0.06): best ${runB.metrics.best}, ${runB.generation} generations, ${runB.metrics.distinct} distinct, Hamming ${runB.metrics.hamming.toFixed(2)} — ${runB.stopReason}.`);
console.log(`Colony: ${lab.ROUTES.length} routes, costs ${lab.ROUTES.map((r) => r.cost).sort((a, b) => a - b).join(", ")}; shortest is ${lab.bestRoute().label}.`);
