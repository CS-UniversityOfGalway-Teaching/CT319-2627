---
title: Week 10 — Clustering and recommendation
eyebrow: CT319 Artificial Intelligence · Week 10 · Clustering and recommendation
question: Can a machine discover useful structure when nobody tells it the correct groups?
description: CT319 Week 10. K-means, DBSCAN and hierarchical clustering on fixed datasets, then collaborative filtering — what counts as similar, and who decided how many groups there are.
bar: Week 10 · Sections
source: week-10.md
---

Last week the examples arrived with labels, and the job was to predict one. This week the labels are gone. The points stay exactly where they were; only the answers disappear.

<!-- ct319:focus -->

> **Can a machine discover useful structure when nobody tells it the correct groups?**

<!-- ct319:endfocus -->

There is a trap waiting in that question, and it is worth naming before we start. An algorithm will always return groups. Whether those groups mean anything is a separate question, and not one the algorithm can answer.

We work through five things.

* [**Remove the labels**](#remove-the-labels--what-can-the-machine-still-see) — what is left visible once the class names are taken away.
* [**Move the centres**](#move-the-centres--how-does-k-means-discover-groups) — how K-means turns a chosen `k` into groups by reassigning points and moving centroids.
* [**What if the groups are not blobs?**](#what-if-the-groups-are-not-blobs--does-every-algorithm-see-the-same-structure) — what happens when the data do not form compact regions around centres.
* [**People who liked this also liked**](#people-who-liked-this-also-liked--where-do-recommendations-come-from) — how patterns of similarity and preference turn into recommendations.
* [**Useful pattern or misleading pattern**](#useful-pattern-or-misleading-pattern--what-can-go-wrong) — why a clustering is an output to interpret, and what cold start costs a recommender.

Three ideas carry the page, and it is worth keeping them apart:

<!-- ct319:focus -->

<div class="lenses">
<div class="lens"><span class="lens__key">Structure</span><span class="lens__gloss">useful patterns can exist even when nobody supplied a single label</span></div>
<div class="lens"><span class="lens__key">Similarity</span><span class="lens__gloss">how we define “similar” decides which groups get discovered</span></div>
<div class="lens"><span class="lens__key">Preference</span><span class="lens__gloss">patterns across people and items can be turned into recommendations</span></div>
</div>

<!-- ct319:endfocus -->

<!-- ct319:beats -->

<!-- ct319:beat -->
## Remove the labels — what can the machine still see?

Last week every example came with a target attached. Take it away and the picture barely changes — which is exactly the problem.

<!-- ct319:focus -->

![The same ten points shown first with class A and B labels and then drawn neutrally with none](../../media/week-10/labels-removed.svg "hero")

<sub><em>Figure 1. Identical positions on both sides. The only thing removed was the answer key. Diagram created for these pages; no external image licence is used.</em></sub>

<!-- ct319:endfocus -->

You can still see two groups. So can most people. But nobody supplied them, which turns a comfortable question into an uncomfortable one:

<!-- ct319:focus -->

> **Who decided how many groups there are?**

<!-- ct319:endfocus -->

<!-- ct319:beat -->
## What actually changed

<!-- ct319:focus -->

<div class="lenses lenses--pair">
<div class="lens"><span class="lens__key">Supervised</span><span class="lens__gloss">examples carry a target, and the learner fits a rule that predicts it</span></div>
<div class="lens"><span class="lens__key">Unsupervised</span><span class="lens__gloss">examples carry no supplied label, and the learner looks for structure in the features</span></div>
</div>

<!-- ct319:endfocus -->

One important unsupervised task is **clustering**: organising examples into groups using some notion of similarity. The usual starting definition is that examples within a cluster should be more similar to one another than to examples in other clusters.

The difficult word in that sentence is *similar*.

<!-- ct319:beat -->
## Similarity still has to be designed

Suppose we represent customers using age, location, purchase frequency, average spend and products viewed. Two customers can be close in age and far apart in buying behaviour, or live two countries apart and buy nearly identical things. Which of those pairs is "similar" depends entirely on what we chose to record.

The algorithm sees the representation we provide, and the question from Weeks 2 and 9 comes back unchanged:

<!-- ct319:focus -->

> **What should count as similar for this problem?**

<!-- ct319:endfocus -->

Clustering can group customers, organise documents, divide images into regions or flag unusual observations. None of that makes a cluster a real-world category. `Cluster 0`, `Cluster 1` and `Cluster 2` are identifiers for an algorithm's output — interpreting them is still our job.

### Why this matters this week

Everything that follows produces groups. The work is deciding which of those groups you are entitled to believe.

<!-- ct319:beat -->
## Move the centres — how does K-means discover groups?

Suppose unlabelled points sit in three compact regions. We can see a grouping; the algorithm has not been given one. **K-means** starts from a decision that is ours, not its:

<!-- ct319:focus -->

> **Choose `k` — the number of clusters to request.**

<!-- ct319:endfocus -->

For `k = 3` it starts with three candidate centres, called **centroids**. A centroid is the mean position of the points currently assigned to it. From there it repeats two steps.

<!-- ct319:focus -->

![Assign every point to its nearest centroid, move each centroid to the mean of its points, repeat](../../media/week-10/kmeans-cycle.svg "hero")

<sub><em>Figure 2. Two steps, repeated until the centroids stop moving. Everything interesting happens because of what we fixed before the loop started. Diagram created for these pages; no external image licence is used.</em></sub>

<!-- ct319:endfocus -->

### Predict before running

If a centroid starts too far to the right, where does it move once nearby points are assigned to it? And what happens if one distant point is assigned to it as well?

The mean moves towards the assigned points — *including* the distant one. Which tells you the shape of problem K-means is built for: groups that form reasonably compact regions around a centre.

```python
from sklearn.cluster import KMeans

model = KMeans(n_clusters=3, random_state=42, n_init=10)
labels = model.fit_predict(X)
centroids = model.cluster_centers_
```

The returned values `0`, `1` and `2` are identifiers. They are not class names and they carry no meaning until somebody gives them one.

<!-- ct319:beat -->
## One dataset, three values of `k`

The demonstration uses 180 deterministic points in three compact regions. The data and the axes never move; only `k` changes. Black stars mark the fitted centroids.

<!-- ct319:focus -->

![180 unlabelled points forming three compact regions](../../media/week-10/blobs-data.svg "wide")

<sub><em>Figure 3. The starting picture. Before running anything, decide how many groups you would ask for — and be ready to say why. Plot created for these pages by the clustering demonstration; no external image licence is used.</em></sub>

<!-- ct319:endfocus -->

<!-- ct319:focus -->

| `k = 2` — too few | `k = 3` — matches what we see |
|---|---|
| ![K-means with k equals 2 merging two of the three regions](../../media/week-10/blobs-k2.svg) | ![K-means with k equals 3 recovering the three regions](../../media/week-10/blobs-k3.svg) |
| Cluster sizes **60, 120**. Two visible regions are merged into one. | Cluster sizes **60, 60, 60**. Each region recovered exactly. |

<sub><em>Figure 4. At `k = 2` the algorithm did not fail — it did precisely what was asked, which was to produce two groups. Plots created for these pages by the clustering demonstration; no external image licence is used.</em></sub>

<!-- ct319:endfocus -->

<!-- ct319:focus -->

![K-means with k equals 5 subdividing two of the three visible regions](../../media/week-10/blobs-k5.svg "wide")

<sub><em>Figure 5. At `k = 5`, cluster sizes are **60, 38, 38, 22, 22** — two of the three regions get split down the middle. The points did not change. The requested number of groups did. Plot created for these pages by the clustering demonstration; no external image licence is used.</em></sub>

<!-- ct319:endfocus -->

<!-- ct319:beat -->
## Why you cannot pick `k` by the score

There is an obvious-looking escape: let the algorithm choose `k` by measuring how tight the clusters are. **Inertia** — the total squared distance from each point to its own centroid — is the usual measure, and on this dataset it reads:

| `k` | Cluster sizes | Inertia |
|---:|:---|---:|
| 2 | 60, 120 | 946.7 |
| 3 | 60, 60, 60 | 204.1 |
| 5 | 60, 38, 38, 22, 22 | **149.9** |

The lowest inertia belongs to `k = 5`, which is the one that splits two perfectly good regions in half. Inertia keeps falling as `k` rises, all the way to one cluster per point, where it reaches zero.

<!-- ct319:focus -->

> **The tightest clustering is not the most useful one. Choosing `k` is a judgement, and it stays ours.**

<!-- ct319:endfocus -->

### Why this matters this week

K-means did not discover the one true grouping at `k = 3`. It produced a grouping under the representation, the `k`, the initialisation and the centre-based assumption we handed it. Change any of the four and the answer changes with it.

<!-- ct319:beat -->
## What if the groups are not blobs? — does every algorithm see the same structure?

K-means works naturally when groups are compact regions around a centre. Nothing obliges data to be shaped that way.

The second dataset is 220 points in two interleaving crescents — the same shape as Week 9, with its own fixed settings.

<!-- ct319:focus -->

![220 unlabelled points forming two interleaving crescent shapes](../../media/week-10/moons.svg "wide")

<sub><em>Figure 6. Trace the two shapes with your finger before choosing an algorithm. Then ask whether a pair of centres could possibly describe them. Plot created for these pages by the clustering demonstration; no external image licence is used.</em></sub>

<!-- ct319:endfocus -->

<!-- ct319:beat -->
## Centres against density

Ask K-means for two clusters and it will give you two clusters. Then compare it with **DBSCAN**, which looks for dense, connected regions instead of organising everything around a centre. Two parameters carry the intuition: **`eps`**, the neighbourhood radius around a point, and **`min_samples`**, the local density a neighbourhood has to reach.

```python
from sklearn.cluster import DBSCAN

model = DBSCAN(eps=0.18, min_samples=5)
labels = model.fit_predict(X)
```

<!-- ct319:focus -->

| K-means, `k = 2` | DBSCAN, `eps = 0.18` |
|---|---|
| ![K-means cutting straight across both crescents](../../media/week-10/moons-kmeans.svg) | ![DBSCAN recovering both crescents and marking four points as noise](../../media/week-10/moons-dbscan.svg) |
| Cluster sizes **110, 110**. The boundary cuts across both shapes. | **2 clusters** recovered, and **4** of the 220 points marked as noise. |

<sub><em>Figure 7. K-means did not break. Its assumption — that a group is whatever lies nearest a centre — simply does not describe a crescent. Plots created for these pages by the clustering demonstration; no external image licence is used.</em></sub>

<!-- ct319:endfocus -->

Two things in that right-hand panel are worth naming. DBSCAN was never told there were two groups — it found two. And it is allowed to say *neither*: those four noise points are a legitimate output, not a failure.

`eps = 0.18` is tuned to the scale and density of these particular crescents. It is not a universal setting, and on a different dataset it would be meaningless.

<!-- ct319:beat -->
## A third view — hierarchy

Hierarchical clustering records groups within groups. An **agglomerative** approach starts from small groups and repeatedly merges; a **divisive** one starts from a single large group and repeatedly splits. A **dendrogram** displays that history.

<!-- ct319:focus -->

![A dendrogram where A and B merge, D and E merge, C joins A and B, and the two groups merge](../../media/week-10/hierarchical-dendrogram.svg "wide")

<sub><em>Figure 8. Read upwards. Note what is missing: no `k` was chosen in advance — the height at which you cut the tree is what decides how many groups you get. Diagram created for these pages; no external image licence is used.</em></sub>

<!-- ct319:endfocus -->

<!-- ct319:focus -->

<div class="lenses">
<div class="lens"><span class="lens__key">K-means</span><span class="lens__gloss">a group is whatever is nearest a centroid; you must supply `k`</span></div>
<div class="lens"><span class="lens__key">DBSCAN</span><span class="lens__gloss">a group is a dense connected region; some points may be noise</span></div>
<div class="lens"><span class="lens__key">Hierarchical</span><span class="lens__gloss">groups nest inside groups; you cut the tree wherever you choose</span></div>
</div>

<!-- ct319:endfocus -->

### Why this matters this week

Three algorithms, one dataset, three different answers — and none of them is wrong. Each encodes a different assumption about what a group *is*. The honest version of "we clustered the data" names which assumption was used.

<!-- ct319:beat -->
## People who liked this also liked — where do recommendations come from?

Clustering asks which examples look similar. Recommendation asks a different question: can patterns of similarity and preference predict what somebody wants next?

<!-- ct319:focus -->

> **Recommendation can use similarity without first clustering users or items into groups at all.**

<!-- ct319:endfocus -->

Five people, five films, and two gaps.

|  | Film A | Film B | Film C | Film D | Film E |
|---|---:|---:|---:|---:|---:|
| **Aoife** | 5 | 4 | **?** | 1 | **?** |
| Ben | 5 | 5 | 4 | 1 | 2 |
| Carla | 4 | 4 | 5 | 2 | 1 |
| Darragh | 2 | 1 | 2 | 5 | 4 |
| Eimear | 1 | 2 | 1 | 4 | 5 |

<!-- ct319:focus -->

> **What would you recommend to Aoife — and which rows gave you the evidence?**

<!-- ct319:endfocus -->

Ben and Carla share Aoife's high ratings for Films A and B and her low rating for Film D. Both of them prefer Film C to Film E. That is evidence for recommending Film C — and notice what it is not based on: nobody described what Film C is about.

This is **collaborative filtering**: using patterns in collective behaviour to estimate a preference nobody has observed yet.

<!-- ct319:beat -->
## Two ways to use the same table

<!-- ct319:focus -->

<div class="lenses lenses--pair">
<div class="lens"><span class="lens__key">User-based</span><span class="lens__gloss">who behaves like Aoife? Find similar users, look at what they liked, recommend something she has not seen</span></div>
<div class="lens"><span class="lens__key">Item-based</span><span class="lens__gloss">which films behave like the films Aoife likes? Compare items by their interaction patterns across users</span></div>
</div>

<!-- ct319:endfocus -->

Both are classical collaborative strategies, and neither exhausts the possibilities. The evidence in both cases comes from ratings, viewing, purchases or other interactions — behaviour, not description.

### When description is available

If item features exist — genre, director, cast, release year, language — a **content-based** recommender can find items related to what a user already prefers. A **hybrid** combines the two signals.

The distinction is where the relationship comes from: behaviour across users and items, or features describing the items themselves.

### Why this matters this week

A recommendation is a prediction, in exactly the sense Week 9 used the word — will this user click, watch, buy or rate highly? But it is also a decision about what the user gets the chance to see at all. That second half has a consequence, and it is the last thing on this page.

<!-- ct319:beat -->
## Useful pattern or misleading pattern — what can go wrong?

### A clustering is an output, not a discovery

Features, numerical scale, parameters and algorithmic assumptions all shape the grouping that comes back. K-means and DBSCAN can disagree about the same points and both be behaving correctly, because they are looking for different things.

<!-- ct319:focus -->

> **Which assumptions make sense for this problem?**

<!-- ct319:endfocus -->

Four clusters in the output is not evidence that four kinds of customer exist in the world.

### Cold start

A new user has no ratings, no purchases and no viewing history, so a collaborative approach has almost nothing to work with. A new item has the matching problem: nobody has interacted with it yet.

This is the **cold-start problem**. Item features or a short set of opening preference questions can supply other evidence, but the missing history is real and no amount of algorithm fixes it.

### Preferences and context move

Old behaviour goes stale as interests change. An account can also represent more than one person: a household profile holding children's programmes, crime dramas, football and documentaries is not one stable taste, and averaging it describes nobody.

<!-- ct319:focus -->

> **Every observed interaction has a time and a context. Treating all of them as equally current expressions of one person's preference is a modelling assumption, not a neutral default.**

<!-- ct319:endfocus -->

<!-- ct319:beat -->
## Recommendations change the next dataset

A recommender does not sit outside the process that generates its evidence. It takes part in it.

<!-- ct319:focus -->

![The system recommends, the user sees and interacts, the interaction becomes data, and the system learns from it](../../media/week-10/recommendation-loop.svg "hero")

<sub><em>Figure 9. The loop closes. What the system suggested yesterday shapes what it has to learn from today. Diagram created for these pages; no external image licence is used.</em></sub>

<!-- ct319:endfocus -->

So: if recommendations influence what people see, is the next dataset independent of the system that produced the recommendations?

<!-- ct319:focus -->

> **No. It records behaviour that happened after the system helped decide what was visible.**

<!-- ct319:endfocus -->

### Why this matters this week

Weeks 8 to 10 moved from learning from data, to prediction with labels, to structure without them. The algorithms changed every week. The discipline did not: inspect the representation, name the assumptions, and ask what the evidence actually supports.

<!-- ct319:endbeats -->

## The clustering demo

📦 **[`clustering_demo.py`](https://github.com/CS-UniversityOfGalway-Teaching/CT319-2627/blob/main/experiments/week-10/clustering_demo.py)** — every plot on this page, as a sequence you can step through.

```sh
python -m pip install numpy matplotlib scikit-learn
python experiments/week-10/clustering_demo.py
```

Press **Space**, the **right arrow** or the on-screen button to advance. Two fixed datasets serve every stage, so each visible change is attributable to the algorithm or parameter that changed.

### Try it yourself

1. Open `--mode blobs --k 3` and ask how many groups you would have requested from the raw points alone.
2. Run `--k 2` and `--k 5`. For each, say what the algorithm was asked to do before saying whether it did it well.
3. Read the inertia printed in the terminal for all three. Notice that the lowest value is not the best grouping.
4. Switch to `--mode moons` and trace the two shapes before running anything.
5. Run `--mode moons-kmeans`, then `--mode moons-dbscan`. Name the assumption that makes the difference.
6. Find the four noise points, and decide whether you would want an algorithm that is allowed to say "neither".

To regenerate every plot on this page without opening a window:

```sh
python experiments/week-10/clustering_demo.py --save-dir media/week-10
```

---

## Before Week 11

Across the last three weeks the machine learned from data — with labels, then without them, then from patterns of behaviour. Everything we asked was whether a result was *accurate*.

<!-- ct319:focus -->

> **Accuracy is one question. When should anyone trust what the system did with it?**

<!-- ct319:endfocus -->

That is where Week 11 begins.

---

## Quick revision

If you can answer these without reopening the page, you have the core of this week.

1. **[WK-10-01]** What does an unsupervised learner receive that a supervised one does not, and what is it looking for instead?
2. Why is “similar” a design decision rather than a property of the data?
3. **[WK-10-02]** Describe the two steps K-means repeats, and what makes it stop.
4. On the blob dataset, `k = 5` has the lowest inertia. Why is it not the best answer?
5. Why does one distant point pull a centroid, and what does that imply about the shapes K-means suits?
6. **[WK-10-03]** Why does K-means cut across the crescents, and what is DBSCAN doing differently?
7. What does it mean that DBSCAN marked four points as noise, and why is that not a failure?
8. What does a dendrogram record, and what does it let you avoid choosing in advance?
9. **[WK-10-04]** What evidence does collaborative filtering use, and what does it not need?
10. What is the difference between a user-based and an item-based approach to the same ratings table?
11. **[WK-10-05]** What is the cold-start problem, and why can no algorithm solve it outright?
12. Explain why a recommender's next dataset is not independent of the recommender.

---

## Sources and licensing notes

### CT319 source material

This week follows selected material from the formal CT319 *Clustering & Recommender Systems* material on Canvas, which remains the broader reference. These pages do not reproduce every slide; they develop a smaller number of points in more depth.

The page concentrates on what remains available once class labels are removed; K-means as a repeated cycle of assignment and centroid movement driven by a chosen `k`; the visible consequences of choosing `k` badly, on one fixed dataset; density-based clustering as a different set of assumptions, with noise as a legitimate output; hierarchical clustering as a nested alternative that needs no `k` in advance; recommendation from patterns of behaviour, without clustering first; and a clustering as an output to interpret, with cold start as a structural limit.

The inertia comparison is not in the formal material. It is included because the obvious escape from choosing `k` is to let a score choose it, and on this dataset that score picks the wrong answer — which is worth seeing once.

### Continuity from Week 9

Week 9 predicted a category from labelled examples. This week removes the labels and asks what structure can still be justified.

Both weeks use scikit-learn's two-moons generator, with **different settings**: Week 9 uses `n_samples=140, noise=0.23, random_state=2`, and this week uses `n_samples=220, noise=0.08, random_state=7`. The shape is familiar while each page keeps its own fixed data.

### Examples and measured values

Two fixed datasets serve every stage:

```python
make_blobs(n_samples=180,
           centers=((-3.0, -1.0), (0.0, 2.8), (3.0, -0.8)),
           cluster_std=(0.75, 0.80, 0.85),
           random_state=42)
make_moons(n_samples=220, noise=0.08, random_state=7)
```

Because the datasets and the estimators are seeded, every cluster size, inertia value and noise count quoted here is **reproducible rather than illustrative**. They were last regenerated with scikit-learn 1.9.1, matplotlib 3.11.2 and NumPy 2.5.3 on **5 October 2026**, by the script in this repository.

The five-person ratings table is a worked classroom example, not a dataset; no model is fitted to it.

### Figures

Figures 1–9 were **created for these pages**. They use no external image licence.

- Figures 1, 2, 8 and 9 are original diagrams.
- Figures 3, 4, 5, 6 and 7 are plots generated by the demonstration script from the datasets above. Every value quoted beside them is computed, not transcribed.

No external images, videos, papers or interactives are used.

### Software

- 📦 [**`clustering_demo.py`**](https://github.com/CS-UniversityOfGalway-Teaching/CT319-2627/blob/main/experiments/week-10/clustering_demo.py) — written for this module. Requires `numpy`, `matplotlib` and `scikit-learn`; nothing is downloaded at run time.
- scikit-learn User Guide — [clustering](https://scikit-learn.org/stable/modules/clustering.html)
- scikit-learn reference — [`KMeans`](https://scikit-learn.org/stable/modules/generated/sklearn.cluster.KMeans.html) · [`DBSCAN`](https://scikit-learn.org/stable/modules/generated/sklearn.cluster.DBSCAN.html) · [`make_blobs`](https://scikit-learn.org/stable/modules/generated/sklearn.datasets.make_blobs.html) · [`make_moons`](https://scikit-learn.org/stable/modules/generated/sklearn.datasets.make_moons.html)

scikit-learn and NumPy are distributed under the BSD 3-Clause licence, and matplotlib under the Python Software Foundation licence. They are used here as tools; no library code is reproduced on these pages.
