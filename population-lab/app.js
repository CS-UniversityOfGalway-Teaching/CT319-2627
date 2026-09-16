(function initialiseInterface(global, document) {
  "use strict";

  const lab = global.CT319Population;
  if (!lab || !lab.createEvolutionSession || !lab.createColonySession) {
    throw new Error("Population Lab scripts were loaded in the wrong order.");
  }

  const stage = document.querySelector("#stage");
  const viewButtons = [...document.querySelectorAll("[data-view]")];
  const mutationControl = document.querySelector("#mutation-control");
  const mutationOutput = document.querySelector("#mutation-output");
  const mutationField = document.querySelector("#mutation-field");
  const evaporationControl = document.querySelector("#evaporation-control");
  const evaporationOutput = document.querySelector("#evaporation-output");
  const evaporationField = document.querySelector("#evaporation-field");
  const seedControl = document.querySelector("#seed-control");
  const speedControl = document.querySelector("#speed-control");
  const speedOutput = document.querySelector("#speed-output");
  const stepButton = document.querySelector("#step-button");
  const runButton = document.querySelector("#run-button");
  const pauseButton = document.querySelector("#pause-button");
  const resetButton = document.querySelector("#reset-button");
  const runStatus = document.querySelector("#run-status");
  const viewTitle = document.querySelector("#view-title");
  const viewExplanation = document.querySelector("#view-explanation");
  const legendText = document.querySelector("#legend-text");

  const EVOLUTION_LEGEND = "Each row is one candidate solution. The wheel share is that candidate's slice of the fitness-proportionate selection wheel, so a candidate over the capacity has no slice at all. Distinct candidates is a rough classroom proxy for diversity; mean pairwise Hamming distance is the average number of bit positions in which two members of the population differ, and reaches 0 only when every candidate is identical.";
  const COLONY_LEGEND = "Edge thickness shows the artificial pheromone on that edge, not its cost — the two are stored separately and printed separately. Every round, all pheromone evaporates first and then each ant reinforces the edges of the route it actually completed. Route probability is recomputed from pheromone and 1/cost, so an ant never simply takes the strongest edge.";

  let view = "EVOLUTION";
  let evolution = null;
  let colony = null;
  let timer = null;

  const format = (value, places = 2) => Number(value).toFixed(places);
  const percent = (value) => `${(value * 100).toFixed(1)}%`;

  function currentSeed() {
    const parsed = Number(seedControl.value);
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1;
  }

  function makeSessions() {
    if (view === "EVOLUTION") {
      evolution = lab.createEvolutionSession({
        seed: currentSeed(),
        mutationRate: Number(mutationControl.value),
      });
    } else {
      colony = lab.createColonySession({
        seed: currentSeed(),
        evaporation: Number(evaporationControl.value),
      });
    }
  }

  const session = () => (view === "EVOLUTION" ? evolution : colony);
  const isFinished = () => session().status !== lab.RUNNING;

  // ---------------------------------------------------------------- evolution

  function genomeMarkup(bits, highlight = []) {
    return [...bits]
      .map((bit, index) => {
        const classes = ["bit", bit === "1" ? "is-on" : "is-off"];
        if (highlight.includes(index)) classes.push("is-changed");
        return `<span class="${classes.join(" ")}">${bit}</span>`;
      })
      .join("");
  }

  function renderProblem() {
    const rows = lab.ITEMS.map((item) => `
      <tr><th scope="row">${item.id}</th><td>${item.weight}</td><td>${item.value}</td></tr>`).join("");
    return `
      <div class="state-group">
        <div class="state-group__heading"><h4>The problem</h4><span>capacity ${lab.CAPACITY}</span></div>
        <table class="mini-table">
          <thead><tr><th scope="col">Item</th><th scope="col">Weight</th><th scope="col">Value</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <p class="note">A candidate over the capacity keeps a fitness of <code>0</code>, so it stays visible but cannot be selected.</p>
      </div>`;
  }

  function renderPopulation(current) {
    const scores = current.population.map((bits) => lab.fitness(bits));
    const total = scores.reduce((sum, score) => sum + score, 0);
    const eliteIndex = scores.indexOf(Math.max(...scores));

    const rows = current.population.map((bits, index) => {
      const candidate = lab.describe(bits);
      const share = total === 0 ? 1 / current.population.length : candidate.fitness / total;
      const classes = [];
      if (!candidate.feasible) classes.push("is-infeasible");
      if (index === eliteIndex) classes.push("is-elite");
      return `
        <tr class="${classes.join(" ")}">
          <td class="genome">${genomeMarkup(bits)}</td>
          <td>${candidate.items}</td>
          <td class="numeric">${candidate.weight}</td>
          <td class="numeric">${candidate.value}</td>
          <td class="numeric"><strong>${candidate.fitness}</strong></td>
          <td class="numeric">
            <span class="wheel"><span class="wheel__fill" style="width: ${(share * 100).toFixed(1)}%"></span></span>
            ${percent(share)}
          </td>
        </tr>`;
    }).join("");

    return `
      <table class="population-table">
        <caption class="visually-hidden">Population at generation ${current.generation}</caption>
        <thead>
          <tr>
            <th scope="col">Candidate</th><th scope="col">Items</th>
            <th scope="col" class="numeric">Weight</th><th scope="col" class="numeric">Value</th>
            <th scope="col" class="numeric">Fitness</th><th scope="col" class="numeric">Wheel share</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;
  }

  function renderEvents(current) {
    if (current.lastEvents.length === 0) {
      return '<li class="empty-state">Step once to select parents and build the next generation.</li>';
    }
    return current.lastEvents.map((event) => {
      const point = event.point;
      const split = (bits) => `${bits.slice(0, point)}<span class="cut">|</span>${bits.slice(point)}`;
      const mutationNote = (before, after, flipped) => (flipped.length === 0
        ? '<span class="quiet">no mutation</span>'
        : `<span class="mutated">bit ${flipped.map((i) => lab.ITEMS[i].id).join(", ")} flipped → ${genomeMarkup(after, flipped)}</span>`);
      return `
        <li class="event">
          <div class="event__row"><span class="event__label">parents</span><code>${split(event.parentOne)}</code><code>${split(event.parentTwo)}</code></div>
          <div class="event__row"><span class="event__label">point ${point}</span><code>${genomeMarkup(event.childOne)}</code><code>${genomeMarkup(event.childTwo)}</code></div>
          <div class="event__row"><span class="event__label">mutation</span>${mutationNote(event.childOne, event.mutatedOne, event.flippedOne)}${mutationNote(event.childTwo, event.mutatedTwo, event.flippedTwo)}</div>
        </li>`;
    }).join("");
  }

  // Two series on one frame: fitness on the left axis, mean pairwise Hamming on
  // the right. Reading them together is the point of the whole experiment.
  function renderHistoryChart(current) {
    const history = current.history;
    const width = 560;
    const height = 190;
    const pad = { left: 34, right: 34, top: 14, bottom: 24 };
    const innerWidth = width - pad.left - pad.right;
    const innerHeight = height - pad.top - pad.bottom;
    const maxGeneration = Math.max(8, history.length - 1);
    const maxFitness = current.optimum.fitness;
    const maxHamming = lab.GENOME_LENGTH;

    const x = (generation) => pad.left + (generation / maxGeneration) * innerWidth;
    const yFitness = (value) => pad.top + innerHeight - (value / maxFitness) * innerHeight;
    const yHamming = (value) => pad.top + innerHeight - (value / maxHamming) * innerHeight;

    const line = (accessor, scale) => history
      .map((point, index) => `${index === 0 ? "M" : "L"}${format(x(point.generation), 1)},${format(scale(accessor(point)), 1)}`)
      .join(" ");

    return `
      <figure class="chart">
        <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Best fitness, average fitness and mean pairwise Hamming distance across generations">
          <line x1="${pad.left}" y1="${pad.top + innerHeight}" x2="${pad.left + innerWidth}" y2="${pad.top + innerHeight}" class="axis"/>
          <line x1="${pad.left}" y1="${pad.top}" x2="${pad.left}" y2="${pad.top + innerHeight}" class="axis"/>
          <line x1="${pad.left}" y1="${format(yFitness(maxFitness), 1)}" x2="${pad.left + innerWidth}" y2="${format(yFitness(maxFitness), 1)}" class="axis axis--target"/>
          <path d="${line((p) => p.best, yFitness)}" class="series series--best"/>
          <path d="${line((p) => p.average, yFitness)}" class="series series--average"/>
          <path d="${line((p) => p.hamming, yHamming)}" class="series series--hamming"/>
          <text x="${pad.left - 6}" y="${format(yFitness(maxFitness) + 4, 1)}" class="tick tick--end">${maxFitness}</text>
          <text x="${pad.left - 6}" y="${pad.top + innerHeight}" class="tick tick--end">0</text>
          <text x="${pad.left + innerWidth + 6}" y="${pad.top + 10}" class="tick">${maxHamming}</text>
          <text x="${pad.left + innerWidth / 2}" y="${height - 4}" class="tick tick--mid">generation</text>
        </svg>
        <figcaption>
          <span class="key key--best">best fitness</span>
          <span class="key key--average">average fitness</span>
          <span class="key key--hamming">mean pairwise Hamming</span>
        </figcaption>
      </figure>`;
  }

  function evolutionStatus(current) {
    if (current.status === lab.STOPPED) return `Stopped — ${current.stopReason}.`;
    const best = lab.describe(lab.bestOf(current.population));
    return `Generation ${current.generation}. Best ${best.bits} = ${best.fitness}. Optimum for this instance is ${current.optimum.fitness}.`;
  }

  function renderEvolution(current) {
    const metrics = current.metrics;
    return `
      <article class="lab-card" data-view="EVOLUTION">
        <header class="lab-card__header">
          <h3><span class="badge">EVOLUTION</span>genetic algorithm · knapsack</h3>
          <p class="lab-card__status">${evolutionStatus(current)}</p>
        </header>
        <div class="lab-card__body">
          <div class="lab-card__main">
            ${renderPopulation(current)}
            ${renderHistoryChart(current)}
          </div>
          <aside class="state-panel" aria-label="Genetic algorithm state">
            <div class="state-group">
              <div class="state-group__heading"><h4>This generation</h4><span>mutation rate ${format(current.options.mutationRate)}</span></div>
              <ol class="event-list">${renderEvents(current)}</ol>
            </div>
            ${renderProblem()}
            <div class="rule-box">
              <strong>Rules in force</strong>
              <span>Fitness-proportionate selection, one-point crossover, bit-flip mutation, and the single best candidate carried over unchanged.</span>
            </div>
          </aside>
        </div>
        <dl class="metrics">
          ${metric("Generation", current.generation)}
          ${metric("Best fitness", metrics.best)}
          ${metric("Average fitness", format(metrics.average))}
          ${metric("Distinct candidates", `${metrics.distinct} / ${current.options.populationSize}`)}
          ${metric("Mean pairwise Hamming", format(metrics.hamming))}
          ${metric("Over capacity", metrics.infeasible)}
        </dl>
      </article>`;
  }

  // ------------------------------------------------------------------- colony

  function edgeAnchor(edge) {
    const a = lab.NODES.find((node) => node.id === edge.from);
    const b = lab.NODES.find((node) => node.id === edge.to);
    const t = edge.labelT === undefined ? 0.5 : edge.labelT;
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, a, b };
  }

  function renderGraph(current) {
    const pheromones = [...current.pheromone.values()];
    const maxPheromone = Math.max(...pheromones, 0.001);
    const usedThisRound = new Set();
    current.tours.forEach((tour) => tour.edges.forEach((edge) => usedThisRound.add(lab.edgeKey(edge.from, edge.to))));

    const edges = lab.EDGES.map((edge) => {
      const key = lab.edgeKey(edge.from, edge.to);
      const pheromone = current.pheromone.get(key);
      const { a, b, x, y } = edgeAnchor(edge);
      const width = 1.5 + (pheromone / maxPheromone) * 12;
      const used = usedThisRound.has(key) ? " is-used" : "";
      return `
        <g class="edge${used}">
          <line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke-width="${format(width, 1)}"/>
          <rect x="${format(x - 39, 1)}" y="${format(y - 13, 1)}" width="78" height="26" rx="6" class="edge-plate"/>
          <text x="${format(x, 1)}" y="${format(y - 2, 1)}" class="edge-cost">cost ${edge.cost}</text>
          <text x="${format(x, 1)}" y="${format(y + 9, 1)}" class="edge-pheromone">&#964; ${format(pheromone)}</text>
        </g>`;
    }).join("");

    const nodes = lab.NODES.map((node) => {
      const terminal = node.id === "NEST" || node.id === "FOOD" ? " is-terminal" : "";
      return `
        <g class="node${terminal}">
          <circle cx="${node.x}" cy="${node.y}" r="26"/>
          <text x="${node.x}" y="${node.y + 5}">${node.label}</text>
        </g>`;
    }).join("");

    return `<svg class="graph" viewBox="0 0 720 380" role="img" aria-label="Route graph from Nest to Food with pheromone levels on each edge">${edges}${nodes}</svg>`;
  }

  function renderRoutes(current) {
    const chosen = new Map();
    current.tours.forEach((tour) => chosen.set(tour.label, (chosen.get(tour.label) || 0) + 1));
    const bestCost = current.optimum.cost;

    const rows = lab.ROUTES
      .map((route) => ({ route, probability: lab.routeProbability(current, route) }))
      .sort((one, two) => two.probability - one.probability)
      .map(({ route, probability }) => `
        <tr class="${route.cost === bestCost ? "is-optimum" : ""}">
          <td><code>${route.nodes.join(" → ")}</code></td>
          <td class="numeric">${route.cost}</td>
          <td class="numeric">${chosen.get(route.label) || 0}</td>
          <td class="numeric">
            <span class="wheel"><span class="wheel__fill" style="width: ${(probability * 100).toFixed(1)}%"></span></span>
            ${percent(probability)}
          </td>
        </tr>`).join("");

    return `
      <table class="population-table">
        <thead>
          <tr>
            <th scope="col">Route</th><th scope="col" class="numeric">Cost</th>
            <th scope="col" class="numeric">Ants</th><th scope="col" class="numeric">Next-round chance</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;
  }

  function renderChoices(current) {
    return ["NEST", "A", "B", "C"].map((node) => {
      const options = lab.choiceProbabilities(current, node);
      if (options.length < 2) return "";
      const rows = options.map((option) => `
        <li class="reading-row">
          <span>${node} → ${option.edge.to} <span class="quiet">cost ${option.edge.cost}</span></span>
          <strong>&#964; ${format(option.pheromone)} · ${percent(option.probability)}</strong>
        </li>`).join("");
      return `
        <div class="state-group">
          <div class="state-group__heading"><h4>Choice at ${node}</h4><span>pheromone × 1/cost</span></div>
          <ul class="event-list">${rows}</ul>
        </div>`;
    }).join("");
  }

  function colonyStatus(current) {
    if (current.round === 0) return `Ready. Every edge starts at &#964; ${format(current.options.initialPheromone)}, whatever it costs.`;
    const costs = current.tours.map((tour) => tour.cost);
    return `Round ${current.round}. This round's ants: ${costs.join(", ")}. Best route so far costs ${current.bestTour.cost}.`;
  }

  function renderColony(current) {
    const deposited = [...current.lastDeposits.values()].reduce((sum, value) => sum + value, 0);
    return `
      <article class="lab-card" data-view="COLONY">
        <header class="lab-card__header">
          <h3><span class="badge">COLONY</span>ant colony optimisation · route graph</h3>
          <p class="lab-card__status">${colonyStatus(current)}</p>
        </header>
        <div class="lab-card__body">
          <div class="lab-card__main">
            ${renderGraph(current)}
            ${renderRoutes(current)}
          </div>
          <aside class="state-panel" aria-label="Colony state">
            ${renderChoices(current)}
            <div class="rule-box">
              <strong>Each round</strong>
              <span>${current.options.ants} ants build a route, every edge evaporates by ${format(current.options.evaporation)}, then each ant adds ${format(current.options.deposit)}/cost to the edges it used.</span>
            </div>
          </aside>
        </div>
        <dl class="metrics">
          ${metric("Round", current.round)}
          ${metric("Best route cost", current.bestTour ? current.bestTour.cost : "—")}
          ${metric("Shortest possible", current.optimum.cost)}
          ${metric("Evaporation", format(current.options.evaporation))}
          ${metric("Deposited this round", format(deposited))}
          ${metric("Total pheromone", format(lab.totalPheromone(current)))}
        </dl>
      </article>`;
  }

  // -------------------------------------------------------------------- shell

  function metric(label, value) {
    return `<div class="metric"><dt>${label}</dt><dd>${value}</dd></div>`;
  }

  function render() {
    const current = session();
    stage.innerHTML = view === "EVOLUTION" ? renderEvolution(current) : renderColony(current);
    runStatus.innerHTML = view === "EVOLUTION" ? evolutionStatus(current) : colonyStatus(current);
    legendText.textContent = view === "EVOLUTION" ? EVOLUTION_LEGEND : COLONY_LEGEND;

    if (view === "EVOLUTION") {
      viewTitle.textContent = "Evolution — a genetic algorithm on the CT319 knapsack.";
      viewExplanation.textContent = `Set the mutation rate to 0, reset and run. Then try ${format(lab.GA_DEFAULTS.mutationRate)} from the same seed and compare diversity.`;
    } else {
      viewTitle.textContent = "Colony — ant colony optimisation on a small route graph.";
      viewExplanation.textContent = "Run with evaporation 0.30, then reset with evaporation 0 and compare how long the colony stays undecided.";
    }

    stepButton.disabled = isFinished();
    runButton.disabled = timer !== null || isFinished();
    pauseButton.disabled = timer === null;
  }

  function advance() {
    if (view === "EVOLUTION") lab.stepGeneration(evolution);
    else lab.stepRound(colony);
    render();
  }

  function pause() {
    if (timer !== null) global.clearTimeout(timer);
    timer = null;
    render();
  }

  function runNextTick() {
    if (isFinished()) { pause(); return; }
    advance();
    if (isFinished()) { pause(); return; }
    timer = global.setTimeout(runNextTick, Number(speedControl.value));
  }

  function run() {
    if (timer !== null || isFinished()) return;
    timer = global.setTimeout(runNextTick, 0);
    render();
  }

  function reset() {
    if (timer !== null) global.clearTimeout(timer);
    timer = null;
    makeSessions();
    render();
  }

  viewButtons.forEach((button) => {
    button.addEventListener("click", () => {
      view = button.dataset.view;
      viewButtons.forEach((candidate) => candidate.setAttribute("aria-pressed", String(candidate === button)));
      mutationField.hidden = view !== "EVOLUTION";
      evaporationField.hidden = view !== "COLONY";
      seedControl.value = view === "EVOLUTION" ? lab.GA_DEFAULTS.seed : lab.ACO_DEFAULTS.seed;
      reset();
    });
  });

  mutationControl.addEventListener("input", () => { mutationOutput.value = format(mutationControl.value); });
  mutationControl.addEventListener("change", () => { if (view === "EVOLUTION") reset(); });
  evaporationControl.addEventListener("input", () => { evaporationOutput.value = format(evaporationControl.value); });
  evaporationControl.addEventListener("change", () => { if (view === "COLONY") reset(); });
  seedControl.addEventListener("change", reset);
  speedControl.addEventListener("input", () => { speedOutput.value = `${speedControl.value} ms`; });

  stepButton.addEventListener("click", () => { if (timer !== null) pause(); advance(); });
  runButton.addEventListener("click", run);
  pauseButton.addEventListener("click", pause);
  resetButton.addEventListener("click", reset);

  mutationControl.value = String(lab.GA_DEFAULTS.mutationRate);
  mutationOutput.value = format(lab.GA_DEFAULTS.mutationRate);
  evaporationControl.value = String(lab.ACO_DEFAULTS.evaporation);
  evaporationOutput.value = format(lab.ACO_DEFAULTS.evaporation);
  seedControl.value = String(lab.GA_DEFAULTS.seed);
  makeSessions();
  render();

  global.CT319PopulationLab = {
    get view() { return view; },
    get session() { return session(); },
    reset,
    step: advance,
    pause,
  };
}(globalThis, document));
