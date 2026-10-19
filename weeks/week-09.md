---
title: Week 9 — Classification
eyebrow: CT319 Artificial Intelligence · Week 9 · Classification
question: How can a machine decide which category a new example belongs to?
description: CT319 Week 9. k-nearest neighbours and decision trees on one fixed dataset — what changes when k changes, what a tree learns, and why training accuracy proves nothing on its own.
bar: Week 9 · Sections
source: week-09.md
deck: yes
---

Last week introduced machine learning in general. This week we focus on one kind: learning from **labelled examples**, where we already know the right answer for every past case. The question is how those known answers help the machine predict the category of a new case.

<!-- ct319:focus -->

> **How can a machine decide which category a new example belongs to?**

<!-- ct319:endfocus -->

All the experiments this week use the same dataset, the same split into training and test data, the same axes and the same unknown point. Only one thing changes at a time. So when a picture changes, you can say exactly what caused it.
<!-- ct319:key Only one thing changes at a time. So when a picture changes, you can say exactly what caused it. -->

This week covers five topics:
<!-- ct319:key This week covers five topics: -->

* [**From examples to categories**](#from-examples-to-categories--what-are-we-asking-the-machine-to-learn) — what a classification task is, when every training example already has its answer.
* [**Ask the neighbours**](#ask-the-neighbours--how-does-knn-make-a-decision) — how KNN predicts by looking at the labelled examples closest to a new case.
* [**Learn the rules instead**](#learn-the-rules-instead--what-does-a-decision-tree-do-differently) — how a decision tree learns a series of questions instead of keeping the examples.
* [**Good on what data?**](#good-on-what-data--did-the-classifier-actually-learn) — why a high score on the training examples proves nothing by itself.
* [**Representation first**](#representation-first--what-does-the-classifier-actually-see) — what the algorithm actually receives once a customer, an email or a photo has been turned into features.

Keep three ideas separate as you read:

<!-- ct319:focus -->

<div class="lenses">
<div class="lens"><span class="lens__key">Examples</span><span class="lens__gloss">the learner sees cases whose answers somebody already knows</span></div>
<div class="lens"><span class="lens__key">Decisions</span><span class="lens__gloss">a classifier must put a new case into one of a fixed set of categories</span></div>
<div class="lens"><span class="lens__key">Generalisation</span><span class="lens__gloss">doing well on examples it has already seen is not the question; what happens next is</span></div>
</div>

<!-- ct319:endfocus -->

We use two algorithms this week. On the same data, they give different answers, and understanding why is the main lesson.

<!-- ct319:beats -->

<!-- ct319:beat -->
## From examples to categories — what are we asking the machine to learn?

Classification is a **supervised learning** task. That means every training example comes with its correct answer.
<!-- ct319:key Classification is a **supervised learning** task. -->

Suppose a bank has records of past customers, and it knows whether each one repaid their loan:

| Income (€k) | Savings (€k) | Repaid? |
|---:|---:|:---|
| 31 | 4 | No |
| 36 | 7 | No |
| 48 | 14 | Yes |
| 55 | 18 | Yes |
| 63 | 24 | Yes |

Each row is an **example**. `Income` and `Savings` are **features**: the measurements we chose to describe each customer. `Repaid?` is the **class label**: the answer we want the classifier to predict.

Now a new customer applies. We know their features, but the answer is missing:

| Income (€k) | Savings (€k) | Repaid? |
|---:|---:|:---|
| 46 | 12 | **?** |

The classifier does not know the answer. It has to work it out from what the past examples showed it.

<!-- ct319:focus -->

> **Given the features of a new example, predict its class.**

<!-- ct319:endfocus -->

### Binary and multiclass

Sometimes there are only two possible classes: spam or not spam, fraud or not fraud, approve or reject. This is **binary classification**. Sometimes there are more: cat, dog or rabbit; red, amber or green. This is **multiclass classification**. The task works the same way in both cases. Only the number of possible answers changes.
<!-- ct319:key The task works the same way in both cases. Only the number of possible answers changes. -->

<!-- ct319:beat -->
## The dataset everything else runs on

The loan table is useful for learning the vocabulary. For the experiments, we switch to a dataset with two features, so every example can be drawn as a point on a flat plot. The dataset is generated the same way every time, so the results never change between runs:
<!-- ct319:key For the experiments, we switch to a dataset with two features, so every example can be drawn as a point on a flat plot. -->

```python
make_moons(n_samples=140, noise=0.23, random_state=2)
```

It has 140 points. Each has two numerical features on similar scales and is labelled `A` or `B`. The diamond is the unknown point, at `[-0.4, 0.15]`.

<!-- ct319:focus -->

![140 labelled points in two interleaving crescents, with an unknown diamond at minus 0.4, 0.15](../../media/week-09/data.svg "wide")

<sub><em>Figure 1. The whole week on one pair of axes. Solid circles are training examples, hollow circles are the held-back test examples, and the diamond is the unknown point. Plot created for these pages by the classification demonstration; no external image licence is used.</em></sub>

> **Which class would you give the diamond — and what evidence did you just use?**

<!-- ct319:endfocus -->

Decide on your answer before running any model. Then think about how you decided. You probably looked at which points are close to the diamond. That is exactly the idea behind the first algorithm.

### Why this matters this week

From here on, we change one thing at a time and compare against this picture: first how many neighbours the algorithm looks at, then which algorithm we use, then how much of the data it is allowed to see.

<!-- ct319:beat -->
## Ask the neighbours — how does KNN make a decision?

**k-nearest neighbours**, or **KNN**, predicts the class of a new example by looking at the labelled examples closest to it. The method is simple: find the *k* nearest examples, look at their classes, and let them vote.
<!-- ct319:key The method is simple: find the k nearest examples, look at their classes, and let them vote. -->

<!-- ct319:focus -->

![An unknown point with a dashed circle around its three nearest neighbours, two of class A and one of class B](../../media/week-09/knn-vote.svg "hero")

<sub><em>Figure 2. With `k = 3`, three labelled examples vote and the rest take no part. Two of them are A, so the prediction is A. Diagram created for these pages; no external image licence is used.</em></sub>

<!-- ct319:endfocus -->

Nobody wrote any rules in advance. The prediction depends only on which labelled examples happen to be nearest.
<!-- ct319:key Nobody wrote any rules in advance. The prediction depends only on which labelled examples happen to be nearest. -->

<!-- ct319:beat -->
## What does *nearest* mean?

To measure "nearest", each example has to be described by features. If both features are numbers, each example becomes a point, and KNN measures the distance between points. For two numerical features the usual choice is **Euclidean distance**: the ordinary straight-line distance.

The computer does the arithmetic. What matters for us is the consequence:

<!-- ct319:focus -->

> **KNN relies on the geometry of the representation we chose.**

<!-- ct319:endfocus -->

KNN treats two examples that are close together as similar. So how we represent the data decides which examples count as similar, and that can cause problems.

<!-- ct319:beat -->
## Is distance always meaningful?

Suppose a customer is described by `age = 37` and `income = 75000`. Income is measured in much bigger numbers than age. So when KNN calculates a distance, income almost completely decides it. That is not because income matters more. It is only because of the units it happens to be recorded in.

<!-- ct319:focus -->

> **A distance can be dominated by one feature simply because of the units it was recorded in.**

<!-- ct319:endfocus -->

In this week's dataset both features use similar scales, so this problem does not affect our experiments. With real data it often does. Then the features have to be rescaled, and choosing how to scale them is part of choosing the representation.

<!-- ct319:beat -->
## What does `k` change?

`k` is the number of neighbours that get a vote. With `k = 1`, the single closest example decides. With `k = 15`, fifteen examples vote, so a much larger area around the new point affects the answer.

Before running anything, make a prediction:

<!-- ct319:focus -->

> **Will changing `k` leave the prediction unchanged?**

<!-- ct319:endfocus -->

In scikit-learn, KNN takes three lines of code:

```python
from sklearn.neighbors import KNeighborsClassifier

model = KNeighborsClassifier(n_neighbors=3)
model.fit(X_train, y_train)
prediction = model.predict(X_new)
```

The code is the easy part. What matters is how the results change. Everything stays the same (the data, the split, the axes and the diamond) except `k`.

<!-- ct319:focus -->

| `k = 1` — one example decides | `k = 3` — three vote |
|---|---|
| ![KNN decision boundary with k equals 1, highly fragmented](../../media/week-09/knn-k1.svg) | ![KNN decision boundary with k equals 3, smoother](../../media/week-09/knn-k3.svg) |
| Training **100.0%**, test **81.0%**. Diamond → **A** | Training **93.9%**, test **92.9%**. Diamond → **A** |

<sub><em>Figure 3. At `k = 1` every training example gets its own small territory, which is why training accuracy is perfect and test accuracy is the worst of the four. Plots created for these pages by the classification demonstration; no external image licence is used.</em></sub>

<!-- ct319:endfocus -->

<!-- ct319:focus -->

| `k = 9` | `k = 15` |
|---|---|
| ![KNN decision boundary with k equals 9](../../media/week-09/knn-k9.svg) | ![KNN decision boundary with k equals 15](../../media/week-09/knn-k15.svg) |
| Training **93.9%**, test **95.2%**. Diamond → **B** | Training **93.9%**, test **95.2%**. Diamond → **B** |

<sub><em>Figure 4. Somewhere between `k = 3` and `k = 9` the diamond changes class. Nothing about the diamond changed — only how many examples were allowed to speak about it. Plots created for these pages by the classification demonstration; no external image licence is used.</em></sub>

<!-- ct319:endfocus -->

Here are all four results together. Notice that the diamond's predicted class changes between `k = 3` and `k = 9`:
<!-- ct319:key Notice that the diamond's predicted class changes between `k = 3` and `k = 9` -->

| `k` | Training accuracy | Test accuracy | Diamond |
|---:|---:|---:|:---|
| 1 | 100.0% | 81.0% | A |
| 3 | 93.9% | 92.9% | A |
| 9 | 93.9% | 95.2% | **B** |
| 15 | 93.9% | 95.2% | B |

With a very small `k`, the prediction depends heavily on single examples, so one unusual point can change the answer. A larger `k` smooths this out. But bigger is not always better: if `k` is too large, examples far from the new point start to affect a decision that should depend on what is nearby.

### Why this matters this week

Do not just read the accuracy numbers; look at the plots. Check where the boundary between the classes moved, and which examples are now closest to the diamond. The numbers alone would not show you that the diamond's predicted class changed.
<!-- ct319:key Do not just read the accuracy numbers; look at the plots. -->

<!-- ct319:beat -->
## Learn the rules instead — what does a decision tree do differently?

KNN keeps all the training examples and looks at them every time a new case arrives. There is another approach. A **decision tree** learns a series of yes/no questions during training. After that, it only needs to follow those questions to classify a new case.
<!-- ct319:key A decision tree learns a series of yes/no questions during training. -->

<!-- ct319:focus -->

![A tree that asks whether income exceeds 45, then whether savings exceed 10, reaching high or low risk](../../media/week-09/decision-tree-rules.svg "hero")

<sub><em>Figure 5. A new example enters at the top and follows branches until it reaches a prediction. Nobody wrote the thresholds — the algorithm searched the training data for splits that separate the classes. Diagram created for these pages; no external image licence is used.</em></sub>

<!-- ct319:endfocus -->

<!-- ct319:beat -->
## Lazy and eager learning

There are standard names for this difference: **lazy** learning and **eager** learning.

<!-- ct319:focus -->

<div class="lenses lenses--pair">
<div class="lens"><span class="lens__key">KNN · lazy</span><span class="lens__gloss">stores the training examples and delays the work until a prediction is requested</span></div>
<div class="lens"><span class="lens__key">Decision tree · eager</span><span class="lens__gloss">builds a model during training, then uses that model and not the examples</span></div>
</div>

<!-- ct319:endfocus -->

Neither one is better. The names describe *when* the work is done, and what has to be stored afterwards.

<!-- ct319:beat -->
## What if we let the tree keep growing?

A small tree with only a few questions gets most of the training examples right. If we let it ask more questions, it can add very specific rules that deal with single training examples. Its training accuracy goes up. Is that a good thing?

No. This is the idea from Week 8, now with real numbers to show it:

<!-- ct319:focus -->

> **Learning is not remembering.**

<!-- ct319:endfocus -->

The code is the same three lines as before, with a different classifier. The data stays the same; only the learning algorithm changes:

```python
from sklearn.tree import DecisionTreeClassifier

model = DecisionTreeClassifier(max_depth=2, random_state=42)
model.fit(X_train, y_train)
prediction = model.predict(X_new)
```

`max_depth` limits how many questions the tree can ask, one after another, before it gives an answer.

<!-- ct319:focus -->

| `max_depth = 2` — 7 nodes, 4 leaves | `max_depth = 5` — 23 nodes, 12 leaves |
|---|---|
| ![Decision tree boundary at depth 2, four rectangular regions](../../media/week-09/tree-depth-2.svg) | ![Decision tree boundary at depth 5, twelve regions](../../media/week-09/tree-depth-5.svg) |
| Training **90.8%**, test **90.5%** | Training **96.9%**, test **85.7%** |

<sub><em>Figure 6. Deeper means more regions, and the regions are axis-aligned rectangles — a tree can only cut straight across one feature at a time. Training accuracy rises by six points while test accuracy falls by five. Plots created for these pages by the classification demonstration; no external image licence is used.</em></sub>

<!-- ct319:endfocus -->

Now remove the depth limit completely:
<!-- ct319:key Now remove the depth limit completely: -->

<!-- ct319:focus -->

![Decision tree boundary with no depth limit, fragmented into seventeen regions including slivers](../../media/week-09/tree-depth-unrestricted.svg "wide")

<sub><em>Figure 7. Unrestricted: 33 nodes, 17 leaves, **100.0%** on the training examples and **76.2%** on the held-back ones — the worst of the three. Several of those regions exist to accommodate a single training point. Plot created for these pages by the classification demonstration; no external image licence is used.</em></sub>

<!-- ct319:endfocus -->

### If the data are identical, why do the models disagree?

Because each algorithm makes a different assumption about what the data looks like. KNN assumes that examples close together belong to the same class. A decision tree assumes the classes can be separated by straight cuts, one feature at a time.

The same data can produce different models. There is no single "correct" model hidden in the data.
<!-- ct319:key The same data can produce different models. There is no single "correct" model hidden in the data. -->

### Why this matters this week

Two algorithms, one dataset, two different answers, and neither algorithm is reading the data wrongly. Choosing the learning algorithm is a design decision, just like choosing the representation in Week 2.

<!-- ct319:beat -->
## Good on what data? — did the classifier actually learn?

Train a classifier on 100 examples, then ask it to predict those same 100. It gets them all right.

<!-- ct319:focus -->

> **Those are the examples it learned from. Repeating them is not evidence of anything.**

<!-- ct319:endfocus -->

What we really want to know is how it does on examples it did not see during training. To find out, we have to set some examples aside before training starts.

<!-- ct319:beat -->
## Training data and test data

The standard approach is to hold back some of the labelled examples before any learning happens. The model trains on the rest. The held-back examples are used only at the end, to test it.
<!-- ct319:key The standard approach is to hold back some of the labelled examples before any learning happens. -->

<!-- ct319:focus -->

![140 labelled examples split into 98 for training and 42 kept unseen for testing](../../media/week-09/train-test-split.svg "hero")

<sub><em>Figure 8. The split used by every figure on this page. Stratified, so the class proportions survive into both parts. Diagram created for these pages; no external image licence is used.</em></sub>

<!-- ct319:endfocus -->

```python
from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.30, random_state=42, stratify=y
)
```

`test_size=0.30` holds back 30% of the data for testing. `random_state=42` makes the split the same every time, so you always get the same figures. `stratify=y` keeps the same mix of A and B in both parts. With 140 examples, that gives 98 for training and 42 for testing.

<!-- ct319:focus -->

> **Keep some evidence outside the training process.**

<!-- ct319:endfocus -->

If you train on all the data, nothing is left for a fair test. The model might then look good only because it is being tested on examples it has already seen.

<!-- ct319:beat -->
## Overfitting, measured

A model **overfits** when it fits its training data so closely that it does worse on new data. On this dataset, the effect is easy to see:

| Decision tree | Nodes | Leaves | Training | Test |
|:---|---:|---:|---:|---:|
| `max_depth=2` | 7 | 4 | 90.8% | **90.5%** |
| `max_depth=5` | 23 | 12 | 96.9% | 85.7% |
| unrestricted | 33 | 17 | **100.0%** | **76.2%** |

As the tree grows, training accuracy rises all the way to 100%, while test accuracy keeps falling. The tree that memorised every training label does worst on new data, which is the job that actually matters.
<!-- ct319:key The tree that memorised every training label does worst on new data, which is the job that actually matters. -->

<!-- ct319:focus -->

![KNN and decision tree results side by side on the same dataset and split](../../media/week-09/compare.svg "wide")

<sub><em>Figure 9. All of it on one screen. The setting with the best training score and the setting with the best test score are not the same setting. Plot created for these pages by the classification demonstration; no external image licence is used.</em></sub>

<!-- ct319:endfocus -->

<!-- ct319:beat -->
## Accuracy, and where it goes blind

The simplest way to score a classifier is **accuracy**: the proportion of predictions it got right. If it gets 18 of 20 test examples right, its accuracy is 90%. That is useful, but it does not tell the whole story.

Imagine trying to detect something rare, where 99 out of every 100 examples belong to the same class. A system that always predicts that common class scores **99%** accuracy, yet it detects **none** of the rare cases we actually care about.

<!-- ct319:focus -->

> **Accuracy is a useful starting measure, not a definition of a good classifier. The evaluation has to match the problem.**

<!-- ct319:endfocus -->

There are many other ways to measure a classifier, and we do not cover them here. The habit to take away is to ask whether the measure fits the problem.

### Why this matters this week

For every model we now have three numbers: the training score, the test score, and the gap between them. The gap is the most informative of the three.
<!-- ct319:key The gap is the most informative of the three. -->

<!-- ct319:beat -->
## Representation first — what does the classifier actually see?

Every classifier this week has the same hidden limitation. The algorithm never sees a real customer, email, photograph or patient.

<!-- ct319:focus -->

> **It sees the representation we gave it — and nothing else.**

<!-- ct319:endfocus -->

This brings us back to the idea of representation from Week 2.

<!-- ct319:beat -->
## An email is not a feature vector

Suppose an email says *FREE tickets available in Galway tomorrow*. A classical classifier cannot understand the meaning of that sentence. The text first has to be turned into numbers it can count.
<!-- ct319:key A classical classifier cannot understand the meaning of that sentence. The text first has to be turned into numbers it can count. -->

<!-- ct319:focus -->

![A message turned into word counts, and the pair good and not good colliding under those counts](../../media/week-09/bag-of-words.svg "hero")

<sub><em>Figure 10. A **bag-of-words** representation records which words appear and largely discards their order. That works surprisingly well for some tasks — and fails exactly where order carries the meaning. Diagram created for these pages; no external image licence is used.</em></sub>

<!-- ct319:endfocus -->

Both `good` and `not good` contain the word `good`. So if we only count single words, a positive review and a negative one can look almost the same. One fix is to also count pairs of neighbouring words: `"not good"` is a **bigram**. In general, a sequence of *n* neighbouring words is called an **n-gram**.

The specific fix matters less than the general point:

<!-- ct319:focus -->

> **Changing the representation changes what the classifier is capable of learning — before any algorithm has been chosen.**

<!-- ct319:endfocus -->

<!-- ct319:beat -->
## Similarity changes too

For some kinds of data, straight-line distance is not the best way to measure similarity. When text is turned into word counts, most of the counts are zero, because any one document uses only a few of all possible words. For data like this, **cosine similarity** is often used instead. It compares the direction of two lists of numbers rather than the distance between them.

You do not need the formula. The important design question is:

<!-- ct319:focus -->

> **What should count as similar for this problem?**

<!-- ct319:endfocus -->

The classifier cannot answer this question for us. The answer is decided when we choose the representation, before the classifier ever runs.
<!-- ct319:key The classifier cannot answer this question for us. -->

### Why this matters this week

In Week 2 we had to decide what a state was, which actions were possible and what counted as a goal. Machine learning does not take those decisions away from us. For classification, we still decide what an example is, which features describe it, what the labels mean, which data the model learns from, and how we measure success. The algorithm only works within the choices we make.

<!-- ct319:endbeats -->

## The classification demo

📦 **[`classification_demo.py`](https://github.com/CS-UniversityOfGalway-Teaching/CT319-2627/blob/main/experiments/week-09/classification_demo.py)** — shows every figure from this page, one step at a time.

```sh
python -m pip install numpy matplotlib scikit-learn
python experiments/week-09/classification_demo.py
```

Press **Space**, the **right arrow** or **Next →** to move to the next step. Each step shows a question and its measured result on the figure. The dataset, the split, the axes and the unknown point stay the same throughout.
<!-- ct319:key The dataset, the split, the axes and the unknown point stay the same throughout. -->

### Try it yourself

1. Open `--mode data` and predict the diamond's class by eye. Say what evidence you used.
2. Step through `--mode knn --k 1`, then `3`, then `9`, then `15`. Predict how the boundary will look before each one.
3. Find where the diamond changes class, and name the examples responsible.
4. Switch to `--mode tree --depth 2`, then `5`, then `none`. Predict whether test accuracy will rise along with training accuracy.
5. Finish on `--mode compare` and find three things: the setting that memorised every training example, the setting with the best test score, and why training accuracy cannot tell you which is which.
<!-- ct319:key Find where the diamond changes class, and name the examples responsible. -->

To save every figure on this page as a file, without opening a window:

```sh
python experiments/week-09/classification_demo.py --save-dir media/week-09
```

---

## Before Week 10

Every classifier this week learned from examples that already had the correct label. Someone had already done the hard work of labelling them.

<!-- ct319:focus -->

> **What happens when nobody gives us the labels?**

<!-- ct319:endfocus -->

That is where Week 10 begins: **clustering**.

---

## Quick revision

If you can answer these without reopening the page, you have the core of this week.
<!-- ct319:key If you can answer these without reopening the page, you have the core of this week. -->

1. **[WK-09-01]** What makes classification a supervised task, and what does the learner receive that an unsupervised one does not?
2. What is the difference between binary and multiclass classification, and what stays the same?
3. **[WK-09-02]** How does KNN reach a prediction, and what does `k` control?
4. Why can changing `k` alone change the predicted class of a point that has not moved?
5. Why does feature scale matter to KNN but not to a decision tree?
6. **[WK-09-03]** What does a decision tree learn during training, and what does it keep afterwards?
7. What do “lazy” and “eager” describe, and why is neither one better?
8. **[WK-09-04]** Why does 100% on the training examples establish nothing, and what would establish something?
9. Why does test accuracy fall as the tree is allowed to grow, while training accuracy rises?
10. Give a case where 99% accuracy is evidence of a useless classifier.
11. **[WK-09-05]** Why can a bag-of-words representation not separate “good” from “not good”, and what fixes it?
12. Name three decisions a classifier cannot make for you.

---

## Sources and licensing notes

### CT319 source material

This week follows selected material from the formal CT319 *Classification* material on Canvas, which remains the broader reference. These pages do not reproduce every slide; they develop a smaller number of points in more depth.

The page concentrates on classification as a supervised task; k-nearest neighbours as a decision reached by consulting nearby labelled examples; the effect of `k` on both the decision boundary and one individual prediction; decision trees as a learned sequence of questions, and the effect of depth; training accuracy against held-out accuracy, and why the first alone establishes nothing; the blind spot in accuracy when one class is rare; and representation — features, numerical scale, and what the classifier actually receives.

### Continuity from Week 8

Week 8 used `KNeighborsClassifier` only to expose the scikit-learn workflow of `fit(...)` followed by prediction. This week teaches k-nearest neighbours in its own right, adds decision trees, and turns Week 8's remarks about generalisation and overfitting into a measured train/test comparison.

### Examples and measured values

One fixed dataset and one fixed split serve every stage, so each visible change is attributable to the classifier or parameter that changed:

```python
make_moons(n_samples=140, noise=0.23, random_state=2)
train_test_split(test_size=0.30, random_state=42, stratify=y)
```

Because the dataset, the split and the estimators are all seeded, every accuracy, node count and leaf count quoted here is **reproducible rather than illustrative**. They were last regenerated with scikit-learn 1.9.1, matplotlib 3.11.2 and NumPy 2.5.3 on **5 October 2026**, by the script in this repository.

The loan table in the first highlight is a vocabulary example only, and no model is fitted to it.

### Figures

Figures 1–10 were **created for these pages**. They use no external image licence.

- Figures 2, 5, 8 and 10 are original diagrams.
- Figures 1, 3, 4, 6, 7 and 9 are plots generated by the demonstration script from the fixed dataset above. Every value printed on them is computed, not transcribed.

No external images, videos, papers or interactives are used.

### Software

- 📦 [**`classification_demo.py`**](https://github.com/CS-UniversityOfGalway-Teaching/CT319-2627/blob/main/experiments/week-09/classification_demo.py) — written for this module. Requires `numpy`, `matplotlib` and `scikit-learn`; nothing is downloaded at run time.
- scikit-learn User Guide — [nearest neighbours](https://scikit-learn.org/stable/modules/neighbors.html) · [decision trees](https://scikit-learn.org/stable/modules/tree.html)
- scikit-learn reference — [`KNeighborsClassifier`](https://scikit-learn.org/stable/modules/generated/sklearn.neighbors.KNeighborsClassifier.html) · [`DecisionTreeClassifier`](https://scikit-learn.org/stable/modules/generated/sklearn.tree.DecisionTreeClassifier.html) · [`train_test_split`](https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.train_test_split.html) · [`make_moons`](https://scikit-learn.org/stable/modules/generated/sklearn.datasets.make_moons.html)

scikit-learn and NumPy are distributed under the BSD 3-Clause licence, and matplotlib under the Python Software Foundation licence. They are used here as tools; no library code is reproduced on these pages.
