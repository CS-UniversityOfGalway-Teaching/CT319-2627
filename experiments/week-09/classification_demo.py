#!/usr/bin/env python3
"""CT319 Week 9: classification, boundaries and generalisation.

Install:
    python -m pip install numpy matplotlib scikit-learn

Run the complete live sequence:
    python experiments/week-09/classification_demo.py

Run one view:
    python experiments/week-09/classification_demo.py --mode data
    python experiments/week-09/classification_demo.py --mode knn --k 3
    python experiments/week-09/classification_demo.py --mode tree --depth 5
    python experiments/week-09/classification_demo.py --mode compare

Export every stage without opening a window:
    python experiments/week-09/classification_demo.py --save-dir media/week-09
"""

from argparse import ArgumentParser
from pathlib import Path

import numpy as np
from sklearn.datasets import make_moons
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier

N_SAMPLES = 140
NOISE = 0.23
DATA_RANDOM_STATE = 2
SPLIT_RANDOM_STATE = 42
TEST_SIZE = 0.30
K_VALUES = (1, 3, 9, 15)
TREE_DEPTHS = (2, 5, None)
UNKNOWN = np.array([[-0.4, 0.15]])
AXIS_LIMITS = (-1.7, 2.7, -1.2, 1.7)
COLOURS = ("#0969da", "#b54708")
REGION_COLOURS = ("#dceafe", "#fbe7d3")
MARKERS = ("o", "s")
CLASS_NAMES = ("A", "B")

X, y = make_moons(
    n_samples=N_SAMPLES,
    noise=NOISE,
    random_state=DATA_RANDOM_STATE,
)
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=TEST_SIZE,
    random_state=SPLIT_RANDOM_STATE,
    stratify=y,
)


def class_name(label):
    return CLASS_NAMES[int(label)]


def depth_label(depth):
    return "unrestricted" if depth is None else str(depth)


def make_grid():
    x_min, x_max, y_min, y_max = AXIS_LIMITS
    xx, yy = np.meshgrid(
        np.linspace(x_min, x_max, 330),
        np.linspace(y_min, y_max, 220),
    )
    return xx, yy, np.c_[xx.ravel(), yy.ravel()]


def configure_feature_axes(ax):
    x_min, x_max, y_min, y_max = AXIS_LIMITS
    ax.set(
        xlim=(x_min, x_max),
        ylim=(y_min, y_max),
        xlabel="Feature 1",
        ylabel="Feature 2",
    )
    ax.set_aspect("equal", adjustable="box")
    ax.grid(color="#d8dee4", linewidth=0.7, alpha=0.75, zorder=0)
    ax.spines[["top", "right"]].set_visible(False)


def draw_examples(ax, show_split=True):
    for label, colour, marker in zip((0, 1), COLOURS, MARKERS):
        training = X_train[y_train == label]
        ax.scatter(
            training[:, 0],
            training[:, 1],
            s=58,
            c=colour,
            marker=marker,
            edgecolors="white",
            linewidths=0.8,
            label=f"Train · class {class_name(label)}",
            zorder=4,
        )
        if show_split:
            testing = X_test[y_test == label]
            ax.scatter(
                testing[:, 0],
                testing[:, 1],
                s=62,
                facecolors="none",
                edgecolors=colour,
                marker=marker,
                linewidths=1.6,
                label=f"Test · class {class_name(label)}",
                zorder=4,
            )


def draw_unknown(ax, prediction=None):
    edge = "#24292f" if prediction is None else COLOURS[int(prediction)]
    ax.scatter(
        UNKNOWN[:, 0],
        UNKNOWN[:, 1],
        s=260,
        facecolors="white",
        edgecolors=edge,
        marker="D",
        linewidths=2.8,
        label="Unknown point",
        zorder=7,
    )
    text = "?" if prediction is None else class_name(prediction)
    ax.text(
        UNKNOWN[0, 0],
        UNKNOWN[0, 1],
        text,
        ha="center",
        va="center",
        fontsize=12,
        weight="bold",
        color=edge,
        zorder=8,
    )
    ax.annotate(
        "Predict this point" if prediction is None else f"Predicted class {text}",
        UNKNOWN[0],
        xytext=(-1.58, -0.92),
        fontsize=12,
        weight="bold",
        color=edge,
        arrowprops={"arrowstyle": "->", "color": edge, "linewidth": 1.5},
        zorder=8,
    )


