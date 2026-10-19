---
title: Week 10 — Clustering and recommendation
eyebrow: CT319 Artificial Intelligence · Week 10 · Clustering and recommendation
question: Can a machine discover useful structure when nobody tells it the correct groups?
description: CT319 Week 10. K-means, DBSCAN and hierarchical clustering on fixed datasets, then collaborative filtering — what counts as similar, and who decided how many groups there are.
bar: Week 10 · Sections
source: week-10.md
deck: yes
---

Last week every example came with a label, and the job was to predict the label of a new one. This week the labels are gone. The points stay exactly where they were. Only the answers have been taken away.

<!-- ct319:focus -->

> **Can a machine discover useful structure when nobody tells it the correct groups?**

<!-- ct319:endfocus -->

Watch out for a trap in that question. An algorithm will always return groups. Whether those groups mean anything is a separate question, and the algorithm cannot answer it.

This week covers five topics.

* [**Remove the labels**](#remove-the-labels--what-can-the-machine-still-see) — what we can still see once the class names are taken away.
* [**Move the centres**](#move-the-centres--how-does-k-means-discover-groups) — how K-means turns a chosen number `k` into groups, by reassigning points and moving centroids.
* [**What if the groups are not blobs?**](#what-if-the-groups-are-not-blobs--does-every-algorithm-see-the-same-structure) — what happens when the data do not form compact groups around a centre.
* [**People who liked this also liked**](#people-who-liked-this-also-liked--where-do-recommendations-come-from) — how patterns of similarity and preference become recommendations.
* [**Useful pattern or misleading pattern**](#useful-pattern-or-misleading-pattern--what-can-go-wrong) — why a clustering result has to be interpreted, and why new users are hard to recommend for.

Keep three ideas separate as you read.

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

Last week every example came with a label. Take the labels away, and the picture hardly changes. That is exactly the problem.
<!-- ct319:key Last week every example came with a label. Take the labels away, and the picture hardly changes. That is exactly the problem. -->

<!-- ct319:focus -->

![The same ten points shown first with class A and B labels and then drawn neutrally with none](../../media/week-10/labels-removed.svg "hero")

<sub><em>Figure 1. The points are in identical positions on both sides. The only thing removed was the answer key. Diagram created for these pages. No external image licence is used.</em></sub>

<!-- ct319:endfocus -->

You can still see two groups, and so can most people. But nobody told us there were two. That raises an uncomfortable question.

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

One important unsupervised task is **clustering**. Clustering puts examples into groups, based on how similar they are. The usual idea is that examples in the same cluster should be more similar to each other than to examples in other clusters.

The hard word in that sentence is *similar*.

<!-- ct319:beat -->
## Similarity still has to be designed

Suppose we describe customers by their age, location, how often they buy, how much they spend and which products they view. Two customers can be close in age but buy very different things. Two others can live in different countries but buy almost the same things. Which pair counts as "similar" depends entirely on what we chose to record.

The algorithm only sees the representation we give it. So the question from Weeks 2 and 9 comes back.

<!-- ct319:focus -->

> **What should count as similar for this problem?**

<!-- ct319:endfocus -->

Clustering can group customers, organise documents, split images into regions or flag unusual cases. But a cluster is not automatically a real-world category. `Cluster 0`, `Cluster 1` and `Cluster 2` are just names the algorithm gives its output. Working out what they mean is still our job.

### Why this matters this week

Every method this week produces groups. The real work is deciding which groups you can trust.

<!-- ct319:beat -->
## Move the centres — how does K-means discover groups?

Suppose some unlabelled points sit in three compact groups. We can see the groups, but the algorithm has not been told about them. **K-means** starts from a decision that we make, not the algorithm.

<!-- ct319:focus -->

> **Choose `k` — the number of clusters to request.**

<!-- ct319:endfocus -->

With `k = 3`, K-means starts with three candidate centres, called **centroids**. A centroid is the average position of the points assigned to it. K-means then repeats two steps.

<!-- ct319:focus -->

![Assign every point to its nearest centroid, move each centroid to the mean of its points, repeat](../../media/week-10/kmeans-cycle.svg "hero")

<sub><em>Figure 2. Two steps, repeated until the centroids stop moving. The result depends on what we fixed before the loop started. Diagram created for these pages. No external image licence is used.</em></sub>

<!-- ct319:endfocus -->

### Predict before running

Suppose a centroid starts too far to the right. Where does it move once nearby points are assigned to it? And what happens if one distant point is assigned to it as well?

The centroid moves towards the points assigned to it, *including* the distant one. K-means works best when each group forms a fairly compact region around a centre.
<!-- ct319:key K-means works best when each group forms a fairly compact region around a centre. -->

```python
from sklearn.cluster import KMeans

model = KMeans(n_clusters=3, random_state=42, n_init=10)
labels = model.fit_predict(X)
centroids = model.cluster_centers_
```

`fit_predict` gives each point a cluster number. The numbers `0`, `1` and `2` are only identifiers. They are not class names, and they mean nothing until somebody interprets them.

<!-- ct319:beat -->
## One dataset, three values of `k`

The demonstration uses 180 points in three compact groups. The points are generated the same way every time. The data and the axes never change, and only `k` does. Black stars mark the centroids that K-means finds.
<!-- ct319:key The data and the axes never change, and only `k` does. -->

<!-- ct319:focus -->

![180 unlabelled points forming three compact regions](../../media/week-10/blobs-data.svg "wide")

<sub><em>Figure 3. The starting picture. Before running anything, decide how many groups you would ask for, and be ready to say why. Plot created for these pages by the clustering demonstration. No external image licence is used.</em></sub>

<!-- ct319:endfocus -->

<!-- ct319:focus -->

| `k = 2` — too few | `k = 3` — matches what we see |
|---|---|
| ![K-means with k equals 2 merging two of the three regions](../../media/week-10/blobs-k2.svg) | ![K-means with k equals 3 recovering the three regions](../../media/week-10/blobs-k3.svg) |
| Cluster sizes **60, 120**. Two visible regions are merged into one. | Cluster sizes **60, 60, 60**. Each region recovered exactly. |

<sub><em>Figure 4. At `k = 2` the algorithm did not fail. It did exactly what it was asked, which was to produce two groups. Plots created for these pages by the clustering demonstration. No external image licence is used.</em></sub>

<!-- ct319:endfocus -->

<!-- ct319:focus -->

![K-means with k equals 5 subdividing two of the three visible regions](../../media/week-10/blobs-k5.svg "wide")

<sub><em>Figure 5. At `k = 5`, the cluster sizes are **60, 38, 38, 22, 22**. Two of the three regions are split down the middle. The points did not change. Only the number of groups we asked for did. Plot created for these pages by the clustering demonstration. No external image licence is used.</em></sub>

<!-- ct319:endfocus -->

<!-- ct319:beat -->
## Why you cannot pick `k` by the score

It might seem easy to let the algorithm choose `k` by measuring how tight the clusters are. The usual measure is **inertia**. It adds up the squared distance from each point to its own centroid, so lower inertia means tighter clusters. Here are the values for this dataset.

| `k` | Cluster sizes | Inertia |
|---:|:---|---:|
| 2 | 60, 120 | 946.7 |
| 3 | 60, 60, 60 | 204.1 |
| 5 | 60, 38, 38, 22, 22 | **149.9** |

The lowest inertia belongs to `k = 5`, the setting that splits two good regions in half. Inertia keeps falling as `k` rises. With one cluster per point, it reaches zero.

<!-- ct319:focus -->

> **The tightest clustering is not the most useful one. Choosing `k` is a judgement, and it stays ours.**

<!-- ct319:endfocus -->

### Why this matters this week

K-means did not find the one true grouping at `k = 3`. It produced a grouping based on four things we gave it. The four things are the representation, the value of `k`, the starting centroids, and the assumption that groups form around centres. Change any of the four, and the answer can change too.
<!-- ct319:key K-means did not find the one true grouping at `k = 3`. It produced a grouping based on four things we gave it. -->

<!-- ct319:beat -->
## What if the groups are not blobs? — does every algorithm see the same structure?

K-means works well when groups are compact regions around a centre. But real data does not have to look like that.
<!-- ct319:key K-means works well when groups are compact regions around a centre. But real data does not have to look like that. -->

The second dataset has 220 points in two interlocking crescents. It is the same shape as in Week 9, generated with its own fixed settings.

<!-- ct319:focus -->

![220 unlabelled points forming two interleaving crescent shapes](../../media/week-10/moons.svg "wide")

<sub><em>Figure 6. Trace the two shapes with your finger before choosing an algorithm. Then ask whether two centres could ever describe them. Plot created for these pages by the clustering demonstration. No external image licence is used.</em></sub>

<!-- ct319:endfocus -->

<!-- ct319:beat -->
## Centres against density

Ask K-means for two clusters, and it will give you two clusters. Now compare K-means with **DBSCAN**. DBSCAN looks for dense, connected regions of points, instead of building groups around centres. It has two main settings. **`eps`** is the radius of the neighbourhood around each point. **`min_samples`** is how many points a neighbourhood needs before it counts as dense.
<!-- ct319:key Ask K-means for two clusters, and it will give you two clusters. -->

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

<sub><em>Figure 7. K-means did not break. It assumes a group is whatever lies nearest a centre, and that simply does not describe a crescent. Plots created for these pages by the clustering demonstration. No external image licence is used.</em></sub>

<!-- ct319:endfocus -->

Look at the right-hand panel. DBSCAN was never told there were two groups, but it found two. DBSCAN can also leave some points out of every group. Those four noise points are a valid result, not a failure.
<!-- ct319:key DBSCAN was never told there were two groups, but it found two. -->

The value `eps = 0.18` was tuned to the size and spacing of these crescents. It is not a general setting. On a different dataset it would mean nothing.

<!-- ct319:beat -->
## A third view — hierarchy

**Hierarchical clustering** builds groups inside groups. The **agglomerative** approach starts with very small groups and keeps merging them. The **divisive** approach starts with one big group and keeps splitting it. A **dendrogram** is a diagram that shows the order of these merges or splits.
<!-- ct319:key **Hierarchical clustering** builds groups inside groups. -->

<!-- ct319:focus -->

![A dendrogram where A and B merge, D and E merge, C joins A and B, and the two groups merge](../../media/week-10/hierarchical-dendrogram.svg "wide")

<sub><em>Figure 8. Read it from the bottom up. Notice that no `k` was chosen in advance. Where you cut the tree decides how many groups you get. Diagram created for these pages. No external image licence is used.</em></sub>

<!-- ct319:endfocus -->

<!-- ct319:focus -->

<div class="lenses">
<div class="lens"><span class="lens__key">K-means</span><span class="lens__gloss">a group is whatever lies nearest a centroid, and you must choose <code>k</code></span></div>
<div class="lens"><span class="lens__key">DBSCAN</span><span class="lens__gloss">a group is a dense, connected region, and some points may be left as noise</span></div>
<div class="lens"><span class="lens__key">Hierarchical</span><span class="lens__gloss">groups sit inside larger groups, and you cut the tree wherever you choose</span></div>
</div>

<!-- ct319:endfocus -->

### Why this matters this week

Three algorithms, one dataset, three different answers, and none of them is wrong. Each one assumes something different about what a group *is*. So instead of saying "we clustered the data", say which assumption the method made.

<!-- ct319:beat -->
## People who liked this also liked — where do recommendations come from?

Clustering asks which examples are similar. Recommendation asks a different question. Can patterns of similarity and preference predict what somebody will want next?

<!-- ct319:focus -->

> **Recommendation can use similarity without first clustering users or items into groups at all.**

<!-- ct319:endfocus -->

Here are five people, five films and two gaps.

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

Like Aoife, Ben and Carla rated Films A and B highly and Film D low. Both of them also prefer Film C to Film E. That is evidence for recommending Film C to Aoife. Notice what that evidence does not use. Nobody described what Film C is about.

This method is called **collaborative filtering**. Collaborative filtering uses patterns in many people's behaviour to estimate a preference that nobody has recorded yet.
<!-- ct319:key Collaborative filtering uses patterns in many people's behaviour to estimate a preference that nobody has recorded yet. -->

<!-- ct319:beat -->
## Two ways to use the same table

<!-- ct319:focus -->

<div class="lenses lenses--pair">
<div class="lens"><span class="lens__key">User-based</span><span class="lens__gloss">who behaves like Aoife? Find similar users, look at what they liked, recommend something she has not seen</span></div>
<div class="lens"><span class="lens__key">Item-based</span><span class="lens__gloss">which films behave like the films Aoife likes? Compare items by their interaction patterns across users</span></div>
</div>

<!-- ct319:endfocus -->

These are the two classic collaborative methods, but there are others. In both, the evidence comes from what people did, such as ratings, viewing or purchases. It does not come from descriptions of the items.

### When description is available

Sometimes we do have item features, such as genre, director, cast, release year or language. Then a **content-based** recommender can find items similar to what a user already likes. A **hybrid** recommender combines both kinds of evidence.

Recommenders can draw on two kinds of evidence. One is how people behave. The other is features that describe the items.
<!-- ct319:key Recommenders can draw on two kinds of evidence. One is how people behave. The other is features that describe the items. -->

### Why this matters this week

A recommendation is both a prediction and a decision. As a prediction, it estimates whether this user will click, watch, buy or rate an item highly, just as in Week 9. As a decision, it controls what the user gets to see in the first place. That has a consequence, which we come to at the end of this week.
<!-- ct319:key A recommendation is both a prediction and a decision. -->

<!-- ct319:beat -->
## Useful pattern or misleading pattern — what can go wrong?

### A clustering is an output, not a discovery

The features, the scale of the numbers, the settings and the algorithm's assumptions all shape the groups that come back. K-means and DBSCAN can disagree about the same points and both be working correctly, because they look for different things.

<!-- ct319:focus -->

> **Which assumptions make sense for this problem?**

<!-- ct319:endfocus -->

Finding four clusters does not prove that four kinds of customer exist in the real world.

### Cold start

A new user has no ratings, no purchases and no viewing history. So a collaborative recommender has almost nothing to work with. A new item has the same problem, because nobody has interacted with it yet.

This is called the **cold-start problem**. Item features, or a few questions about the user's tastes, can provide some evidence. But the missing history is real, and no algorithm can make it up.

### Preferences and context change

People's interests change, so old behaviour goes out of date. One account can also be shared by several people. A family profile with children's programmes, crime dramas, football and documentaries is not one person's taste. Averaging it describes nobody.

<!-- ct319:focus -->

> **Every observed interaction has a time and a context. Treating all of them as equally current expressions of one person's preference is a modelling assumption, not a neutral default.**

<!-- ct319:endfocus -->

<!-- ct319:beat -->
## Recommendations change the next dataset

A recommender is not outside the process that creates its data. It is part of that process.
<!-- ct319:key A recommender is not outside the process that creates its data. It is part of that process. -->

<!-- ct319:focus -->

![The system recommends, the user sees and interacts, the interaction becomes data, and the system learns from it](../../media/week-10/recommendation-loop.svg "hero")

<sub><em>Figure 9. The loop closes. What the system recommended yesterday shapes the data it learns from today. Diagram created for these pages. No external image licence is used.</em></sub>

<!-- ct319:endfocus -->

Recommendations influence what people see. So is the next dataset independent of the system that made the recommendations?

<!-- ct319:focus -->

> **No. It records behaviour that happened after the system helped decide what was visible.**

<!-- ct319:endfocus -->

### Why this matters this week

From Week 8 to Week 10 we moved from learning from data, to prediction with labels, to finding structure without labels. The algorithms changed every week, but the habits did not. Check the representation, name the assumptions, and ask what the evidence really supports.

<!-- ct319:endbeats -->

## The clustering demo

📦 **[`clustering_demo.py`](https://github.com/CS-UniversityOfGalway-Teaching/CT319-2627/blob/main/experiments/week-10/clustering_demo.py)** — shows every plot from this page, one step at a time.

```sh
python -m pip install numpy matplotlib scikit-learn
python experiments/week-10/clustering_demo.py
```

Press **Space**, the **right arrow** or the on-screen button to move on. Every step uses the same two datasets. So when something changes, you know it was caused by the algorithm or setting that changed.
<!-- ct319:key Every step uses the same two datasets. So when something changes, you know it was caused by the algorithm or setting that changed. -->

### Try it yourself

Work through these steps, and make a prediction before each one.
<!-- ct319:key Work through these steps, and make a prediction before each one. -->

1. Open `--mode blobs --k 3`. Decide how many groups you would have asked for, just from looking at the points.
2. Run `--k 2` and `--k 5`. For each one, say what the algorithm was asked to do before judging how well it did it.
3. Read the inertia printed in the terminal for all three runs. Notice that the lowest value does not give the best grouping.
4. Switch to `--mode moons` and trace the two shapes before running anything.
5. Run `--mode moons-kmeans`, then `--mode moons-dbscan`. Name the assumption that makes the difference.
6. Find the four noise points. Decide whether you would want an algorithm that is allowed to say "neither".

To save every plot on this page as a file, without opening a window, run this.

```sh
python experiments/week-10/clustering_demo.py --save-dir media/week-10
```

---

## Before Week 11

Over the last three weeks the machine learned from data. First it learned with labels, then without them, then from patterns of behaviour. Each time, we mostly asked whether the result was *accurate*.

<!-- ct319:focus -->

> **Accuracy is one question. When should anyone trust what the system did with it?**

<!-- ct319:endfocus -->

That is where Week 11 begins.

---

## Quick revision

If you can answer these without reopening the page, you have the core of this week.
<!-- ct319:key If you can answer these without reopening the page, you have the core of this week. -->

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
