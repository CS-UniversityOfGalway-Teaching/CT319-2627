(function initialiseKnapsack(global) {
  "use strict";

  // The five CT319 knapsack items, with the weights and values used in the
  // formal Heuristic Search lecture. The capacity is stated here so that every
  // fitness value on this page and in the Week 6 Wiki can be checked by hand.
  const ITEMS = Object.freeze([
    Object.freeze({ id: "A", weight: 12, value: 4 }),
    Object.freeze({ id: "B", weight: 2, value: 2 }),
    Object.freeze({ id: "C", weight: 1, value: 2 }),
    Object.freeze({ id: "D", weight: 1, value: 1 }),
    Object.freeze({ id: "E", weight: 4, value: 10 }),
  ]);

  const CAPACITY = 12;
  const GENOME_LENGTH = ITEMS.length;

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

  function assertGenome(bits) {
    if (typeof bits !== "string" || bits.length !== GENOME_LENGTH || /[^01]/.test(bits)) {
      throw new Error(`A candidate must be ${GENOME_LENGTH} characters of 0 and 1, not "${bits}".`);
    }
  }

  function selectedItems(bits) {
    assertGenome(bits);
    return ITEMS.filter((_, index) => bits[index] === "1");
  }

  function totalWeight(bits) {
    return selectedItems(bits).reduce((sum, item) => sum + item.weight, 0);
  }

  function totalValue(bits) {
    return selectedItems(bits).reduce((sum, item) => sum + item.value, 0);
  }

  function isFeasible(bits) {
    return totalWeight(bits) <= CAPACITY;
  }

  // Rejection by zero fitness: an over-capacity candidate stays in the population
  // but cannot be selected by a fitness-proportionate rule. Nothing is hidden —
  // the interface labels these candidates as over capacity.
  function fitness(bits) {
    return isFeasible(bits) ? totalValue(bits) : 0;
  }

  function describe(bits) {
    const weight = totalWeight(bits);
    const value = totalValue(bits);
    const feasible = weight <= CAPACITY;
    return {
      bits,
      items: selectedItems(bits).map((item) => item.id).join("") || "—",
      weight,
      value,
      feasible,
      fitness: feasible ? value : 0,
    };
  }

  function everyCandidate() {
    const total = 2 ** GENOME_LENGTH;
    const all = [];
    for (let n = 0; n < total; n += 1) {
      all.push(n.toString(2).padStart(GENOME_LENGTH, "0"));
    }
    return all;
  }

  // Exhaustive over 32 candidates: cheap, and it lets the lab state a fitness
  // threshold that is genuinely the optimum rather than a guess.
  function bestPossible() {
    return everyCandidate()
      .map(describe)
      .reduce((best, candidate) => (candidate.fitness > best.fitness ? candidate : best));
  }

  function hammingDistance(a, b) {
    assertGenome(a);
    assertGenome(b);
    let distance = 0;
    for (let i = 0; i < GENOME_LENGTH; i += 1) {
      if (a[i] !== b[i]) distance += 1;
    }
    return distance;
  }

  global.CT319Population = Object.assign(global.CT319Population || {}, {
    ITEMS,
    CAPACITY,
    GENOME_LENGTH,
    createRandom,
    selectedItems,
    totalWeight,
    totalValue,
    isFeasible,
    fitness,
    describe,
    everyCandidate,
    bestPossible,
    hammingDistance,
  });
}(globalThis));
