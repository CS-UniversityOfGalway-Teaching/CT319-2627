---
title: Week 5 — Local search and getting stuck
eyebrow: CT319 Artificial Intelligence · Week 5 · Local search and getting stuck
question: How can a local search escape when immediate improvement is not enough?
description: CT319 Week 5. Random restarts, variable neighbourhood search and simulated annealing — three escapes from a local optimum, each changing exactly one design choice.
bar: Week 5 · Sections
source: week-05.md
---

Week 4 ended with a machine that had not run out of legal moves.

![Stuck at (4,8): every legal move makes h worse](../../media/week-05/trap-at-4-8.svg "hero")

<sub><em>Figure 1. At `(4,8)` the heuristic reads `h = 2`, and both legal neighbours read `h = 3`. `DOWN` is a wall and there is no column 9, so the strict rule has nothing it is willing to move to — with the goal four moves away. Diagram created for these pages; no external image licence is used.</em></sub>

Strict hill climbing stops.

<!-- ct319:focus -->

> **It has not run out of legal moves. It has run out of moves its current rule is willing to accept.**

<!-- ct319:endfocus -->

Hill climbing is already a **local-search** method: it keeps one current candidate, inspects nearby alternatives and decides where to move. Week 4 used the simplest and strictest version of that rule. This week asks what else a local search can do when strict improvement runs out.

We work through four things.

