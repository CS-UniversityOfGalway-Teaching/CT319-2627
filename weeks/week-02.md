---
title: Week 2 — Problems, states and search
eyebrow: CT319 Artificial Intelligence · Week 2 · Problems, states and search
question: How do you turn a messy problem into something a machine can search?
description: CT319 Week 2. Representation, states, operators and search spaces, developed through Farmer Jones and a maze whose legal next states a program can generate.
bar: Week 2 · Sections
source: week-02.md
---

A river, a wolf, a goat and a cabbage sound like a story. A maze looks like a picture. Getting from Galway to Dublin sounds like an ordinary morning.

People read all three without effort, and while reading them we quietly decide which details matter. A computer starts with none of that. Before it can look for a solution, somebody has to say what a situation *is*, what may be done to it, and what would count as success.

Week 1 asked what we are entitled to conclude from a machine's behaviour. Week 2 is more concrete: **what does a machine have to be given before problem solving is even possible?**

We work through four things.

* We start with [**representation**](#from-a-messy-problem-to-a-representation). The same real situation becomes several different computational problems depending on what we keep and what we throw away.

* We then take the [**Farmer Jones river-crossing puzzle**](#farmer-jones--solve-the-story-first) and turn an English story into states, operators, constraints and a state space. This is the main formal work of the week.

* [**A maze**](#the-maze--the-same-computational-structure) then shows that two problems which look nothing alike to a person can have almost the same computational shape.

* Finally we [**build a searchable problem**](#building-the-searchable-problem-in-code) in code. It will know where it is, what is legal and whether it has finished — and it will deliberately stop one decision short of solving anything.

Three words carry the whole page, and it is worth keeping them apart:

<div class="lenses">
<div class="lens"><span class="lens__key">Representation</span><span class="lens__gloss">what we choose to record about the problem</span></div>
<div class="lens"><span class="lens__key">Transition</span><span class="lens__gloss">how one valid situation legally becomes another</span></div>
<div class="lens"><span class="lens__key">Search space</span><span class="lens__gloss">the structure those states and transitions create between them</span></div>
</div>

The representation decides what states exist. The transitions connect them. Together they produce something in which the idea of a *solution* finally has a precise meaning.

<!-- ct319:beats -->

<!-- ct319:beat -->
## From a messy problem to a representation

Consider an ordinary problem:

> I need to get from Galway to Dublin tomorrow morning.
> I have €30.
> I do not want to drive.
> I have a meeting at 11:00.
> It might rain.
> My phone battery is at 40%.
> I have not had breakfast.

A human reader immediately begins sorting this. Some of it feels important, some of it feels like noise. But notice that the sorting cannot happen until we know what we are actually trying to do.

### Change the goal and the relevant information changes

Suppose the goal is **arrive in Dublin before 11:00**. Then departure times, journey durations and the available forms of transport matter. Ticket prices probably do not. The phone battery certainly does not.

Now make the goal **reach Dublin as cheaply as possible**. Ticket prices have become the centre of the problem, and the 11:00 deadline may drop out entirely.

Change it once more to **arrive by 11:00 without getting soaked**. The rainfall forecast and the walking distance between connections suddenly matter, and they were irrelevant a moment ago.

![One situation, three goals, three representations](../../media/week-02/goal-changes-representation.svg "hero")

<sub><em>Figure 1. The same Galway to Dublin situation under three different goals. Each goal makes different information relevant, and therefore produces a different representation. Diagram created for these pages; no external image licence is used.</em></sub>

Nothing about Galway, Dublin or tomorrow's weather changed between those three paragraphs. What changed was the question — and with it, the **representation**.

> [!IMPORTANT]
> **The real-world problem is not the same thing as its computational representation.**
>
> A representation is a deliberately simplified model, built to contain what a particular question needs and to leave out everything else.

This is the first idea of Week 2, and most of the rest of the page is a consequence of it.

### Relevance is not a property of the information

It is tempting to think of facts as intrinsically relevant or irrelevant. They are not. `phone battery = 40%` is noise for a train timetable and essential for a problem about whether you can navigate once you arrive.

A computer cannot make that call. It has no way of knowing that the colour of a cabbage does not affect a river crossing while the bank the cabbage is standing on does. Someone has to decide.

That means problem solving begins **before** any algorithm is chosen. It breaks into three jobs, in order:

1. define the problem precisely
2. isolate and represent the knowledge needed to solve it
3. choose an appropriate problem-solving technique

The order is the point. Choosing a clever technique before knowing what the states and legal actions are is working backwards.

![From an unstructured situation to a searchable problem](../../media/week-02/representation-pipeline.svg "hero")

<sub><em>Figure 2. The pipeline from an unstructured situation to a problem a machine can search. Week 2 covers every step except the last one's payoff. Diagram created for these pages; no external image licence is used.</em></sub>

<!-- ct319:beat -->
## Farmer Jones — solve the story first

Farmer Jones has a wolf, a goat, a prize cabbage and a small boat. He needs all three of his charges moved from the **south bank** of a river to the **north bank**.

The boat carries Farmer Jones and **at most one** other thing. And he has two problems:

- left alone together, the wolf eats the goat
- left alone together, the goat eats the cabbage

![The Farmer Jones river-crossing problem](../../media/week-02/farmer-jones-river.svg "secondary")

<sub><em>Figure 3. The starting situation. Everything begins on the south bank, and the boat holds the farmer plus at most one other item. Diagram created for these pages; no external image licence is used.</em></sub>

> **How can Farmer Jones get everything safely to the north bank?**

### Solve it as a human first

Before formalising anything, solve it. It takes a few minutes and the experience matters for what follows.

While you work, pay attention to what you are keeping track of in your head. Almost certainly it is which bank each of the four is on, and nothing else. You are not tracking the colour of the cabbage, the age of the wolf, the name of the boat, or why the farmer owns a wolf in the first place.

That is the representation problem from the opening section, happening automatically, in a world small enough to watch yourself do it.

<!-- ct319:beat -->
## What makes a representation useful?

A good representation is doing several jobs at once, and they pull against each other.

- **Make the important objects and relationships explicit** — in the Galway problem, that the journey has a start, an end and a departure time, rather than leaving those buried in prose.
- **Suppress irrelevant detail**, so the breakfast and the phone battery never reach the machine at all.
- **Expose the constraints**, because a problem is defined as much by what is forbidden as by what is possible. A €30 budget is not a decoration on the problem; it is part of its shape.
- **Stay concise** enough to work with. A representation that records every fact about tomorrow morning is faithful and useless.
- **Stay complete** enough for the task. If we discard departure times and then ask whether we can arrive by 11:00, the question is no longer answerable from what we kept.

The last two are in direct tension, and resolving that tension sensibly is the skill. Keep too much and the problem becomes unwieldy; keep too little and correct answers become unreachable.

### The vocabulary we need

Farmer Jones will do most of the real teaching, so we only need enough language here to describe what you just did by hand.

- **Abstraction** — deliberately dropping detail that the current question does not need.
- **State** — a description of the situation at one particular moment, containing only what matters.
- **Initial state** — where the problem begins.
- **Goal** — what counts as success. Where many different situations would count, it is more useful to speak of a **goal test**: a check answering *does this state satisfy the objective?*
- **Action**, or **operator** — something the problem permits us to do, which turns one state into another.
- **Transition** — the actual change from one state to the next when an operator is applied.

Two more terms need more care than the rest.

<!-- ct319:beat -->
## Preconditions and constraints

These are easy to blur together, and blurring them makes the Farmer Jones analysis muddy.

A **precondition** is about the *operator*. It says what must already be true for this particular action to be applicable at all. You cannot carry the wolf across the river if you and the wolf are standing on opposite banks — not because it is a bad idea, but because the action is meaningless.

A **constraint** is about the *problem*. It says which situations the problem permits, regardless of how you arrived at them. Leaving the goat alone with the cabbage is forbidden no matter which operator produced it.

> [!NOTE]
> **Precondition** — can this action be applied here?
>
> **Constraint** — is the resulting situation allowed to exist?
>
> They interact constantly, but they answer different questions. An action can be perfectly applicable and still produce a forbidden situation.

Keeping them separate lets us say something precise later: an operator is *usable* when its precondition holds **and** the state it produces satisfies the constraints.

### A question that usually exposes the representation

Whenever you meet a new problem, ask:

> **What would have to be recorded in a state for the machine to work out what can happen next?**

Whatever the answer is, that is roughly your representation. If two situations would allow different things to happen next, they cannot be the same state.

### Why this matters this week

Search does not operate on the world. It operates on a representation of the world that somebody built.

If necessary information was left out, the machine cannot reason about it — the fact simply does not exist as far as the program is concerned. If unnecessary information was left in, we have created more situations to distinguish between than the problem actually requires.

So before asking *how* to search, we have to be able to say precisely **what is being searched**. With the story already solved, Farmer Jones is small enough to hold entirely in view while we make it precise.

<!-- ct319:beat -->
## Turning Farmer Jones into a state

Four things, each on one of two banks. So a state can be written as four positions:

```text
(Farmer, Wolf, Goat, Cabbage)
```

with:

```text
S = south bank
N = north bank
```

which makes the opening situation `(S,S,S,S)` and the target `(N,N,N,N)`.

### Where did the boat go?

Look at what the story contained and what the state contains.

The story has a farmer, a wolf, a goat, a cabbage **and a boat**. The state has four slots, and the boat is not one of them. This looks like an oversight. It is the single most instructive decision in the whole example.

The boat never travels without Farmer Jones. It cannot: he is the only one who can row it. So the moment we know which bank the farmer is on, we already know which bank the boat is on. Recording it separately would add a variable that can never disagree with one we already have — it would double the number of tuples we can write down without letting us describe a single new situation.

> [!IMPORTANT]
> **Complete does not mean writing down everything in the story.**
>
> A representation is complete when nothing needed to solve the problem has been lost. Information that is fully determined by what we already store is not lost when we drop it — it is still there, implied.

This is worth carrying forward. When you are deciding what belongs in a state, the test is not "is this thing in the problem?" but "could this vary independently of what I am already recording?"

![From the river scene to a four-position tuple](../../media/week-02/farmer-jones-abstraction.svg "hero")

<sub><em>Figure 4. The abstraction in three stages: the physical arrangement, the four positions that can vary independently, and the tuple that records them. The boat is dropped because its position is already implied by the farmer's. Diagram created for these pages; no external image licence is used.</em></sub>

### Reading a tuple

The tuple is not a code to be memorised. It is positional: slot one is the farmer, slot two the wolf, slot three the goat, slot four the cabbage.

So `(N,S,N,S)` reads as farmer and goat on the north bank, wolf and cabbage on the south. Nothing more is being claimed than that.

<!-- ct319:beat -->
## Raw configurations, valid states and reachable states

Four slots, two possible values each:

```text
2 × 2 × 2 × 2 = 16
```

Sixteen tuples can be formed. That is a fact about the *notation*, not about the puzzle — it counts what the representation is capable of expressing, before anyone asks whether those situations are allowed.

Distinguishing three things here will save confusion later:

- **raw configurations** — everything the representation can express. Sixteen.
- **valid states** — those the constraints permit. We are about to find there are ten.
- **reachable states** — the valid ones you can actually get to from the start.

These are not automatically the same. A problem can easily have valid states that are unreachable, marooned somewhere the operators cannot take you. For Farmer Jones they happen to coincide: all ten valid states are reachable from `(S,S,S,S)`. Worth knowing that this is a fact about this puzzle rather than a general rule.

<!-- ct319:beat -->
## Operators and transitions

There are four things the farmer can do:

```text
Farmer-Takes-Self
Farmer-Takes-Wolf
Farmer-Takes-Goat
Farmer-Takes-Cabbage
```

A name is not a definition. Take one and write it out properly.

```text
OPERATOR
Farmer-Takes-Goat

PRECONDITION
Farmer and Goat are on the same bank.

EFFECT
Farmer and Goat move to the opposite bank.
Wolf and Cabbage stay where they are.

SAFETY CONSTRAINT
The resulting configuration must not leave
Wolf + Goat, or Goat + Cabbage, without the Farmer.
```

Notice that these three do genuinely different jobs, and this is where the distinction from the previous section earns its keep.

The **precondition** is about whether the action makes sense. In `(S,N,S,S)` the farmer is south and the wolf is north, so `Farmer-Takes-Wolf` cannot be applied — not because it leads somewhere bad, but because there is no wolf to take. This is not a poor move. It is not a move.

The **effect** says what changes, and just as importantly what does not. The wolf and cabbage staying put is part of the definition.

The **safety constraint** is about the situation that results. It does not care which operator produced it.

An operator is usable when its precondition holds *and* its effect lands somewhere the constraints allow. Two separate tests, applied at two different moments.

### Safe and unsafe states

Apply `Farmer-Takes-Wolf` to `(S,S,S,S)` and you get `(N,N,S,S)`. The precondition was satisfied — farmer and wolf were both south. But look at what it produced: the goat and the cabbage alone on the south bank.

![Safe and unsafe Farmer Jones states](../../media/week-02/farmer-jones-safe-unsafe.svg "hero")

<sub><em>Figure 5. Three arrangements. A conflicting pair is permitted when the farmer is present, and forbidden when he is not. Diagram created for these pages; no external image licence is used.</em></sub>

The rule stated precisely:

> If the farmer is not on a bank, then on that bank the wolf may not be with the goat, and the goat may not be with the cabbage.

Note that a conflicting pair is not forbidden in itself — the top panel of Figure 5 has the goat and cabbage side by side quite legally, because the farmer is standing there.

<!-- ct319:beat -->
## Building the state-space graph

Applying that constraint to all sixteen tuples leaves ten:

```text
(S,S,S,S)   (N,S,N,S)
(S,S,S,N)   (N,S,N,N)
(S,S,N,S)   (N,N,S,N)
(S,N,S,S)   (N,N,N,S)
(S,N,S,N)   (N,N,N,N)
```

Six configurations were expressible and forbidden. The problem is no longer "search every arrangement of four objects" but "search the ten the constraints allow", and we have not yet done any searching to achieve that reduction — it fell out of the representation.

### Building the graph, rather than being handed one

Before looking at the finished picture, work out one piece of it.

Take the state `(S,S,N,S)` — farmer, wolf and cabbage south, goat already north.

> **Which of the four operators can actually be applied here, and which of the results are safe?**

Work through them one at a time. Check the precondition first, then check the state the effect produces.

<br>

Working through them one at a time:

- **`Farmer-Takes-Self`** — precondition always holds. Gives `(N,S,N,S)`, which is safe.
- **`Farmer-Takes-Wolf`** — precondition holds, both are south. Gives `(N,N,N,S)`, safe, because the farmer is with the wolf and goat.
- **`Farmer-Takes-Cabbage`** — precondition holds. Gives `(N,S,N,N)`, safe for the same reason.
- **`Farmer-Takes-Goat`** — fails its precondition outright. The goat is north and the farmer is south, so there is no goat to take.

So `(S,S,N,S)` has exactly three legal transitions. Do that for every state and the graph builds itself.

### The complete state space

![The complete safe state space for Farmer Jones](../../media/week-02/farmer-jones-state-space.svg "hero")

<sub><em>Figure 6. All ten safe states, with an edge wherever one legal crossing turns one state into another. The graph was constructed by applying every operator to every safe state and keeping the results the constraints permit. Diagram created for these pages from the CT319 problem definition; no external image licence is used.</em></sub>

Every node is a safe state. Every edge is one legal crossing, labelled with who travels with the farmer. This is the **state space**, and it was not drawn by inspiration — it is the exhaustive result of the definitions above.

Three things are now visible that were not visible in the story:

- **The start state has only one legal move.** The goat must go first — and the graph makes that unavoidable rather than clever.
- **The middle splits into two symmetric routes and rejoins**, which is why the puzzle has two distinct shortest solutions rather than one.
- **`(S,S,N,S)` is the branch point** where those two routes diverge. That is the state we just worked through by hand.

<!-- ct319:beat -->
## A solution becomes a path

![One solution path through the Farmer Jones state space](../../media/week-02/farmer-jones-solution-path.svg "hero")

<sub><em>Figure 7. One of the two seven-crossing solutions, numbered from the start state to the goal. The other runs through the lower branch and is exactly as good. Diagram created for these pages; no external image licence is used.</em></sub>

In words: take the goat over, come back alone, take the wolf over, bring the goat back, take the cabbage over, return alone, take the goat over. Seven crossings.

The sequence is not the thing worth remembering. What matters is that **a solution has become a path through a graph** — and that is a completely different kind of object from a story about a farmer. Paths can be counted, compared and looked for systematically. Stories cannot.

### The algorithm sees structure, not story

Look at what the machine now needs in order to work on this problem. Not what a wolf is. Not what a cabbage tastes like, or why anyone would leave one unattended. It needs:

```text
a start state
a goal test
the set of valid states
the legal transitions between them
```

Everything that made this a story has been consumed by the representation, and what is left is structure.

> [!IMPORTANT]
> **The algorithm sees structure, not story.**
>
> The story matters enormously while we are designing the representation — it is the only source of the constraints. Once the representation is built, the same machinery works on farmers, robots, timetables or game positions without knowing the difference.

That indifference is not a limitation. It is precisely what makes general problem-solving methods possible.

### Why this matters this week

Farmer Jones contains the entire Week 2 idea at a size you can hold in your head.

**`REPRESENTATION`** turned a paragraph of English into `(Farmer, Wolf, Goat, Cabbage)`, and justified dropping the boat.

**`TRANSITION`** turned "he rows across with the goat" into an operator with a precondition, an effect and a constraint.

**`SEARCH SPACE`** turned ten safe states and their legal connections into a graph in which "solution" means something exact.

The puzzle is no longer merely something a human can reason about. It is something a machine *could* search. Whether that shape is peculiar to river puzzles is the next question.

<!-- ct319:beat -->
## The maze — the same computational structure

A maze has no wolf, no goat, no cabbage, no boat and no river. To a person it has nothing whatsoever in common with the last section.

Computationally it is nearly the same problem, and that is the point of putting it here.

### The maze

![The CT319 Week 2 maze](../../media/week-02/maze-grid.svg "hero")

<sub><em>Figure 8. The Week 2 maze: seven rows, nine columns, start at (0,0) and goal at (6,8). Every open cell is labelled with its (row, column) address. Diagram created for these pages; no external image licence is used.</em></sub>

The same maze written as text, which is the form the code will use:

```text
    0 1 2 3 4 5 6 7 8

0   S . # . . . . . .
1   # . # . # # # . #
2   . . . . . . # . .
3   . # # # # . # # .
4   . . . . # . . . .
5   # # # . # # # . #
6   . . . . . . . . G
```

```text
S = start      # = wall
G = goal       . = open cell
```

A person looks at this and sees a route. What should the machine see?

<!-- ct319:beat -->
## The maze state and legal neighbours

This is the distinction that causes the most trouble, so it is worth being blunt about it.

The walls never move. The grid never changes size. The goal stays where it is. None of that is part of the current situation — it is part of the **problem definition**, fixed for the whole exercise.

What actually changes as the agent moves is one thing: where the agent is. So the state is:

```text
(row, column)
```

and nothing else. Not the maze. Not the walls. Not the route taken so far. The start is `(0,0)`, the goal is `(6,8)`, and if the agent is at `(2,3)` then `(2,3)` is the complete state.

> [!NOTE]
> **The map is not the state.**
>
> Anything that cannot change during the problem belongs to the problem definition. The state records only what varies.

We do not store the agent's colour, or how long it has been going, or which way it is facing — unless one of those would change what it can do next. That test again decides everything.

### Actions and constraints

Four actions, each a change in coordinates:

```text
UP    = (-1, 0)        LEFT  = (0, -1)
DOWN  = (+1, 0)        RIGHT = (0, +1)
```

An action proposes a transition. Whether it is legal is a separate question, and the constraints answer it: the destination must stay inside the grid, and must not be a wall.

![Legal neighbours of the state (2,3)](../../media/week-02/maze-neighbours.svg "hero")

<sub><em>Figure 9. From (2,3), all four move vectors are tried. Three land on open cells and become legal next states; DOWN reaches the wall at (3,3) and is discarded. Diagram created for these pages; no external image licence is used.</em></sub>

From `(0,0)` the arithmetic is even starker. `UP` and `LEFT` leave the grid, `DOWN` hits the wall at `(1,0)`, and only `RIGHT` survives. The start state has exactly one legal move — just as `(S,S,S,S)` did.

### The same computational shape

Set the two problems side by side:

| | Farmer Jones | Maze |
| --- | --- | --- |
| **State** | `(Farmer, Wolf, Goat, Cabbage)` | `(row, column)` |
| **Start** | `(S,S,S,S)` | `(0,0)` |
| **Goal** | `(N,N,N,N)` | `(6,8)` |
| **Actions** | four river crossings | `UP` `DOWN` `LEFT` `RIGHT` |
| **Constraints** | no unattended conflicting pair | stay on the grid, avoid walls |
| **Transition** | a crossing whose result is safe | a move onto an open cell |

The left-hand column is a folk puzzle. The right-hand column is a grid. The rows are the same rows.

That is why representation is worth this much attention: it is the step that makes two unrelated-looking problems into instances of the same thing. Every open cell is a state, every legal move between neighbouring cells is an edge, and the picture of the maze is simply a convenient way of displaying a graph we never had to draw.

<!-- ct319:beat -->
## When position alone is not enough

Now break it deliberately. Suppose the maze contains a locked door and a key somewhere else.

Is `(row, column)` still sufficient? Stand at `(4,3)`, immediately above the door at `(5,3)`.

![The same cell, two different states](../../media/week-02/maze-has-key.svg "hero")

<sub><em>Figure 10. The agent occupies (4,3) in both panels. Without the key, DOWN is not a legal move; with it, DOWN is legal. Identical positions, different legal actions. Diagram created for these pages; no external image licence is used.</em></sub>

The position is the same in both panels. The legal moves are not. So `(row, column)` can no longer tell the machine what can happen next, and by the test we have been using all week, these must be two different states:

```text
(row, column, has_key)
```

> [!IMPORTANT]
> **If two situations allow different things to happen next, they are not the same state.**
>
> Adding a variable to the tuple is the consequence, not the insight. The insight is noticing that the old representation could no longer answer the question we needed it to answer.

There is a cost. With position alone there is at most one state per open cell. Add `has_key` and many cells now correspond to two distinct states — the same place, before and after finding the key. Richer representations describe more, and they also produce more situations to distinguish between. That trade-off never really goes away.

### This maze is staying with us

The maze is not a disposable example. We will keep this exact problem and change what the machine does with it.

- **This week** — what is a state, which moves are legal, and what states can come next?
- **Next** — when several next states are legal, how should the machine choose between them?
- **Later** — can extra information help guide that choice?

Holding the problem fixed is what will let us see clearly what changes.

### Why this matters this week

Farmer Jones alone might suggest that state-space thinking is a trick for puzzles. The maze shows it is not.

The machinery never needed a concept of a wolf, and it does not need a concept of a wall. It needs a problem that can supply just three things:

- a current state
- the legal states that may follow it
- a way to recognise the goal

Anything able to provide those three things is searchable. So let us build exactly that, in code, and see how far it gets us.

<!-- ct319:beat -->
## Building the searchable problem in code

The aim of the build is deliberately modest, and its limitation is the lesson.

We are not writing something that finds a route. We are writing the thing a route-finder would need, and then stopping — one decision short — so that the missing piece becomes visible rather than theoretical.

By the end, the program can answer:

```text
Where am I?
Where is the goal?
Which moves are legal from here?
What state does each legal move produce?
Have I finished?
```

And it will have no opinion whatever on:

```text
Which of these legal states should I look at first?
```

### The shape of the program

The code splits into two parts, and keeping them apart is a genuine design decision rather than tidiness.

![The problem definition and the Week 2 controller](../../media/week-02/problem-definition-vs-controller.svg "hero")

<sub><em>Figure 11. The problem definition describes what is true and what is legal. The controller is a placeholder for a decision the machine cannot yet make. Diagram created for these pages; no external image licence is used.</em></sub>

📦 [**`ct319_maze.py`**](https://github.com/CS-UniversityOfGalway-Teaching/CT319-2627/blob/main/experiments/week-02/ct319_maze.py) — the complete Week 2 program. Python standard library only; nothing to install.

### The problem definition

The maze becomes data. The picture stops being necessary.

```python
ROWS, COLS = 7, 9
START = (0, 0)
GOAL  = (6, 8)

WALLS = {
    (0, 2),
    (1, 0), (1, 2), (1, 4), (1, 5), (1, 6), (1, 8),
    (2, 6),
    (3, 1), (3, 2), (3, 3), (3, 4), (3, 6), (3, 7),
    (4, 4),
    (5, 0), (5, 1), (5, 2), (5, 4), (5, 5), (5, 6), (5, 8),
}
```

`WALLS` is the clearest example of the earlier point: it is defined once, never modified, and never appears in a state.

The actions are pure coordinate arithmetic, and say nothing about legality:

```python
MOVES = {
    "UP":    (-1, 0),
    "DOWN":  (+1, 0),
    "LEFT":  (0, -1),
    "RIGHT": (0, +1),
}
```

The constraints get their own function, which is the whole of what "legal state" means here:

```python
def is_legal(state):
    row, col = state
    inside_grid = 0 <= row < ROWS and 0 <= col < COLS
    return inside_grid and state not in WALLS
```

And then the important one:

```python
def neighbours(state):
    row, col = state
    result = []

    for action, (d_row, d_col) in MOVES.items():
        candidate = (row + d_row, col + d_col)
        if is_legal(candidate):
            result.append((action, candidate))

    return result
```

This is the centre of Week 2. Give it a state, and it returns every legal state that can follow, each labelled with the action that gets there. It is Figure 9 expressed as six lines of Python:

```python
>>> neighbours((2, 3))
[('UP', (1, 3)), ('LEFT', (2, 2)), ('RIGHT', (2, 4))]
```

Three options come back. The function has produced no ranking, no preference and no suggestion. It reports what is possible and stops.

Finally the goal test:

```python
def is_goal(state):
    return state == GOAL
```

That completes the problem: a start, a goal test, a set of actions, the constraints that filter them, and a transition function. Every ingredient the Farmer Jones graph had.

<!-- ct319:beat -->
## What is still missing? — the machine cannot yet choose what to explore

```python
def play():
    state = START

    while not is_goal(state):
        render(state)
        options = neighbours(state)

        for action, next_state in options:
            print(f"  {action:5} -> {next_state}")

        choice = input("\nMove: ").strip().upper()
        legal_choices = dict(options)

        if choice not in legal_choices:
            print("That move is not legal from here.")
            continue

        state = legal_choices[choice]
```

Run it and the division of labour is unmistakable.

The **program** supplies the representation, the constraints, the legal next states and the goal test. The **human** supplies one thing: which of the offered states to move to.

That single `input()` call is where a search strategy will eventually go. Right now a person is standing in for it, which is a perfectly honest description of where Week 2 ends.

### Change the problem, or change the representation?

These sound similar and are not, and telling them apart is a good test of whether the section has landed.

**Changing the problem instance.** Move a wall, put the goal somewhere else, make the grid larger, block another cell. Then ask: *is `(row, column)` still enough to say what can happen next?*

Yes, every time. A bigger maze has more states, and a different goal makes `is_goal` return true somewhere else, but the *kind* of thing a state is has not changed. Only the data changed — `WALLS`, `GOAL`, `ROWS`, `COLS` — and `neighbours` did not need a single edit.

**Changing the representation.** Now add the key and the locked door. Ask the same question: *is `(row, column)` still enough?*

No. As Figure 10 showed, the same position now permits different moves depending on something position does not record. The state itself has to change shape:

```text
(row, column, has_key)
```

and `is_legal`, `neighbours` and `is_goal` all have to be rewritten to handle a three-part state.

That is the real distinction. Editing the data is routine. Editing what a state *is* changes the problem's structure, and everything built on top of it.

> [!NOTE]
> Try the instance changes first, and only reach for the key once the basic representation is completely clear. The key is a probe for testing understanding, not a way to make the starting example more elaborate.

### Why this matters this week

The build makes one boundary concrete: **a problem representation is not a solving strategy.**

Our program can enumerate every legal state that could come next, from any state, correctly, every time. It cannot decide which of them deserves attention, and nothing in it is even shaped like an opinion on the matter.

So Week 2 closes exactly where it should:

**`REPRESENTATION`** — the maze exists as data, and a state is `(row, column)`

**`TRANSITION`** — `neighbours(state)` generates the legal next states

**`SEARCH SPACE`** — repeated transitions define everywhere the agent could reach

And the missing piece is no longer an abstraction. It is one line:

```python
choice = input("\nMove: ")
```

<!-- ct319:endbeats -->

## Before Week 3

Our program now reaches this point and halts:

```text
Current state: (2, 3)

Legal next states:
  UP    -> (1, 3)
  LEFT  -> (2, 2)
  RIGHT -> (2, 4)
```

The representation has done everything asked of it. The states exist, the constraints have been applied, the legal transitions have been generated, and the goal test is ready.

> **We now know which states exist and which moves are legal.**
>
> **But if several next states are possible, which one should the machine explore first?**

Nothing on this page answers that. Notice that the question is not about the maze, or about Farmer Jones — both would pose it equally. It is a question about what to do with a state space once you have one.

That is where Week 3 begins.

---

## Quick revision

If you can answer these without reopening the page, you have the core of Week 2.

1. Why is a real-world problem not the same thing as its computational representation?
2. Why can changing the goal change which information is relevant, when the physical situation has not changed at all?
3. Why does the Farmer Jones state contain no boat, and what does that tell us about the word *complete*?
4. What is the difference between an operator's **precondition**, its **effect**, and a **constraint** on the problem?
5. Why are only 10 of the 16 possible Farmer Jones configurations safe — and why is 16 a fact about the notation rather than about the puzzle?
6. What does a single edge represent in the Farmer Jones state-space graph?
7. Why can a river-crossing puzzle and a maze be treated as the same kind of computational problem? Why are the maze's walls not part of the state?
8. What does `neighbours(state)` provide, and which decision does it deliberately not make?

---

## Sources and licensing notes

### CT319 source material

The representation terminology and the Farmer Jones example follow the existing CT319 *Introduction to AI* lecture material on Canvas, in particular its treatment of:

- intelligent problem solving
- problem representation, and relevant versus irrelevant information
- concise and complete representations
- states, start states and goal states
- operators
- Farmer Jones, and safe versus unsafe states
- state-space representation

This page develops the parts we spend time on in class rather than reproducing the formal lecture. The slides remain the authoritative statement of the module content.

### Figures

- Figures 1–11 were **created for these pages**. They use no external image licence.
- The Farmer Jones state space in Figures 6 and 7 was derived by applying the operator definitions and safety constraints to all 16 configurations, rather than copied from the Canvas slides. It was checked programmatically: 16 raw configurations, 10 safe, all 10 reachable from `(S,S,S,S)`, 10 legal transitions, and a shortest solution of 7 crossings.
- The maze figures are generated from the same `WALLS` set used by the Week 2 program, so the diagrams and the code cannot drift apart.

No external images, videos or interactives are used on this page. Available river-crossing videos and puzzle applets were reviewed and rejected on two grounds:

- they simply reveal the seven-move solution, which removes the part students should work through themselves, or
- they move directly into search strategies that belong to later weeks.

### Software

- 📦 [**`ct319_maze.py`**](https://github.com/CS-UniversityOfGalway-Teaching/CT319-2627/blob/main/experiments/week-02/ct319_maze.py) — written for this module; Python standard library only. The problem definition and the Week 2 controller are separated inside the file so the problem can be reused unchanged in later weeks.
