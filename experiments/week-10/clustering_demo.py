#!/usr/bin/env python3
"""CT319 Week 10: clustering assumptions and visible consequences.

Install:
    python -m pip install numpy matplotlib scikit-learn

Run the complete live sequence:
    python experiments/week-10/clustering_demo.py

Run one experiment:
    python experiments/week-10/clustering_demo.py --mode blobs --k 3
    python experiments/week-10/clustering_demo.py --mode moons
    python experiments/week-10/clustering_demo.py --mode moons-kmeans
    python experiments/week-10/clustering_demo.py --mode moons-dbscan

Export every stage without opening a window:
    python experiments/week-10/clustering_demo.py --save-dir media/week-10
"""

from argparse import ArgumentParser
from pathlib import Path

import numpy as np
from sklearn.cluster import DBSCAN, KMeans
from sklearn.datasets import make_blobs, make_moons

RANDOM_STATE = 42
K_VALUES = (2, 3, 5)
DBSCAN_EPS = 0.18
DBSCAN_MIN_SAMPLES = 5

BLOB_X, _ = make_blobs(
    n_samples=180,
    centers=((-3.0, -1.0), (0.0, 2.8), (3.0, -0.8)),
    cluster_std=(0.75, 0.80, 0.85),
    random_state=RANDOM_STATE,
)
MOON_X, _ = make_moons(n_samples=220, noise=0.08, random_state=7)

BLOB_LIMITS = (-5.2, 5.2, -3.1, 5.0)
MOON_LIMITS = (-1.35, 2.35, -0.85, 1.35)
CLUSTER_COLOURS = ("#0969da", "#b54708", "#1a7f37", "#8250df", "#bf3989")
REGION_COLOURS = ("#dceafe", "#fbe7d3", "#dcf3e3", "#ece5fb", "#f8e2ef")


def fit_kmeans(points, k):
    return KMeans(n_clusters=k, random_state=RANDOM_STATE, n_init=10).fit(points)


def fit_dbscan():
    return DBSCAN(eps=DBSCAN_EPS, min_samples=DBSCAN_MIN_SAMPLES).fit(MOON_X)


def configure_axes(ax, limits):
    x_min, x_max, y_min, y_max = limits
    ax.set(xlim=(x_min, x_max), ylim=(y_min, y_max), xlabel="Feature 1", ylabel="Feature 2")
    ax.set_aspect("equal", adjustable="box")
    ax.grid(color="#d8dee4", linewidth=0.7, alpha=0.75, zorder=0)
    ax.spines[["top", "right"]].set_visible(False)


def draw_unlabelled(ax, points, limits, title, note):
    configure_axes(ax, limits)
    ax.scatter(
        points[:, 0], points[:, 1], s=48, c="#57606a", edgecolors="white",
        linewidths=0.55, label="Unlabelled points", zorder=3,
    )
    ax.set_title(title, fontsize=17, weight="bold", pad=15)
    ax.legend(loc="upper right", fontsize=10, framealpha=0.96)
    return note


def grid_for(limits):
    x_min, x_max, y_min, y_max = limits
    xx, yy = np.meshgrid(
        np.linspace(x_min, x_max, 360),
        np.linspace(y_min, y_max, 260),
    )
    return xx, yy, np.c_[xx.ravel(), yy.ravel()]


def draw_kmeans(ax, points, limits, k, title):
    from matplotlib.colors import ListedColormap

    model = fit_kmeans(points, k)
    xx, yy, grid = grid_for(limits)
    regions = model.predict(grid).reshape(xx.shape)
    ax.contourf(
        xx, yy, regions, levels=np.arange(k + 1) - 0.5,
        cmap=ListedColormap(REGION_COLOURS[:k]), alpha=0.82, zorder=1,
    )
    configure_axes(ax, limits)
    for cluster in range(k):
        members = points[model.labels_ == cluster]
        ax.scatter(
            members[:, 0], members[:, 1], s=48,
            c=CLUSTER_COLOURS[cluster], edgecolors="white",
            linewidths=0.55, zorder=3,
        )
    ax.scatter(
        model.cluster_centers_[:, 0], model.cluster_centers_[:, 1],
        marker="*", s=330, c="#24292f", edgecolors="white", linewidths=1.0,
        label="Centroids", zorder=5,
    )
    ax.set_title(title, fontsize=17, weight="bold", pad=15)
    ax.legend(loc="upper right", fontsize=10, framealpha=0.96)
    return model


def draw_blob_kmeans(ax, k):
    draw_kmeans(ax, BLOB_X, BLOB_LIMITS, k, f"K-means · k = {k}")
    return f"{k} requested clusters · black stars are centroids · what changed when k changed?"


def draw_moon_kmeans(ax):
    draw_kmeans(ax, MOON_X, MOON_LIMITS, 2, "Two moons · K-means")
    return "2 requested clusters · centre-based regions · does the split follow the curved groups?"


