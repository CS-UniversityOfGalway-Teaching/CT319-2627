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

We work through six things.

* We begin with [**heuristic information**](#a-hint--what-blind-search-was-missing). A heuristic gives the machine a cheap way to judge how promising a state appears, without already knowing the real answer.

* We then return to [**the same maze**](#the-same-maze-now-with-a-hint) from Weeks 2 and 3. The walls, start, goal and transitions stay unchanged. We add one number, `h(state)`, and watch the problem acquire direction.

* [**Hill climbing**](#hill-climbing--always-take-the-better-neighbour) turns that evaluation into a strict decision rule: inspect the legal neighbours, select one with a strictly lower `h`, break an equal-best tie by successor order, and stop when no improving neighbour exists.

* We then deliberately [**let the heuristic fail**](#a-useful-hint-can-still-mislead). The same maze contains a state only two rows from the goal where hill climbing can stop even though a valid route still exists.

* We then leave the maze for [**a second problem**](#a-second-problem-and-a-decision-to-make) — a route between two Galway hospitals — and choose an algorithm for it together.

* Finally we meet [**uniform-cost search**](#uniform-cost-search--choosing-by-cost-instead-of-by-depth), the rule none of our algorithms use — why it returns the cheapest route, and what it pays for that.

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

<!-- ct319:beat -->
## A second problem, and a decision to make

Every algorithm this week has run on the same maze. The formal notes use a different problem: **transferring a patient from University Hospital Galway to Merlin Park**.

![The UHG to Merlin Park route graph: fifteen junctions, seventeen roads, each with a cost](../../media/week-04/galway-route-problem.svg "hero")

<sub><em>Figure 9. Fifteen junctions and seventeen roads, transcribed from the formal notes without change. The start `O` is UHG, the goal `D` is Merlin Park, and each road carries a cost. Four routes reach `D`. Nothing in the diagram says which algorithm should find one. Diagram created for these pages; no external image licence is used.</em></sub>

Here is the whole problem, in a form a program can read:

```text
Junctions: A B C D E F G I J L N O Q R S

Roads (undirected, with cost):
  A-B 3   A-C 1   B-C 3   C-O 1   O-E 2   O-F 2
  F-G 1   G-I 5   G-L 2   I-J 4   J-N 5   L-N 5
  N-Q 4   N-S 15  Q-R 1   R-S 6   S-D 7

Start: O        Goal: D
```

### What we have to choose from

We have three algorithms: **breadth-first search**, **depth-first search** and **hill climbing**. Nothing in the problem says which of them suits it.

<!-- ct319:focus -->

> **Choosing the algorithm is part of the work, not a step that happens after the real thinking.**

<!-- ct319:endfocus -->

Hill climbing needs one more thing before it can run at all: an **evaluation function**. The maze handed us one for free — `(row, col)` for the current cell and for the goal, so Manhattan distance fell straight out of the representation. This graph has no coordinates. What it does have is a cost on every road, and a cost is a reasonable thing to judge a move by.

So there are at least three evaluation functions available:

<div class="lenses">
<div class="lens"><span class="lens__key">Cheapest road</span><span class="lens__gloss">prefer the least expensive road out of the current junction</span></div>
<div class="lens"><span class="lens__key">Dearest road</span><span class="lens__gloss">prefer the most expensive road out of the current junction</span></div>
<div class="lens"><span class="lens__key">Cost so far</span><span class="lens__gloss">judge a junction by the total spent reaching it, and prefer lower</span></div>
</div>

Each one is computable from the seventeen numbers above. Each one produces a different algorithm. None of them is obviously wrong before you run it.

### Asking a model to write the code

We will not write these by hand. We will describe each algorithm to a coding model and read what comes back.

That takes some care. A capable model will often notice a better algorithm than the one it was asked for and quietly write that instead. So each request names the mechanism, rules out the substitution, and asks for evidence.

Every request carries the whole problem and ends with the same two instructions — state which algorithm you implemented, and print the evidence. Those two lines are what let us check a program instead of trusting it.

Each block below is complete. Copy one, paste it, and run what comes back.

**Breadth-first search**

```prompt
Junctions: A B C D E F G I J L N O Q R S
Roads (undirected, with cost):
A-B 3, A-C 1, B-C 3, C-O 1, O-E 2, O-F 2, F-G 1, G-I 5, G-L 2,
I-J 4, J-N 5, L-N 5, N-Q 4, N-S 15, Q-R 1, R-S 6, S-D 7
Start: O. Goal: D.

Write Python for this graph. Use breadth-first search exactly
as defined: a FIFO queue, expand by depth, return the first
path that reaches D. Do not use the road costs to order the
queue. Do not substitute a different algorithm.

Before the code, say in one sentence which algorithm you
implemented and which you deliberately did not use. After the
code, print the route, its total cost and the number of
junctions expanded.
```

**Depth-first search**

```prompt
Junctions: A B C D E F G I J L N O Q R S
Roads (undirected, with cost):
A-B 3, A-C 1, B-C 3, C-O 1, O-E 2, O-F 2, F-G 1, G-I 5, G-L 2,
I-J 4, J-N 5, L-N 5, N-Q 4, N-S 15, Q-R 1, R-S 6, S-D 7
Start: O. Goal: D.

Write Python for this graph. Use depth-first search exactly as
defined: a LIFO stack, follow one branch as far as it goes
before backtracking, return the first path that reaches D.
Take neighbours in alphabetical order. Do not use the road
costs. Do not substitute a different algorithm.

Before the code, say in one sentence which algorithm you
implemented and which you deliberately did not use. After the
code, print the route, its total cost and the number of
junctions expanded.
```

**Hill climbing** — paste the evaluation function we settle on into the last line.

```prompt
Junctions: A B C D E F G I J L N O Q R S
Roads (undirected, with cost):
A-B 3, A-C 1, B-C 3, C-O 1, O-E 2, O-F 2, F-G 1, G-I 5, G-L 2,
I-J 4, J-N 5, L-N 5, N-Q 4, N-S 15, Q-R 1, R-S 6, S-D 7
Start: O. Goal: D.

Write Python for this graph. Use hill climbing: from the
current junction, move to the best neighbour under the
evaluation function below, and stop when no neighbour is
better. Do not look further ahead than one road. Do not
substitute a different algorithm.

Evaluation function: <the one we chose>

Before the code, say in one sentence which algorithm you
implemented and which you deliberately did not use. After the
code, print the route, its total cost and the number of
junctions expanded.
```

### What to look for when it runs

<!-- ct319:focus -->

Four questions, for every run:

- Which route came back, and what does it cost?
- Is that the cheapest route that reaches `D`?
- How many junctions did it expand to find it?
- Did it implement the algorithm it was asked for?

The last one is not a formality.

<!-- ct319:endfocus -->

### Why this matters this week

We spent the week building a rule that follows an estimate downhill. This problem does not obviously supply that estimate, and we have three algorithms with nothing telling us which to use.

The question worth settling is not which algorithm is best in general. It is what a problem has to give you before the question can be asked at all.

<!-- ct319:beat -->
## Uniform-cost search — choosing by cost instead of by depth

Week 3 left us with one idea and three words for it: the **frontier** holds the paths that have been discovered but not yet examined, and a **strategy** is the rule that decides which of them gets attention next.

Breadth-first search takes the oldest waiting path. Depth-first search takes the newest. Neither rule ever looks at what a path costs — which is why neither returns the cheapest route on a graph where the roads are not all the same.

**Uniform-cost search** uses a third rule, and the whole of it fits on one line:

<!-- ct319:focus -->

> **Take the cheapest waiting path.**

<!-- ct319:endfocus -->

It appeared in the Week 3 list of blind-search methods we did not develop, and it is the same algorithm published by Edsger Dijkstra in 1959 for exactly this problem.

![One search loop with three different rules for what comes off the frontier](../../media/week-04/one-loop-three-rules.svg "hero")

<sub><em>Figure 10. The loop is the one Week 3 built: take a path off the frontier, test it, expand it, repeat. Breadth-first, depth-first and uniform-cost search differ only in the first step. Diagram created for these pages; no external image licence is used.</em></sub>

### The change, in code

Week 3 wrote breadth-first search with a queue that gives back the oldest entry:

```python
from collections import deque

frontier = deque([START])
state = frontier.popleft()      # remove the oldest waiting state
```

and depth-first search with a list that gives back the newest:

```python
frontier = [START]
state = frontier.pop()          # remove the newest waiting state
```

Uniform-cost search stores the cost alongside the path, and uses a queue that gives back the cheapest entry:

```python
import heapq

frontier = [(0, [START])]                 # (cost so far, path)
cost, path = heapq.heappop(frontier)      # remove the cheapest waiting path

for neighbour, road in roads_from(path[-1]):
    heapq.heappush(frontier, (cost + road, path + [neighbour]))
```

Nothing else changes. The same frontier, the same expansion, the same goal test.

> [!IMPORTANT]
> **Test the goal when a path comes off the frontier, not when it goes on.**
>
> A path reaching the goal can be discovered long before the cheapest one is. If we stop the moment the goal appears, we return whichever route happened to be found first. Uniform-cost search only becomes correct because it waits until that path is the cheapest thing left waiting.

### Why it works

The argument is short enough to hold in your head.

<!-- ct319:focus -->

When a path comes off the frontier, it is the cheapest one waiting. Every other path still on the frontier already costs at least as much — and extending any of them only adds more road, so none of them can become cheaper later.

> **So the first time a path ending at the goal is removed, no cheaper path to the goal can still be coming.**

<!-- ct319:endfocus -->

That argument leans on one assumption, and it is worth naming: **no road may have a negative cost**. If adding a road could reduce a total, a path waiting on the frontier could get cheaper after we had already committed, and the reasoning collapses. Distances, times and fuel are never negative, so the assumption holds here — but it is an assumption, not a law.

### What it costs

Uniform-cost search examines more of the graph than breadth-first search does. It has to: to know that a route is the cheapest, it must rule out the ones that looked promising and were not.

That is Week 3's trade-off again, in its plainest form — **search cost** against **solution cost**. Paying more of the first is how you lower the second.

### Try it yourself

The three requests from the previous highlight each named an algorithm and forbade the substitution. This one asks for the algorithm that actually fits the problem, so nothing has to be forbidden.

```prompt
Junctions: A B C D E F G I J L N O Q R S
Roads (undirected, with cost):
A-B 3, A-C 1, B-C 3, C-O 1, O-E 2, O-F 2, F-G 1, G-I 5, G-L 2,
I-J 4, J-N 5, L-N 5, N-Q 4, N-S 15, Q-R 1, R-S 6, S-D 7
Start: O. Goal: D.

Write Python for this graph. Use uniform-cost search: a
priority queue ordered by the total cost of the path so far,
always expanding the cheapest waiting path, and testing for
the goal when a path is removed from the queue rather than
when it is added.

Before the code, say in one sentence which algorithm you
implemented and which you deliberately did not use. After the
code, print the route, its total cost and the number of
junctions expanded.
```

Run it, then compare four things against the breadth-first result: the route, its cost, the number of junctions expanded, and which of those two numbers each algorithm was trying to make small.

<!-- ct319:focus -->

### Why this matters this week

Uniform-cost search uses the cost **already spent**. Our heuristic estimates the cost **still to come**. Each is half of the same question, and neither algorithm this week uses both.

An algorithm that adds them together — the road behind plus the estimate ahead — is where informed search goes next. That is beyond this module, but it is worth knowing the shape of the idea: this week you have built both halves.

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

The **Galway hospital route example** is the worked example for both formal search lectures, and it closes this page. The graph is reproduced exactly: fifteen junctions, seventeen roads and the costs as printed.

The formal treatment runs breadth-first and depth-first search over it and then delimits the search area to cut the work. This page asks a different question of the same graph — which algorithm to choose, and what the representation makes possible — so that the three algorithms built this week can be tested against a problem the maze cannot pose.

**Uniform-cost search** is developed here and not in the slides, which name it once in a list of blind-search methods and move on. The route example makes the gap impossible to ignore — breadth-first search returns a route that is not the cheapest — so the rule that closes it is stated, along with the argument for why it works and the non-negative-cost assumption that argument needs. Its equivalence to Dijkstra's algorithm is noted; the priority-queue complexity is not.

The travelling-salesman example and fuller knapsack treatment remain on Canvas. These pages support the live experiment rather than reproducing the complete lecture.

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

Figures 1–10 were **created for these pages**. They use no external image licence.

Figures 4, 6 and 7 are Search Lab screenshots rendered from the exact maze and the Manhattan-distance calculation described on this page.

Figure 9 redraws the formal route graph in the palette used across these pages. The junctions, roads and costs are the ones the lecture prints. Figure 10 is an original diagram.

No external images, videos or papers are required for this page.

### Software

The [Search Lab](../../search-lab/) is the same classroom artefact used in Week 3, extended with:

- a show/hide control for Manhattan values on open maze cells
- strict hill-climbing mode
- visible legal-neighbour evaluation and successor-order tie-breaking
- successful and trapped runs on the unchanged default maze

The problem definition remains separate from BFS, DFS and strict hill climbing.
