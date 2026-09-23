---
title: Week 7 — Search checkpoint
eyebrow: CT319 Artificial Intelligence · Week 7 · Search checkpoint
question: Can you recognise the idea when the algorithm name is removed?
description: CT319 Week 7. A checkpoint on the search block — reconnect Weeks 1–6, identify a method from its behaviour, predict before running, and correct the traps.
bar: Week 7 · Sections
source: week-07.md
---

Weeks 2 to 6 built one thing, one change at a time. A problem became a representation. A representation gained a rule for what to explore next. That rule gained information. The information gained a way out when strict improvement ran out. And the single candidate became a population.

There is no new algorithm on this page. This is a checkpoint: we take the names off and find out whether the mechanisms underneath are still recognisable.

<!-- ct319:focus -->

> **Can you recognise the idea when the algorithm name is removed?**

<!-- ct319:endfocus -->

Start from memory, say your prediction out loud, then explain or revise it using the behaviour on screen. Getting it wrong first and correcting it against the run is the exercise, not a failure of it.

We work through four activities.

* [**The story so far**](#the-story-so-far--what-changed-each-week) — reconnect Weeks 1–6 as one progression rather than six separate topics.
* [**Algorithm detective**](#algorithm-detective--what-clues-tell-you-what-is-happening) — identify a method from what it actually does.
* [**Predict before you run**](#predict-before-you-run--what-will-the-algorithm-do-next) — use the Search Lab and the Population Lab to connect a decision rule to an observed result.
* [**Final check**](#final-check--what-are-the-traps-to-avoid) — correct the misconceptions that blur those mechanisms together.

Three habits carry the page, and it is worth keeping them apart:

<!-- ct319:focus -->

<div class="lenses">
<div class="lens"><span class="lens__key">Recognise</span><span class="lens__gloss">identify the mechanism from its behaviour, not from a memorised definition</span></div>
<div class="lens"><span class="lens__key">Predict</span><span class="lens__gloss">work out what an algorithm will do before running it</span></div>
<div class="lens"><span class="lens__key">Connect</span><span class="lens__gloss">explain how representation, information and search strategy influence one another</span></div>
</div>

<!-- ct319:endfocus -->

Nothing here is new. There is quite a lot here to be able to tell apart.

<!-- ct319:beats -->

<!-- ct319:beat -->
## The story so far — what changed each week?

Six weeks reads as a list of six topics. Read as a progression, each week changed exactly **one** part of the same problem-solving story and left the rest alone.

### Week 1 — behaviour is not the same thing as mechanism

ELIZA and Turing's imitation game separated **behaviour** — what a system does — from **mechanism** — how it produces that behaviour — and **evaluation** — what the evidence actually establishes.

An impressive conversation does not reveal its internal mechanism. An impressive search run likewise does not establish that the method always succeeds, or that it finds the best solution. Keep that distinction as we reconnect the later weeks.

### Week 2 — representation

Farmer Jones and the maze became states, legal transitions and constraints. In the maze, `state = (row, column)` records where the agent is, and `neighbours(state)` reports the legal next states.

The change was **representation**: deciding what the machine is able to describe. Missing relevant information makes some decisions impossible; unnecessary information enlarges the state space. Generating legal options still leaves the choice between them unresolved.

### Week 3 — blind search

BFS removes the oldest waiting frontier state; DFS removes the newest. Both explore systematically, without estimating which state is nearer the goal.

The change was the **exploration rule**, not the maze. The frontier keeps alternatives available, and its removal policy decides when they receive attention. DFS may spend a long time inside an unhelpful branch before it returns to the alternatives it kept.

### Week 4 — heuristic information

The maze, the legal moves and the goal all stayed fixed. We added `h(state)`: Manhattan distance, a cheap estimate of remaining cost that ignores walls.

The change was **additional information**. A lower value means a state looks closer under that estimate. It influences behaviour only when the strategy reads it. Strict hill climbing supplied a local rule that acted on the comparison.

### Week 5 — local movement and escape

Hill climbing was already local search. Week 5 broadened what a search following one current candidate could do once strict improvement stopped.

The changes were **start**, **neighbourhood** and **acceptance**: begin somewhere else, inspect different nearby candidates, or sometimes accept a worse move. VNS changes the neighbourhood; simulated annealing changes acceptance. Neither has to change the underlying objective.

<!-- ct319:focus -->

> **“No better neighbour exists” does not mean “no better solution exists.”**

<!-- ct319:endfocus -->

### Week 6 — one candidate becomes many

A Genetic Algorithm keeps a population of candidates and transforms it through selection, crossover and mutation. Ant Colony Optimisation uses many route-building agents and a shared pheromone signal.

The change was **search organisation**: many candidates or agents contribute, rather than one current candidate carrying the whole search. Diversity and shared information now matter — but more participants on their own do not guarantee a better result.

### The whole search block

<!-- ct319:focus -->

![Weeks 2 to 6 in sequence, and the four modelling choices that run through all of them](../../media/week-06/search-recap.svg "hero")

<sub><em>Figure 1. The progression from Weeks 2–6, and the four modelling choices that recur in every one of them. This is the Week 6 summary diagram, reused here rather than redrawn, because it is the same story being reconnected. Diagram created for these pages; no external image licence is used.</em></sub>

<!-- ct319:endfocus -->

### One problem, several possible questions

Read that as a sequence of changes, not as a ranking from weak algorithms to strong ones. A representation defines the possibilities. A search rule decides what receives attention. A heuristic supplies guidance. A neighbourhood and an acceptance rule govern local movement. Population operators and shared signals organise contributions from many candidates at once.

Pick one transition and explain it using the maze, the knapsack or the route graph:

<!-- ct319:focus -->

> **What became available that was missing before?**

<!-- ct319:endfocus -->

### Why this matters this week

The progression is what connects the methods. Now we remove their names and recognise them from behaviour alone.

<!-- ct319:beat -->
## Algorithm detective — what clues tell you what is happening?

Read all eight cases before looking at any explanation. Compare your reasoning with someone else's before moving down the page — the disagreement is more useful than the answer.

For each case, two things:

<!-- ct319:focus -->

> **Name the method. Then name the single decision that gives it away.**

<!-- ct319:endfocus -->

### The eight cases

**Case 1** — The algorithm always removes the state that has been waiting on the frontier the longest. Newly discovered states join behind the waiting ones.

**Case 2** — The algorithm expands the most recently added frontier state. Newly generated successors receive attention before older alternatives.

**Case 3** — Each maze state receives a cheap estimate of remaining distance, `h(state)`. A smaller value looks more promising, although walls may force a detour.

**Case 4** — The algorithm inspects every legal neighbour and selects the best strictly improving value. Successor order breaks an equal-best tie. With no strict improvement available, it stops.

**Case 5** — The search uses a small neighbourhood while improvements are available. When that fails, it checks a larger one, and returns to the small one after a successful move.

**Case 6** — A proposed worse candidate may be accepted. Acceptance depends on how much worse it is, and on a temperature that decreases during the run.

**Case 7** — Several bit strings are evaluated. Fitter candidates receive more selection probability, parents are combined, and occasional bit changes introduce variation.

**Case 8** — Many agents construct routes probabilistically. Values stored on edges influence later choices, receive reinforcement from completed routes, and gradually evaporate.

### Check your answers

1. **Breadth-first search.** The clue is a **FIFO frontier**: first in, first out. New discoveries wait behind older entries.
2. **Depth-first search.** The clue is a **LIFO frontier**: last in, first out. Older alternatives stay available while newer ones are explored.
3. **Heuristic information.** `h(state)` supplies a problem-specific estimate. This is information — not a complete algorithm, and not a guarantee about the route.
4. **Strict hill climbing.** Our version takes the best strict local improvement, resolves ties by successor order, and stops when none exists.
5. **Variable Neighbourhood Search.** The clue is changing what counts as nearby. The CT319 version returns to the cheaper neighbourhood after an improvement.
6. **Simulated Annealing.** The clue is controlled, probabilistic acceptance of worse moves. A higher temperature permits more exploration for the same amount of worsening.
7. **Genetic Algorithm.** The combination is **population + selection + crossover + mutation**. Each operator has a different job.
8. **Ant Colony Optimisation.** The shared signal is **artificial pheromone**. Reinforcement and evaporation change future route probabilities; edge costs remain properties of the problem.

### The clues that matter

Three questions separate every method on that list:

<!-- ct319:focus -->

> **What is stored? What information is read? What decides the next change?**

<!-- ct319:endfocus -->

Randomness answers none of them. It can select a parent, propose a move or influence a route choice — its presence alone identifies nothing.

> [!NOTE]
> **Do not identify an algorithm from one vague word.**
>
> “Random”, “best”, “population” and “distance” appear in many methods. Identify the actual decision rule.

### Why this matters this week

Recognising the mechanism explains why a name fits. The next activity goes one step further: use that mechanism to predict a visible decision, then check the prediction against the run.

<!-- ct319:beat -->
## Predict before you run — what will the algorithm do next?

Use the [**Search Lab**](../../search-lab/) and the [**Population Lab**](../../population-lab/). Every scenario below follows the same sequence:

<!-- ct319:focus -->

> **Predict → run or step → observe → explain.**

<!-- ct319:endfocus -->

Say what you expect *before* pressing the control. Afterwards, name the rule that caused the result.

### Which waiting state gets attention next?

Keep the default maze and successor order. Step **BFS** until several states are waiting, predict the next expansion from the frontier, then step once. Reset, select **DFS** and repeat.

Explain the difference using oldest versus newest, not closeness to the goal. The lab displays each frontier in **removal order, next first**, so the DFS display already accounts for the stack. Compare how new successors join the waiting alternatives rather than assuming both panels show insertion order.

### Does showing a heuristic change BFS?

Keep **BFS** selected and turn **Show Manhattan h** on. Predict whether a waiting state with a lower value will jump ahead. Run from the same start and successor order, then compare against the run without the overlay.

The traversal is unchanged, because BFS never reads `h` when it selects its next state. The number is on screen; the queue still decides.

<!-- ct319:focus -->

> **Information in a program affects a strategy only when its decision rule uses it.**

<!-- ct319:endfocus -->

### What happens at the strict hill-climbing trap?

Select **Hill climb**, set **neighbours() order** to `UP → RIGHT → DOWN → LEFT`, and step to `(4,7)`. Predict which equal-best neighbour wins, then continue to `(4,8)`.

At that cell, pause before the next step:

<!-- ct319:focus -->

```text
current (4,8): h = 2
UP   → (3,8): h = 3
LEFT → (4,7): h = 3
```

<!-- ct319:endfocus -->

Predict the outcome, then step. Explain the stopping message using **acceptable** moves, not legal ones. The goal is still reachable through `(4,7) → (5,7) → (6,7) → (6,8)`: four moves remain, although the heuristic estimates two.

### Can the same worse-looking exit be accepted?

Select **Anneal**, restore `UP → DOWN → LEFT → RIGHT`, and use seed `743`. After fourteen steps the run is at `(4,8)`. Predict what the acceptance rule permits, then inspect the next two proposals.

The first is rejected. The second accepts `LEFT → (4,7)`, raising `h` from `2` to `3`. Read the probability and the random draw together.

<!-- ct319:focus -->

> **A worse proposal is possible to accept, not certain to be accepted.**

<!-- ct319:endfocus -->

Temperature influences that probability. One step can reject a proposal without the agent moving at all.

Explain what changed from the strict rule. The wall and the distance estimate are exactly as they were. The run now has a way out of the local minimum — which is a possibility, not a promise for every seed or cooling schedule.

### What can crossover do when everyone looks alike?

In the Population Lab's **Evolution** view, keep seed `39`. Predict how population similarity will change with **mutation rate = 0**, then reset and run. Read **distinct candidates** and **mean pairwise Hamming distance** alongside best fitness.

Repeat from the same seed with mutation `0.06`. Predict whether variation can reappear, then compare the populations and the traces. Keep every other setting fixed, so the mutation rate is the one change you are explaining.

In the zero-mutation run the population becomes copies of `01101`: best fitness `14`, one distinct candidate, mean pairwise Hamming distance `0`. With mutation `0.06`, this seeded run reaches fitness `15` and keeps its variation. Those are observations from these settings, not universal promises about mutation rates.

Explain why identical parents produce identical children under this crossover. Similar parents leave fewer differences to recombine, and mutation is what can reintroduce the missing variation. A small non-zero rate offers that possibility without replacing a whole candidate at random.

### Why this matters this week

A good explanation identifies **what changed** — frontier policy, information used, acceptance rule, population variation — and keeps it separate from what stayed fixed. That connects a visible outcome to a mechanism, instead of treating one successful run as proof of general superiority.

<!-- ct319:beat -->
## Final check — what are the traps to avoid?

Every correction below has the same shape.

<!-- ct319:focus -->

> **A method's name, a low score or one successful run does not establish a general guarantee.**

<!-- ct319:endfocus -->

> [!NOTE]
> **Keep the conditions attached to the claim.** Most of these are not wrong statements — they are true statements with their conditions quietly removed.

- **“BFS finds the cheapest route.”** BFS finds a minimum-**depth** route. That is minimum cost when action costs are equal; BFS does not optimise unequal edge weights.
- **“DFS always finds a reachable goal.”** DFS is not complete in general: infinite branches or unchecked cycles can stop it returning to alternatives. On our finite maze, reached-state checking makes it terminate and find a reachable goal.
- **“The heuristic tells us the work actually left.”** It *estimates* remaining cost. At `(4,8)` Manhattan distance is `2`, but the shortest remaining route costs `4` moves.
- **“Hill climbing stopped, so there is no solution.”** Stopping means no strictly improving neighbour exists under the chosen neighbourhood and evaluation. Legal routes can remain.
- **“A larger neighbourhood is automatically better.”** It may expose an escape, but evaluating more candidates costs more. The CT319 VNS version returns to the smaller neighbourhood after an improvement.
- **“Simulated Annealing accepts worse moves.”** It *may* accept them, with a probability controlled by the amount of worsening and the temperature. It does not accept every worse proposal.
- **“Crossover makes better children.”** It recombines parent material. Children still need evaluating, and may be worse or infeasible; identical bit-string parents supply no variation to recombine.
- **“Mutation simply randomises the solution.”** It introduces controlled random variation through an operator such as bit flipping. Too little leaves useful variation missing; too much disrupts useful structure.
- **“Pheromone is route cost.”** Cost belongs to the problem. Pheromone is accumulated search information that influences probabilistic choices and changes through reinforcement and evaporation.

### Why this matters this week

<!-- ct319:focus -->

Every one of those corrections separates what a mechanism **does** from what we are entitled to **conclude** — which is where the module started in Week 1. Describe the behaviour, identify the mechanism, and make only the claim the evidence supports.

<!-- ct319:endfocus -->

<!-- ct319:endbeats -->

## The labs

Both labs are seeded, so a given seed replays the same run exactly. That is what makes a prediction checkable rather than an opinion.

🧪 **[Open the Search Lab](../../search-lab/)** — the recurring maze under BFS, DFS, strict hill climbing and seeded annealing, with the frontier and the Manhattan overlay visible.

🧪 **[Open the Population Lab](../../population-lab/)** — the five-bit knapsack population in the Evolution view, and the colony's shared pheromone signal in the Colony view.

Both are existing CT319 artefacts from Weeks 2–6. Nothing new was built for this week; the point is to revisit them knowing what to look for.

---

## Before Week 8

The first search block is complete. We supplied the representations, the legal transitions, the evaluations and the rules for deciding what happens next. The machine searched inside the structure we designed for it — and every interesting failure this block produced came from that structure, not from the machine.

Which raises the obvious next question:

<!-- ct319:focus -->

> **What if, instead of specifying every decision rule ourselves, we gave the machine data or experience and asked it to improve from that?**

<!-- ct319:endfocus -->

That is where Week 8 begins.

---

## Quick revision

If you can answer these without reopening the page, you have the core of this week.

1. **[WK-07-01]** Weeks 2 to 6 each changed one part of the same story. Name the change each of them made.
2. Why is it a mistake to read that progression as a ranking from weak algorithms to strong ones?
3. **[WK-07-02]** A method expands the most recently added frontier state. What is it, and which word in that sentence identifies it?
4. Why is “it uses randomness” never enough to identify an algorithm?
5. **[WK-07-03]** Why does turning on the Manhattan overlay leave a breadth-first traversal unchanged?
6. At `(4,8)` the heuristic reads `2` while the shortest remaining route is four moves. Why is that not a bug?
7. **[WK-07-04]** Why does “hill climbing stopped” not mean “no solution exists”?
8. What is the difference between an edge's cost and the pheromone on that edge, and which of the two does the algorithm change?

---

## Sources and licensing notes

### CT319 source material

This checkpoint draws on the CT319 material already covered in Weeks 1–6: behaviour and mechanism; representation; BFS and DFS; heuristics; local search; and evolution and collective intelligence. The individual week pages carry the worked explanations and their own source notes.

No new formal lecture material is introduced here. Where this page states a value — the `h = 2` reading at `(4,8)`, the four remaining moves, seed `743`, seed `39`, fitness `14` and `15` — it is the value the labs compute for those settings, and it is checked by their test suites.

### Figures

Figure 1 is the Week 6 summary diagram, **created for these pages** and reused here rather than redrawn. It uses no external image licence.

No external images, videos, papers or interactives are used.

### Classroom artefacts

- 🧪 [**CT319 Search Lab**](../../search-lab/) — frontier decisions, the heuristic overlay, strict hill climbing and seeded annealing on the recurring maze.
- 🧪 [**CT319 Population Lab**](../../population-lab/) — the five-bit knapsack population and the colony's shared pheromone signal.

Both are existing CT319 teaching artefacts. This week adds no new application and no external media.