def draw_regions(ax, model):
    from matplotlib.colors import ListedColormap

    xx, yy, grid = make_grid()
    regions = model.predict(grid).reshape(xx.shape)
    ax.contourf(
        xx,
        yy,
        regions,
        levels=(-0.5, 0.5, 1.5),
        cmap=ListedColormap(REGION_COLOURS),
        alpha=0.9,
        zorder=1,
    )
    ax.contour(
        xx,
        yy,
        regions,
        levels=(0.5,),
        colors=("#57606a",),
        linewidths=1.1,
        zorder=2,
    )


def draw_data(ax):
    configure_feature_axes(ax)
    draw_examples(ax)
    draw_unknown(ax)
    ax.set_title("One dataset · labelled examples and one unknown", fontsize=16, weight="bold")
    ax.legend(loc="upper right", fontsize=9, framealpha=0.96, ncols=2)
    return (
        f"{len(X_train)} training examples · {len(X_test)} held back for testing · "
        "predict the diamond before fitting a model"
    )


def fit_knn(k):
    return KNeighborsClassifier(n_neighbors=k).fit(X_train, y_train)


def draw_knn(ax, k):
    model = fit_knn(k)
    prediction = int(model.predict(UNKNOWN)[0])
    draw_regions(ax, model)
    configure_feature_axes(ax)
    draw_examples(ax)
    draw_unknown(ax, prediction)
    ax.set_title(f"KNN decision regions · k = {k}", fontsize=16, weight="bold")
    ax.legend(loc="upper right", fontsize=9, framealpha=0.96, ncols=2)
    return (
        f"Unknown → class {class_name(prediction)} · "
        f"training accuracy {model.score(X_train, y_train):.1%} · "
        f"test accuracy {model.score(X_test, y_test):.1%}"
    )


def fit_tree(depth):
    return DecisionTreeClassifier(
        max_depth=depth,
        random_state=SPLIT_RANDOM_STATE,
    ).fit(X_train, y_train)


def draw_tree(ax, depth):
    model = fit_tree(depth)
    prediction = int(model.predict(UNKNOWN)[0])
    draw_regions(ax, model)
    configure_feature_axes(ax)
    draw_examples(ax)
    draw_unknown(ax, prediction)
    ax.set_title(
        f"Decision-tree regions · max_depth = {depth_label(depth)}",
        fontsize=16,
        weight="bold",
    )
    ax.legend(loc="upper right", fontsize=9, framealpha=0.96, ncols=2)
    return (
        f"{model.tree_.node_count} nodes · {model.tree_.n_leaves} leaves · "
        f"training accuracy {model.score(X_train, y_train):.1%} · "
        f"test accuracy {model.score(X_test, y_test):.1%}"
    )


def model_results():
    results = []
    for k in K_VALUES:
        model = fit_knn(k)
        results.append(
            (f"KNN\nk={k}", model.score(X_train, y_train), model.score(X_test, y_test))
        )
    for depth in TREE_DEPTHS:
        model = fit_tree(depth)
        label = "none" if depth is None else str(depth)
        results.append(
            (f"Tree\ndepth={label}", model.score(X_train, y_train), model.score(X_test, y_test))
        )
    return results


def draw_comparison(ax):
    results = model_results()
    labels = [row[0] for row in results]
    training = np.array([row[1] for row in results])
    testing = np.array([row[2] for row in results])
    positions = np.arange(len(labels))
    width = 0.36
    training_bars = ax.bar(
        positions - width / 2,
        training,
        width,
        label="Training accuracy",
        color="#0969da",
    )
    test_bars = ax.bar(
        positions + width / 2,
        testing,
        width,
        label="Test accuracy",
        color="#b54708",
    )
    ax.set_ylim(0.65, 1.04)
    ax.set_ylabel("Accuracy")
    ax.set_xticks(positions, labels)
    ax.set_yticks(np.arange(0.7, 1.01, 0.1), [f"{v:.0%}" for v in np.arange(0.7, 1.01, 0.1)])
    ax.set_title("Good on what data?", fontsize=16, weight="bold")
    ax.grid(axis="y", color="#d8dee4", linewidth=0.8, zorder=0)
    ax.spines[["top", "right"]].set_visible(False)
    ax.legend(loc="lower left", fontsize=10, framealpha=0.96)
    for bars in (training_bars, test_bars):
        ax.bar_label(bars, labels=[f"{bar.get_height():.1%}" for bar in bars], padding=3, fontsize=8)
    return (
        "The unrestricted tree fits every training example but performs worse on the held-back test set."
    )


STAGES = [
    ("data", None),
    *[("knn", k) for k in K_VALUES],
    *[("tree", depth) for depth in TREE_DEPTHS],
    ("compare", None),
]


