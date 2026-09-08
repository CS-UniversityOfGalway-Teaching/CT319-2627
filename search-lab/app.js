(function initialiseInterface(global, document) {
  "use strict";

  const lab = global.CT319;
  if (!lab) throw new Error("Search Lab scripts were loaded in the wrong order.");

  const stage = document.querySelector("#search-stage");
  const modeButtons = [...document.querySelectorAll("[data-mode]")];
  const presetSelect = document.querySelector("#preset-select");
  const orderSelect = document.querySelector("#order-select");
  const speedControl = document.querySelector("#speed-control");
  const speedOutput = document.querySelector("#speed-output");
  const heuristicToggle = document.querySelector("#heuristic-toggle");
  const stepButton = document.querySelector("#step-button");
  const runButton = document.querySelector("#run-button");
  const pauseButton = document.querySelector("#pause-button");
  const resetButton = document.querySelector("#reset-button");
  const runStatus = document.querySelector("#run-status");
  const presetDescription = document.querySelector("#preset-description");
  const orderExplanation = document.querySelector("#order-explanation");

  let mode = "BFS";
  let problem = lab.PROBLEMS[0];
  let successorOrder = [...lab.DEFAULT_ORDER];
  let sessions = [];
  let timer = null;

  function permutations(values) {
    if (values.length === 1) return [values];
    return values.flatMap((value, index) => {
      const rest = [...values.slice(0, index), ...values.slice(index + 1)];
      return permutations(rest).map((permutation) => [value, ...permutation]);
    });
  }

  function populateControls() {
    lab.PROBLEMS.forEach((preset) => {
      const option = document.createElement("option");
      option.value = preset.id;
      option.textContent = preset.name;
      presetSelect.append(option);
    });

    permutations([...lab.DEFAULT_ORDER]).forEach((order) => {
      const option = document.createElement("option");
      option.value = order.join(",");
      option.textContent = order.join(" → ");
      if (option.value === lab.DEFAULT_ORDER.join(",")) option.selected = true;
      orderSelect.append(option);
    });
  }

  function makeSessions() {
    if (mode === "RACE") {
      sessions = [lab.createSession(problem, "BFS", successorOrder), lab.createSession(problem, "DFS", successorOrder)];
    } else if (mode === "HILL") {
      sessions = [lab.createHillSession(problem, successorOrder)];
    } else {
      sessions = [lab.createSession(problem, mode, successorOrder)];
    }
  }

  function isFinished() {
    return sessions.every((session) => session.status !== lab.SEARCHING);
  }

  function statusText(session) {
    if (session.status === lab.FOUND) {
      const moves = session.finalPath.length - 1;
      return `Goal found in ${moves} move${moves === 1 ? "" : "s"}.`;
    }
    if (session.status === lab.STUCK) {
      return `${lab.NO_IMPROVING_NEIGHBOUR}. Stopped at (${session.current}), h=${lab.manhattan(session.problem, lab.stateOf(session.current))}.`;
    }
    if (session.status === lab.EXHAUSTED) return "Frontier empty. No goal found.";
    if (session.strategy === "HILL") {
      const prefix = session.lastAction === null ? "Ready" : `Moved ${session.lastAction}`;
      return `${prefix}: current (${session.current}), h=${lab.manhattan(session.problem, lab.stateOf(session.current))}.`;
    }
    if (session.current === null) return "Ready: start is next.";
    return `Expanded (${session.current}); generated ${session.lastGenerated} new state${session.lastGenerated === 1 ? "" : "s"}.`;
  }

  function modeDescription(strategy) {
    if (strategy === "BFS") return "FIFO · remove oldest";
    if (strategy === "DFS") return "LIFO · remove newest";
    return "strict improvement · local choice";
  }

  function classNamesForCell(session, stateKey) {
    const names = ["maze-cell"];
    if (session.problem.walls.has(stateKey)) names.push("is-wall");
    if (session.explored.includes(stateKey)) names.push("is-explored");
    if (session.frontier.includes(stateKey)) names.push("is-frontier");
    const displayedPath = session.strategy === "HILL" ? session.path : session.finalPath;
    if (displayedPath.includes(stateKey)) names.push("is-path");
    if (session.current === stateKey) names.push("is-current");
    if (stateKey === lab.keyOf(session.problem.start)) names.push("is-start");
    if (stateKey === lab.keyOf(session.problem.goal)) names.push("is-goal");
    return names.join(" ");
  }

  function cellDescription(session, stateKey) {
    const labels = [`State (${stateKey})`];
    if (session.problem.walls.has(stateKey)) labels.push("wall");
    if (stateKey === lab.keyOf(session.problem.start)) labels.push("start");
    if (stateKey === lab.keyOf(session.problem.goal)) labels.push("goal");
    if (session.current === stateKey) labels.push("current state");
    else if (session.frontier.includes(stateKey)) labels.push("on frontier");
    else if (session.explored.includes(stateKey)) labels.push("explored");
    const displayedPath = session.strategy === "HILL" ? session.path : session.finalPath;
    if (displayedPath.includes(stateKey)) labels.push(session.status === lab.FOUND ? "on final path" : "on current path");
    if (heuristicToggle.checked && !session.problem.walls.has(stateKey)) {
      labels.push(`Manhattan h ${lab.manhattan(session.problem, lab.stateOf(stateKey))}`);
    }
    return labels.join(", ");
  }

  function renderMaze(session) {
    const cells = [];
    const startKey = lab.keyOf(session.problem.start);
    const goalKey = lab.keyOf(session.problem.goal);

    for (let row = 0; row < session.problem.rows; row += 1) {
      for (let column = 0; column < session.problem.cols; column += 1) {
        const stateKey = lab.keyOf([row, column]);
        const marker = stateKey === startKey ? "S" : stateKey === goalKey ? "G" : "";
        const currentMarker = session.current === stateKey ? '<span class="current-marker">●</span>' : "";
        const isWall = session.problem.walls.has(stateKey);
        const heuristic = heuristicToggle.checked && !isWall
          ? `<span class="heuristic-value">h=${lab.manhattan(session.problem, [row, column])}</span>`
          : "";
        const coordinate = isWall ? "" : `<span class="coordinate">${row},${column}</span>`;
        cells.push(`
          <div class="${classNamesForCell(session, stateKey)}${heuristic ? " has-heuristic" : ""}" role="gridcell" aria-label="${cellDescription(session, stateKey)}">
            ${marker ? `<span class="cell-marker">${marker}</span>` : ""}
            <span class="cell-values">${coordinate}${heuristic}</span>
            ${currentMarker}
          </div>`);
      }
    }

    return `<div class="maze-grid" style="--cols: ${session.problem.cols}" role="grid" aria-label="${session.problem.name}">${cells.join("")}</div>`;
  }

  function stateList(keys, kind) {
    if (keys.length === 0) return '<li class="empty-state">None</li>';
    return keys.map((key, index) => {
      const next = kind === "frontier" && index === 0 ? ' <span aria-hidden="true">← next</span>' : "";
      return `<li class="state-chip" data-kind="${kind}">(${key})${next}</li>`;
    }).join("");
  }

  function renderStatePanel(session) {
    if (session.strategy === "HILL") return renderHillStatePanel(session);

    const frontier = lab.frontierInRemovalOrder(session);
    const current = session.current === null ? "None yet" : `(${session.current})`;
    return `
      <aside class="state-panel" aria-label="${session.strategy} search state">
        <div class="state-group">
          <div class="state-group__heading"><h4>Current</h4><span>being examined</span></div>
          <p class="current-state-value">${current}</p>
        </div>
        <div class="state-group">
          <div class="state-group__heading"><h4>Frontier</h4><span>next → later · ${frontier.length}</span></div>
          <ol class="state-list">${stateList(frontier, "frontier")}</ol>
        </div>
        <div class="state-group">
          <div class="state-group__heading"><h4>Explored</h4><span>expansion order · ${session.explored.length}</span></div>
          <ol class="state-list">${stateList(session.explored, "explored")}</ol>
        </div>
      </aside>`;
  }

  function renderHillStatePanel(session) {
    const currentH = lab.manhattan(session.problem, lab.stateOf(session.current));
    const improvingValues = session.candidates
      .filter((candidate) => candidate.improving)
      .map((candidate) => candidate.heuristic);
    const bestH = improvingValues.length > 0 ? Math.min(...improvingValues) : null;
    const candidates = session.candidates.length === 0
      ? '<li class="empty-state">Goal reached — no next move needed.</li>'
      : session.candidates.map((candidate) => {
        const isPreferred = candidate.key === session.preferredKey;
        const isBestTie = candidate.improving && candidate.heuristic === bestH;
        const result = isPreferred
          ? "next by order"
          : isBestTie
            ? "equal-best tie"
            : candidate.improving
              ? "improves"
              : "not improving";
        return `<li class="neighbour-row${isPreferred ? " is-preferred" : ""}${isBestTie ? " is-best" : ""}">
          <span class="neighbour-action">${candidate.action}</span>
          <code>(${candidate.key})</code>
          <strong>h=${candidate.heuristic}</strong>
          <span>${result}</span>
        </li>`;
      }).join("");

    return `
      <aside class="state-panel hill-panel" aria-label="Strict hill-climbing state">
        <div class="state-group">
          <div class="state-group__heading"><h4>Current</h4><span>the only active state</span></div>
          <p class="current-state-value">(${session.current}) · h=${currentH}</p>
        </div>
        <div class="state-group">
          <div class="state-group__heading"><h4>Legal neighbours</h4><span>successor order · ${session.candidates.length}</span></div>
          <ol class="neighbour-list">${candidates}</ol>
        </div>
        <div class="strict-rule">
          <strong>Strict rule</strong>
          <span>Move only to a strictly lower h. Equal best values are resolved by successor order.</span>
        </div>
      </aside>`;
  }

  function metric(label, value) {
    return `<div class="metric"><dt>${label}</dt><dd>${value}</dd></div>`;
  }

  function renderCard(session) {
    const pathLength = session.status === lab.FOUND ? session.finalPath.length - 1 : "—";
    const goalFound = session.status === lab.FOUND
      ? "Yes"
      : session.status === lab.EXHAUSTED || session.status === lab.STUCK
        ? "No"
        : "Not yet";
    const metrics = session.strategy === "HILL"
      ? [
        metric("Moves made", session.movesMade),
        metric("Current h", lab.manhattan(session.problem, lab.stateOf(session.current))),
        metric("Path so far", session.path.length - 1),
        metric("Goal found", goalFound),
      ].join("")
      : [
        metric("States expanded", session.statesExpanded),
        metric("Maximum frontier", session.maximumFrontier),
        metric("Path length", pathLength),
        metric("Goal found", goalFound),
      ].join("");
    return `
      <article class="search-card" data-strategy="${session.strategy}">
        <header class="search-card__header">
          <h3><span class="strategy-badge">${session.strategy}</span>${modeDescription(session.strategy)}</h3>
          <p class="search-card__status">${statusText(session)}</p>
        </header>
        <div class="search-card__body">
          <div class="maze-wrap">${renderMaze(session)}</div>
          ${renderStatePanel(session)}
        </div>
        <dl class="metrics">${metrics}</dl>
      </article>`;
  }

  function render() {
    stage.classList.toggle("is-race", mode === "RACE");
    stage.innerHTML = sessions.map(renderCard).join("");

    const descriptions = sessions.map((session) => `${session.strategy}: ${statusText(session)}`);
    runStatus.textContent = descriptions.join(" ");
    presetDescription.textContent = problem.description;
    orderExplanation.textContent = mode === "HILL"
      ? `Strict hill climbing chooses the lowest improving h; the first generated state wins an equal-best tie.`
      : mode === "DFS"
      ? `DFS uses the rightmost legal generated state next because a stack removes the newest entry.`
      : mode === "BFS"
        ? `BFS uses the leftmost legal generated state first and preserves depth order.`
        : `Both receive the same order; BFS removes the oldest entry and DFS removes the newest.`;

    stepButton.disabled = isFinished();
    runButton.disabled = timer !== null || isFinished();
    pauseButton.disabled = timer === null;
  }

  function pause() {
    if (timer !== null) global.clearTimeout(timer);
    timer = null;
    render();
  }

  function expandOneTick() {
    sessions.forEach((session) => {
      if (session.status !== lab.SEARCHING) return;
      if (session.strategy === "HILL") lab.stepHillSession(session);
      else lab.stepSession(session);
    });
    render();
  }

  function runNextTick() {
    if (isFinished()) {
      pause();
      return;
    }
    expandOneTick();
    if (isFinished()) {
      pause();
      return;
    }
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

  modeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      mode = button.dataset.mode;
      if (mode === "HILL") heuristicToggle.checked = true;
      modeButtons.forEach((candidate) => {
        candidate.setAttribute("aria-pressed", String(candidate === button));
      });
      reset();
    });
  });

  presetSelect.addEventListener("change", () => {
    problem = lab.PROBLEMS.find((candidate) => candidate.id === presetSelect.value);
    reset();
  });

  orderSelect.addEventListener("change", () => {
    successorOrder = orderSelect.value.split(",");
    reset();
  });

  speedControl.addEventListener("input", () => {
    speedOutput.value = `${speedControl.value} ms`;
  });

  heuristicToggle.addEventListener("change", render);

  stepButton.addEventListener("click", () => {
    if (timer !== null) pause();
    expandOneTick();
  });
  runButton.addEventListener("click", run);
  pauseButton.addEventListener("click", pause);
  resetButton.addEventListener("click", reset);

  populateControls();
  makeSessions();
  render();

  global.CT319SearchLab = {
    get mode() { return mode; },
    get problem() { return problem; },
    get successorOrder() { return [...successorOrder]; },
    get showHeuristic() { return heuristicToggle.checked; },
    get sessions() { return sessions; },
    reset,
    step: expandOneTick,
    pause,
  };
}(globalThis, document));
