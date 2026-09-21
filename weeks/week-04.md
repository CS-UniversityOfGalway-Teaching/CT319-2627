---
title: Week 4 — Heuristics
eyebrow: CT319 Artificial Intelligence · Week 4 · Heuristics
question: Can a useful guess save us from searching everything?
description: CT319 Week 4. Heuristics, evaluation functions and strict hill climbing on the same maze, and what happens when a useful hint still walks the search into a dead end.
bar: Week 4 · Sections
source: week-04.md
---

Week 3 gave the machine two systematic ways to organise ignorance: BFS preferred the oldest frontier state; DFS preferred the newest. Neither could say which waiting state **looked more promising**.

This week we add that missing hint. It provides guidance, not a guarantee.

We work through four things.

* We begin with [**heuristic information**](#a-hint--what-blind-search-was-missing). A heuristic gives the machine a cheap way to judge how promising a state appears, without already knowing the real answer.

* We then return to [**the same maze**](#the-same-maze-now-with-a-hint) from Weeks 2 and 3. The walls, start, goal and transitions stay unchanged. We add one number, `h(state)`, and watch the problem acquire direction.

* [**Hill climbing**](#hill-climbing--always-take-the-better-neighbour) turns that evaluation into a strict decision rule: inspect the legal neighbours, select one with a strictly lower `h`, break an equal-best tie by successor order, and stop when no improving neighbour exists.

* Finally we deliberately [**let the heuristic fail**](#a-useful-hint-can-still-mislead). The same maze contains a state only two rows from the goal where hill climbing can stop even though a valid route still exists.

Three ideas carry the page, and it is worth keeping them apart:

<!-- ct319:focus -->

<div class="lenses">
<div class="lens"><span class="lens__key">Heuristic</span><span class="lens__gloss">problem-specific information estimating how promising a state appears</span></div>
<div class="lens"><span class="lens__key">Evaluation</span><span class="lens__gloss">the score used to compare candidates — here <code>h(state)</code>, lower preferred</span></div>
<div class="lens"><span class="lens__key">Local</span><span class="lens__gloss">hill climbing compares the current candidate only with its neighbours</span></div>
</div>

<!-- ct319:endfocus -->

The important change from Week 3 is small:

<!-- ct319:focus -->

**Week 3** — Which waiting state should be explored next?

**Week 4** — Which available state looks more promising?

<!-- ct319:endfocus -->

That word — **looks** — matters.

<!-- ct319:beats -->

<!-- ct319:beat -->
## A hint — what blind search was missing

Suppose the search frontier contains three states: `A`, `B` and `C`.

Breadth-first search may choose the oldest.

Depth-first search may choose the newest.

Neither asks whether `A`, `B` or `C` appears to be closer to the goal.

That is what made them **uninformed**, or **blind**, search strategies.

### What does blind search already know?

Blind does not mean random.

BFS and DFS follow exact rules.

They know:

- the initial state
- the goal test
- the legal actions
- the transition model
- the states already reached
- the states waiting on the frontier

What they do not have is **problem-specific information that ranks non-goal states by how promising they seem**.

That is the gap we fill this week.

<!-- ct319:beat -->
## What changes when the frontier has scores

Suppose we attach a number, `h(state)`, to every state and interpret smaller values as:

> **this state appears closer to the goal**

Then instead of seeing three undifferentiated states, the machine may see:

- `A`, with `h = 9`
- `B`, with `h = 4`
- `C`, with `h = 7`

Now there is a reason to prefer `B`.

The number did not come from BFS or DFS.

It came from knowledge about the particular problem.

A strategy becomes **informed** when that information influences its choice. Merely calculating the numbers is not enough.

In the formal vocabulary: the information is supplied in advance, and an **evaluation function** is what puts it to work.

![The same frontier: Week 3 chooses by waiting order; Week 4 can compare h values](../../media/week-04/frontier-hint.svg "hero")

<sub><em>Figure 1. The same waiting states now have heuristic values. BFS still selects the oldest and DFS the newest; the new information says B looks most promising. This comparison adds guidance, not a new frontier algorithm. Diagram created for these pages; no external image licence is used.</em></sub>

<!-- ct319:beat -->
## What a heuristic is

<!-- ct319:focus -->

For our maze, **`h(state)` is a cheap estimate of remaining distance or cost to the goal**. Computing it should take much less work than solving the remaining route. It need not equal the real cost, and it guides search only if the decision rule uses it.

<!-- ct319:endfocus -->

### Are the estimate, true cost and goal test the same?

Keep three ideas separate:

<!-- ct319:focus -->

- **goal test** — the exact question, “have we finished?”
- **true remaining cost** — what it will actually take to reach the goal
- **heuristic estimate `h(state)`** — how much work we cheaply estimate is left

<!-- ct319:endfocus -->

The goal test can be exact while the heuristic is imperfect.

For example:

```python
def is_goal(state):
    return state == GOAL
```

tells us with certainty whether the maze is solved.

A heuristic such as distance-to-goal is trying to answer a different question:

<!-- ct319:focus -->

> **How good does this unfinished state look?**

<!-- ct319:endfocus -->

That answer may be wrong.

<!-- ct319:beat -->
## Where this maze gets its hint

The maze already records the current cell and the goal cell. Their row and column differences give us a distance estimate without searching any route. We will calculate it next.

That estimate depends on the problem. BFS's queue and DFS's stack work without geometric information; a maze-distance heuristic uses it explicitly.

> [!IMPORTANT]
> **A heuristic is not hidden knowledge of the correct solution.** It may help direct search effort, but the goal test still decides whether the maze is solved.

<!-- ct319:focus -->

### Why this matters this week

Week 2 defined what a problem looks like to the machine.

Week 3 defined systematic ways to explore it without guidance.

This week we introduce information that can distinguish one legal state from another.

The question is no longer only:

> **Which state is waiting next?**

It becomes:

> **Which state looks worth trying?**

Now we need a heuristic simple enough to see.

<!-- ct319:endfocus -->

<!-- ct319:beat -->
## The same maze, now with a hint

We keep the exact maze from Weeks 2 and 3.

![The unchanged maze from Weeks 2 and 3, every cell addressed by row and column](../../media/week-02/maze-grid.svg "hero")

<sub><em>Figure 2. The same maze as Weeks 2 and 3, unchanged: same grid, same walls, same start at `(0,0)` and same goal at `(6,8)`. Every cell is addressed by `(row, column)`. This week adds one number to each open cell and nothing else. Diagram created for these pages; no external image licence is used.</em></sub>

Nothing in the problem definition changes:

- `START = (0, 0)`
- `GOAL = (6, 8)`
- the same walls
- the same legal moves
- the same `neighbours(state)` and `is_goal(state)` functions

The only addition to the problem information is `heuristic(state)`; the hill-climbing controller follows in Highlight 3.

### Why count horizontal and vertical moves?

Our agent can move only `UP`, `DOWN`, `LEFT` or `RIGHT`, with **one unit of cost per move**.

Suppose we temporarily ignore the walls and ask:

<!-- ct319:focus -->

> **How many horizontal and vertical moves separate this cell from the goal?**

For a state `(row, column)` and goal `(goal_row, goal_column)`, `h(state) = |row - goal_row| + |column - goal_column|`.

<!-- ct319:endfocus -->

This is **Manhattan distance**. Each move can change only one coordinate by one. Without walls, we must cover the row difference and the column difference, and doing exactly those moves reaches the goal. Their sum is therefore the exact cost in the wall-free grid.

![A crop of the maze: two rows plus one column gives h of 3; a wall blocks one direct route](../../media/week-04/manhattan-grid.svg "hero")

<sub><em>Figure 3. Rows 4–6 and columns 6–8 of the unchanged maze. From (4,7), two vertical moves plus one horizontal move give h = 3. The dashed geometric route crosses the wall at (5,8): the formula counts coordinate differences without checking that route's legality. Diagram created for these pages; no external image licence is used.</em></sub>

With walls, the real route may require a detour. Manhattan distance remains **cheap** to calculate and **informative** about separation, but **imperfect** about the work actually left.

In Python:

<!-- ct319:focus -->

```python
def heuristic(state):
    row, col = state
    goal_row, goal_col = GOAL

    return abs(row - goal_row) + abs(col - goal_col)
```

<!-- ct319:endfocus -->

For our goal `(6,8)`:

| State | `h(state)` |
|---|---:|
| `(6,8)` | 0 |
| `(6,7)` | 1 |
| `(4,8)` | 2 |
| `(4,7)` | 3 |
| `(2,3)` | 9 |
| `(0,0)` | 14 |

Smaller means:

> **closer according to this estimate**

<!-- ct319:beat -->
## What the heuristic ignores

Manhattan distance uses only the current and goal coordinates. It ignores walls, dead ends and corridors, so it cannot tell whether a direct route is legal.

The wall still matters to `neighbours(state)`: it blocks movement. It contributes nothing to `heuristic(state)`. These functions read different parts of the same problem definition.

![The maze with Manhattan h values overlaid on every open cell](../../media/week-04/heuristic-overlay.png "wide")

<sub><em>Figure 4. The Search Lab overlays Manhattan `h` on the unchanged maze. The start is `h = 14`, the goal is `h = 0`, and walls receive no value. Screenshot created from the Search Lab for these pages; no external image licence is used.</em></sub>

### Which neighbour looks better at `(2,3)`?

Return to the Week 2 example state `(2,3)` and evaluate its legal neighbours:

| Action | Neighbour | `h` |
|---|---|---:|
| `UP` | `(1,3)` | 10 |
| `LEFT` | `(2,2)` | 10 |
| `RIGHT` | `(2,4)` | 8 |

Week 2 could tell us all three were legal.

Week 3 could put all three on a frontier.

Now we can say:

<!-- ct319:focus -->

> **RIGHT looks better under this heuristic.**

<!-- ct319:endfocus -->

That is the new information.

<!-- ct319:beat -->
## Showing `h` does not change a blind search

There is a useful experiment here.

Run BFS on the maze with the heuristic numbers displayed.

Nothing changes.

Run DFS with the same display.

Nothing changes.

Why?

Because neither algorithm reads `h(state)`.

The information exists, but the strategy ignores it.

> [!NOTE]
> **Adding information to the screen does not make an algorithm informed.**
>
> The information must actually influence the decision rule.

### How do we run the controlled experiment?

Open the [Search Lab](../../search-lab/) and keep the default maze and successor order selected.

1. Turn **Show Manhattan h** on. Inspect `(2,3)` and predict which neighbour the score favours.
2. Select **BFS**, reset and run. Compare with its Week 3 traversal.
3. Select **DFS**, reset and run. Again, the overlay changes no decisions.
4. Switch to **Hill climb** and step through the legal-neighbour evaluations. Now the displayed score determines the move.

The representation and transitions remain fixed. Week 2 supplied legal options, Week 3 organised waiting states, and this week adds information a decision rule can use. We finish this experiment in Highlight 4 by changing only successor order.

### Does a lower `h` guarantee a better route?

The start has `h = 14` and the goal has `h = 0`. Reducing the number seems like progress, but the calculation ignores walls. A cell can be close to the goal and still require a detour. The trap at `(4,8)` will expose that difference.

<!-- ct319:focus -->

### Why this matters this week

The machine can now say “this neighbour looks better”, but a score alone is not a search method. We need a rule that acts on it:

> **if one neighbour looks better, move there**

That is hill climbing.

<!-- ct319:endfocus -->

<!-- ct319:beat -->
## Hill climbing — always take the better neighbour

Hill climbing is a **local-search rule**: repeatedly compare the current candidate with its neighbours and move to an improvement.

> [!IMPORTANT]
> **This week we use a deliberately strict best-improvement version of hill climbing.** Other variants need not use these acceptance and tie rules.

<!-- ct319:focus -->

At each step:

1. inspect all legal neighbours
2. evaluate them — for our maze, lower `h` is better
3. choose the neighbour with the best strictly improving value
4. use successor order to break an equal-best tie
5. stop if no neighbour is strictly better; otherwise move and repeat until the goal

<!-- ct319:endfocus -->

This version accepts no equal or worse value, makes no fresh start, and keeps no alternative routes for later.

The same process has three ingredients:

- a representation of the solution
- an evaluation function
- a neighbourhood around the current solution

Those three pieces should now look familiar.

### How little code does the rule need?

From Week 2 we already have `neighbours(state)`. From this week we now have `heuristic(state)`.

So the basic hill-climbing decision is:

<!-- ct319:focus -->

```python
def best_improving_neighbour(state):
    options = neighbours(state)

    better = [
        next_state
        for _, next_state in options
        if heuristic(next_state) < heuristic(state)
    ]

    if not better:
        return None

    return min(better, key=heuristic)
```

<!-- ct319:endfocus -->

Then:

```python
current = START

while not is_goal(current):
    next_state = best_improving_neighbour(current)

    if next_state is None:
        break

    current = next_state
```

Python’s `min` returns the first minimum it encounters, so the order supplied by `neighbours(state)` breaks an equal-best tie. The `<` comparison filters out equal and worse values before selection.

The important word is **improving**: the evaluation must say the move is better.

<!-- ct319:beat -->
## Why "hill climbing" when the number gets smaller

Hill climbing means repeated local improvement. In the classic analogy, higher is better. In our maze, lower `h` is better, so improvement means descending the heuristic value. The evaluation function determines which direction counts as better.

![A profile of h: a descent into a shallow local minimum, a ridge, a flat plateau, then a descent to the global minimum at h = 0](../../media/week-04/hill-climbing-landscape.svg "hero")

<sub><em>Figure 5. The hill-climbing landscape drawn for our problem, where lower `h` is better and so the classic picture turns over. The run descends, settles in a **local minimum** where no neighbour is better, and stops. The climb out and the flat **plateau** are marked in red: the strict rule accepts neither, because neither is strictly better. Diagram created for these pages; no external image licence is used.</em></sub>

### Which information decides the next move?

Hill climbing keeps no broad frontier or alternative routes for later. Its decision uses the current neighbourhood:

> **Which neighbour looks best now?**

It does not ask:

> **Which complete path will eventually be best?**

Those are different questions.

### What does the rule do at `(2,3)`?

From `(2,3)`, where `h = 9`:

| Action | Neighbour `h` | Decision |
|---|---:|---|
| `UP` | 10 | reject |
| `LEFT` | 10 | reject |
| `RIGHT` | 8 | select `(2,4)` |

From `(2,4)`, where `h = 8`, `LEFT` returns to `h = 9` while `RIGHT` reaches `(2,5)` with `h = 7`. Hill climbing selects `RIGHT` again.

The apparent purpose comes entirely from the score. The machine has not discovered the maze's corridor structure.

<!-- ct319:beat -->
## What counts as a neighbour

The three ingredients are not really about mazes. Any problem a local-search rule can attack has to supply all three:

<!-- ct319:focus -->

- **Representation** — what a candidate is. Here, a location `(row, column)`.
- **Neighbourhood** — what counts as one step away. Here, the legal adjacent cells.
- **Evaluation** — the score that compares candidates. Here, `h(state)`, lower preferred.

<!-- ct319:endfocus -->

The representation says what can change, the neighbourhood says what one change means, and the evaluation says whether it helps. Changing any of these can change hill-climbing behaviour.

Next week we put the same three to work on a problem with no grid, no coordinates and no remaining distance to estimate — and the evaluation there will not be a heuristic estimate at all.

### What does this local rule buy us?

Hill climbing can use very little search memory, avoid exploring much of the state space, and move quickly towards apparently good states. It keeps a current candidate and compares nearby alternatives instead of maintaining a broad frontier.

The trade-off is that **local improvement does not imply global success**. Our maze lets us test that immediately.

<!-- ct319:focus -->

### Why this matters this week

Hill climbing turns a heuristic estimate into behaviour.

We have now moved from “this state looks better” to “move to the better-looking state.”

That can save enormous amounts of search.

But it also introduces a new failure mode:

> **what if every nearby move looks worse, even though a real solution still exists?**

We do not need a new example to answer that.

The maze is already waiting.

<!-- ct319:endfocus -->

<!-- ct319:beat -->
## A useful hint can still mislead

Move through the maze until we reach `(4,7)`. The goal is `(6,8)`, so Manhattan distance gives `h(4,7) = 3`.

Two legal moves improve the score equally:

- `DOWN → (5,7)`, with `h = 2`
- `RIGHT → (4,8)`, with `h = 2`

<!-- ct319:focus -->

Both are legal, improving and allowed by the strict rule. **Both satisfy the rule. Only one leads this run to the goal.**

<!-- ct319:endfocus -->

![Strict hill climbing at state 4,7, showing DOWN and RIGHT tied at h equals 2](../../media/week-04/hill-decision-4-7.png "wide")

<sub><em>Figure 6. At `(4,7)`, the Search Lab shows `DOWN` and `RIGHT` as equal-best improving neighbours. The default successor order lists `DOWN` first. Screenshot created from the Search Lab for these pages; no external image licence is used.</em></sub>

### What happens when DOWN or RIGHT wins the tie?

Choose `DOWN` first and the run succeeds: `(4,7) → (5,7) → (6,7) → (6,8)`, with `h` falling `3 → 2 → 1 → 0`.

Choose `RIGHT` first and the run enters `(4,8)`, with `h` falling from `3` to `2`.

Now inspect the legal neighbours of `(4,8)`.

The cell below, `(5,8)`, is a wall.

The remaining legal moves are `UP → (3,8), h = 3` and `LEFT → (4,7), h = 3`.

Every legal move makes the heuristic worse.

Strict hill climbing refuses them.

So it stops with **`NO IMPROVING NEIGHBOUR`**.

| `DOWN` first — successful run | `RIGHT` first — trapped run |
|---|---|
| ![Hill climbing reaches the goal when DOWN wins the tie](../../media/week-04/hill-success.png) | ![Hill climbing stops at 4,8 when RIGHT wins the tie](../../media/week-04/hill-trapped.png) |

<sub><em>Figure 7. Two Search Lab runs differ only in successor order at the equal-best tie. `DOWN` first reaches the goal; `RIGHT` first stops at `(4,8)` with legal neighbours still available. Screenshots created from the Search Lab for these pages; no external image licence is used.</em></sub>

<!-- ct319:beat -->
## How much work is actually left

At `(4,8)`, the goal test is false and the heuristic says **2 moves**. But the wall at `(5,8)` blocks the direct descent. The actual shortest remaining route is:

![h along the route out of 4,8: it rises from 2 to 3 on the first move, then falls 2, 1, 0](../../media/week-04/escape-route-profile.svg "hero")

<sub><em>Figure 8. `h` along the shortest remaining route from `(4,8)`. The first move to `(4,7)` raises `h` from 2 to 3; the three that follow lower it to 0. Strict hill climbing accepts only strictly improving moves, so it refuses the first step and never reaches the rest. Diagram created for these pages; no external image licence is used.</em></sub>

That costs **4 moves**. The first move increases `h`, so strict hill climbing rejects it even though it belongs to a shortest route from this state.

This is Highlight 1's distinction made concrete:

<!-- ct319:focus -->

- **Goal test:** false — we have not finished.
- **Heuristic estimate:** `h(4,8) = 2`.
- **True remaining cost:** `4`.

<!-- ct319:endfocus -->

Both `UP` and `LEFT` remain legal, with `h = 3`. The problem definition permits them; the evaluation and acceptance rule reject them.

> [!IMPORTANT]
> **Hill climbing has not run out of legal moves.**
>
> **It has run out of moves it is willing to accept.**

To reach the goal from this position, the algorithm would first have to make a move that looks worse according to its heuristic.

Strict hill climbing refuses to do that.

### Was the hint useless because the run failed?

No. Manhattan distance cheaply guided the run towards the goal for most of the route. At the trap, it ignores a wall the route must respect. **Useful guidance can still mislead**; the failure comes from combining that estimate with a rule that accepts only immediate improvement.

### What changed between the two runs?

At `(4,7)`, the evaluation cannot distinguish `DOWN` from `RIGHT`. Successor order resolves the tie, changing success into failure while the maze, start, goal, heuristic and strict hill-climbing rule remain identical.

This connects directly to Week 3, where successor order altered DFS. **Algorithm names do not uniquely determine every observed traversal when ties remain unresolved.**

<!-- ct319:beat -->
## One good run proves nothing

With the default successor order, hill climbing reaches the goal in **14 moves**, also a shortest path for this maze. Does that observed result establish a guarantee?

No. This particular run, on this maze, with this tie-breaking order, happened to return a shortest path. The alternate order fails completely despite a reachable goal. This counterexample disproves a guarantee of finding a solution. The successful run supplies no general shortest-path guarantee either.

This is the Week 3 comparison discipline again: **an observed result is not an algorithmic guarantee**. A successful demonstration tells us what happened under its conditions; it does not establish what must happen on other runs.

### What is local about this minimum?

At `(4,8)`, `h = 2` and every legal neighbour has a larger value. It is therefore a **local minimum of `h` under the chosen neighbourhood**.

This is the structural failure called becoming trapped in a **local optimum**. The term describes the evaluation relative to nearby candidates. It does not mean `(4,8)` solves the maze or is a globally optimal solution.

The goal with `h = 0` is reachable, but the route above begins `2 → 3`. Our strict rule cannot take that first step.

<!-- ct319:beat -->
## Reproducing the comparison

Continue the Search Lab experiment from Highlight 2:

1. With **Hill climb** and `UP → DOWN → LEFT → RIGHT`, step to `(4,7)` and inspect the equal-best tie.
2. Finish the run. `DOWN` wins and the goal is reached in 14 moves.
3. Change **neighbours() order** to `UP → RIGHT → DOWN → LEFT`, reset and re-run.
4. At `(4,8)`, inspect both rejected legal neighbours and the **NO IMPROVING NEIGHBOUR** message.
5. Compare the displayed `h = 2` with the four-move route back through `(4,7)`. Identify the first move the strict rule will not accept.

Keep the maze, heuristic and starting state fixed throughout. Successor order is the experimental change; success or failure is the observed consequence.

<!-- ct319:focus -->

### Why this matters this week

We began by asking whether a useful guess could save us from searching everything.

The answer is:

> **yes — but guidance changes the trade-off rather than removing it**

The heuristic supplies an estimate; the evaluation lets the rule compare candidates; hill climbing acts on that comparison locally. It can save search effort, but its refusal to accept a temporary worsening can leave a reachable goal unfound.

The same maze has shown both the benefit and the cost. We end with that failure still visible.

<!-- ct319:endfocus -->

<!-- ct319:endbeats -->

## Before Week 5

At `(4,8)` the machine is stuck:

```text
Current state: (4,8)
Heuristic: 2

Goal: (6,8)

Legal neighbours:
  UP    h = 3
  LEFT  h = 3

No improving move.
Hill climbing stops.
```

A route exists, but every legal move initially looks worse:

<!-- ct319:focus -->

> **What if reaching a better solution sometimes requires making a worse move first?**

<!-- ct319:endfocus -->

Week 5 broadens local search beyond strict hill climbing, asking how local-search methods can escape when strict improvement is not enough.

---

## Quick revision

If you can answer these without reopening the page, you have the core of Week 4.

1. What makes a search strategy informed rather than blind?
2. What is the difference between `h(state)` and the true remaining cost?
3. Why does Manhattan distance make sense for four-direction, unit-cost movement?
4. What important information does Manhattan distance ignore?
5. Why does displaying `h(state)` not change BFS or DFS?
6. What exact rule does our strict hill climber use, including equal-best ties and stopping?
7. Why can `(4,8)` trap hill climbing even though legal moves and a route to the goal remain?
8. Why does one successful 14-move run not prove hill climbing is optimal?

---

## Sources and licensing notes

### Lecture material

The Week 4 terminology and formal progression follow the existing *Informed (Heuristic) Search* lecture material on Canvas.

This page develops heuristic estimates, evaluation and strict hill climbing on the recurring maze, using **representation, neighbourhood and evaluation** to connect with the formal terminology. The trap makes local improvement and its limits observable.

The Galway hospital route example, travelling-salesman example and fuller knapsack treatment remain on Canvas. These pages support the live experiment rather than reproducing the complete lecture.

### Continuity from Weeks 2 and 3

The maze problem definition is unchanged:

- `7 × 9` grid
- `START = (0,0)`
- `GOAL = (6,8)`
- the same walls and moves
- the same `neighbours(state)` and `is_goal(state)` functions

Week 4 adds only the heuristic:

```python
def heuristic(state):
    row, col = state
    goal_row, goal_col = GOAL
    return abs(row - goal_row) + abs(col - goal_col)
```

The hill-climbing trap at `(4,7)` / `(4,8)` is derived from the same maze rather than introduced as a separate artificial example.

### Figures

Figures 1–8 were **created for these pages**. They use no external image licence.

Figures 4, 6 and 7 are Search Lab screenshots rendered from the exact maze and the Manhattan-distance calculation described on this page.

No external images, videos or papers are required for this page.

### Software

The [Search Lab](../../search-lab/) is the same classroom artefact used in Week 3, extended with:

- a show/hide control for Manhattan values on open maze cells
- strict hill-climbing mode
- visible legal-neighbour evaluation and successor-order tie-breaking
- successful and trapped runs on the unchanged default maze

The problem definition remains separate from BFS, DFS and strict hill climbing.