def stage_name(stage):
    kind, value = stage
    if kind == "knn":
        return f"knn-k{value}"
    if kind == "tree":
        return f"tree-depth-{depth_label(value)}"
    return kind


def draw_stage(ax, stage):
    ax.clear()
    kind, value = stage
    if kind == "data":
        return draw_data(ax)
    if kind == "knn":
        return draw_knn(ax, value)
    if kind == "tree":
        return draw_tree(ax, value)
    return draw_comparison(ax)


def print_results():
    print(
        f"Dataset: make_moons(n_samples={N_SAMPLES}, noise={NOISE}, "
        f"random_state={DATA_RANDOM_STATE})"
    )
    print(
        f"Split: {len(X_train)} train / {len(X_test)} test "
        f"(random_state={SPLIT_RANDOM_STATE}, stratified)"
    )
    print("\nModel                    Train      Test     Unknown")
    print("-" * 55)
    for k in K_VALUES:
        model = fit_knn(k)
        prediction = class_name(model.predict(UNKNOWN)[0])
        print(
            f"KNN k={k:<2}                 {model.score(X_train, y_train):>6.1%}    "
            f"{model.score(X_test, y_test):>6.1%}       {prediction}"
        )
    for depth in TREE_DEPTHS:
        model = fit_tree(depth)
        prediction = class_name(model.predict(UNKNOWN)[0])
        print(
            f"Tree depth={depth_label(depth):<12} {model.score(X_train, y_train):>6.1%}    "
            f"{model.score(X_test, y_test):>6.1%}       {prediction}"
        )


def select_stage(mode, k, depth):
    if mode == "data":
        return ("data", None)
    if mode == "knn":
        return ("knn", k)
    if mode == "tree":
        return ("tree", depth)
    return ("compare", None)


def export_stages(save_dir, plt):
    save_dir.mkdir(parents=True, exist_ok=True)
    for stage in STAGES:
        fig, ax = plt.subplots(figsize=(10, 7.2))
        fig.subplots_adjust(bottom=0.14)
        note = draw_stage(ax, stage)
        fig.text(0.5, 0.035, note, ha="center", fontsize=11)
        path = save_dir / f"{stage_name(stage)}.svg"
        fig.savefig(path, metadata={"Date": None})
        plt.close(fig)
        print(f"Saved {path}")


def show_one(stage, plt):
    fig, ax = plt.subplots(figsize=(10, 7.2))
    fig.subplots_adjust(bottom=0.14)
    note = draw_stage(ax, stage)
    fig.text(0.5, 0.035, note, ha="center", fontsize=11)
    plt.show()


def show_all(plt):
    from matplotlib.widgets import Button

    fig, ax = plt.subplots(figsize=(10, 7.2))
    fig.subplots_adjust(bottom=0.20)
    footer = fig.text(0.5, 0.105, "", ha="center", fontsize=11)
    button = Button(fig.add_axes((0.37, 0.025, 0.26, 0.055)), "Run first model")
    index = 0

    def refresh():
        footer.set_text(draw_stage(ax, STAGES[index]))
        if index == len(STAGES) - 1:
            button.label.set_text("Close")
        else:
            button.label.set_text(f"Next: {stage_name(STAGES[index + 1])}")
        fig.canvas.draw_idle()

    def advance(_event):
        nonlocal index
        if index == len(STAGES) - 1:
            plt.close(fig)
        else:
            index += 1
            refresh()

    button.on_clicked(advance)
    fig.canvas.mpl_connect(
        "key_press_event",
        lambda event: advance(event) if event.key in (" ", "right") else None,
    )
    refresh()
    plt.show()


def parse_depth(raw):
    return None if raw == "none" else int(raw)


def main():
    parser = ArgumentParser(description=__doc__)
    parser.add_argument(
        "--mode",
        choices=("all", "data", "knn", "tree", "compare"),
        default="all",
    )
    parser.add_argument("--k", type=int, choices=K_VALUES, default=3)
    parser.add_argument("--depth", choices=("2", "5", "none"), default="2")
    parser.add_argument("--save-dir", type=Path)
    args = parser.parse_args()

    import matplotlib

    if args.save_dir:
        matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    plt.rcParams.update(
        {
            "font.size": 12,
            "svg.fonttype": "none",
            "svg.hashsalt": "ct319-week09",
        }
    )
    print_results()

    if args.save_dir:
        export_stages(args.save_dir, plt)
    elif args.mode == "all":
        show_all(plt)
    else:
        show_one(select_stage(args.mode, args.k, parse_depth(args.depth)), plt)


if __name__ == "__main__":
    main()
