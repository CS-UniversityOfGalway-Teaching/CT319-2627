---
title: Week 8 — Learning from data
eyebrow: CT319 Artificial Intelligence · Week 8 · Learning from data
question: What does it mean for a machine to learn?
description: CT319 Week 8. From specifying search behaviour to learning it — examples, features and labels, supervised, unsupervised and reinforcement learning, and why generalisation is the real test.
bar: Week 8 · Sections
source: week-08.md
---

Across Weeks 2 to 6 we designed the machinery ourselves. We chose the representation, the legal actions, the search rule, the heuristic, the neighbourhood, the fitness function and the population operators. The machine then followed the structure we gave it — faithfully, and only as far as that structure allowed.

This week changes the question. Instead of asking *how should the machine search?*, we ask:

<!-- ct319:focus -->

> **What if we gave the machine data or experience, and asked it to improve from that?**

<!-- ct319:endfocus -->

That is the starting point for **machine learning**. The formal CT319 material introduces the transition through data analytics, the growth of available data, the different kinds of learning, and a worked loan-approval example.

We work through five things.

* [**From rules to learning**](#from-rules-to-learning--what-changes-when-the-machine-learns-from-experience) — what changes when part of the behaviour comes from data rather than from rules we wrote case by case.
* [**Data becomes evidence**](#data-becomes-evidence--what-exactly-do-we-give-the-learner) — how examples, features, labels and preparation decide what can be learned at all.
* [**Learning from answers**](#learning-from-answers--what-does-supervised-learning-look-like) — supervised learning, classification and regression, with a small classification teaser you can run.
* [**Different feedback**](#different-feedback--what-does-the-learner-actually-receive) — supplied labels, unlabelled examples and reward from interaction, with a clustering teaser on the same six points.
* [**Learning is not remembering**](#learning-is-not-remembering--how-do-we-know-the-model-learned-something-useful) — generalisation, overfitting, and why a good-looking result can still be misleading.

Three ideas carry the page, and it is worth keeping them apart:

<!-- ct319:focus -->

<div class="lenses">
<div class="lens"><span class="lens__key">Data</span><span class="lens__gloss">learning depends on examples or experience that actually contain information about the problem</span></div>
<div class="lens"><span class="lens__key">Model</span><span class="lens__gloss">what the learning algorithm builds or adjusts, and the only part that meets a new case</span></div>
<div class="lens"><span class="lens__key">Generalisation</span><span class="lens__gloss">the real test: does what was learned stay useful on cases nobody has labelled?</span></div>
</div>

<!-- ct319:endfocus -->

Machine learning does not remove design decisions. It moves where some of them happen.

<!-- ct319:beats -->

<!-- ct319:beat -->
## From rules to learning — what changes when the machine learns from experience?

Suppose we want to separate unwanted email from legitimate email. One approach is to write the rules ourselves.

```text
IF subject contains "FREE MONEY"       THEN spam
IF message contains 5 or more links    THEN spam
IF sender unknown AND text has "urgent" THEN spam
```

The problem shows up almost immediately. Real behaviour is messy: a legitimate email can contain the word `urgent`, and a spammer can simply stop writing `FREE MONEY`. As the world changes, hand-written rules become brittle — and every repair is another rule somebody has to think of first.

### Replace some hand-written rules with examples

Suppose instead we have previous messages whose outcome is already known:

```text
message 1 -> spam
message 2 -> not spam
message 3 -> not spam
message 4 -> spam
```

We give those examples to a **learning algorithm**. What it produces is the **model**: the representation actually used to make a prediction or a decision. The algorithm is the procedure; the model is the product.

<!-- ct319:focus -->

![Past examples feed a learning algorithm, which produces a model that a new example is then given to](../../media/week-08/learning-pipeline.svg "hero")

<sub><em>Figure 1. Past data builds the model. A new example — one nobody has labelled — is given to that same model, which returns a prediction or a decision. Diagram created for these pages; no external image licence is used.</em></sub>

<!-- ct319:endfocus -->

The change that matters is this:

<!-- ct319:focus -->

> **Part of the decision behaviour is learned from data, rather than specified case by case by the programmer.**

<!-- ct319:endfocus -->

That does **not** mean the computer has been given no rules. We still decide what problem we are solving, what data to collect, how to represent it, which learning algorithm to use, what counts as success, and when the resulting model is safe or useful enough to put in front of anyone. Machine learning changes the *source* of some behaviour. It does not remove engineering judgement.

### Search and learning are different questions

The first half of CT319 asked us to specify how a machine explores possibilities: BFS expands the oldest frontier state, hill climbing moves to a better neighbour, a Genetic Algorithm selects, recombines and mutates a population. Every one of those rules came from us.

<!-- ct319:focus -->

<div class="lenses lenses--pair">
<div class="lens"><span class="lens__key">Search</span><span class="lens__gloss">we specify how to explore the possibilities</span></div>
<div class="lens"><span class="lens__key">Learning</span><span class="lens__gloss">we supply data or experience, and a method that adjusts a model</span></div>
</div>

<!-- ct319:endfocus -->

The boundary is not absolute. Learning algorithms use optimisation internally, and search methods appear inside larger learning systems. For this part of the module the useful distinction is simpler: **search asks how to explore possible solutions; machine learning asks how behaviour can improve from data or experience.**

### AI, machine learning and deep learning

The formal material also separates three terms that get used as if they were interchangeable.

<!-- ct319:focus -->

![Artificial intelligence contains machine learning, which contains deep learning](../../media/week-08/ai-ml-dl.svg "hero")

<sub><em>Figure 2. Three nested scopes, not three names for the same thing. Everything from Weeks 2 to 6 sits in the outer ring. Diagram created for these pages; no external image licence is used.</em></sub>

<!-- ct319:endfocus -->

**Artificial Intelligence** is the broad field: search and optimisation as much as learning, reasoning and planning. **Machine Learning** is the family of methods whose performance can improve through data or experience rather than through rules written case by case. **Deep Learning** is the subset of machine learning built on multi-layer neural networks.

That last relationship matters here, because it is easy to forget: Weeks 2 to 6 were AI too.

### Why did machine learning become so prominent?

One reason is the sheer amount and variety of data ordinary systems now produce — transactions, sensors, websites, mobile devices, images and video, text, location traces, industrial equipment, scientific instruments. The formal material introduces this through **Big Data**, and the useful idea is not "big data means lots of rows". The familiar "Vs" each name a different pressure:

| Idea | The question it asks |
| --- | --- |
| **Volume** | How much data is there? |
| **Variety** | What forms does it take? |
| **Velocity** | How quickly does it arrive or change? |
| **Veracity** | How trustworthy is it? |
| **Value** | Does it contain information useful for *this* problem? |

A million poor-quality records are not automatically worth more than ten thousand relevant ones. A fast stream of inaccurate data is still inaccurate. A dataset can be enormous and still carry almost nothing about the decision we actually care about.

> [!IMPORTANT]
> **More data is not the same thing as better learning.**
>
> The data also has to be relevant, usable and trustworthy enough for the task.

### Why this matters this week

This week is not asking us to forget search. It adds a second way of producing intelligent behaviour: instead of writing every decision ourselves, we let patterns in data shape a model. Which immediately raises the next question.

<!-- ct319:focus -->

> **What exactly counts as data for a learning system?**

<!-- ct319:endfocus -->

<!-- ct319:beat -->
## Data becomes evidence — what exactly do we give the learner?

Start with the formal lecture's loan-approval example. A bank has historical applications, and knows whether each loan was later repaid:

| Income | Savings | Existing debt | Loan later repaid? |
| ---: | ---: | ---: | --- |
| €34,000 | €3,500 | €7,000 | Yes |
| €61,000 | €21,000 | €2,000 | Yes |
| €28,000 | €800 | €14,000 | No |
| €47,000 | €5,500 | €18,000 | No |

Each **row** is an example, or instance. Income, savings and existing debt are **features**, recorded at application time. Whether the loan was later repaid is the **target**, and its Yes/No value is a class **label**.

The ordering there is not a detail:

<!-- ct319:focus -->

> **The features must be available when the new application is considered — before anyone knows its outcome.**

<!-- ct319:endfocus -->

A repayment prediction can inform a loan decision. It is not itself an approval rule.

### What forms can the examples take?

The formal material draws four useful contrasts.

- **Numerical** — salary or temperature is a measurement; number of missed payments is a count.
- **Categorical** — payment type or product category records membership, not a measured amount.
- **Time series** — hourly demand or daily sales carries an order in time, and that order matters.
- **Text** — an email or a review needs some representation of its content before anything can be learned from it.

Those categories overlap: a time series is usually made of numerical measurements. Images, audio and graphs need representations too. Week 2's question has not gone anywhere — **what must we record for this task?**

### Raw data is rarely ready to learn from

Go back to the loan table. `€35k` and `35000` may mean the same income. `N/A` is missing information, not zero. Duplicated applications and wrong dates quietly distort the evidence.

Preparation means inspecting records, correcting errors, deciding what to do about missing values, representing categories, selecting relevant features, and sometimes scaling or transforming values. Every one of those choices changes what actually reaches the learner.

The formal lecture presents a fuller data-analysis lifecycle based on CRISP-DM and KDD. The part worth carrying this week is the shape of it.

<!-- ct319:focus -->

![Question, gather, prepare, model, validate, communicate, with a dashed return from validate to prepare](../../media/week-08/data-lifecycle.svg "hero")

<sub><em>Figure 3. The model is one step in a larger loop, not the whole of it. The dashed return is the ordinary case: validation sends you back to preparation. Diagram created for these pages; no external image licence is used.</em></sub>

<!-- ct319:endfocus -->

### Is an available feature an appropriate feature?

The loan example raises a question worth sitting with. A lender may hold shopping history, location traces, phone records or social-media activity alongside the financial information.

<!-- ct319:focus -->

> **If a feature is available, should the model use it?**

<!-- ct319:endfocus -->

Four things are worth checking: **relevance** to the question being asked, **quality** of the measurement, **potential bias** or sensitive proxies hiding inside it, and **appropriateness** of collecting and using it at all. A feature can look predictive and still be invasive, outdated, or simply unavailable for the next applicant.

<!-- ct319:focus -->

> **Available data is not automatically appropriate data.**

<!-- ct319:endfocus -->

Keep that principle here; the broader ethical treatment returns later in the module.

### The tool landscape

The formal lecture introduces several tools with different jobs.

| Tool | Useful for |
| --- | --- |
| **Python** | general programming, data processing, machine learning and automation |
| **scikit-learn** | classical machine-learning algorithms behind one consistent Python API |
| **R** | statistics, data analysis and visualisation |
| **Excel** | small-scale tabular exploration, calculation and charting |
| **Weka** | GUI-based experimentation with classical machine-learning algorithms |

> [!NOTE]
> **Weka appears in the original CT319 material; it is not a required installation this year.** The practical demonstrations in CT319 2026/27 use Python and scikit-learn. R and Excel remain useful parts of the wider analytics landscape.

The first choice is the question, not the software. The lecture's analytics categories give a compact way to tell those questions apart:

| Question | What it asks |
| --- | --- |
| **Descriptive** | What happened? |
| **Diagnostic** | Why might it have happened? |
| **Predictive** | What is likely to happen? |
| **Prescriptive** | What action should we consider? |

Machine learning contributes to prediction and to pattern discovery. A summary, a chart or a spreadsheet may answer the other two without any learned model at all.

### Why this matters this week

We now have the raw ingredients: examples, features, and — sometimes — labels. That last word is where the next question lives. Sometimes we know the correct outcome for past examples. Sometimes nobody does. That single distinction creates the first major division in machine learning.

<!-- ct319:beat -->
## Learning from answers — what does supervised learning look like?

Take those historical email messages again. For each one, somebody already knows the answer, so the learner receives two things together: the input features, and the known target.

That is **supervised learning**.

<!-- ct319:focus -->

> **“Supervised” does not mean a person watches every prediction. It means the training examples carry the outcomes the learner is supposed to model.**

<!-- ct319:endfocus -->

### Classification and regression

The formal material introduces two supervised tasks, and the difference between them is the *kind* of thing being predicted.

<!-- ct319:focus -->

<div class="lenses lenses--pair">
<div class="lens"><span class="lens__key">Classification</span><span class="lens__gloss">predicts a category — spam or not spam, fraud or not fraud, low / medium / high risk</span></div>
<div class="lens"><span class="lens__key">Regression</span><span class="lens__gloss">predicts a numerical value — a house price, tomorrow's temperature, expected delivery time</span></div>
</div>

<!-- ct319:endfocus -->

The recognition rule is short: a **category** means classification, a **numerical quantity** means regression. That is as far as we take it this week — classification gets a proper treatment next week.

### A classification teaser — which class would you predict?

Six labelled examples, two numerical features each. The diamond marked **?** is a new example at `(2.4, 1.8)` — not one of the six, and no answer has been supplied for it.

<!-- ct319:focus -->

![Six labelled points in classes A and B, plus an unknown diamond at 2.4, 1.8, before prediction](../../media/week-08/classification-before.svg "secondary")

<sub><em>Figure 4. The supplied classes A and B, plus a visible unknown point whose answer the learner has never been given. Plot created for these pages from the demonstration's synthetic data; no external image licence is used.</em></sub>

> **Would you expect the unknown point to be A or B — and what in the picture supports that?**

<!-- ct319:endfocus -->

These two toy features happen to use comparable scales. With distance-based methods, feature scale can change which examples count as "nearest", which is a Week 9 problem.

Run the demonstration yourself:

```sh
python -m pip install scikit-learn matplotlib
python learning_demo.py --mode classification
```

The window opens on the unknown point. Make your prediction, then click **Run and reveal** or press **Space**. The fitted classifier's answer appears on that same point.

The operation at the centre of it is three lines:

```python
from sklearn.neighbors import KNeighborsClassifier

model = KNeighborsClassifier(n_neighbors=3)
model.fit(X, y)
prediction = model.predict(unknown)
```

`X` is the six coordinate pairs, `y` is their supplied A/B labels, and `unknown` is the separate query point. `fit(X, y)` hands the algorithm the labelled examples; `predict(unknown)` applies the fitted model to a new one. Everything else in the script is plotting.

<!-- ct319:focus -->

![The same labelled examples, with the unknown point now showing predicted class A](../../media/week-08/classification-after.svg "secondary")

<sub><em>Figure 5. The classifier predicts A for the diamond. The supplied labels and the model's prediction are two different sources of information, and the plot keeps them visually distinct. Plot created for these pages by the scikit-learn demonstration; no external image licence is used.</em></sub>

<!-- ct319:endfocus -->

The reveal is worth saying out loud: the new example was assigned one of the **supplied** classes. That is classification. One plausible prediction says nothing yet about performance on any other case — and k-nearest neighbours itself belongs to Week 9.

### What did the machine actually learn?

Be careful with the language here. The model did not learn that `A` is good or that `B` is bad. It used the relationship between feature values and supplied labels, under one particular algorithm. KNN keeps its training examples and consults them at prediction time; fitting a model does not have to mean discovering an equation.

Change the data and the result can change. Change the features, the algorithm or the labels, and the result can change too. Machine learning gives us a new dependency chain to keep track of:

<!-- ct319:focus -->

<ol class="flow" aria-label="What a prediction depends on, in order">
<li><span>data</span></li>
<li><span>representation</span></li>
<li><span class="is-pivot">learning algorithm</span></li>
<li><span>model</span></li>
<li><span>predictions</span></li>
</ol>
<p class="flow__note">The model is never independent of the choices that produced it. The highlighted step is the only one we usually name when we describe the system.</p>

<!-- ct319:endfocus -->

### The loan example becomes supervised learning

Back to the bank. If the historical records hold borrower features alongside a `REPAID` or `NOT REPAID` outcome, we have a supervised classification problem, and the learner can try to use those labelled examples to make predictions about new applicants.

Which creates an immediate problem. Suppose the model reproduces every historical label perfectly. Is it good?

Not necessarily — and the last highlight is about why.

### Why this matters this week

Supervised learning is powerful because the examples tell the learner which outcome matters. But labelled data is often difficult or expensive to get. Millions of images may exist; that does not mean millions of trustworthy labels exist. Millions of customer records may exist; that does not mean anybody has already sorted them into the groups we care about.

So what can a learning system do when the answers are simply missing?

<!-- ct319:beat -->
## Different feedback — what does the learner actually receive?

So far the learner received examples *and* supplied answers. Other settings hand it something different.

| Learning setting | What the learner receives | The question it can ask |
| --- | --- | --- |
| **Supervised** | examples + supplied targets or labels | Can I predict the target for a new example? |
| **Unsupervised** | examples without supplied labels | Is there useful structure in this data? |
| **Reinforcement learning** | actions, consequences and reward from interacting with an environment | Which actions lead to better long-term reward? |

<!-- ct319:focus -->

> **What feedback is available — an answer for an example, no supplied label, or a consequence of an action?**

<!-- ct319:endfocus -->

Unsupervised learning is not given class labels. Reinforcement learning receives reward through interaction, which is not simply another flavour of unlabelled data.

### Remove the labels — what remains?

Take exactly the same six examples used to fit the classifier and delete `y`, leaving every coordinate where it was. The classification query is left out too: it was never one of the six.

<!-- ct319:focus -->

![The same six example coordinates drawn neutrally, with no supplied labels](../../media/week-08/clustering-before.svg "secondary")

<sub><em>Figure 6. The six example points from Figure 4 with their labels removed. Not a single position has moved. Plot created for these pages from the same synthetic data; no external image licence is used.</em></sub>

> **Can you still see structure? What grouping would you expect, without being told A or B?**

<!-- ct319:endfocus -->

**Clustering** groups examples using patterns or similarities in their features. Notice that the question itself has changed: it asks about structure across the examples, not about the class of one new point.

### A clustering teaser — run, then reveal the groups

Open the unlabelled view of the same demonstration:

```sh
python learning_demo.py --mode clustering
```

Predict a grouping, then click **Run and reveal**. The six neutral points pick up group colours and markers. The key code uses `X`, and no `y` at all:

```python
from sklearn.cluster import KMeans

model = KMeans(n_clusters=2, random_state=42, n_init=10)
groups = model.fit_predict(X)
```

We **asked for two clusters**. The model did not discover how many groups there are — we told it. The fixed settings are there to keep a small demonstration reproducible, and the mechanics belong to Week 10.

<!-- ct319:focus -->

![The same six points assigned to two clusters, using group identifiers rather than A or B](../../media/week-08/clustering-after.svg "secondary")

<sub><em>Figure 7. K-means groups the same six examples without ever receiving their class labels. The group numbers are identifiers, not supplied meanings — swapping them changes nothing. Plot created for these pages by the scikit-learn demonstration; no external image licence is used.</em></sub>

<!-- ct319:endfocus -->

Three points land in each group. The separation matches the labelled version here because this toy dataset was built to make the contrast visible; clustering does not, in general, recover known classes.

<!-- ct319:focus -->

<div class="lenses lenses--pair">
<div class="lens"><span class="lens__key">Classification</span><span class="lens__gloss">X and y → fit → predict a class for the unknown point</span></div>
<div class="lens"><span class="lens__key">Clustering</span><span class="lens__gloss">X only → fit → group the six examples</span></div>
</div>

<!-- ct319:endfocus -->

Running `python learning_demo.py` with no mode presents both demonstrations in sequence, pausing before each reveal.

### Same data, different question

Customer features with `churned` / `did not churn` labels support supervised prediction. The *same* features without those labels can support clustering — finding groups of similar recorded behaviour. What decides between them is the question being asked and the information that happens to be available.

A result with four clusters does not prove there are four objective types of customer. Features, algorithms and settings all influence the grouping, and it takes interpretation to decide whether it is useful. Week 10 returns to exactly that.

### A third kind of feedback — reinforcement learning

In **reinforcement learning**, an **agent** chooses actions in an **environment**, and the consequences come back as a **reward**.

<!-- ct319:focus -->

![An agent sends an action to an environment, which returns a new state and a reward](../../media/week-08/agent-environment.svg "hero")

<sub><em>Figure 8. Learning through interaction. The agent is not told the correct action; it receives what happened afterwards. Diagram created for these pages; no external image licence is used.</em></sub>

<!-- ct319:endfocus -->

The learner is not normally given the correct action for each situation. It has to discover behaviour that leads to better long-term reward. A game makes the difference concrete: supervised learning might receive many labelled pairs of *board position → best move*, while reinforcement learning receives a move, then the game continuing, then eventually a win, a loss or a score.

A labelled board position supplies an example of a move. A game outcome supplies a consequence — possibly a long time later. Reward guides learning; it does not usually specify the right action at every step.

### Why this matters this week

The word "learning" is covering three quite different mechanisms. A classifier learns from labelled examples. A clusterer looks for structure without them. A reinforcement-learning agent learns from consequences over many interactions. All three raise the same uncomfortable question, and it is the one the final highlight is about: how do we know the resulting behaviour is any use?

<!-- ct319:beat -->
## Learning is not remembering — how do we know the model learned something useful?

Suppose we train a model on 100 historical examples, and it gets all 100 right. That sounds excellent. Now give it 20 examples it has never seen, and it gets 9 of them right.

<!-- ct319:focus -->

> **100 out of 100 on the training examples is evidence of fit to those 100 cases. It is not evidence that the model will work on anything else.**

<!-- ct319:endfocus -->

### The point is generalisation

A useful model captures something that transfers beyond the examples it was shown. That ability is called **generalisation**, and it is the actual target:

<!-- ct319:focus -->

<ol class="flow" aria-label="What generalisation asks, in order">
<li><span>training data</span></li>
<li><span>learn a pattern</span></li>
<li><span>new unseen data</span></li>
<li><span class="is-pivot">still useful?</span></li>
</ol>
<p class="flow__note">Only the highlighted step is a test. Everything before it is preparation, and it is entirely possible to do all of it well and fail there.</p>

<!-- ct319:endfocus -->

So the goal is not *perform perfectly on the data used to fit the model*. It is **learn enough useful structure to perform well on new cases drawn from the problem we care about**.

### Overfitting

**Overfitting** is what happens when a model captures detail or noise that is specific to the training examples and does not transfer. A very close training fit sitting beside poor performance on comparable unseen data is the warning sign.

The analogy is studying by memorising the answers to ten known questions. If the real exam asks those ten questions, memorisation looks brilliant. Change them slightly and the weakness is immediate.

<!-- ct319:focus -->

> **Memorising the training examples is not the same thing as generalising to new ones.**

<!-- ct319:endfocus -->

Retaining examples, as KNN does, is not by itself overfitting — the question is always whether the predictions generalise. Week 9 makes this concrete by separating training data from test data when we build classifiers.

### What if the learning signal is wrong?

The loan example shows why fitting successfully is not enough. A repayment label may simply be wrong. A dataset may leave out whole groups of applicants. Historical approval decisions may encode unfair treatment. Learning to reproduce those records does not establish that the learned pattern is useful, or appropriate.

- **Poor labels or biased historical examples** give the learner misleading evidence to fit.
- **Weak evaluation** gives us misleading confidence in whatever it produced.
- **A badly designed reward** encourages the wrong behaviour, and does it efficiently.

For clustering, a visually neat grouping is not proof that it means anything. For reinforcement learning, rewarding speed alone can produce something fast and careless. In every case the learner improves against its signal while missing the purpose we had in mind.

<!-- ct319:focus -->

> **A system can technically learn, and still learn the wrong thing.**

<!-- ct319:endfocus -->

That is the reason to inspect the data, the feedback and the evidence of usefulness rather than the score alone. The broader treatment comes later in the module.

### Why this matters this week

The CT319 progression now extends by one step.

<!-- ct319:focus -->

<ol class="flow" aria-label="The CT319 progression from representation to learning">
<li><span>Week 2 · representation</span></li>
<li><span>Week 3 · blind search</span></li>
<li><span>Week 4 · heuristic</span></li>
<li><span>Week 5 · local search</span></li>
<li><span>Week 6 · population</span></li>
<li><span class="is-pivot">Week 8 · learning</span></li>
</ol>
<p class="flow__note">The words are new. The habit is not: ask what information the system receives, how that information changes its behaviour, and what evidence tells us the result is useful.</p>

<!-- ct319:endfocus -->

<!-- ct319:endbeats -->

## The demonstration

📦 **[`learning_demo.py`](https://github.com/CS-UniversityOfGalway-Teaching/CT319-2627/blob/main/experiments/week-08/learning_demo.py)** — both teasers on one tiny synthetic dataset. Needs `scikit-learn` and `matplotlib`; nothing to download.

```sh
python -m pip install scikit-learn matplotlib
python learning_demo.py
```

It opens on the inputs and runs the model only when you ask for the reveal, so a prediction can be made before the answer is visible. `--mode classification` and `--mode clustering` open one view at a time.

---

## Before Week 9

We have the landscape now: supervised learning, unsupervised learning and reinforcement learning, plus two tiny examples — a classifier learning from labelled points, and a clusterer finding structure without them.

Next week slows down and takes one of them apart properly.

<!-- ct319:focus -->

> **If we know the classes of previous examples, how can a machine decide the class of a new one?**

<!-- ct319:endfocus -->

That is where Week 9 begins.

---

## Quick revision

If you can answer these without reopening the page, you have the core of this week.

1. **[WK-08-01]** What changes when part of a system's decision behaviour is learned from data rather than specified case by case?
2. How do AI, machine learning and deep learning relate to one another?
3. Why is “more data” not automatically the same thing as “better learning”?
4. **[WK-08-02]** What is the difference between an example, a feature and a target or label?
5. Why is data preparation part of machine learning rather than unrelated housekeeping before it?
6. **[WK-08-03]** What distinguishes classification from regression?
7. What information makes a learning problem supervised?
8. **[WK-08-04]** What information is missing in an unsupervised-learning problem?
9. Why do cluster identifiers not automatically correspond to real-world class labels?
10. What feedback does a reinforcement-learning agent receive, and how does it differ from a label?
11. **[WK-08-05]** Why does perfect performance on training examples not prove that a model will work on new ones?
12. What does generalisation mean, and what would you have to do to measure it?

---

## Sources and licensing notes

### CT319 source material

This week follows selected material from the formal CT319 *Lecture 7: Machine Learning* on Canvas.

The formal lecture develops the transition from search algorithms to data analytics and machine learning; the growth and variety of available data; the 3 Vs, 5 Vs and extended Big Data descriptions; descriptive, diagnostic, predictive and prescriptive analytics; numerical, categorical, time-series and text data; the data-analysis lifecycle and its CRISP-DM/KDD framing; Python, R, Excel and Weka as tools; a loan-approval example from gathering through representation to modelling; the relationship between AI, machine learning and deep learning; supervised learning; classification and regression; unsupervised learning; clustering and association rules; the limitations of both; and reinforcement learning.

These pages do not reproduce every slide, or every Big Data “V”. They concentrate on the conceptual transition from specified search behaviour to learning from data or experience; on examples, features and targets; on data quality and preparation; on the three learning settings; on classification and clustering as short teasers for Weeks 9 and 10; and on generalisation as the question behind whether any of it was useful. The Canvas slides remain the broader reference.

**Weka** appears in the original CT319 material as a GUI-based machine-learning tool. It is not a required installation for CT319 2026/27, whose demonstrations use Python and scikit-learn.

### Classroom demonstrations

The classification teaser uses `sklearn.neighbors.KNeighborsClassifier` purely to expose the scikit-learn workflow — fit labelled examples, then predict a new one. K-nearest neighbours itself is taught in Week 9.

The clustering teaser uses `sklearn.cluster.KMeans` purely to expose the contrast — the same feature data, no supplied labels, a discovered grouping. K-means and clustering are taught properly in Week 10.

Both views share one tiny synthetic two-dimensional dataset, so there is nothing to download. The classification query point is separate and is never supplied during fitting. To regenerate the four plots from the repository root:

```sh
python experiments/week-08/learning_demo.py --save-dir media/week-08
```

That export mode writes the before/after figures without opening a window.

### Figures

Figures 1–8 were **created for these pages**. They use no external image licence.

- Figures 1, 2, 3 and 8 are original diagrams.
- Figures 4–7 are plots generated by the Python demonstration from its single dataset, including its actual classifier prediction and cluster assignments.

No external images, videos, papers or interactives are used.

### Software

- 📦 [**`learning_demo.py`**](https://github.com/CS-UniversityOfGalway-Teaching/CT319-2627/blob/main/experiments/week-08/learning_demo.py) — written for this module. Requires `scikit-learn` and `matplotlib`; no data download and no build step.
- [scikit-learn — `KNeighborsClassifier`](https://scikit-learn.org/stable/modules/generated/sklearn.neighbors.KNeighborsClassifier.html)
- [scikit-learn — `KMeans`](https://scikit-learn.org/stable/modules/generated/sklearn.cluster.KMeans.html)
- [scikit-learn documentation](https://scikit-learn.org/stable/) · [Python](https://www.python.org/) · [R](https://www.r-project.org/) · [Weka](https://www.cs.waikato.ac.nz/ml/weka/)
