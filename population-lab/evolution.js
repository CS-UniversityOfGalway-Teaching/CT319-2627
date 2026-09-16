(function initialiseEvolution(global) {
  "use strict";

  const lab = global.CT319Population;
  if (!lab || !lab.fitness) throw new Error("knapsack.js must be loaded before evolution.js");

  const RUNNING = "running";
  const STOPPED = "stopped";

  const GA_DEFAULTS = Object.freeze({
    seed: 39,
    populationSize: 8,
    mutationRate: 0.06,
    elitism: 1,
    generationLimit: 60,
    patience: 12,
  });

  function randomGenome(random) {
    let bits = "";
    for (let i = 0; i < lab.GENOME_LENGTH; i += 1) bits += random() < 0.5 ? "1" : "0";
    return bits;
  }

  // Roulette wheel over fitness. If every candidate is over capacity the wheel
  // has no width, so we fall back to a uniform draw rather than dividing by zero.
  function rouletteSelect(population, random) {
    const scores = population.map((bits) => lab.fitness(bits));
    const total = scores.reduce((sum, score) => sum + score, 0);
    if (total === 0) return population[Math.floor(random() * population.length)];

    let ticket = random() * total;
    for (let i = 0; i < population.length; i += 1) {
      ticket -= scores[i];
      if (ticket < 0) return population[i];
    }
    return population[population.length - 1];
  }

  function onePointCrossover(parentOne, parentTwo, random) {
    // A point of 1..length-1 always exchanges at least one bit, so a child is
    // genuinely built from both parents.
    const point = 1 + Math.floor(random() * (lab.GENOME_LENGTH - 1));
    return {
      point,
      childOne: parentOne.slice(0, point) + parentTwo.slice(point),
      childTwo: parentTwo.slice(0, point) + parentOne.slice(point),
    };
  }

  function mutate(bits, rate, random) {
    let mutated = "";
    const flipped = [];
    for (let i = 0; i < bits.length; i += 1) {
      if (random() < rate) {
        mutated += bits[i] === "1" ? "0" : "1";
        flipped.push(i);
      } else {
        mutated += bits[i];
      }
    }
    return { bits: mutated, flipped };
  }

  function distinctCount(population) {
    return new Set(population).size;
  }

  // Mean over every unordered pair of the number of bit positions in which the
  // two candidates differ. 0 means the population is identical.
  function meanPairwiseHamming(population) {
    if (population.length < 2) return 0;
    let total = 0;
    let pairs = 0;
    for (let i = 0; i < population.length; i += 1) {
      for (let j = i + 1; j < population.length; j += 1) {
        total += lab.hammingDistance(population[i], population[j]);
        pairs += 1;
      }
    }
    return total / pairs;
  }

  function measure(population) {
    const scores = population.map((bits) => lab.fitness(bits));
    return {
      best: Math.max(...scores),
      average: scores.reduce((sum, score) => sum + score, 0) / scores.length,
      distinct: distinctCount(population),
      hamming: meanPairwiseHamming(population),
      infeasible: population.filter((bits) => !lab.isFeasible(bits)).length,
    };
  }

  function bestOf(population) {
    return population.reduce((best, bits) => (lab.fitness(bits) > lab.fitness(best) ? bits : best));
  }

  function createEvolutionSession(settings = {}) {
    const options = { ...GA_DEFAULTS, ...settings };
    const random = lab.createRandom(options.seed);
    const optimum = lab.bestPossible();

    const population = [];
    for (let i = 0; i < options.populationSize; i += 1) population.push(randomGenome(random));

    const metrics = measure(population);
    return {
      options,
      random,
      optimum,
      generation: 0,
      population,
      initialPopulation: [...population],
      metrics,
      history: [{ generation: 0, best: metrics.best, average: metrics.average, hamming: metrics.hamming, distinct: metrics.distinct }],
      bestEver: bestOf(population),
      generationsWithoutImprovement: 0,
      lastEvents: [],
      status: RUNNING,
      stopReason: null,
    };
  }

  function stepGeneration(session) {
    if (session.status !== RUNNING) return session;

    const { random, options } = session;
    const previousBest = session.metrics.best;
    const events = [];
    const nextPopulation = [];

    // Elitism: the single best candidate survives untouched, so the best-fitness
    // trace can never fall and the class can read it as progress.
    const ranked = [...session.population].sort((a, b) => lab.fitness(b) - lab.fitness(a));
    for (let i = 0; i < options.elitism; i += 1) nextPopulation.push(ranked[i]);

    while (nextPopulation.length < options.populationSize) {
      const parentOne = rouletteSelect(session.population, random);
      const parentTwo = rouletteSelect(session.population, random);
      const { point, childOne, childTwo } = onePointCrossover(parentOne, parentTwo, random);

      const mutatedOne = mutate(childOne, options.mutationRate, random);
      const mutatedTwo = mutate(childTwo, options.mutationRate, random);

      events.push({
        parentOne,
        parentTwo,
        point,
        childOne,
        childTwo,
        mutatedOne: mutatedOne.bits,
        mutatedTwo: mutatedTwo.bits,
        flippedOne: mutatedOne.flipped,
        flippedTwo: mutatedTwo.flipped,
      });

      nextPopulation.push(mutatedOne.bits);
      if (nextPopulation.length < options.populationSize) nextPopulation.push(mutatedTwo.bits);
    }

    session.population = nextPopulation;
    session.generation += 1;
    session.metrics = measure(nextPopulation);
    session.lastEvents = events;
    session.history.push({
      generation: session.generation,
      best: session.metrics.best,
      average: session.metrics.average,
      hamming: session.metrics.hamming,
      distinct: session.metrics.distinct,
    });

    if (lab.fitness(bestOf(nextPopulation)) > lab.fitness(session.bestEver)) {
      session.bestEver = bestOf(nextPopulation);
    }

    session.generationsWithoutImprovement = session.metrics.best > previousBest
      ? 0
      : session.generationsWithoutImprovement + 1;

    // The three stopping conditions named in the formal CT319 notes.
    if (session.metrics.best >= session.optimum.fitness) {
      session.status = STOPPED;
      session.stopReason = `FITNESS THRESHOLD · reached ${session.optimum.fitness}`;
    } else if (session.generationsWithoutImprovement >= options.patience) {
      session.status = STOPPED;
      session.stopReason = `NO IMPROVEMENT · ${options.patience} generations`;
    } else if (session.generation >= options.generationLimit) {
      session.status = STOPPED;
      session.stopReason = `GENERATION LIMIT · ${options.generationLimit}`;
    }

    return session;
  }

  function runEvolution(settings = {}) {
    const session = createEvolutionSession(settings);
    while (session.status === RUNNING) stepGeneration(session);
    return session;
  }

  global.CT319Population = Object.assign(lab, {
    RUNNING,
    STOPPED,
    GA_DEFAULTS,
    randomGenome,
    rouletteSelect,
    onePointCrossover,
    mutate,
    distinctCount,
    meanPairwiseHamming,
    measure,
    bestOf,
    createEvolutionSession,
    stepGeneration,
    runEvolution,
  });
}(globalThis));
