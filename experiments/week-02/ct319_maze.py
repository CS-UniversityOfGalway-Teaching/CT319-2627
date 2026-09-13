#!/usr/bin/env python3
"""
CT319 Week 2 — a searchable problem, with no search strategy

The program knows the maze, the start, the goal, the legal moves and the
goal test. It can generate every legal next state.

It deliberately does NOT decide which of those states to explore first.
A human makes that choice. That missing decision is the whole point of
where Week 2 stops.

Run:
    python ct319_maze.py
"""

from __future__ import annotations

# =====================================================================
# PART 1 — THE PROBLEM DEFINITION
#
# Everything in this part describes the problem itself. It says nothing
# about how the problem should be solved, and it is reused unchanged in
# later weeks.
# =====================================================================

ROWS = 7
COLS = 9

START = (0, 0)
GOAL = (6, 8)

# The walls never move. They belong to the problem definition,
# not to the current state.
WALLS = {
    (0, 2),
    (1, 0), (1, 2), (1, 4), (1, 5), (1, 6), (1, 8),
    (2, 6),
    (3, 1), (3, 2), (3, 3), (3, 4), (3, 6), (3, 7),
    (4, 4),
    (5, 0), (5, 1), (5, 2), (5, 4), (5, 5), (5, 6), (5, 8),
}

# An action is a change in coordinates. On its own it says nothing
# about whether applying it is legal.
MOVES = {
    "UP":    (-1, 0),
    "DOWN":  (+1, 0),
    "LEFT":  (0, -1),
    "RIGHT": (0, +1),
}


def is_legal(state):
    """The problem's constraints: stay on the grid, keep out of walls."""
    row, col = state
    inside_grid = 0 <= row < ROWS and 0 <= col < COLS
    return inside_grid and state not in WALLS


def neighbours(state):
    """Every legal state reachable from `state` in one action.

    This is the central Week 2 idea. It reports what is *possible*.
    It expresses no opinion about what is *advisable*.
    """
    row, col = state
    result = []

    for action, (d_row, d_col) in MOVES.items():
        candidate = (row + d_row, col + d_col)
        if is_legal(candidate):
            result.append((action, candidate))

    return result


def is_goal(state):
    """The goal test."""
    return state == GOAL


# =====================================================================
# PART 2 — THE WEEK 2 CONTROLLER
#
# This part is not the problem. It is a temporary stand-in for the
# decision the machine cannot yet make, and a way to look at the state.
# =====================================================================

def render(state):
    """Draw the maze with the current state marked."""
    for row in range(ROWS):
        line = []
        for col in range(COLS):
            cell = (row, col)
            if cell == state:
                line.append("@")
            elif cell == GOAL:
                line.append("G")
            elif cell in WALLS:
                line.append("#")
            else:
                line.append(".")
        print(" ".join(line))


def play():
    state = START
    steps = 0

    while not is_goal(state):
        print()
        render(state)
        print(f"\nCurrent state: {state}")

        options = neighbours(state)
        print("\nLegal next states:")
        for action, next_state in options:
            print(f"  {action:5} -> {next_state}")

        choice = input("\nMove: ").strip().upper()
        legal_choices = dict(options)

        if choice not in legal_choices:
            print("That move is not legal from here.")
            continue

        state = legal_choices[choice]
        steps += 1

    print()
    render(state)
    print(f"\nGoal reached in {steps} moves.")
    print("The program generated the options. You chose between them.")


if __name__ == "__main__":
    play()