def draw_moon_dbscan(ax):
    model = fit_dbscan()
    configure_axes(ax, MOON_LIMITS)
    cluster_ids = sorted(label for label in set(model.labels_) if label != -1)
    for colour_index, cluster in enumerate(cluster_ids):
        members = MOON_X[model.labels_ == cluster]
        ax.scatter(
            members[:, 0], members[:, 1], s=48,
            c=CLUSTER_COLOURS[colour_index], edgecolors="white",
            linewidths=0.55, zorder=3,
        )
    noise = MOON_X[model.labels_ == -1]
    if len(noise):
        ax.scatter(
            noise[:, 0], noise[:, 1], s=72, c="#24292f", marker="x",
            linewidths=1.8, label="Noise", zorder=5,
        )
        ax.legend(loc="upper right", fontsize=10, framealpha=0.96)
    ax.set_title("Two moons · DBSCAN", fontsize=17, weight="bold", pad=15)
    return (
        f"{len(cluster_ids)} clusters · {len(noise)} noise points · "
        f"eps = {DBSCAN_EPS} · min_samples = {DBSCAN_MIN_SAMPLES} (chosen for this dataset)"
    )


STAGES = [
    ("blobs-data", None),
    *[("blobs", k) for k in K_VALUES],
    ("moons", None),
    ("moons-kmeans", None),
    ("moons-dbscan", None),
]


def stage_name(stage):
    kind, value = stage
    return f"blobs-k{value}" if kind == "blobs" else kind


def draw_stage(ax, stage):
    ax.clear()
    kind, value = stage
    if kind == "blobs-data":
        return draw_unlabelled(
            ax, BLOB_X, BLOB_LIMITS, "Unlabelled data · how many groups?",
            "Predict the number and shape of the groups before choosing k.",
        )
    if kind == "blobs":
        return draw_blob_kmeans(ax, value)
    if kind == "moons":
        return draw_unlabelled(
            ax, MOON_X, MOON_LIMITS, "Two moons · what groups do you see?",
            "No labels are supplied · trace the structures you would group together.",
        )
    if kind == "moons-kmeans":
        return draw_moon_kmeans(ax)
    return draw_moon_dbscan(ax)


def print_results():
    print("Blob dataset: make_blobs(n_samples=180, random_state=42)")
    for k in K_VALUES:
        model = fit_kmeans(BLOB_X, k)
        counts = np.bincount(model.labels_, minlength=k)
        print(f"K-means k={k}: cluster sizes {counts.tolist()} · inertia {model.inertia_:.1f}")
    kmeans = fit_kmeans(MOON_X, 2)
    dbscan = fit_dbscan()
    cluster_ids = sorted(label for label in set(dbscan.labels_) if label != -1)
    noise_count = int(np.count_nonzero(dbscan.labels_ == -1))
    print("Moon dataset: make_moons(n_samples=220, noise=0.08, random_state=7)")
    print(f"Moon K-means k=2: cluster sizes {np.bincount(kmeans.labels_).tolist()}")
    print(
        f"Moon DBSCAN eps={DBSCAN_EPS}, min_samples={DBSCAN_MIN_SAMPLES}: "
        f"{len(cluster_ids)} clusters · {noise_count} noise points"
    )


def select_stage(mode, k):
    if mode == "blobs":
        return ("blobs", k)
    return (mode, None)


def export_stages(save_dir, plt):
    save_dir.mkdir(parents=True, exist_ok=True)
    for stage in STAGES:
        fig, ax = plt.subplots(figsize=(10, 7.2))
        fig.subplots_adjust(top=0.88, bottom=0.16)
        note = draw_stage(ax, stage)
        fig.text(0.5, 0.055, note, ha="center", fontsize=11)
        path = save_dir / f"{stage_name(stage)}.svg"
        fig.savefig(path, metadata={"Date": None})
        plt.close(fig)
        print(f"Saved {path}")


def show_one(stage, plt):
    fig, ax = plt.subplots(figsize=(10, 7.2))
    fig.subplots_adjust(top=0.88, bottom=0.16)
    note = draw_stage(ax, stage)
    fig.text(0.5, 0.055, note, ha="center", fontsize=11)
    plt.show()


def show_all(plt):
    from matplotlib.widgets import Button

    fig, ax = plt.subplots(figsize=(10, 7.2))
    fig.subplots_adjust(top=0.88, bottom=0.21)
    footer = fig.text(0.5, 0.115, "", ha="center", fontsize=11)
    button = Button(fig.add_axes((0.36, 0.025, 0.28, 0.055)), "Next")
    index = 0

    def refresh():
        footer.set_text(draw_stage(ax, STAGES[index]))
        button.label.set_text("Close" if index == len(STAGES) - 1 else f"Next: {stage_name(STAGES[index + 1])}")
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


def main():
    parser = ArgumentParser(description=__doc__)
    parser.add_argument(
        "--mode",
        choices=("all", "blobs", "moons", "moons-kmeans", "moons-dbscan"),
        default="all",
    )
    parser.add_argument("--k", type=int, choices=K_VALUES, default=3)
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
            "svg.hashsalt": "ct319-week10",
        }
    )
    print_results()

    if args.save_dir:
        export_stages(args.save_dir, plt)
    elif args.mode == "all":
        show_all(plt)
    else:
        show_one(select_stage(args.mode, args.k), plt)


if __name__ == "__main__":
    main()
