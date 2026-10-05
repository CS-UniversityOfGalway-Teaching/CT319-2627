---
title: Week 9 — Classification
eyebrow: CT319 Artificial Intelligence · Week 9 · Classification
question: How can a machine decide which category a new example belongs to?
description: CT319 Week 9. k-nearest neighbours and decision trees on one fixed dataset — what changes when k changes, what a tree learns, and why training accuracy proves nothing on its own.
bar: Week 9 · Sections
source: week-09.md
---

Last week introduced learning from data and experience in general. This week narrows it to one setting — **labelled examples** — and one question: how do known answers become category predictions for new cases?

<!-- ct319:focus -->

> **How can a machine decide which category a new example belongs to?**

<!-- ct319:endfocus -->

Everything on this page runs on one dataset, with one fixed split, one fixed pair of axes and one unknown point. Nothing else moves. That is deliberate: when the picture changes, exactly one thing caused it, and you should be able to name it.

We work through five things.

* [**From examples to categories**](#from-examples-to-categories--what-are-we-asking-the-machine-to-learn) — what a supervised task asks for once the training examples already carry their answers.
* [**Ask the neighbours**](#ask-the-neighbours--how-does-knn-make-a-decision) — how KNN predicts by consulting the labelled examples nearest a new case.
* [**Learn the rules instead**](#learn-the-rules-instead--what-does-a-decision-tree-do-differently) — how a decision tree learns a sequence of questions rather than keeping the examples.
* [**Good on what data?**](#good-on-what-data--did-the-classifier-actually-learn) — why scoring well on the training examples establishes nothing on its own.
* [**Representation first**](#representation-first--what-does-the-classifier-actually-see) — what the algorithm actually receives once a customer, an email or a photograph becomes features.

Three ideas carry the page, and it is worth keeping them apart:

<!-- ct319:focus -->

<div class="lenses">
<div class="lens"><span class="lens__key">Examples</span><span class="lens__gloss">the learner sees cases whose answers somebody already knows</span></div>
<div class="lens"><span class="lens__key">Decisions</span><span class="lens__gloss">a classifier must put a new case into one of a fixed set of categories</span></div>
<div class="lens"><span class="lens__key">Generalisation</span><span class="lens__gloss">doing well on examples it has already seen is not the question; what happens next is</span></div>
</div>

<!-- ct319:endfocus -->

Two algorithms this week, and they disagree with each other on the same data. That disagreement is the lesson.

<!-- ct319:beats -->

<!-- ct319:beat -->
## From examples to categories — what are we asking the machine to learn?

Classification is a **supervised learning** task, which means the training examples arrive with their answers attached.

Suppose we have a set of previous customers, and we already know whether each one repaid a loan.

| Income (€k) | Savings (€k) | Repaid? |
|---:|---:|:---|
| 31 | 4 | No |
| 36 | 7 | No |
| 48 | 14 | Yes |
| 55 | 18 | Yes |
| 63 | 24 | Yes |

Each row is an **example**. `Income` and `Savings` are **features** — the measurements we chose to represent each case. `Repaid?` is the **class label**, the answer we want predicted.

Now a new customer arrives, and the one column that matters is empty.

| Income (€k) | Savings (€k) | Repaid? |
|---:|---:|:---|
| 46 | 12 | **?** |

The classifier does not know the answer. That is the entire point — it has to use what the previous examples taught it.

<!-- ct319:focus -->

> **Given the features of a new example, predict its class.**

<!-- ct319:endfocus -->

### Binary and multiclass

Sometimes there are exactly two possible classes — spam or not spam, fraud or not fraud, approve or reject. That is **binary classification**. Sometimes there are more — cat, dog or rabbit; red, amber or green. That is **multiclass classification**. The structure is identical either way; only the size of the answer set changes.

<!-- ct319:beat -->
## The dataset everything else runs on

The loan table gives us the vocabulary. For the live experiments we switch to one deterministic two-dimensional dataset, so that the geometry is visible on a screen.

```python
make_moons(n_samples=140, noise=0.23, random_state=2)
```

140 points, two numerical features on comparable scales, every point labelled `A` or `B`, and one diamond marking the unknown point at `[-0.4, 0.15]`.

<!-- ct319:focus -->

![140 labelled points in two interleaving crescents, with an unknown diamond at minus 0.4, 0.15](../../media/week-09/data.svg "wide")

<sub><em>Figure 1. The whole week on one pair of axes. Solid circles are training examples, hollow circles are the held-back test examples, and the diamond is the unknown point. Plot created for these pages by the classification demonstration; no external image licence is used.</em></sub>

> **Which class would you give the diamond — and what evidence did you just use?**

<!-- ct319:endfocus -->

Answer that before any model runs. Then ask what, exactly, your eye was doing. That turns out to be most of this week.

### Why this matters this week

Everything from here changes one thing at a time against that picture: first how many neighbours get consulted, then which algorithm is doing the consulting, then how much of the data it was allowed to see.

<!-- ct319:beat -->
## Ask the neighbours — how does KNN make a decision?

**k-nearest neighbours**, written **KNN**, makes a prediction by looking at the labelled examples nearest the new one. That is the whole idea, and it is deliberately unambitious: find the nearby examples, look at their classes, count the votes.

<!-- ct319:focus -->

![An unknown point with a dashed circle around its three nearest neighbours, two of class A and one of class B](../../media/week-09/knn-vote.svg "hero")

<sub><em>Figure 2. With `k = 3`, three labelled examples vote and the rest take no part. Two of them are A, so the prediction is A. Diagram created for these pages; no external image licence is used.</em></sub>

<!-- ct319:endfocus -->

No rule book was written in advance. The decision comes from whichever labelled examples happen to lie nearest.

<!-- ct319:beat -->
## What does *nearest* mean?

The examples have to be represented as features first. If both features are numerical, each example becomes a point, and KNN needs a way to measure the distance between points. For two-dimensional numerical data the familiar choice is **Euclidean distance** — ordinary straight-line distance.

We do not need to do that arithmetic by hand. The consequence is what matters:

<!-- ct319:focus -->

> **KNN relies on the geometry of the representation we chose.**

<!-- ct319:endfocus -->

Two examples that are close in feature space are treated as similar. Which creates a design problem immediately.

<!-- ct319:beat -->
## Is distance always meaningful?

Suppose a customer is represented as `age = 37` and `income = 75000`. The numerical scale of income is enormously larger than the scale of age, so a distance calculation is dominated by income — not because income matters more, but because of the units somebody picked.

<!-- ct319:focus -->

> **A distance can be dominated by one feature simply because of the units it was recorded in.**

<!-- ct319:endfocus -->

Today's dataset deliberately keeps both feature scales comparable, so that this effect is held still while we vary something else. In a real problem it is not held still, and scaling becomes part of the representation decision.

<!-- ct319:beat -->
## What does `k` change?

`k` is how many neighbours get consulted. With `k = 1` a single nearby example decides. With `k = 15`, fifteen of them vote and a much larger region influences the answer.

Before running anything:

<!-- ct319:focus -->

> **Will changing `k` leave the prediction unchanged?**

<!-- ct319:endfocus -->

The scikit-learn version is three lines, and it is not the interesting part:

```python
from sklearn.neighbors import KNeighborsClassifier

model = KNeighborsClassifier(n_neighbors=3)
model.fit(X_train, y_train)
prediction = model.predict(X_new)
```

The behaviour is the interesting part. Same data, same split, same axes, same diamond — change only `k`.

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

Read the two tables together:

| `k` | Training accuracy | Test accuracy | Diamond |
|---:|---:|---:|:---|
| 1 | 100.0% | 81.0% | A |
| 3 | 93.9% | 92.9% | A |
| 9 | 93.9% | 95.2% | **B** |
| 15 | 93.9% | 95.2% | B |

A very small `k` makes the classifier hypersensitive to individual examples. A larger `k` smooths that out — but larger is not automatically better, because eventually examples that are nowhere near the new point are influencing what should have been a local decision.

### Why this matters this week

The score is part of the evidence; the picture is the experiment. Ask where the decision region moved, and which examples now reach the diamond. The number alone will not tell you that the answer flipped.

<!-- ct319:beat -->
## Learn the rules instead — what does a decision tree do differently?

KNN keeps the training examples and consults them when a new case arrives. That is not the only option. A **decision tree** instead learns a sequence of questions during training, and afterwards just follows them.

<!-- ct319:focus -->

![A tree that asks whether income exceeds 45, then whether savings exceed 10, reaching high or low risk](../../media/week-09/decision-tree-rules.svg "hero")

<sub><em>Figure 5. A new example enters at the top and follows branches until it reaches a prediction. Nobody wrote the thresholds — the algorithm searched the training data for splits that separate the classes. Diagram created for these pages; no external image licence is used.</em></sub>

<!-- ct319:endfocus -->

<!-- ct319:beat -->
## Lazy and eager learning

The classical terminology for that difference is **lazy** against **eager** learning.

<!-- ct319:focus -->

<div class="lenses lenses--pair">
<div class="lens"><span class="lens__key">KNN · lazy</span><span class="lens__gloss">stores the training examples and delays the work until a prediction is requested</span></div>
<div class="lens"><span class="lens__key">Decision tree · eager</span><span class="lens__gloss">builds a model during training, then uses that model and not the examples</span></div>
</div>

<!-- ct319:endfocus -->

Neither label means better. They describe *when* the work happens, and what has to be kept around afterwards.

<!-- ct319:beat -->
## What if we let the tree keep growing?

A shallow tree gets most training examples right. Allow more branches and it can start writing very specific rules that deal with individual training examples. Training accuracy improves. Is that good?

No — and this is the Week 8 distinction arriving with evidence attached:

<!-- ct319:focus -->

> **Learning is not remembering.**

<!-- ct319:endfocus -->

The second classifier is the same three lines with one word changed, which is the point: the data stays put, the learning algorithm moves.

```python
from sklearn.tree import DecisionTreeClassifier

model = DecisionTreeClassifier(max_depth=2, random_state=42)
model.fit(X_train, y_train)
prediction = model.predict(X_new)
```

<!-- ct319:focus -->

| `max_depth = 2` — 7 nodes, 4 leaves | `max_depth = 5` — 23 nodes, 12 leaves |
|---|---|
| ![Decision tree boundary at depth 2, four rectangular regions](../../media/week-09/tree-depth-2.svg) | ![Decision tree boundary at depth 5, twelve regions](../../media/week-09/tree-depth-5.svg) |
| Training **90.8%**, test **90.5%** | Training **96.9%**, test **85.7%** |

<sub><em>Figure 6. Deeper means more regions, and the regions are axis-aligned rectangles — a tree can only cut straight across one feature at a time. Training accuracy rises by six points while test accuracy falls by five. Plots created for these pages by the classification demonstration; no external image licence is used.</em></sub>

<!-- ct319:endfocus -->

Now remove the limit entirely.

<!-- ct319:focus -->

![Decision tree boundary with no depth limit, fragmented into seventeen regions including slivers](../../media/week-09/tree-depth-unrestricted.svg "wide")

<sub><em>Figure 7. Unrestricted: 33 nodes, 17 leaves, **100.0%** on the training examples and **76.2%** on the held-back ones — the worst of the three. Several of those regions exist to accommodate a single training point. Plot created for these pages by the classification demonstration; no external image licence is used.</em></sub>

<!-- ct319:endfocus -->

### If the data are identical, why do the models disagree?

They disagree because they assume different things about how useful structure should be extracted. KNN assumes nearby examples are similar. A tree assumes the classes can be separated by cuts across one feature at a time.

The dataset does not uniquely determine one model. It never did.

### Why this matters this week

Two algorithms, one dataset, two different answers — and neither of them is reading the data wrongly. The choice of learner is a modelling decision, exactly like the choice of representation in Week 2.

<!-- ct319:beat -->
## Good on what data? — did the classifier actually learn?

Train a classifier on 100 examples, then ask it to predict those same 100. It gets all of them right.

<!-- ct319:focus -->

> **Those are the examples it learned from. Repeating them is not evidence of anything.**

<!-- ct319:endfocus -->

The useful question is what happens on examples it did not see during training — which means arranging, in advance, for some to exist.

<!-- ct319:beat -->
## Training data and test data

The standard move is to hold some labelled examples back before any learning happens.

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

`random_state=42` makes the split reproducible, so the same figures come back every time. `stratify=y` preserves the class proportions. With 140 examples that gives 98 for training and 42 held back.

<!-- ct319:focus -->

> **Keep some evidence outside the training process.**

<!-- ct319:endfocus -->

Train on everything and you have no clean check left. The result then looks good for a reason that has nothing to do with the model being any good.

<!-- ct319:beat -->
## Overfitting, measured

A model **overfits** when it fits its training data so closely that performance on new data suffers. On this dataset the pattern is not subtle:

| Decision tree | Nodes | Leaves | Training | Test |
|:---|---:|---:|---:|---:|
| `max_depth=2` | 7 | 4 | 90.8% | **90.5%** |
| `max_depth=5` | 23 | 12 | 96.9% | 85.7% |
| unrestricted | 33 | 17 | **100.0%** | **76.2%** |

Training accuracy climbs all the way to perfect. Test accuracy falls the whole way down. The model that memorised every training label is the worst of the three at the only job that matters.

<!-- ct319:focus -->

![KNN and decision tree results side by side on the same dataset and split](../../media/week-09/compare.svg "wide")

<sub><em>Figure 9. All of it on one screen. The setting with the best training score and the setting with the best test score are not the same setting. Plot created for these pages by the classification demonstration; no external image licence is used.</em></sub>

<!-- ct319:endfocus -->

<!-- ct319:beat -->
## Accuracy, and where it goes blind

For a simple problem the obvious measure is **accuracy**: what proportion of predictions were correct? 18 of 20 test examples is 90%. Useful — but not the whole story.

Imagine detecting something rare, where 99 of every 100 examples belong to the same class. A system that always predicts the majority class scores **99%** accuracy while detecting **none** of the events anyone cares about.

<!-- ct319:focus -->

> **Accuracy is a useful starting measure, not a definition of a good classifier. The evaluation has to match the problem.**

<!-- ct319:endfocus -->

We are not turning this week into a catalogue of metrics. The habit is what carries forward.

### Why this matters this week

Three numbers now exist for every model: a training score, a test score, and the gap between them. The gap is the one that says something.

<!-- ct319:beat -->
## Representation first — what does the classifier actually see?

There is a problem sitting underneath every classifier on this page. The algorithm does not see a customer, an email, a photograph or a patient.

<!-- ct319:focus -->

> **It sees the representation we gave it — and nothing else.**

<!-- ct319:endfocus -->

Which takes us straight back to Week 2.

<!-- ct319:beat -->
## An email is not a feature vector

Suppose the message is *FREE tickets available in Galway tomorrow*. A classical classifier cannot work with the meaning of that sentence. It needs something countable first.

<!-- ct319:focus -->

![A message turned into word counts, and the pair good and not good colliding under those counts](../../media/week-09/bag-of-words.svg "hero")

<sub><em>Figure 10. A **bag-of-words** representation records which words appear and largely discards their order. That works surprisingly well for some tasks — and fails exactly where order carries the meaning. Diagram created for these pages; no external image licence is used.</em></sub>

<!-- ct319:endfocus -->

`good` and `not good` both contain `good`, so counting words alone cannot tell a recommendation from its opposite. One response is to count short sequences of neighbouring words as features too: `"not good"` is a **bigram**, and sequences of neighbouring terms in general are **n-grams**.

We are not building a text classifier today. The point is more fundamental than any particular fix:

<!-- ct319:focus -->

> **Changing the representation changes what the classifier is capable of learning — before any algorithm has been chosen.**

<!-- ct319:endfocus -->

<!-- ct319:beat -->
## Similarity changes too

For some representations, ordinary Euclidean distance is not the most useful notion of similarity. Text as word counts is usually sparse — most entries are zero — and measures such as **cosine similarity** compare the direction of those vectors rather than the straight-line distance between them.

The formula is not today's target. The design question is:

<!-- ct319:focus -->

> **What should count as similar for this problem?**

<!-- ct319:endfocus -->

That is not a question the classifier can answer, because the answer is built into the representation before the classifier ever runs.

### Why this matters this week

Week 2 made us decide what a state was, what actions existed, and what counted as a goal. Machine learning does not take that responsibility away. For classification we still decide what an example is, which features represent it, what the labels mean, which data get used for learning, and how success is measured. The algorithm works inside those choices — all of them ours.

<!-- ct319:endbeats -->

## The classification demo

📦 **[`classification_demo.py`](https://github.com/CS-UniversityOfGalway-Teaching/CT319-2627/blob/main/experiments/week-09/classification_demo.py)** — every figure on this page, as a sequence you can step through.

```sh
python -m pip install numpy matplotlib scikit-learn
python experiments/week-09/classification_demo.py
```

Press **Space**, the **right arrow** or **Next →** to advance. Each stage carries its own prompt and measured result on the figure, and the dataset, split, axes and unknown point never move.

### Try it yourself

1. Open `--mode data` and predict the diamond's class by eye. Say what evidence you used.
2. Step `--mode knn --k 1`, then `3`, then `9`, then `15`. Predict the boundary before each one.
3. Find where the diamond changes class, and name the examples responsible.
4. Switch to `--mode tree --depth 2`, then `5`, then `none`. Predict whether test accuracy will follow training accuracy up.
5. Finish on `--mode compare` and pick out three things: the setting that memorised every training example, the setting with the best test score, and why training accuracy cannot tell you which is which.

To regenerate every figure on this page without opening a window:

```sh
python experiments/week-09/classification_demo.py --save-dir media/week-09
```

---

## Before Week 10

Every classifier this week learned from examples that arrived with a correct label attached. Somebody had already done the hard part.

<!-- ct319:focus -->

> **What happens when nobody gives us the labels?**

<!-- ct319:endfocus -->

That is where Week 10 begins: **clustering**.

---

## Quick revision

If you can answer these without reopening the page, you have the core of this week.

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
