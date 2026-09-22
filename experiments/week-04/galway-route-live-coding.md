# Galway route — live coding card

Four things happen, in order: the class picks an algorithm, we code it live,
we read the result against the graph, and then the algorithm that actually
solves it gets introduced.

---

## The block that goes on screen and into every prompt

```
Junctions: A B C D E F G I J L N O Q R S

Roads (undirected, with cost):
  A-B 3   A-C 1   B-C 3   C-O 1   O-E 2   O-F 2
  F-G 1   G-I 5   G-L 2   I-J 4   J-N 5   L-N 5
  N-Q 4   N-S 15  Q-R 1   R-S 6   S-D 7

Start: O  (University Hospital Galway)
Goal:  D  (Merlin Park University Hospital)
```

Last line of every prompt, no exceptions:

> Before the code, state in one sentence which algorithm you implemented and
> which you deliberately did not use. After the code, print the route, its
> total cost, and the number of junctions expanded.

That line is what makes adherence visible instead of assumed. If the model
swaps the algorithm, it has to say so out loud.

---

## Run 1 — Breadth-first search

*The algorithm they have. Ask the room to predict the answer first.*

> Write Python for the graph above. Use breadth-first search exactly as
> defined: a FIFO queue, expand by depth, return the first path that reaches
> D. Do not use the road costs to order the queue. Do not substitute a
> different algorithm.

**Expected** — `O-F-G-L-N-S-D`, cost **32**, 6 roads, 15 junctions expanded.

The question to put to the room: *is 32 the cheapest route?* It is not. BFS
returned the route with the fewest roads. Week 3's "minimum depth, not
minimum cost" is now a number on the screen rather than a caveat.

---

## Run 2 — Hill climbing, with the evaluation function put to a vote

*Do not tell them which one works. None of them do.*

> We need an evaluation function before we can write this. Here are three.
> Which should we use?
>
> **A** — prefer the cheapest road out of the current junction
> **B** — prefer the most expensive road out of the current junction
> **C** — judge a junction by the total cost spent getting there, and prefer lower

Take the vote, then prompt:

> Write Python for the graph above. Use hill climbing: from the current
> junction, move to the best neighbour under the evaluation function below,
> and stop when no neighbour is better. Do not look further ahead than one
> road. Do not substitute a different algorithm.
>
> Evaluation function: *(paste the winner)*

**All three outcomes are verified:**

| Vote | What happens |
|---|---|
| **A** cheapest road | `O-C-A-B` — **stuck** in the cul-de-sac, cost 5, never within reach of D |
| **B** most expensive road | reaches D at cost **39** — the worst of the four routes |
| **C** total spent, minimised | **never moves.** Every road raises the total, so no neighbour is ever "better". Stops at O. |

If the room is split, run two. B and C together are the sharpest pair.

### The point to land here

The graph gives us **cost so far**. It gives us **no estimate of cost
remaining**. Every evaluation function above describes where we have *been*,
not how far we still have to *go* — which is exactly why cheap roads lead
into a dead end.

Compare the maze: `(row, col)` for the current cell and for the goal, so
Manhattan distance falls straight out of the representation. Here there are
no coordinates. The information simply is not in the seventeen numbers.

*The representation decides which algorithms are even available.*

---

## Run 3 — the reveal

*Prepared, not generated. Show the name on the Week 3 taxonomy slide first —
it was in the list we skipped.*

> Write Python for the graph above. Use uniform-cost search: a priority queue
> ordered by the total cost of the path so far, expanding the cheapest
> frontier path first, stopping when D is removed from the queue.

**Expected** — `O-F-G-L-N-Q-R-S-D`, cost **28**, 8 roads, 20 junctions expanded.

Two things to say:

1. It is **one data structure** away from Run 1. Swap the FIFO queue for a
   priority queue ordered by cost. Nothing else changes.
2. It expanded **20** junctions against BFS's 15. The correct algorithm did
   *more* work. That is Lecture 2's own slide — *high search costs usually
   mean low solution costs* — demonstrated rather than claimed.

### If someone asks about A\*

Good question, and the honest answer is the teaching point: A\* adds an
estimate of the distance still to go. This graph cannot supply one. You
would need coordinates or straight-line distances — new information, not a
cleverer algorithm.

---

## Answer key — all four routes

| Route | Cost | Roads |
|---|---:|---:|
| `O-F-G-L-N-Q-R-S-D` | **28** | 8 |
| `O-F-G-L-N-S-D` | 32 | 6 |
| `O-F-G-I-J-N-Q-R-S-D` | 35 | 9 |
| `O-F-G-I-J-N-S-D` | 39 | 7 |

What each algorithm returns:

| Algorithm | Route | Cost | Expanded |
|---|---|---:|---:|
| BFS | `O-F-G-L-N-S-D` | 32 | 15 |
| DFS (alphabetical) | `O-F-G-I-J-N-Q-R-S-D` | 35 | 16 |
| Hill climbing A | stuck at B | — | — |
| Hill climbing B | `O-F-G-I-J-N-S-D` | 39 | — |
| Hill climbing C | never leaves O | — | — |
| Uniform-cost | `O-F-G-L-N-Q-R-S-D` | **28** | 20 |

**The slide erratum.** The deck prints 46 for `O-F-G-I-J-N-S-D`. The printed
weights give `2+1+5+4+5+15+7 = 39`. The other three totals reproduce exactly,
and the two `I-J` routes must differ from the two `L` routes by the same
amount in both cases — which fixes the fourth at 39. Expect a live run to
print 39 while the slide says 46. Hill climbing B lands on this same route,
so it will come up twice.

---

## Running order, for a tight slot

1. Show the graph. Ask which algorithm, and why. **Do not settle it.**
2. Run 1 live — BFS. Read the cost against the four routes.
3. Vote, then Run 2 live — one variant, two if the room is split.
4. Name what is missing: cost so far, no estimate of cost remaining.
5. Run 3 — prepared. Reveal the name from the Week 3 slide.
6. Close: the algorithm was never the first decision. The representation was.