* We begin with [**getting stuck**](#getting-stuck--local-best-is-not-global-best), and separate “no better neighbour exists” from “no better solution exists”. That separation exposes the three things a local search can change.
* [**Try somewhere else**](#try-somewhere-else--does-the-start-decide-the-finish) keeps the rule identical and moves the starting candidate instead.
* [**Change what nearby means**](#change-what-nearby-means) keeps the starting point and enlarges the set of candidates the search is allowed to inspect.
* [**Sometimes go the wrong way**](#sometimes-go-the-wrong-way--simulated-annealing) keeps both, and changes which moves the search is willing to accept.

Three design choices carry the page, and it is worth keeping them apart:

<!-- ct319:focus -->

<div class="lenses">
<div class="lens"><span class="lens__key">Start</span><span class="lens__gloss">where the search begins</span></div>
<div class="lens"><span class="lens__key">Neighbourhood</span><span class="lens__gloss">which alternatives the search is willing to inspect</span></div>
<div class="lens"><span class="lens__key">Acceptance</span><span class="lens__gloss">which of those candidates the search is willing to move to</span></div>
</div>

<!-- ct319:endfocus -->

<!-- ct319:beats -->

<!-- ct319:beat -->
## Getting stuck — local best is not global best

Strict hill climbing has one rule:

> move only to a strictly better neighbour

When no such neighbour exists, it stops. That tells us something exact about the **neighbourhood around the current candidate**. It tells us nothing about the rest of the search space.

<!-- ct319:focus -->

A **local optimum** is a candidate better than everything immediately around it. A **global optimum** is the best candidate in the whole search space. These are different claims, and the first does not imply the second:

> **“No better neighbour exists” is not the same statement as “no better solution exists.”**

<!-- ct319:endfocus -->

![A local optimum is not a global optimum](../../media/week-05/local-vs-global.svg "hero")

<sub><em>Figure 2. The same profile Week 4 used, drawn as a valley because lower `h` is better. The search sits on the floor of a shallow basin at `(4,8)`, where both neighbours stand at `h = 3`. The red span is the whole of what “no better neighbour” describes; the deeper valley beyond it is untouched by that claim. Diagram created for these pages; no external image licence is used.</em></sub>

### The maze makes the gap concrete

At `(4,8)`, `h = 2`, and both legal neighbours have `h = 3`. Under our rule — smaller `h` is better — `(4,8)` is a **local minimum of the heuristic function** for this neighbourhood.

Yet the goal is reachable. Week 4 traced the route:

![The escape route from (4,8) to the goal](../../media/week-05/escape-route.svg "hero")

<sub><em>Figure 3. The four-move route to the goal, with `h` running `2 → 3 → 2 → 1 → 0`. Only the first step is uphill, and it is exactly the step a strictly improving rule refuses — which is why this route is invisible to it. Diagram created for these pages; no external image licence is used.</em></sub>

The search space contains a better state. The algorithm simply cannot reach it while obeying its own acceptance rule, because the first move on that route makes the heuristic worse.

> [!IMPORTANT]
> **Local search gets stuck because its decisions are local.**
>
> It can act only on the candidates it is willing to inspect and the moves it is willing to accept.

<!-- ct319:beat -->
## What can actually change?

The maze, the walls, the goal, the legal moves and Manhattan distance are all fixed. Being stuck is not evidence that the problem is unsolvable, so it is worth asking precisely:

<!-- ct319:focus -->

> **What can the algorithm change without changing the underlying optimisation problem?**

<!-- ct319:endfocus -->

There are exactly three answers, and the rest of this page is each one in turn:

```text
1. START somewhere else
2. inspect a different NEIGHBOURHOOD
3. change the ACCEPTANCE rule
```

![Strict hill climbing stops at (4,8); three panels name what can change: START, NEIGHBOURHOOD, ACCEPTANCE](../../media/week-05/trap-three-choices.svg "hero")

<sub><em>Figure 4. At `(4,8)` both legal moves score `h = 3` and the strict rule rejects both, so the search stops with legal moves still available. The three panels name the design choices this week can vary. Diagram created for these pages; no external image licence is used.</em></sub>

Notice what is *not* on that list. We are not changing the maze, and we are not changing Manhattan distance. A different heuristic is a different experiment; these three are changes to the **search**, not to the problem.

<!-- ct319:focus -->

### Why this matters this week

Week 4 showed a heuristic-guided method getting trapped. This week explains why, and the answer is not “hill climbing is bad”:

> **a local method can only act on the possibilities and acceptance rules we give it**

The cheapest of the three changes comes first. What if we simply start somewhere else?

<!-- ct319:endfocus -->

<!-- ct319:beat -->
## Try somewhere else — does the start decide the finish?

The formal CT319 notes give this as the first idea for improving hill climbing:

<!-- ct319:focus -->

> **run hill climbing several times, from different initial solutions**

<!-- ct319:endfocus -->

Nothing about the climbing rule changes. The starting candidate decides which region of the search space the algorithm meets first, and a strict climber can only improve from where it already is.

![A landscape with two peaks: Start A climbs to a local optimum, Start B climbs to the global optimum](../../media/week-05/different-starts.svg "hero")

<sub><em>Figure 5. The same deterministic rule, neighbourhood and evaluation function, run twice. Start A reaches a local optimum; Start B reaches a better one. Only the initial candidate differs. Diagram created for these pages; no external image licence is used.</em></sub>

Repeating the search from randomly chosen initial candidates and keeping the best result is commonly called **random-restart hill climbing**. The name matters less than the change it makes:

<!-- ct319:focus -->

What changes is **`START`**. The hill-climbing rule itself is untouched.

<!-- ct319:endfocus -->

### One run is evidence about one region

A single hill-climbing run tells us where the algorithm ends *from that starting point*. That is much weaker than a claim about the whole search space. Several starts give evidence from several regions:

![Four starts, three outcomes](../../media/week-05/restart-outcomes.svg "hero")

<sub><em>Figure 6. Four starts under the same rule reach three outcomes: `1` and `3` both end at `A`, so four runs sample only three regions. `C` is the best seen, which is not the same as the best there is. Diagram created for these pages; no external image licence is used.</em></sub>

We keep the best result seen. But we still cannot say it is globally optimal — only that four starts found nothing better.

### Why not restart from everywhere?

<!-- ct319:focus -->

Because that is exhaustive search again, and avoiding exhaustive search was the point. The trade-off is direct:

```text
more restarts
→ more regions sampled
→ more computation
```

![Restarting from everywhere is exhaustive search](../../media/week-05/restart-everywhere.svg "hero")

<sub><em>Figure 7. Taken to its limit, using every candidate as a start visits every candidate — the exhaustive search restarting was meant to avoid. The useful question is not whether to restart, but how many restarts are worth their cost. Diagram created for these pages; no external image licence is used.</em></sub>

<!-- ct319:endfocus -->

### Random does not mean careless

Initial candidates are often generated randomly, and that is worth reading carefully. Each individual run can still follow a completely deterministic improvement rule. The randomness changes **where we begin**, not **how we climb**.

This is a general pattern worth carrying forward: **randomness can be a mechanism for exploration**. Simulated annealing, later this week, puts randomness to a different job in a different place — deciding which moves to accept rather than where to start.

<!-- ct319:focus -->

### Why this matters this week

Restarting avoids trusting a single local optimum too much. But every run still uses the same neighbourhood, so every run is still blind to the same alternatives. If the better candidate lies just outside what our neighbourhood can see, restarting only re-samples the same blindness.

That points at the second change: **what counts as nearby?**

<!-- ct319:endfocus -->

<!-- ct319:beat -->
## Change what "nearby" means

We need a second problem here, and the **knapsack problem** is the right one: five items, each with a weight and a value, and a bag that can only carry so much. Choose the subset worth the most that still fits. Its representation makes “nearby” something we can literally count.

A candidate is a bit string over five items:

![A knapsack candidate is a bit string over five items](../../media/week-05/knapsack-candidate.svg "hero")

<sub><em>Figure 8. One slot per item: `0` leaves the item out, `1` takes it. The example `01101` means take B, C and E. Every candidate the search can hold is one of the 32 strings this representation allows. Diagram created for these pages; no external image licence is used.</em></sub>

> [!NOTE]
> **Heuristic estimate and evaluation function are not universal synonyms.** An evaluation function supplies the score used to compare candidates. In the maze we chose the remaining-cost estimate `h(state)` as that score. Knapsack instead scores the candidate's quality — total value within capacity — and estimates no remaining distance at all.

Take a one-bit change as the neighbourhood operator. From `00000`, that gives exactly five candidates — take A, take B, take C, take D, take E.

Now allow two bits to change at once. For five items there are

```text
C(5,2) = 4 + 3 + 2 + 1 = 10
```

two-item combinations, so the larger neighbourhood exposes ten candidates from the same current solution.

![Concentric rings around the candidate 00000: an inner ring of five one-bit neighbours and an outer ring of ten two-bit neighbours](../../media/week-05/knapsack-neighbourhoods.svg "hero")

<sub><em>Figure 9. The same current solution under two neighbourhood definitions. The inner ring holds the five candidates one bit away; the outer ring holds the ten candidates two bits away. Nothing about the problem changed — only the operator that decides which candidates count as neighbours. Diagram created for these pages; no external image licence is used.</em></sub>

The comparison the formal notes draw is exactly this trade-off:

| | Small neighbourhood | Larger neighbourhood |
|---|---|---|
| **Operator** | change 1 item | change 2 items |
| **Candidates** | 5 | 10 |
| **Cost per iteration** | cheap | higher |
| **Chance of an escape** | lower | higher |

<!-- ct319:beat -->
## The escape may be two changes away

Suppose every one-bit neighbour of the current solution is worse. Strict hill climbing using that neighbourhood stops.

Now suppose one two-bit neighbour has a better feasible evaluation. That candidate was always in the search space. The algorithm simply did not classify it as a neighbour.

![An escape that only a larger neighbourhood can see](../../media/week-05/two-bit-escape.svg "hero")

<sub><em>Figure 10. Every candidate on the inner ring is one bit away and worse, so the strict rule stops at the centre. One candidate on the outer ring is two bits away and better — always present in the search space, never offered by the one-bit operator. Drawn schematically, since which bits change depends on the item weights and values. Diagram created for these pages; no external image licence is used.</em></sub>

So the sentence:

> this candidate is locally optimal

always means:

> this candidate is locally optimal **under this neighbourhood definition**

Change the definition and the conclusion can change with it. Sometimes the escape is not to accept a worse candidate — it is to redefine what counts as nearby.

<!-- ct319:beat -->
## Variable neighbourhood search

The formal notes call the resulting method **Variable Neighbourhood Search (VNS)**, described as hill climbing with two neighbourhoods defined instead of one:

```python
current = initial_solution

while True:
    better = best_improvement(current, neighbourhood="small")

    if better is not None:
        current = better
        continue                    # stay in the small neighbourhood

    better = best_improvement(current, neighbourhood="large")

    if better is not None:
        current = better
        continue                    # move, then go back to the small one

    break
```

![The VNS loop: stay in the small neighbourhood while it improves, escape through the larger one, then return](../../media/week-05/vns-behaviour.svg "hero")

<sub><em>Figure 11. VNS inspects the small neighbourhood first and only reaches for the larger one when the small one offers no improvement. After a successful larger move it returns to the small neighbourhood. Diagram created for these pages; no external image licence is used.</em></sub>

### Why return to the small neighbourhood?

<!-- ct319:focus -->

This is the trade-off worth arguing about, because **bigger is better** is the tempting wrong answer.

<!-- ct319:endfocus -->

- Small neighbourhoods are **cheaper** to inspect, and most iterations are ordinary improving iterations.
- After escaping into a new region, cheap improvements are often available again.
- The larger neighbourhood is an **escape mechanism**, not a permanent setting.

VNS does not say *always use the largest neighbourhood*. It says **change neighbourhood when the current one stops being useful**, and change back when it becomes useful again.

<!-- ct319:beat -->
## A neighbourhood is a design decision

This connects straight back to Week 2:

![Three decisions define what a local search can see](../../media/week-05/representation-neighbourhood-evaluation.svg "hero")

<sub><em>Figure 12. The three decisions made before the search runs, and what each looks like in the maze and in knapsack. Fix all three and you have fixed what the search is able to see; nothing outside them exists as far as the algorithm is concerned. Diagram created for these pages; no external image licence is used.</em></sub>

The one-bit/two-bit idea makes sense for a bit string and no sense at all for something else. In a route problem a neighbourhood might mean reversing part of a route; in scheduling, swapping two jobs; in the maze, moving to a legal adjacent cell.

> [!NOTE]
> **“Neighbourhood” is a computational definition, not a physical fact.**
>
> The algorithm can inspect only what the representation and the neighbourhood operator make available.

<!-- ct319:focus -->

### Why this matters this week

VNS escapes by changing what the algorithm is allowed to *inspect*. But there is one more possibility, and the maze has been demonstrating it since Week 4.

At `(4,8)` the useful move is already in the small neighbourhood. It is legal, it is one step away, and the rule refuses it — because it looks worse.

What happens if we sometimes say yes?

<!-- ct319:endfocus -->

<!-- ct319:beat -->
## Sometimes go the wrong way — simulated annealing

<!-- ct319:focus -->

> **What if escaping requires getting worse first?**

<!-- ct319:endfocus -->

At `(4,8)` the current heuristic is `2` and both legal exits score `3`. Strict hill climbing says `worse → reject`, and that single rule is the whole trap.

Simulated annealing changes only the acceptance rule:

```text
better move
→ accept

worse move
→ maybe accept
```

<!-- ct319:focus -->

The important word is **maybe**. Accepting *every* worse move would discard the heuristic and let the search wander; accepting none is exactly the behaviour that got stuck. Simulated annealing sits between the two, and controls where.

<!-- ct319:endfocus -->

### So what is simulated annealing?

The name comes from metallurgy: heat a metal and its atoms move freely; cool it slowly and they settle into a low-energy arrangement. Cool it too fast and they freeze into a bad one.

The search borrows the schedule, not the physics. A **temperature** starts high and falls as the run goes on, and it controls one thing only — how willing the search is to accept a move that makes the evaluation worse:

- a **better** move is always accepted
- a **worse** move is accepted with a probability that falls as the temperature falls

Early, while the temperature is high, that willingness buys escape from whatever basin the search happens to be in. Late, when it is low, the willingness is gone and the run settles instead of wandering forever.

![What simulated annealing does](../../media/week-05/annealing-explained.svg "hero")

<sub><em>Figure 13. The same rugged profile, with one run drawn across it. A strictly improving rule stops in the first basin. Annealing accepts the worse moves in red, climbs out while the temperature is high, and settles into the deepest basin once it has cooled. Diagram created for these pages; no external image licence is used.</em></sub>

<!-- ct319:beat -->
## Temperature controls the willingness

The formal notes motivate that control with the slow cooling of metal. The useful part for us is the behaviour it describes:

```text
HIGH TEMPERATURE
more exploratory · a worse move is often accepted

        ↓

MEDIUM TEMPERATURE
some willingness to worsen remains

        ↓

LOW TEMPERATURE
conservative · mostly prefers improvement
```

Early in the search a substantial decrease in value can be tolerated. Later, less. Near the end, almost none — and the method behaves much like strict hill climbing again.

> [!NOTE]
> **What controls “maybe”?**
>
> A common simulated-annealing rule is
>
> `P(accept a worse move) = exp(-Δ / T)`
>
> where `Δ` is how much worse the candidate is and `T` is the current temperature. Larger worsening is less likely to be accepted; higher temperature makes worsening more likely to be accepted. You do not need to derive this expression to read the behaviour off the run.

Two relationships are enough:

```text
small penalty → easier to accept        large penalty → harder to accept
high T        → easier to accept        low T         → harder to accept
```

<!-- ct319:beat -->
## Watch it happen at (4,8)

The Search Lab has an **Anneal** mode that runs this rule on the unchanged maze.

**Seeded** is worth a reminder from Week 2. The accept-or-reject draw is random, but the randomness comes from a generator started at a fixed number — the *seed*. The same seed always produces the same sequence of draws, and therefore the same run, move for move. Change the seed and you get a different run of the same algorithm. So a seeded run is reproducible rather than lucky: what you see again is the mechanism, not one fortunate outcome.

With the default seed `743` and the Week 2 successor order, the run descends to `(4,8)` in fourteen steps — arriving at the exact Week 4 trap — and then meets the same two worse-looking moves. It refuses one and takes the other.

| Step 15 — rejected | Step 16 — accepted |
|---|---|
| ![At (4,8) the lab proposes UP to (3,8), delta plus one, and rejects it](../../media/week-05/anneal-reject-4-8.png) | ![At (4,8) the lab proposes LEFT to (4,7), delta plus one, and accepts it](../../media/week-05/anneal-accept-4-8.png) |
| `UP → (3,8)`, `Δ = +1`, `T = 2.10`, `P = 0.622`, draw `0.831` → **reject** | `LEFT → (4,7)`, `Δ = +1`, `T = 1.98`, `P = 0.603`, draw `0.198` → **accept** |

<sub><em>Figure 14. Two consecutive steps at the same state, under almost the same temperature and almost the same probability. The rule is not “accept worse moves”; it is “accept a worse move with a controlled probability”. Screenshots created for these pages from the Search Lab; no external image licence is used.</em></sub>

The accepted move is `LEFT → (4,7)` — precisely the move Week 4's strict rule rejected. From there the run continues `(5,7) → (6,7) → (6,8)` and finishes.

![The completed annealing run: goal reached in 16 moves with one worse move accepted](../../media/week-05/anneal-complete.png "wide")

<sub><em>Figure 15. The same seeded run reaches `(6,8)` in 16 moves, having accepted exactly one worse move and rejected seven others along the way. On the same maze, the strict rule that enters `(4,8)` stops there permanently. Screenshot created for these pages from the Search Lab; no external image licence is used.</em></sub>

> [!IMPORTANT]
> **In this maze every legal move changes `h` by exactly one.**
>
> Four-direction movement changes one coordinate by one, so `Δ` is always `+1` or `−1`. That makes the maze a clean demonstration of the **temperature** half of the rule: with the penalty fixed, only `T` decides how willing the search is. A problem with varying penalties would exercise the other half.

<!-- ct319:beat -->
## Can it still fail?

Yes, and it is worth saying so plainly.

```text
cool too quickly → becomes greedy early → may still get stuck
cool more slowly → explores longer      → costs more computation
```

The sequence of temperatures is the **cooling schedule**, and no single schedule is best for every problem. A run can also spend its budget in poor regions, or cool without ever reaching the goal — the Search Lab reports exactly that when it happens.

The claim is not that simulated annealing solves local search. It is that:

> **allowing occasional worse moves gives the search an escape mechanism that strict hill climbing does not have**

<!-- ct319:focus -->

### Why this matters this week

Week 4 ended with a reachable goal the algorithm could not reach. The obstacle was never the maze. It was one line of the acceptance rule, and changing that line is enough to reopen the route.

<!-- ct319:endfocus -->

<!-- ct319:beat -->
## Three ways to escape

All three methods this week attack the same failure, and each changes exactly one design choice.

![From a stuck hill climber, three routes: START to random restart, NEIGHBOURHOOD to VNS, ACCEPTANCE to simulated annealing](../../media/week-05/three-escapes.svg "hero")

<sub><em>Figure 16. Each method changes one of the three design choices and leaves the other two alone. Diagram created for these pages; no external image licence is used.</em></sub>

**`START`** — begin from a different initial candidate, and keep the best result across runs. The rule that climbs is untouched. This is *random-restart hill climbing*.

**`NEIGHBOURHOOD`** — enlarge the set of candidates the search may inspect when the current set offers nothing, then return to the cheaper one. This is *Variable Neighbourhood Search*.

**`ACCEPTANCE`** — allow a temporarily worse move, with a probability that falls as the temperature falls. This is *simulated annealing*.

The comparison worth holding on to is not a ranking. It is that one broad problem, one representation and one evaluation function can produce three genuinely different searches, because three different design choices were varied.

<!-- ct319:endbeats -->

## Before Week 6

Every method on this page keeps **one current candidate** at the centre of the search.

![Four methods on the same rugged landscape](../../media/week-05/four-methods-landscape.svg "hero")

<sub><em>Figure 17. The same profile four times. Hill climbing stops in the first basin; random restart runs the same rule from three starts and keeps the best; VNS reaches past the ridge from where it is stuck; annealing climbs out and settles as it cools. Each keeps exactly one current candidate. Diagram created for these pages; no external image licence is used.</em></sub>

That is what makes them trajectory methods: a single path through the search space, one candidate handed to the next.

So there is an obvious question left:

<!-- ct319:focus -->

> **What if we searched with many candidate solutions at the same time?**

<!-- ct319:endfocus -->

Instead of one trajectory:

```text
solution → solution → solution → solution
```

we could maintain a **population**.

That is where Week 6 begins.

---

## Quick revision

If you can answer these without reopening the page, you have the core of this week.

1. **[WK-05-01]** Why does “no better neighbour exists” not prove that the current candidate is globally optimal?
2. What three design choices can we change when strict hill climbing gets stuck, and which of them changes the problem itself?
3. **[WK-05-02]** Why can the same deterministic rule return different results from different starting candidates?
4. What is the trade-off of using more restarts?
5. **[WK-05-03]** Why can enlarging the neighbourhood expose an improvement that a smaller one cannot reach?
6. Why does VNS return to the small neighbourhood after a successful move in the larger one?
7. **[WK-05-04]** Why can accepting a worse move help a local-search method, and why must that acceptance be controlled?
8. What roles do the size of the penalty and the temperature play in whether a worse move is accepted?

---

## Sources and licensing notes

### CT319 source material

This week's progression follows the existing CT319 *Lecture 4: Local Search* material on Canvas, in particular its treatment of:

- hill climbing's tendency to become stuck in local optima
- Idea 1 — running hill climbing from different initial solutions
- Idea 2a — performing a bigger jump, developed into Variable Neighbourhood Search
- the one-item and two-item knapsack neighbourhoods, and the 5-versus-10 candidate comparison
- small versus large neighbourhoods: few solutions and easy to compute, against many solutions and harder to compute
- the VNS algorithm, including its return to the small neighbourhood after a successful larger move
- Idea 2b — accepting a decrease in value for a short time, developed into Simulated Annealing, with the slow-cooling analogy
- the grouping of these methods as **local search**, or **trajectory methods**

Two things are more explicit here than in the slides. The three escape mechanisms are named as changes to **START**, **NEIGHBOURHOOD** and **ACCEPTANCE**, so the methods can be compared rather than listed. The acceptance probability `exp(-Δ/T)` is stated once as optional depth: the slides describe the cooling behaviour without requiring the expression, and the teaching spine here is the behaviour.

### Continuity from Week 4

The maze problem definition is inherited unchanged: a 7 × 9 grid, `START = (0,0)`, `GOAL = (6,8)`, the same walls and moves, and the same `neighbours(state)`, `is_goal(state)` and Manhattan `heuristic(state)`.

The Week 4 trap at `(4,8)` is both the opening anchor and the main simulated-annealing example, rather than a fresh artificial landscape, and the escape route `(4,8) → (4,7) → (5,7) → (6,7) → (6,8)` is the one Week 4 identified.

### Examples

The knapsack neighbourhood follows the binary representation used in the formal CT319 material — five items `A B C D E`, `0` for not selected and `1` for selected — and the neighbourhood sizes of 5 and 10 come directly from those slides.

The two-bit escape is stated **schematically** rather than as a specific bit-string transition. The slides give item weights and values, but the capacity that decides feasibility stays in the lecture, so this page makes no numerical claim about a particular improving candidate.

### Figures

Figures 1–7 were **created for these pages**. They use no external image licence.

- Figures 1, 2, 3, 4 and 7 are original diagrams.
- Figures 5 and 6 are Search Lab screenshots of the unchanged default maze, the Week 2 successor order and annealing seed `743`. The values shown — `Δ`, temperature, `P` and the random draw — are the values the lab computes for those steps.

No external images, videos, papers or interactives are used: the recurring maze, the formal knapsack representation and the Search Lab already cover the week.

### Software

- 🧪 [**Search Lab**](../../search-lab/) — the same artefact used in Weeks 3 and 4, extended this week with an **Anneal** mode:
  - one legal neighbour proposed per step, with the current state, current `h`, candidate state, candidate `h`, `Δ`, temperature, `P(accept)`, the random draw and the accept/reject result all displayed
  - a seeded generator and a fixed cooling schedule, so a given seed replays the same run exactly; the seed is editable on the page
  - a `COOLED WITHOUT REACHING THE GOAL` outcome when a run exhausts its step budget

  The lab remains a maze visualiser. Knapsack neighbourhoods and VNS are taught with Figures 3 and 4 rather than forced into the maze interface.

### Try it yourself

1. Select **Anneal** and keep the default maze, the order `UP → DOWN → LEFT → RIGHT` and seed `743`.
2. Step fourteen times. The current state is `(4,8)`, `h = 2` — the Week 4 stopping point.
3. Step once for the rejected proposal, once more for the accepted one, then run to the goal.
4. Switch to **Hill climb** with the order `UP → RIGHT → DOWN → LEFT`: same maze, same heuristic, different acceptance rule, different outcome.
5. Change the seed and re-run: the mechanism is general, the particular run is not.
