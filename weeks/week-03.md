---
title: Week 3 — Blind search
eyebrow: CT319 Artificial Intelligence · Week 3 · Blind search
question: If the machine has no clue which direction is better, what should it try first?
description: CT319 Week 3. The frontier, breadth-first and depth-first search, and what changes when the only thing that changes is the rule for choosing which state to expand next.
bar: Week 3 · Sections
source: week-03.md
---

Week 2 ended with a program that could describe a problem perfectly well:

```text
Current state: (2, 3)

Legal next states:
  UP    -> (1, 3)
  LEFT  -> (2, 2)
  RIGHT -> (2, 4)
```

It knew the state, the goal, the legal actions and the transitions. Then it stopped, and a human had to finish the job:

```python
choice = input("\nMove: ")
```

Week 3 removes that line. The question is no longer *what moves are possible?* — Week 2 answered that completely. It is **if the machine has no clue which direction is better, what should it try first?**

We work through four things.

* We begin with the [**frontier**](#the-frontier--where-possibilities-wait). Once a problem branches, the machine needs somewhere to keep the possibilities it has discovered but not examined. A search strategy is a rule for deciding which gets attention next.

* [**Breadth-first search**](#breadth-first-search--everything-nearby-first) refuses to go deeper while a shallower possibility is waiting. Its behaviour gives us a reason for the FIFO queue rather than asking us to memorise one.

* [**Depth-first search**](#depth-first-search--commit-to-one-possibility) makes the opposite commitment: follow one branch as far as it goes, then come back. The LIFO stack, the narrower frontier and the sensitivity to successor order all follow from that one decision.

* Finally we [**run both on the same Week 2 maze**](#one-loop-two-policies). Holding the problem fixed is what lets us attribute every difference to the strategy alone.

Three words carry the whole page, and it is worth keeping them apart:

<!-- ct319:focus -->

<div class="lenses">
<div class="lens"><span class="lens__key">Frontier</span><span class="lens__gloss">the states we have discovered but have not yet explored</span></div>
<div class="lens"><span class="lens__key">Strategy</span><span class="lens__gloss">the rule that decides which frontier entry is expanded next</span></div>
<div class="lens"><span class="lens__key">Trade-off</span><span class="lens__gloss">what that rule buys us, and what it costs</span></div>
</div>

<!-- ct319:endfocus -->

Nothing about the problem changes this week:

```text
same maze
same start
same goal
same walls
same neighbours(state)
```

Only the rule for handling unexplored possibilities changes. That is what makes the comparison worth anything.

<!-- ct319:beats -->

<!-- ct319:beat -->
## The frontier — where possibilities wait

Return to the Week 2 program. At `(2,3)`, `neighbours(state)` hands back three legal possibilities and a human picks one on instinct. An algorithm cannot say:

> “Right feels promising.”

Nothing in the representation contains that judgement. So instead of committing to one move and forgetting the others, the algorithm keeps everything it has discovered and decides systematically which to examine next.

That collection is the **frontier**.

> [!IMPORTANT]
> **The frontier contains states that have been discovered but are still waiting to be expanded.**

### Why that word

Picture yourself in an unlit maze. You are standing at a junction with three corridors leading off it. You can only walk down one, but the other two do not stop existing — you simply have not been down them. So you note them: *two corridors back there, unvisited.* When the corridor you chose runs out, you consult that note and pick another.

The note is the frontier, and the name describes its shape. It is the edge of the map you have drawn so far:

<!-- ct319:focus -->

- **behind it** — states you have already expanded, where you have been and looked around
- **the frontier itself** — states you know exist but have not visited, the doors you have seen and not opened
- **beyond it** — states you have not yet heard of

<!-- ct319:endfocus -->

As the search runs, that edge is pushed outwards. This is worth holding on to, because it is literally what you will see later: the wave in Figure 6 is a frontier expanding evenly in every direction, and the thread in Figure 9 is the same frontier racing out along a single branch.

The reason a machine needs one at all is that Week 2's program did not have one. It offered a human three moves, took the answer and forgot the alternatives. An algorithm has no instinct to choose with, so it cannot afford to forget: it keeps every state it has discovered but not examined, precisely so that it can come back. Without a frontier there is nothing to come back to.

### Generated is not the same as expanded

This distinction is small, and everything else this week rests on it.

- **GENERATED** — the machine knows the state exists. It appeared as a legal successor of something already examined.
- **EXPANDED** — the machine has selected that state and called `neighbours(state)` on it, so its own successors are now known too.

A large search may know about thousands of possibilities while actively examining exactly one.

![The life of a state during search: frontier, current, expanded](../../media/week-03/frontier-lifecycle.svg "hero")

<sub><em>Figure 1. The three places a state can be during a search, using real Week 2 maze states. The strategy moves one state into the middle column; expanding it generates new states, which join the frontier. Diagram created for these pages; no external image licence is used.</em></sub>

To **expand** a state is to select it, ask the problem for its legal successors, and put the new ones on the frontier. Week 2 already built the middle step:

```python
neighbours(state)
```

So Week 3 needs no new problem definition — only a rule for choosing which frontier state gets passed to `neighbours()` next.

<!-- ct319:beat -->
## The problem we are searching

![The Week 2 maze](../../media/week-02/maze-grid.svg "hero")

<sub><em>Figure 2. The recurring Week 2 maze: seven rows, nine columns, start at (0,0), goal at (6,8). Week 3 keeps this definition unchanged and adds a frontier policy. Diagram created for these pages; no external image licence is used.</em></sub>

When the search expands `(2,3)` it calls the same `neighbours((2,3))` written in Week 2, and three legal states join the frontier. Which one is removed later is the only thing Week 3 adds.

### The state belongs to the problem; the bookkeeping does not

A maze state is still `(row, column)` and nothing else. But the *search process* needs to remember three things the problem never cared about:

- which states have already been **reached**
- where a state currently sits in the **frontier**
- which state it was generated from — its **parent**

None of that is part of the maze. Reaching `(6,8)` says where the search finished, not how it got there, so `parent` is what recovers the route. We build it in [Highlight 4](#reconstruct-the-solution), beside the code that uses it.

<!-- ct319:beat -->
## Reached states and repeated work

A maze contains cycles. If the agent can move from `A` to `B` it can usually move straight back, and a search with no memory will rediscover `A → B → A → B` forever.

![A cycle produces repeated states](../../media/week-03/cycle-repeated-states.svg "hero")

<sub><em>Figure 3. A cycle produces repeated states. Without reached-state checking, a search can follow the same loop forever and never look at the goal. Diagram created for these pages; no external image licence is used.</em></sub>

So the search keeps a second collection alongside the frontier:

```python
reached = {START}
```

and consults it before adding anything new:

```python
if next_state not in reached:
    reached.add(next_state)
    ...
```

The two collections differ. Everything on the frontier has been reached; not everything reached is still on the frontier, because some of it has been expanded already.

> [!NOTE]
> **Tree search** treats every newly generated path as a new branch, even when two branches arrive at the same state. **Graph search** notices the state has already been reached.
>
> Because our maze is a graph, reached-state checking stops the search processing the same state over and over. It is not an optimisation added for cleverness.

<!-- ct319:beat -->
## What makes a search blind

Search strategies divide into two families. An **uninformed** — or **blind** — strategy has no problem-specific information saying that one non-goal state looks more promising than another.

Blind is not ignorant. The search still knows `START`, `GOAL`, `WALLS`, `MOVES`, `neighbours(state)` and `is_goal(state)`. What it lacks is **guidance**: nothing tells it that one waiting state is closer to the goal than another.

So the frontier has to be organised by a rule that makes no estimate of progress at all. Two very simple rules produce very different behaviour.

<!-- ct319:focus -->

### Why this matters this week

Week 2 gave us a state space. The frontier turns that static structure into a process: at any moment there are states already expanded, one being examined, and a set still waiting. That makes the central Week 3 decision precise:

> **Which waiting state should be expanded next?**

Breadth-first search gives us one answer.

<!-- ct319:endfocus -->

<!-- ct319:beat -->
## Breadth-first search — everything nearby first

Breadth-first search makes one commitment, and it is about behaviour, not data structures:

<!-- ct319:focus -->

> **Do not explore a deeper state while a shallower one is still waiting.**

<!-- ct319:endfocus -->

Take a small tree and watch what that produces.

![Breadth-first expansion order on a small tree](../../media/week-03/bfs-expansion-tree.svg "hero")

<sub><em>Figure 4. A small search tree, each node labelled with the order in which BFS expands it. Every depth-1 state is dealt with before any depth-2 state. Diagram created for these pages; no external image licence is used.</em></sub>

The letters do not matter. The shape does: **wide first, deep later**.

### Watch the frontier, not the final order

That order is a symptom. The cause is what happens to the frontier.

```text
start            [S]
expand S         [A, B, C]
expand A         [B, C, D, E]
```

Notice what did **not** happen. `D` and `E` are children of the state just expanded, and they do not jump ahead of `B` and `C`. The older, shallower possibilities keep their turn — which is exactly what a **FIFO queue** does.

<!-- ct319:beat -->
## FIFO is the mechanism, not the definition

FIFO means **First In, First Out**: whatever has waited longest leaves first.

![A FIFO frontier: remove from the front, add at the back](../../media/week-03/frontier-fifo.svg "hero")

<sub><em>Figure 5. Removal happens at one end of the frontier and addition at the other. Newly generated states therefore queue behind everything already waiting. Diagram created for these pages; no external image licence is used.</em></sub>

> [!IMPORTANT]
> **BFS does not go level by level because somebody drew the tree that way.**
>
> It goes level by level because the frontier behaves as a FIFO queue. The data structure explains the visible behaviour, not the other way round.

In Python that is one import and two method calls:

```python
from collections import deque

frontier = deque([START])

state = frontier.popleft()      # remove the oldest waiting state
frontier.append(next_state)     # add newly generated states at the back
```

<!-- ct319:beat -->
## The maze under BFS

`START`, `GOAL` and `neighbours(state)` are still the Week 2 definitions. Only the frontier is new, and the visible result is a wave.

![Breadth-first search part-way through the Week 2 maze](../../media/week-03/bfs-search-wave.png "wide")

<sub><em>Figure 6. BFS after 18 expansions in the Search Lab. Grey cells are explored, purple cells are waiting on the frontier, and the amber cell is being expanded. Screenshot created from the Search Lab for these pages; no external image licence is used.</em></sub>

BFS discovers everything one move from the start, then everything two moves away, and so on, so the explored region spreads outwards evenly. It has no idea where the goal is. It is refusing to skip a shallower possibility in favour of a deeper one.

### The guarantee, and the condition attached to it

Suppose every move costs one step. If BFS first reaches a goal at depth `5`, there cannot be an undiscovered goal at depth `3` — every reachable state at depths 0 to 4 was dealt with first. So, with equal action costs:

<!-- ct319:focus -->

> **BFS finds a solution of minimum depth: the fewest moves.**

<!-- ct319:endfocus -->

The condition is not decoration. If one route takes two actions costing 10 each and another takes three costing 1 each, BFS prefers the two-action route because it is shallower, never noticing that `20` is worse than `3`. The precise claim is *minimum depth when action costs are equal*, not *the cheapest route*.

> [!NOTE]
> The weighted graph in the formal notes is exactly this case. Standard BFS orders states by depth, not by accumulated edge weight, so a least-cost path with unequal costs needs a cost-aware strategy.

**Completeness** follows from the same behaviour. BFS cannot disappear down one branch, because every shallow frontier state eventually gets its turn. On the finite kind of maze we use here, if a reachable solution exists, BFS will find one.

<!-- ct319:beat -->
## What breadth-first search pays for it

Memory. Suppose each expansion produced roughly three genuinely new states:

```text
depth 0        1
depth 1        3
depth 2        9
depth 3       27
depth 4       81
depth 5      243
```

BFS may hold most of one level in the frontier while it finishes the previous one, so the frontier can become enormous even when the solution path is short. The trade-off, then:

- **Benefit** — with equal step costs, the first goal found is at minimum depth.
- **Cost** — a wide frontier, and therefore a potentially large memory requirement.

<!-- ct319:focus -->

### Why this matters this week

BFS gives the machine a mechanical answer to “what next?”:

> **expand the shallowest waiting possibility**

A FIFO queue is how that answer gets enforced. Depth-first search makes almost the opposite bargain.

<!-- ct319:endfocus -->

<!-- ct319:beat -->
## Depth-first search — commit to one possibility

Depth-first search commits the other way:

<!-- ct319:focus -->

> **Once you start down a branch, keep going until you cannot continue, then come back.**

<!-- ct319:endfocus -->

### Behaviour first, then the mechanism

Suppose the frontier holds `A, B, C` and an expansion has just generated `E` and `F`. DFS wants those new, deeper possibilities considered *before* it returns to the older alternatives.

That is **LIFO — Last In, First Out**: the most recently added possibility is the next one removed. A stack provides it for nothing, and in Python an ordinary list is enough:

```python
frontier = [START]

state = frontier.pop()          # remove the newest waiting state
frontier.append(next_state)     # add at the same end
```

![A LIFO frontier: add and remove at the same end](../../media/week-03/frontier-lifo.svg "hero")

<sub><em>Figure 7. The same frontier drawn the same way as Figure 5, with one difference: both arrows point at the same end. The bottom row is a dead end. Diagram created for these pages; no external image licence is used.</em></sub>

### Backtracking is not a separate intelligence

DFS often looks as though it is reasoning:

> “That route failed. I should go back.”

There is no such step. In the bottom row of Figure 7, nothing new is pushed at the dead end, so the next `pop()` exposes an alternative that has been sitting on the stack since earlier. Backtracking is what a stack does when nothing arrives — not a judgement that the branch was a mistake.

<!-- ct319:beat -->
## The same tree, the other rule

![The same search tree expanded by BFS and by DFS, numbered by expansion order](../../media/week-03/expansion-order.svg "hero")

<sub><em>Figure 8. One tree, two frontier rules. The numbers give expansion order. BFS finishes an entire level before starting the next; DFS drives to a leaf and unwinds. Diagram created for these pages; no external image licence is used.</em></sub>

Both panels use the same tree, goal test and successor order. Only the removal rule differs, and the two traversals are barely recognisable as the same search.

Note which branch DFS opened first. Successors were generated `A`, `B`, `C`, so `C` was pushed last — and a stack removes the newest. That matters more than it looks, and we return to it below.

### The maze under DFS

![Depth-first search part-way through the Week 2 maze](../../media/week-03/dfs-search-path.png "wide")

<sub><em>Figure 9. DFS after 18 expansions in the Search Lab — same problem, same number of expansions, same colour coding as Figure 6. Screenshot created from the Search Lab for these pages; no external image licence is used.</em></sub>

Set Figure 9 beside Figure 6. Instead of a region spreading outwards there is a narrow trail, and the frontier holds a few alternatives from earlier turnings, waiting to be backtracked into.

<!-- ct319:beat -->
## Deep does not mean promising

DFS can walk straight past the answer. Suppose the goal is one move from the start, on a branch DFS does not happen to open first:

![A shallow goal that depth-first search does not reach](../../media/week-03/dfs-shallow-goal.svg "hero")

<sub><em>Figure 10. A shallow goal can sit untouched while DFS follows a deeper branch, depending on which successor was generated last. Diagram created for these pages; no external image licence is used.</em></sub>

If DFS commits to `A` first, it may explore `A → B → C → D → E` before returning to a goal that was one step from the start. Nothing has gone wrong: DFS is doing exactly what its frontier rule says.

<!-- ct319:focus -->

> **deep does not mean promising**

<!-- ct319:endfocus -->

Nothing tells the algorithm that deeper is better. It prefers recency, and recency is not evidence.

### Memory, cycles and termination

Three consequences follow from the same rule, and each needs its condition attached.

- **Frontier memory.** DFS usually keeps a far narrower frontier than BFS, following one branch and retaining only the alternatives needed for backtracking. Our graph-search version also stores `reached` and `parent`, so it is not literally holding one path — the advantage is about the frontier.
- **Cycles.** Unrestricted, DFS can follow `A → B → C → A` indefinitely. That is exactly what the `reached` set from Highlight 1 prevents.
- **Completeness.** Unrestricted DFS can disappear down an infinite branch or around a cycle, so in general it is **not complete**. On our finite maze with reached-state checking it cannot generate endlessly many new states, so it terminates and will encounter a reachable goal. Both statements are true; they describe different cases.

DFS also has no minimum-depth guarantee: the first goal it finds is the first goal along whatever branch ordering the stack produced.

### Successor order breaks the ties

BFS and DFS decide the broad strategy. They do not decide everything.

```python
MOVES = {
    "UP":    (-1, 0),
    "DOWN":  (+1, 0),
    "LEFT":  (0, -1),
    "RIGHT": (0, +1),
}
```

`neighbours(state)` returns successors in that order, and a stack removes whichever was appended last. So the **last** legal successor generated is the **first** one DFS explores. Change the order in `MOVES` and DFS may follow an entirely different corridor — same maze, same start, same goal, same LIFO rule.

This is not a flaw. It is a reminder that a strategy can leave ties unresolved, and the implementation still has to break them somehow. BFS is affected too, but its level-by-level character survives; DFS can look like a different algorithm. We test exactly this in the Search Lab.

<!-- ct319:focus -->

### Why this matters this week

DFS gives the machine the other mechanical answer:

> **expand the newest, deepest waiting possibility**

A LIFO stack creates that behaviour. The benefit is a small frontier and the chance of reaching a deep solution quickly. The cost is that the branch may be terrible, the first solution need not be good, and unrestricted DFS needs care around repeated states and infinite depth.

Neither strategy is the intelligent one. They are two rules for organising ignorance, and the useful comparison only appears when they run on the same problem.

<!-- ct319:endfocus -->

<!-- ct319:beat -->
## One loop, two policies

Everything below runs on the Week 2 problem, untouched:

```text
same ROWS, COLS
same START = (0,0)
same GOAL  = (6,8)
same WALLS
same MOVES
same neighbours(state)
same is_goal(state)
```

The problem has not changed. One line has.

BFS and DFS share almost the entire search:

```python
frontier = ...
reached  = {START}
parent   = {START: None}

while frontier:
    state = remove_next(frontier)

    if is_goal(state):
        break

    for action, next_state in neighbours(state):
        if next_state not in reached:
            reached.add(next_state)
            parent[next_state] = state
            add(frontier, next_state)
```

The start, goal test, `neighbours()`, reached-state rule and parent bookkeeping are identical for both. The entire week is concentrated in the one line that differs:

```python
if mode == "BFS":
    state = frontier.popleft()      # the oldest waiting state
else:
    state = frontier.pop()          # the newest waiting state
```

That is the executable version of the whole argument. Everything else in this section follows from `popleft()` versus `pop()`.

![Breadth-first and depth-first search share everything but the frontier policy](../../media/week-03/bfs-dfs-shared-machinery.svg "hero")

<sub><em>Figure 11. BFS and DFS share the problem representation and nearly all of the search machinery. The one difference is frontier policy. Diagram created for these pages; no external image licence is used.</em></sub>

This is why the Week 2 separation between **problem definition** and **controller** was worth insisting on: we replace the controller without touching the maze.

<!-- ct319:beat -->
## Run the race yourself

🧪 [**Open the Search Lab**](../../search-lab/)

The lab is a browser version of the exact Week 2 maze — same grid, start, goal, walls, move vectors, goal test and successor order — with BFS and DFS supplying two frontier policies. The frontier is always listed in removal order, **next first**, even though the two strategies remove from opposite ends. **Run**, **Pause**, **Reset** and the speed control change only how the process is watched, never the result.

Four runs, in order:

1. **BFS.** Press **Step** repeatedly. Watch three things rather than the outcome: the amber current state, the purple frontier, and the grey explored region.
2. **DFS.** Press **Reset**, switch strategy, and step the same number of times. Ask: *what changed, given that the maze did not?*
3. **Race.** Each tick expands at most one state on each side. Compare states expanded, maximum frontier, path length and whether the goal was found.
4. **Successor order.** Keep DFS selected, change the **`neighbours()` order**, and run again. Ask: *did the algorithm change?*

The answer to the last one is no. The frontier policy is still LIFO. What changed is which successor was generated last, and therefore which one the stack hands over first — and that alone redraws the whole traversal.

### The default race, and what it does not prove

![BFS and DFS completed side by side in the Search Lab](../../media/week-03/search-lab-race.png "wide")

<sub><em>Figure 12. Race mode on the default maze with the Week 2 successor order. Screenshot created from the Search Lab for these pages; no external image licence is used.</em></sub>

| | States expanded | Maximum frontier | Path length |
| --- | ---: | ---: | ---: |
| **BFS** | 41 | 6 | 14 |
| **DFS** | 26 | 5 | 14 |

DFS did less work here and returned a path of the same length. So:

<!-- ct319:focus -->

> **Does DFS finding the same 14-move path prove that DFS is optimal?**

<!-- ct319:endfocus -->

No. It shows that *this* DFS run, on *this* maze, under *this* successor order, happened to return a 14-move path. BFS's 14 moves are guaranteed by the algorithm. DFS's 14 moves are a property of the instance, and nothing protects them if the maze or the successor order changes.

An observed result and an algorithmic guarantee are different kinds of claim. The two optional open-grid presets make that testable: one hands DFS a lucky first branch, the other puts a shallow goal where the same ordering reaches it late.

> [!WARNING]
> **Do not use wall-clock time as the headline measure on a maze this small.**
>
> A few milliseconds mostly measure the browser, the machine and the animation. Count the search work directly instead.

### Search cost is not solution cost

The Race panel shows both at once, which is why they separate most easily here.

- **Search cost** — how much work was needed to find a solution: `states expanded` and `maximum frontier size`.
- **Solution cost** — how expensive the returned solution is. On this equal-cost maze, the number of moves in the path.

They move independently: BFS did more search work for a guaranteed-minimum path, DFS less work for an equally short path with no guarantee behind it. An algorithm can have a high search cost and a low solution cost, or the reverse.

<!-- ct319:beat -->
## Comparing the two strategies

Strategies are compared on four concerns:

- **Time — search work.** Measured here as `states expanded`.
- **Space — memory.** Measured here as `maximum frontier size`.
- **Completeness.** Under the stated conditions, will a solution be found if one exists?
- **Optimality.** Does the returned solution minimise the cost we care about?

The important words are *under the stated conditions*. The assumptions travel with the claims.

**Breadth-first search**

- systematic shallow exploration
- complete for our finite, reachable setting
- a minimum-depth solution **when action costs are equal**
- a potentially wide frontier

**Depth-first search**

- systematic deep exploration
- often a much narrower frontier
- strongly dependent on successor order
- no minimum-depth guarantee
- no general completeness guarantee for unrestricted infinite-depth tree search; terminates on a finite graph with proper reached-state checking

The conclusion is not that one wins. The choice is a **trade-off**, and which side you want is a property of the problem, not of the algorithm:

- a shallow solution matters and memory is available → BFS is attractive
- memory is tight and any solution will do → DFS is attractive
- the first DFS branch happens to be a good one → DFS looks spectacular

But “happens to be good” is not knowledge available to a blind strategy.

### Reconstruct the solution

Finding the goal tells us where the search finished, not the route. This is where the `parent` bookkeeping from Highlight 1 earns its place.

```python
parent = {START: None}

# when next_state is first reached
parent[next_state] = state
```

Every reached state records the state it was generated from. When the goal turns up, follow those links backwards:

```python
def reconstruct_path(parent):
    if GOAL not in parent:
        return []

    path = []
    state = GOAL

    while state is not None:
        path.append(state)
        state = parent[state]

    return list(reversed(path))
```

That returns `START → ... → GOAL`. Week 2 defined what a solution path is; Week 3 produces one — an actual sequence of states, rather than the message “goal found”.

The transferable idea is narrow, and worth keeping narrow: the same frontier machinery applies whenever a problem is represented as states connected by legal transitions.

<!-- ct319:focus -->

### Why this matters this week

Week 3 changes exactly one thing from Week 2:

> **who decides what gets attention next**

In Week 2 a human chooses; in Week 3 a frontier policy does, and every consequence traces back to it.

- **`FRONTIER`** — holds the discovered possibilities still waiting
- **`STRATEGY`** — BFS removes the oldest; DFS removes the newest
- **`TRADE-OFF`** — that choice changes expansion order, memory use, and what kind of guarantee is available

Both strategies share one striking limitation. Neither ever asks which state looks closer to the goal. They do not know. They are blind.

<!-- ct319:endfocus -->

<!-- ct319:endbeats -->

## Before Week 4

Run BFS, run DFS, change the successor order, try another preset, and watch the traversal change completely. Then notice what never appears in either strategy:

- distance to the goal
- estimated remaining cost
- any notion of a promising direction

Both algorithms search systematically without a scrap of it. So the next question is:

<!-- ct319:focus -->

> **What if the machine had a useful hint about which states looked more promising?**

<!-- ct319:endfocus -->

That is where **heuristics** begin.

---

## Quick revision

If you can answer these without reopening the page, you have the core of Week 3.

1. **[WK-03-01]** What is the frontier?
2. What is the difference between a **generated** state and an **expanded** state?
3. Why does the maze need a `reached` set, and why is it separate from the frontier?
4. **[WK-03-02]** Why does a FIFO queue produce breadth-first behaviour?
5. Under what condition does BFS guarantee a minimum-move solution?
6. **[WK-03-03]** Why does a LIFO stack produce depth-first behaviour, and why does backtracking emerge from it without any extra machinery?
7. Why can changing successor order alter a DFS run when the algorithm has not changed?
8. **[WK-03-04]** Why does one good DFS result not prove that DFS is optimal?

---

## Sources and licensing notes

### Lecture material

The Week 3 terminology and comparison follow the existing *Problem Solving using Search* lecture material on Canvas, in particular its treatment of:

- search as finding a path from an initial state to a goal state
- search strategy as the rule deciding which node is expanded next
- search cost and solution cost
- time and space complexity
- completeness and optimality
- uninformed versus informed search
- breadth-first and depth-first search, and the memory trade-off between them

These pages develop only **BFS and DFS**. The slides list further uninformed methods — depth-limited, iterative-deepening, uniform-cost and bidirectional search — which are not highlighted here because the live teaching story is the direct comparison between breadth and depth.

Three statements are made more explicit here than in the slides:

- BFS's guarantee is stated as **minimum depth when action costs are equal**, not as a claim about the cheapest route.
- The weighted graph in the notes carries a clarification that standard BFS does not minimise unequal edge weights.
- DFS completeness is stated with its assumptions: unrestricted infinite-depth tree search and finite graph search with reached-state checking are different cases.

### Where the vocabulary comes from

Two words on this page are standard textbook terms rather than slide terms, and it is worth knowing which is which.

**Frontier** is the term used in Russell and Norvig, *Artificial Intelligence: A Modern Approach*, in its chapter on solving problems by searching. Older work calls the same collection the **fringe** (their second edition) or the **open list** (much of the classical search and path-finding literature). **Reached** follows the same book's more recent treatment, where earlier editions and older work say **explored set** or **closed list**.

The slides describe a search strategy as the rule deciding which **node** is expanded next. That is the same idea: the node being chosen is a frontier node. If you are revising from the slides and the word *frontier* does not appear there, it is the vocabulary that differs, not the content.

### Continuity from Week 2

The maze problem definition is inherited unchanged: a 7 × 9 grid, `START = (0,0)`, `GOAL = (6,8)`, and the same `WALLS`, `MOVES`, `neighbours(state)` and `is_goal(state)`. Week 3 changes the controller, not the representation.

The Search Lab preserves the same separation: `problems.js` holds the maze, legal moves, `neighbours()` and goal test; `search.js` supplies the shared graph-search process and the FIFO/LIFO policy; `app.js` handles only controls and presentation. The lab also carries a **hill-climbing** mode, which belongs to Week 4 rather than here: it needs a heuristic to decide which neighbour looks better, and nothing on this page has one.

### Figures

Figures 1–12 were **created for these pages**. They use no external image licence.

- Figure 2 reuses the Week 2 maze diagram unchanged, so the recurring problem is visibly the same object.
- Figures 5 and 7 are a deliberate pair: one frontier, one visual language, differing only in where states are added and removed.
- Figure 8 draws one tree twice instead of repeating it as separate diagrams. Its expansion numbers were verified against a `deque` implementation using `popleft()` and `pop()` on identical successor order: `S A B C D E F G H` for BFS, `S C H B G F A E D` for DFS.
- Figures 6, 9 and 12 are Search Lab screenshots of the default maze and the Week 2 successor order.

No external images, videos or interactives are used. Generic BFS/DFS visualisers and explainer videos were reviewed and rejected: the Search Lab runs the exact Week 2 problem and allows stepping, resetting, racing and reordering successors, while external tools typically drag in weighted algorithms and other later-week material.

### Software

- 🧪 [**Search Lab**](../../search-lab/) — written for this module in HTML, CSS and vanilla JavaScript. No framework, backend, API or build step. The default preset reproduces the Week 2 maze exactly.

### Formal source

The broader Week 3 lecture remains on Canvas. These pages focus on the one question we spend live time on:

> **When several possibilities are waiting and the machine has no guidance, what rule should decide which one gets explored next?**
