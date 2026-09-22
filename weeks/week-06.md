---
title: Week 6 — Evolution and collective intelligence
eyebrow: CT319 Artificial Intelligence · Week 6 · Evolution and collective intelligence
question: What changes when the search stops betting on one solution?
description: CT319 Week 6. Populations, genetic algorithms and ant colonies — what changes when a search keeps many candidate solutions instead of one.
bar: Week 6 · Sections
source: week-06.md
---

Week 5 kept **one current solution** at the centre of the search. Hill climbing moved it. Variable Neighbourhood Search changed what counted as nearby. Simulated annealing loosened what it would accept. Even repeated restarts still followed one trajectory at a time.

This week changes that assumption. Instead of asking *where should this solution move next?*, we ask:

<!-- ct319:focus -->

> **What if we search with many candidate solutions at the same time?**

<!-- ct319:endfocus -->

That gives us a **population**. From there, two nature-inspired ideas become useful:

- **evolution** — candidates combine and mutate across generations
- **collective behaviour** — many simple agents interact and reinforce useful discoveries

The formal notes develop both through Genetic Algorithms, Ant Colony Optimisation and Artificial Bee Colony.

We work through four things.

* [**More than one candidate**](#more-than-one-candidate--why-search-with-a-population) — why keeping a population changes the structure of the search.
* [**Evolve a solution**](#evolve-a-solution--selection-crossover-and-mutation) — how a Genetic Algorithm builds new generations from selection, crossover and mutation.
* [**When evolution goes wrong**](#when-evolution-goes-wrong--why-diversity-matters) — why a population can lose its useful variation and stop improving.
* [**No leader required**](#no-leader-required--how-can-a-colony-search) — how useful search behaviour emerges from many simple agents sharing information.

Three ideas carry the page, and it is worth keeping them apart:

<!-- ct319:focus -->

<div class="lenses">
<div class="lens"><span class="lens__key">Population</span><span class="lens__gloss">many candidate solutions coexist instead of one trajectory carrying the whole search</span></div>
<div class="lens"><span class="lens__key">Fitness</span><span class="lens__gloss">a consistent evaluation, so that better candidates can influence what happens next</span></div>
<div class="lens"><span class="lens__key">Diversity</span><span class="lens__gloss">variation across the population; without it, exploration collapses</span></div>
</div>

<!-- ct319:endfocus -->

This week is not a new problem type. It is a new way to organise search.

<!-- ct319:beats -->

<!-- ct319:beat -->
## More than one candidate — why search with a population?

Up to Week 5, every method had one thing in common: **there was one current solution**. The algorithm could move it, restart it, change its neighbourhood or accept a worse move — but it followed one candidate at a time.

A population replaces that single candidate with a set of them.

> [!IMPORTANT]
> **A population is a set of candidate solutions, not a set of answers.**
>
> Every member is a possible answer under evaluation. A standard Genetic Algorithm still returns one result at the end. Returning several genuinely different solutions is a separate problem, and it belongs to multi-objective optimisation rather than to this week.

### Replace one candidate with many

Return to the knapsack representation from Week 5. A candidate is five bits, one per item:

```text
A B C D E
0 1 1 0 1
```

A population is simply several of those at once:

```text
01101   00111   10110   01010
10000   00110   01001   00011
```

Now the search occupies several parts of the candidate space at the same time, which changes what *getting stuck* means.

<!-- ct319:focus -->

If one candidate sits in a poor region, others may still be somewhere useful. No single candidate carries the whole search any more.

<!-- ct319:endfocus -->

![The same two-peak landscape searched by one candidate and then by a population of eight](../../media/week-06/trajectory-vs-population.svg "hero")

<sub><em>Figure 1. Weeks 4–5 move one candidate along one trajectory. This week spreads candidates across the landscape so more than one region is represented at once. Diagram created for these pages; no external image licence is used.</em></sub>

### More candidates do not automatically mean better search

A population creates possibilities and it creates cost. If every candidate must be evaluated, a population of `100` needs roughly a hundred evaluations per generation. A larger population covers more of the space and demands more computation, which is the same trade-off as always: **broader search usually costs more**.

<!-- ct319:focus -->

Population-based search is not free parallel intelligence. It is a different way of allocating search effort.

<!-- ct319:endfocus -->

<!-- ct319:beat -->
## Fitness turns candidates into comparable solutions

The formal notes introduce the metaphor as a mapping: an **environment** becomes a problem, an **individual** becomes a solution, and **fitness** becomes that solution's value — which in turn becomes its chance of seeding new solutions.

For knapsack we use the five items from the formal example, and state the capacity explicitly so that every number on this page can be checked:

| Item | A | B | C | D | E |
|---|---:|---:|---:|---:|---:|
| **Weight** | 12 | 2 | 1 | 1 | 4 |
| **Value** | 4 | 2 | 2 | 1 | 10 |

with a capacity of **12**. So `01101` selects B, C and E, weighs `2 + 1 + 4 = 7` and is worth `2 + 2 + 10 = 14`.

A candidate that exceeds the capacity is not a solution at all. We give it a fitness of `0`, which keeps it visible in the population while making it unusable by selection. The best feasible candidate for this instance is `01111` — items B, C, D and E, weight 8, value **15**.

> [!NOTE]
> **Fitness is problem-specific.** Here larger is better. Elsewhere a cost may be minimised instead. What matters is that the algorithm has one consistent way to compare candidates.

<!-- ct319:focus -->

Fitness is what makes a population more than a pile of bit strings. Without one consistent evaluation there is nothing for selection to prefer, and the population is just storage.

<!-- ct319:endfocus -->

<!-- ct319:beat -->
## Where a population starts

The formal notes describe the initial population as fixed in size, usually generated randomly within the problem's constraints, and ideally holding candidates with diverse characteristics — because **diversity is a major consideration**.

The reason is easy to see. Compare a population of six different bit strings with a population of the same string repeated six times. Both contain six candidates.

<!-- ct319:focus -->

Only one contains any variation, and a population with no variation has numbers but no breadth.

<!-- ct319:endfocus -->

Here is a real generation 0, drawn randomly by the Population Lab:

![Eight candidates with weights, values, fitness and selection-wheel shares; four are over capacity with fitness zero](../../media/week-06/population-fitness.png "wide")

<sub><em>Figure 2. Generation 0 for seed 39. Four of the eight random candidates exceed the capacity of 12 and score `0`, so they take no share of the selection wheel. The best candidate here is `00101` — items C and E, worth 12. Screenshot created for these pages from the Population Lab; no external image licence is used.</em></sub>

Notice that random initialisation within a constrained problem routinely produces infeasible candidates. How an implementation handles them is a design decision, not a detail.

<!-- ct319:focus -->

### Why this matters this week

Week 5 tried to help one solution escape. This week changes the architecture: a population gives us several candidates, fitness gives us a way to compare them, and diversity keeps different possibilities alive.

Now we need a mechanism for turning one population into the next.

<!-- ct319:endfocus -->

<!-- ct319:beat -->
## Evolve a solution — selection, crossover and mutation

The formal material presents a Genetic Algorithm as initialisation followed by a repeating loop of selection, crossover and mutation, ending at a stopping condition.

![The genetic algorithm loop: initialise, evaluate, select, crossover, mutate, and back to evaluate](../../media/week-06/ga-cycle.svg "hero")

<sub><em>Figure 3. Each stage contributes something different: fitness makes candidates comparable, selection biases the search, crossover recombines, mutation varies. Diagram created for these pages; no external image licence is used.</em></sub>

<!-- ct319:focus -->

The stages are not four names for the same thing. Each one does a job the others cannot, and the next four sections are about what each one actually contributes.

<!-- ct319:endfocus -->

<!-- ct319:beat -->
## Selection — who influences the next generation?

If every candidate had the same chance to reproduce, fitness would barely influence the search. Selection changes that. The formal notes describe choosing a portion of the population using a roulette-style draw in which **better solutions are given more probability of being selected**.

That wording is precise and worth keeping:

<!-- ct319:focus -->

- being better does **not** guarantee reproduction
- being worse does **not** guarantee disappearance

Because selection is probabilistic, the population can favour good candidates without collapsing to a single answer in one step.

<!-- ct319:endfocus -->

In Figure 2, `00001` holds 37% of the wheel and `00010` holds 3.7% — a strong bias, not a decision.

<!-- ct319:beat -->
## Crossover — combine parts of two candidates

Take two selected parents and cut them at the same point, then exchange the tails. With `11001` and `00110` cut after position 2, the formal notes produce `11110` and `00001`. This is **one-point crossover**; the slides also mention multi-point variants.

<!-- ct319:focus -->

> **crossover creates new combinations from material already present in the population**

It does not certify them. A child can be better than both parents, between them, or worse than both — fitness evaluation decides.

<!-- ct319:endfocus -->

And a crossover operator that makes sense for a bit string may make no sense for a route or a timetable, so **representation still matters**.

<!-- ct319:beat -->
## Mutation — introduce a small random change

After crossover, some children are mutated. For a bit string the formal notes show **bit-flip mutation**: pick a position at random and change it, turning `11110` into `10110`. The slides also mention swap mutation.

The computational role is what counts.

<!-- ct319:focus -->

Without mutation, the algorithm can only recombine information already in the population. Mutation can introduce a value that has gone missing entirely.

<!-- ct319:endfocus -->

<!-- ct319:beat -->
## One worked generation

Take the two fittest candidates from a population — `01101` (fitness 14) and `00111` (fitness 13) — and cut after position 3:

![Two parents crossing to produce the optimum and a second child, then a mutation that breaks the capacity](../../media/week-06/crossover-mutation.svg "hero")

<sub><em>Figure 4. Crossover of `01101` and `00111` at point 3 produces `01111`, weight 8 and value 15 — the best feasible candidate for this instance, and one neither parent held. Mutating bit A of the second child gives `10101`, weight 17, which breaks the capacity. Diagram created for these pages; no external image licence is used.</em></sub>

<!-- ct319:focus -->

Child 1 is better than either parent because each parent carried a different useful fragment. That is the attraction of crossover: the population can recombine partial structures that developed separately.

<!-- ct319:endfocus -->

Child 2's mutation shows the other half of the story.

> [!NOTE]
> **Crossover and mutation do not automatically preserve a problem's constraints.**
>
> An implementation may use a representation that can only produce valid candidates, reject or repair invalid ones, or penalise them through the fitness function. Here we reject: an over-capacity candidate scores `0`. This is Week 2's point again — **representation matters**, and so does what the operators are allowed to build.

<!-- ct319:beat -->
## When does a genetic algorithm stop?

Selection says *keep using what currently looks good*. Mutation says *do not let the population become too certain too early*. That is the exploitation-versus-exploration theme from simulated annealing, in a new form.

<!-- ct319:focus -->

<div class="lenses lenses--pair">
<div class="lens"><span class="lens__key">Selection without diversity</span><span class="lens__gloss">the population can collapse too early, and the search stops finding anything new</span></div>
<div class="lens"><span class="lens__key">Mutation without selection pressure</span><span class="lens__gloss">the search behaves randomly, and good structure is destroyed as fast as it appears</span></div>
</div>

The interesting behaviour lies between those extremes.

<!-- ct319:endfocus -->

### A Genetic Algorithm is not one exact implementation

The broad stages are stable, but population size, selection method, crossover method and rate, mutation method and rate, replacement strategy and stopping condition can all change. So *Genetic Algorithm* names a family of related implementations rather than one fixed piece of code.

### Three practical stopping conditions

The formal notes give three: a set number of generations, no improvement in the best solution for some number of generations, or a fitness value above a predefined threshold. They correspond to *we have spent our budget*, *the search appears to have saturated* and *this is good enough*.

<!-- ct319:focus -->

Notice what none of them establishes: that the result is the global optimum. Metaheuristic search usually stops because it is good enough or has stopped improving — not because optimality has been proved.

<!-- ct319:endfocus -->

### Why this matters this week

The search no longer moves one candidate through a neighbourhood. It transforms a population across generations, with selection biasing, crossover recombining and mutation varying.

That sounds powerful. But a whole population can still become too similar.

<!-- ct319:beat -->
## When evolution goes wrong — why diversity matters

Suppose that after several generations the population looks like this:

```text
01101
01101
01101
01101
01101
01101
```

The fitness is quite good — `01101` is worth 14, and the best possible is 15. But ask what crossover can do now. Take any two parents and cut them anywhere: both children are `01101` again.

<!-- ct319:focus -->

**Crossover cannot create novelty when the parents contain no variation to recombine.**

<!-- ct319:endfocus -->

This is the standard failure mode, and it has a name.

> [!IMPORTANT]
> **Premature convergence.**
>
> If the population becomes highly similar before it reaches a sufficiently good region of the search space, the Genetic Algorithm may suffer premature convergence: strong selection pressure removes variation, crossover stops producing anything new, and improvement stops even though better solutions exist.

<!-- ct319:focus -->

It is the population version of Week 5's problem. There, one solution was trapped in one local region. Here, many solutions become so similar that the whole population searches one narrow region. The algorithm still holds many individuals; from a search point of view they are nearly redundant.

<!-- ct319:endfocus -->

<!-- ct319:beat -->
## Watch it happen

The Population Lab runs exactly this. With the mutation rate set to `0`, the default run collapses:

![Eight identical candidates, one distinct, mean pairwise Hamming zero, stopped on no improvement](../../media/week-06/population-converged.png "wide")

<sub><em>Figure 5. The same seed as Figure 2, thirteen generations later with mutation switched off. Every candidate is `01101`; distinct candidates is 1 of 8 and mean pairwise Hamming distance is 0.00. The run stops on “no improvement”, holding 14 when 15 was available. Screenshot created for these pages from the Population Lab; no external image licence is used.</em></sub>

<!-- ct319:focus -->

The cruel detail is how close it got. `01101` and `01111` differ in exactly one bit — item D. No crossover of identical parents can ever add it. Only mutation can.

<!-- ct319:endfocus -->

### Measuring diversity

The lab reports two numbers, and they are not equally good.

**Distinct candidates** simply counts how many different bit strings the population holds. It is easy to read and it is a rough proxy for diversity, not a definitive metric: eight candidates that differ in one bit each score the same as eight that differ in four.

**Mean pairwise Hamming distance** is the average number of bit positions in which two members of the population differ. It reaches 0 only when every candidate is identical, and it degrades smoothly as variation drains away, which makes it the more informative of the two.

<!-- ct319:beat -->
## The mutation-rate experiment

Run the same algorithm twice from the same seed, changing only the mutation rate.

| Run A — mutation rate `0` | Run B — mutation rate `0.06` |
|---|---|
| ![Best fitness plateaus at 14 while mean pairwise Hamming falls to zero](../../media/week-06/trace-mutation-0.png) | ![Best fitness reaches 15 while mean pairwise Hamming stays above one](../../media/week-06/trace-mutation-006.png) |
| Best fitness stops at 14. Average fitness climbs to meet it. Diversity falls to zero and stays there. | Best fitness reaches the dashed line at 15. Diversity dips, recovers and never collapses. |

<sub><em>Figure 6. The same seed, the same population size, the same selection and crossover. The dashed green line is the best achievable fitness for this instance. Reading the purple diversity trace against the green best-fitness trace is the whole experiment. Screenshots created for these pages from the Population Lab; no external image licence is used.</em></sub>

<!-- ct319:focus -->

The useful question is not *which run scored higher*. It is:

> **What happened to diversity before the search stopped improving?**

That makes mutation's role visible as a search mechanism rather than a biological decoration.

<!-- ct319:endfocus -->

### Too little and too much

Too little mutation and selection gradually makes the population uniform, so the search becomes purely exploitative and converges early. Too much and useful structure is destroyed as fast as it is found, so the search drifts towards random sampling. There is no universal setting that is best for every problem.

### Fitness shapes the pressure

Selection is guided by fitness, so the shape of the fitness function influences the direction of the search. If one region scores much better early, selection may commit to it before alternatives have had time to develop. Which returns us to Week 2:

> **how we represent and evaluate a problem changes what the algorithm can discover**

<!-- ct319:focus -->

### Why this matters this week

Population-based search avoids placing the whole search on one trajectory, but it can still become trapped if the population loses variation. That makes **diversity** an active search resource rather than a pleasant property.

<!-- ct319:endfocus -->

We have now seen one population mechanism based on evolution. The second half of the week asks something different: can many simple agents produce useful search behaviour without any one agent knowing the whole solution?

<!-- ct319:beat -->
## No leader required — how can a colony search?

The formal *Other Meta Heuristic Searches* material introduces several population-based techniques inspired by collective behaviour. It lists many; we develop the underlying computational idea rather than memorising a catalogue of animal names.

### Ant Colony Optimisation

The notes describe Ant Colony Optimisation as inspired by ant behaviour and as a **multi-agent, collective, decentralised, self-organised** search. It was introduced by Marco Dorigo in 1992 and first applied to the Travelling Salesman Problem before being used for other routing problems.

The mapping the slides give is direct: nest and food become nodes in a graph, ants become artificial agents, pheromone becomes an artificial value on the graph, and foraging becomes **random walks guided by the pheromone**.

<!-- ct319:beat -->
## Route cost and pheromone are different things

This distinction carries the whole algorithm.

<!-- ct319:focus -->

A route has a **cost** — distance, time, energy — which is a fixed property of the problem. The algorithm separately maintains an **artificial pheromone** value on each edge, which is search information the colony accumulates and which changes as ants explore.

> **Pheromone is not the route cost. It is a reinforced signal stored in the environment rather than inside any agent.**

<!-- ct319:endfocus -->

![A route graph at round 1, with near-uniform pheromone on every edge](../../media/week-06/pheromone-round-1.png "hero")

<sub><em>Figure 7. Round 1. Every edge started at τ = 1.00 regardless of its cost, and one round of ants has barely moved it. Screenshot created for these pages from the Population Lab; no external image licence is used.</em></sub>

![The same graph after twenty rounds, with pheromone concentrated on the cheapest route](../../media/week-06/pheromone-round-20.png "hero")

<sub><em>Figure 8. Round 20 of the same run. The printed costs are identical to Figure 7 — nothing about the problem changed. Pheromone has concentrated on `NEST → C → Y → FOOD`, the cheapest of the six routes at 5, while the rest has evaporated towards zero. Screenshot created for these pages from the Population Lab; no external image licence is used.</em></sub>

<!-- ct319:beat -->
## Reinforcement and evaporation

An individual ant has only local information. It chooses where to move next, completes a route, and its route contributes to the colony's shared signal. The next ant then searches an environment whose pheromone has changed.

The formal algorithm updates pheromone **using the tour cost**, so cheaper routes deposit more. That is **reinforcement**, and on its own it is unstable: an early accidental preference would keep being reinforced simply because it keeps being sampled.

Practical ACO therefore pairs it with **evaporation** — every edge loses a fraction of its pheromone each round, before the new deposits are added.

<!-- ct319:focus -->

<div class="lenses lenses--pair">
<div class="lens"><span class="lens__key">Evaporate</span><span class="lens__gloss"><code>τ ← (1 − ρ) × τ</code><br>every edge loses a share of its old value, so old information fades</span></div>
<div class="lens"><span class="lens__key">Reinforce</span><span class="lens__gloss"><code>τ ← τ + Q / cost</code><br>every ant adds to the edges it used, and cheaper routes add more</span></div>
</div>

Reinforcement strengthens the evidence for routes that turned out well. Evaporation weakens old information, so the signal reflects recent routes rather than everything ever deposited.

<!-- ct319:endfocus -->

Without evaporation, nothing is ever forgotten: the initial uniform pheromone and every early accidental deposit stay in the totals, and the colony takes far longer to commit to anything. This is the exploration-and-exploitation balance again, now stored in the environment rather than in a temperature or a mutation rate.

> [!NOTE]
> **Artificial ants do not simply take the strongest edge.**
>
> They choose **probabilistically**, with the chance of each edge influenced by its pheromone *and* by problem-specific information such as distance. An edge with the most pheromone is the most likely next step — not the certain one. That is what stops one early reinforcement from closing the search down.

### Which ant knows the best route?

<!-- ct319:focus -->

Possibly none of them. Each ant completes one route using local information and a random draw. The useful search behaviour belongs to the **colony-level process**, and it is stored in the pheromone values rather than in any individual.

<!-- ct319:endfocus -->

<!-- ct319:beat -->
## Metaphor is not mechanism

The slides use bees as a second collective example, in phases: scouts explore for food sources, sources are exploited, returning bees communicate quality through a waggle dance, better sources attract more recruits through positive feedback, and scouts resume exploring when a source is exhausted.

The recurring pattern is what to take away:

<ol class="flow" aria-label="The collective search cycle, in order">
<li><span>explore</span></li>
<li><span>evaluate</span></li>
<li><span>communicate</span></li>
<li><span class="is-pivot">reinforce</span></li>
<li><span>explore again</span></li>
</ol>
<p class="flow__note">That is conceptually related to Ant Colony Optimisation even though the metaphor and the algorithm differ. The highlighted step is the one that makes the cycle a search rather than a survey.</p>

### Evolution and collective intelligence are not the same algorithm

A Genetic Algorithm keeps a population of candidate solutions and transforms it by selection, crossover and mutation across generations. Ant Colony Optimisation keeps a population of agents that construct routes and share a pheromone signal. Artificial Bee Colony keeps agents that explore, evaluate and recruit towards better sources.

They are not interchangeable, and the formal notes are explicit that **there is no best algorithm among them** — each has strengths and weaknesses and suits particular purposes. What they share is a move away from one-current-solution search.

### Do not confuse metaphor with mechanism

It is easy to remember a list of animals and forget what the algorithms do. A metaphor is only useful once we can translate it into computation.

| Ant Colony Optimisation | | Genetic Algorithm | |
|---|---|---|---|
| ant | artificial search agent | individual | candidate solution |
| route | candidate solution | fitness | evaluation |
| pheromone | shared search signal | reproduction | generation of new candidates |
| reinforcement | stronger influence on future choices | mutation | variation |

<!-- ct319:focus -->

If we cannot make that translation, the animal name has not taught us anything. Nature-inspired optimisation is not about copying an animal story — it is about identifying a search mechanism and implementing that mechanism computationally.

<!-- ct319:endfocus -->

### Why this matters this week

We began by representing one problem, searched it blindly, added heuristic guidance, improved one candidate locally, gave that candidate ways to escape, and now let many candidates or agents contribute at once.

The recurring lesson is not that one algorithm is smartest. It is that **changing the information, representation and search structure changes what becomes possible**.

<!-- ct319:endbeats -->

## The Population Lab

🧪 **[Open the Population Lab](../../population-lab/)**

Two views on the same page. Both are seeded, so a given seed replays the same run exactly.

**Evolution** runs the genetic algorithm above on the five-bit knapsack, showing the population with weights, values, fitness and selection-wheel shares, then the parents, crossover point, children and mutations that build each new generation.

**Colony** runs ant colony optimisation on a six-route graph, printing each edge's cost and pheromone separately and showing the probability of each route on the next round.

The lab exposes the search mechanism. It is not a production optimiser.

### Try it yourself

1. Keep the default seed `39`. Drag **mutation rate** to `0`, reset, and run to the end.
2. Read the metrics: best fitness, distinct candidates, mean pairwise Hamming.
3. Set the mutation rate to `0.06`, reset, and run again from the same seed.
4. Compare the two traces. Ask what happened to diversity *before* improvement stopped.
5. Switch to **Colony**, run with **evaporation** at `0.30`, and watch pheromone concentrate on the cost-5 route.
6. Step a few rounds and read the choice panel: the strongest edge is the most likely next step, never a certainty.
7. Reset with evaporation at `0` and run again. Nothing is forgotten, so the colony stays undecided for much longer.

---

## Before Week 7

Week 7 is the **MCQ assessment and revision point**, so this week closes the first search block rather than opening a new algorithm.

![Weeks 2 to 6 in sequence, and the four modelling choices that run through all of them](../../media/week-06/search-recap.svg "hero")

<sub><em>Figure 9. The five-week progression, and the four modelling choices that recur in every one of them. Diagram created for these pages; no external image licence is used.</em></sub>

Change any one of those four choices and the search behaviour can change dramatically while the underlying problem stays exactly where it was.

<!-- ct319:focus -->

A useful revision question for the whole block is therefore:

> **When you change the representation, information, neighbourhood or number of candidates, what exactly changes about the search?**

<!-- ct319:endfocus -->

---

## Quick revision

If you can answer these without reopening the page, you have the core of this week.

1. **[WK-06-01]** What is the main structural difference between local search and population-based search?
2. Why is diversity useful in an initial population, and why does random initialisation often produce infeasible candidates?
3. **[WK-06-02]** What different roles do selection, crossover and mutation play in a Genetic Algorithm?
4. Why does crossover not guarantee that a child is better than its parents, and why can it produce an invalid one?
5. **[WK-06-03]** What is premature convergence, and what happens to crossover once it has occurred?
6. Why is “number of distinct candidates” only a rough proxy for diversity?
7. **[WK-06-04]** In Ant Colony Optimisation, what is the difference between route cost and artificial pheromone, and what does evaporation contribute that reinforcement does not?
8. Why do artificial ants choose probabilistically rather than always taking the strongest edge?

---

## Sources and licensing notes

### CT319 source material

This week combines selected material from two formal CT319 lectures on Canvas.

*Meta Heuristic Search / Genetic Algorithms* supplies the move from one current solution to a population, Darwinian evolution as a computational metaphor, the environment/individual/fitness mapping, GA initialisation with diversity as “a major consideration”, roulette-style selection in which better solutions receive more probability, one-point crossover, bit-flip and swap mutation, the three stopping conditions, and the observation that improvement saturates in later generations.

*Other Meta Heuristic Searches* supplies Ant Colony Optimisation — Dorigo 1992, TSP first, multi-agent and decentralised, with nest and food as nodes, artificial pheromone, and foraging as random walks guided by pheromone — the Artificial Bee Colony phases, and the closing recap that no one algorithm among these is best.

Three points are handled more explicitly here than in the slides:

- **Premature convergence** is named. The slides describe diversity as important and improvement as saturating; this page connects the two and gives the standard term.
- **Pheromone evaporation** is added. The slides describe reinforcement using tour cost but not decay. Evaporation is part of standard ACO and is included so the reinforcement story is not left unbalanced.
- **Probabilistic route choice** is stated. The slides describe foraging as random walks guided by pheromone; this page makes the “not simply the strongest edge” consequence explicit.

The formal slides list further metaheuristics — Grey Wolf, Firefly, Bat, Cuckoo Search and others. These pages do not reproduce that catalogue. Multi-objective optimisation is also raised in the slides as the topic of CA1 and a separate guest lecture, and is deliberately not taught here.

### Examples

The Genetic Algorithm examples reuse the five-bit knapsack representation from Week 5, and the item weights and values are the ones in the formal knapsack example: A `12/4`, B `2/2`, C `1/2`, D `1/1`, E `4/10`.

The **capacity is stated on this page as 12**. The slides run hill climbing on those items without printing the capacity in the material reproduced here. That run is consistent with any capacity from 12 to 15, and `01111` — items B, C, D and E, weight 8, value 15 — is the best feasible candidate across that whole range, so no claim on this page depends on the exact figure. Every fitness value shown is derived from those weights, values and capacity, and is checked by the lab's test suite.

The colony example uses a purpose-built six-route graph rather than a TSP instance, so that pheromone reinforcement and evaporation stay visible on one screen.

### Figures

Figures 1–9 were **created for these pages**. They use no external image licence.

- Figures 1, 3, 4 and 9 are original diagrams.
- Figures 2, 5, 6, 7 and 8 are Population Lab screenshots. The values shown are the values the lab computes for those seeds and settings.

No external images, videos, papers or interactives are used.

### Software

- 🧪 [**Population Lab**](../../population-lab/) — written for this module in HTML, CSS and vanilla JavaScript. No framework, backend, API or build step, matching the Search Lab used in Weeks 2–5.

The implementation is split by responsibility: `knapsack.js` holds the items, capacity, feasibility rule and fitness; `evolution.js` holds selection, crossover, mutation and the diversity measures; `colony.js` holds the route graph, pheromone, reinforcement and evaporation; `app.js` holds only controls and rendering.

Feasibility handling is not hidden. An over-capacity candidate is **rejected by giving it a fitness of `0`**, which is stated in the interface, shown in the population table, and reported in the “over capacity” metric. The genetic algorithm also keeps the single best candidate unchanged each generation, which is stated in the interface, so the best-fitness trace can be read as progress.

Run the checks with:

```sh
node population-lab/test-population.js
```
