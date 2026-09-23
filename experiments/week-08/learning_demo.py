#!/usr/bin/env python3
"""CT319 Week 8: the same six points, with and without supplied labels.

Install: python -m pip install scikit-learn matplotlib
Run:     python learning_demo.py
         python learning_demo.py --mode classification
         python learning_demo.py --mode clustering
Export:  python learning_demo.py --save-dir media/week-08

Click the button (or press Space) to run and reveal each next stage.
Export mode writes four SVG figures without opening a window.
"""
from argparse import ArgumentParser
from pathlib import Path

# One shared dataset. The unknown point is a separate classification query.
X = [[1.0, 1.0], [1.5, 2.0], [2.0, 1.3],
     [5.8, 6.4], [6.0, 5.8], [6.5, 5.5]]
y = ["A", "A", "A", "B", "B", "B"]
unknown = [[2.4, 1.8]]
STAGES = ("classification-before", "classification-after",
          "clustering-before", "clustering-after")
COLOURS = ("#0969da", "#a34400")
MARKERS = ("o", "s")


def classify():
    from sklearn.neighbors import KNeighborsClassifier
    model = KNeighborsClassifier(n_neighbors=3)
    model.fit(X, y)
    return model.predict(unknown)[0]


def cluster():
    from sklearn.cluster import KMeans
    model = KMeans(n_clusters=2, random_state=42, n_init=10)
    return model.fit_predict(X)


def draw(ax, stage):
    """The before stages draw inputs only; fitting happens on reveal."""
    ax.clear()
    ax.set(xlim=(0, 8), ylim=(0, 8), xlabel="Feature 1", ylabel="Feature 2")
    ax.set_aspect("equal")
    ax.set_xticks(range(9))
    ax.set_yticks(range(9))
    ax.grid(color="#d8dee4", linewidth=0.7, zorder=0)
    ax.spines[["top", "right"]].set_visible(False)
    if stage.startswith("classification"):
        for label, colour, marker in zip(("A", "B"), COLOURS, MARKERS):
            points = [point for point, answer in zip(X, y) if answer == label]
            ax.scatter(*zip(*points), s=135, c=colour, marker=marker,
                       label=f"Supplied class {label}", zorder=3)
        revealed = stage.endswith("after")
        prediction = classify() if revealed else None
        colour = COLOURS[("A", "B").index(prediction)] if revealed else "#24292f"
        ax.scatter(*zip(*unknown), s=270, facecolors="white", edgecolors=colour,
                   linewidths=2.5, marker="D", zorder=4)
        ax.annotate(prediction if revealed else "?", unknown[0], ha="center",
                    va="center", fontsize=13, weight="bold", color=colour, zorder=5)
        ax.annotate(f"Predicted {prediction}" if revealed else "Unknown (2.4, 1.8)",
                    unknown[0], xytext=(3.3, 2.5), fontsize=13,
                    arrowprops={"arrowstyle": "-", "color": colour}, color=colour)
        title = "Classification · the prediction" if revealed else "Classification · predict before revealing"
        note = "A is a prediction, not a supplied answer for the new point." if revealed else "Which supplied class would you predict for the ? point?"
    elif stage.endswith("before"):
        ax.scatter(*zip(*X), s=135, c="#57606a", label="No supplied labels", zorder=3)
        title = "Clustering · the same six examples, labels removed"
        note = "Do the unlabelled points still suggest groups?"
    else:
        groups = cluster()
        # Group IDs are arbitrary: colours deliberately differ from A/B colours.
        for group, colour, marker in zip(sorted(set(groups)), ("#8250df", "#087f5b"), MARKERS):
            points = [point for point, assigned in zip(X, groups) if assigned == group]
            ax.scatter(*zip(*points), s=135, c=colour, marker=marker,
                       label=f"Group {group}", zorder=3)
        title = "Clustering · groups found without supplied labels"
        note = "We requested two groups. Their numbers are not class names."
    ax.set_title(title, fontsize=16, weight="bold", pad=18)
    ax.legend(loc="upper left", fontsize=12, framealpha=1)
    return note


def main():
    parser = ArgumentParser(description=__doc__)
    parser.add_argument("--mode", choices=("both", "classification", "clustering"), default="both")
    parser.add_argument("--save-dir", type=Path, help="Export all four SVGs instead of opening a window")
    args = parser.parse_args()
    import matplotlib
    if args.save_dir:
        matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    from matplotlib.widgets import Button
    plt.rcParams.update({"font.size": 12, "svg.fonttype": "none", "svg.hashsalt": "ct319-week8"})
    fig, ax = plt.subplots(figsize=(10, 8))
    fig.subplots_adjust(top=0.87, bottom=0.22)
    footer = fig.text(0.5, 0.13, "", ha="center", fontsize=13)
    if args.save_dir:
        args.save_dir.mkdir(parents=True, exist_ok=True)
        for stage in STAGES:
            footer.set_text(draw(ax, stage))
            fig.savefig(args.save_dir / f"{stage}.svg", metadata={"Date": None})
        plt.close(fig)
        return
    stages = [s for s in STAGES if args.mode == "both" or s.startswith(args.mode)]
    index = 0
    button = Button(fig.add_axes((0.34, 0.035, 0.32, 0.055)), "Run and reveal")

    def refresh():
        footer.set_text(draw(ax, stages[index]))
        label = "Close" if index == len(stages) - 1 else "Next example" if stages[index].endswith("after") else "Run and reveal"
        button.label.set_text(label)
        fig.canvas.draw_idle()

    def advance(event):
        nonlocal index
        if index == len(stages) - 1:
            plt.close(fig)
        else:
            index += 1
            refresh()

    button.on_clicked(advance)
    fig.canvas.mpl_connect("key_press_event", lambda event: advance(event) if event.key == " " else None)
    refresh()
    plt.show()


if __name__ == "__main__":
    main()
