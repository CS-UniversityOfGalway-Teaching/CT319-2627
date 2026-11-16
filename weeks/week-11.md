---
title: Week 11 — Trustworthy AI
eyebrow: CT319 Artificial Intelligence · Week 11 · Trustworthy AI
question: When should we trust an AI system?
description: CT319 Week 11. Fairness, privacy, transparency and accountability — why one accuracy figure settles nothing, and what evidence would justify deploying a system at all.
bar: Week 11 · Sections
source: week-11.md
deck: yes
---

For three weeks we asked whether a machine can learn from data, classify new examples, find structure and make recommendations. Every question was a version of *does it work?*

Now suppose it does. Suppose the accuracy is high, and people are already using the system.

<!-- ct319:focus -->

> **Is that enough?**

<!-- ct319:endfocus -->

This week the most important answers are not technical. They still need the same discipline we have used since Week 1. Say what the evidence shows, and say what it does not show.
<!-- ct319:key This week the most important answers are not technical. They still need the same discipline we have used since Week 1. -->

This week covers five topics.

* [**Accurate, but trustworthy?**](#accurate-but-trustworthy--is-good-performance-enough) — why a high accuracy figure does not tell us whether to rely on a system.
* [**The data were biased before the model arrived**](#the-data-were-biased-before-the-model-arrived--where-can-unfairness-enter) — where unfairness can enter the series of choices that builds a system.
* [**Just because we can collect it**](#just-because-we-can-collect-it--how-much-data-should-a-system-use) — how much data a system *should* use, not just how much it could.
* [**Why did the model say no?**](#why-did-the-model-say-no--what-does-transparency-actually-require) — what transparency really requires of an explanation.
* [**From principles to responsibility**](#from-principles-to-responsibility--who-is-accountable) — who stays accountable, worked through with one fictional university system.

Keep three ideas separate as you read.

<!-- ct319:focus -->

<div class="lenses">
<div class="lens"><span class="lens__key">Fairness</span><span class="lens__gloss">a system can perform well overall while treating groups very differently</span></div>
<div class="lens"><span class="lens__key">Privacy</span><span class="lens__gloss">more data is not automatically better data, and collecting it is itself a decision</span></div>
<div class="lens"><span class="lens__key">Accountability</span><span class="lens__gloss">somebody has to remain responsible for how a system is designed, deployed and used</span></div>
</div>

<!-- ct319:endfocus -->

<!-- ct319:beats -->

<!-- ct319:beat -->
## Accurate, but trustworthy? — is good performance enough?

Imagine a system that helps decide which loan applications are approved. Its test accuracy is **94%**. That sounds impressive. Then someone reports the approval rate for each group. It is **78%** for Group A and **42%** for Group B.

A difference in outcomes does not prove unfairness by itself. But it does show that one number could never settle the question.

<!-- ct319:focus -->

> **94% tells us something real about predictive performance. It tells us nothing about who the performance was for.**

<!-- ct319:endfocus -->

The accuracy figure does not tell us whether the data represented everyone. It does not tell us whether some groups are disadvantaged, or whether sensitive information was used properly. And it does not tell us whether the people affected understand the decision, whether they can challenge it, or who is responsible when it goes wrong.

<!-- ct319:beat -->
## How does performance vary across the people affected?

In Week 9 we asked whether a classifier works on data it has not seen. Now add a second question.

<!-- ct319:focus -->

> **How does performance vary across the people who will actually be affected?**

<!-- ct319:endfocus -->

Here is a classifier with a perfectly respectable overall score.

<!-- ct319:focus -->

![92.8% overall, which is 96% for Group A with 800 examples and 80% for Group B with 200](../../media/week-11/aggregate-hides-the-gap.svg "hero")

<sub><em>Figure 1. Fictional figures, chosen to make one arithmetic point. The overall figure is an average weighted by group size, so the larger group's experience dominates it. Diagram created for these pages. No external image licence is used.</em></sub>

<!-- ct319:endfocus -->

The two groups are sixteen points apart, and neither number appears in the overall figure. A good model does not have to perform identically for every group. But a gap this size needs investigating, not hiding inside an average.

The gap does not prove unlawful discrimination by itself, and it does not tell us *why* the gap exists. One overall score is not enough to understand how a system behaves.
<!-- ct319:key One overall score is not enough to understand how a system behaves. -->

<!-- ct319:beat -->
## What does "trustworthy" mean?

In 2019 the European Commission's High-Level Expert Group on AI published the [Ethics Guidelines for Trustworthy AI](https://digital-strategy.ec.europa.eu/en/library/ethics-guidelines-trustworthy-ai). Figure 2 shows the document and the framework it sets out.
<!-- ct319:key In 2019 the European Commission's High-Level Expert Group on AI published the Ethics Guidelines for Trustworthy AI. -->

<!-- ct319:focus -->

![The cover of the Ethics Guidelines for Trustworthy AI beside the guidelines' own framework diagram](../../media/week-11/eu-trustworthy-ai-guidelines.svg "hero")

<sub><em>Figure 2. The document, and its own Figure 1. High-Level Expert Group on AI, [Ethics Guidelines for Trustworthy AI](https://digital-strategy.ec.europa.eu/en/library/ethics-guidelines-trustworthy-ai), 8 April 2019. © European Union, reused under the Commission's reuse policy (Decision 2011/833/EU).</em></sub>

<!-- ct319:endfocus -->

The guidelines describe trustworthy AI under three headings.

<!-- ct319:focus -->

<div class="lenses">
<div class="lens"><span class="lens__key">Lawful</span><span class="lens__gloss">it complies with the law that applies to it</span></div>
<div class="lens"><span class="lens__key">Ethical</span><span class="lens__gloss">it respects the principles and values at stake</span></div>
<div class="lens"><span class="lens__key">Robust</span><span class="lens__gloss">it works reliably, technically and in its social setting</span></div>
</div>

<!-- ct319:endfocus -->

The guidelines then list seven requirements.

<!-- ct319:focus -->

- human agency and oversight
- technical robustness and safety
- privacy and data governance
- transparency
- diversity, non-discrimination and fairness
- societal and environmental wellbeing
- accountability

<!-- ct319:endfocus -->

This week we look closely at a few of these requirements, rather than memorising all seven. Fairness, privacy, transparency and accountability are part of the framework, not the whole of it.

### Why this matters this week

Until now we asked one question about every system. Now we ask five.

<!-- ct319:focus -->

<ol class="flow" aria-label="Five questions to ask of any AI system">
<li><span>Does it work?</span></li>
<li><span class="is-pivot">Who does it work for?</span></li>
<li><span>What data does it use?</span></li>
<li><span>Can people understand or challenge it?</span></li>
<li><span>Who remains responsible?</span></li>
</ol>

<!-- ct319:endfocus -->

<!-- ct319:beat -->
## The data were biased before the model arrived — where can unfairness enter?

People often talk as if a model becomes unfair by itself, somewhere during training. That is not what happens. A system is built through a series of decisions, and most of them are made before any model is trained.
<!-- ct319:key A system is built through a series of decisions, and most of them are made before any model is trained. -->

<!-- ct319:focus -->

![Purpose, data, labels, features, model, decision rule and use, each with its own fairness question](../../media/week-11/where-unfairness-enters.svg "hero")

<sub><em>Figure 3. Seven decisions. The one most people mean by "the AI" is the fifth, and four have already been made by the time it arrives. Diagram created for these pages. No external image licence is used.</em></sub>

<!-- ct319:endfocus -->

### Who appears in the data?

Suppose a recruitment model is trained mainly on data about past successful employees. That sounds sensible, until you ask what the past hiring process favoured. If it favoured one kind of candidate, the records reflect that. The learning algorithm cannot tell which patterns are worth keeping and which are unfair.
<!-- ct319:key The learning algorithm cannot tell which patterns are worth keeping and which are unfair. -->

This is not only a thought experiment. Figure 4 is a well-documented case.

<!-- ct319:focus -->

![A clipping of the Reuters article of 10 October 2018, Amazon scraps secret AI recruiting tool that showed bias against women](../../media/week-11/news-amazon-recruiting.svg "hero")

<sub><em>Figure 4. [Reuters, 10 October 2018](https://www.reuters.com/article/us-amazon-com-jobs-automation-insight/amazon-scraps-secret-ai-recruiting-tool-that-showed-bias-against-women-idUSKCN1MK08G), by Jeffrey Dastin. Clipped from the [archived page](https://web.archive.org/web/20181011000056/https://www.reuters.com/article/us-amazon-com-jobs-automation-insight/amazon-scraps-secret-ai-recruiting-tool-that-showed-bias-against-women-idUSKCN1MK08G) and laid over the same page, blurred; the three points are our own summary.</em></sub>

<!-- ct319:endfocus -->

### Who decided the labels?

Imagine past employees are labelled `successful` or `unsuccessful`. What does `successful` mean? Did they stay three years? Get high ratings from managers? Get promoted? Sell the most? Work the longest hours?

<!-- ct319:focus -->

> **Labels are not facts because they appear in a spreadsheet. Somebody decided what the target would represent, and a questionable label produces a questionable objective.**

<!-- ct319:endfocus -->

<!-- ct319:beat -->
## Which features are allowed to matter?

Suppose the model uses education, experience, an assessment score and postcode. A protected characteristic, such as a person's ethnicity, might be removed from the data. But another feature, such as postcode, can still be closely linked to it. Removing one column does not remove the risk of unfair treatment. It only removes one way for it to happen.

So the design question is wider. It is the question from Week 8 again.

<!-- ct319:focus -->

> **Why is this feature relevant to the decision we are making?**

<!-- ct319:endfocus -->

Data being available does not make it appropriate to use.

### What happens after the model produces a score?

Two applicants score `0.71` and `0.69`. Someone then sets a rule to interview anyone who scores 0.70 or more. The model only produced numbers. The threshold turned those numbers into consequences. Every threshold is a design decision made by a person, often someone who is not part of the discussion about the model.
<!-- ct319:key Every threshold is a design decision made by a person, often someone who is not part of the discussion about the model. -->

### Why this matters this week

Fairness cannot be checked once, after training. By then, most of the decisions that could cause a problem have already been made. The check has to cover all seven steps in Figure 3.

<!-- ct319:beat -->
## Just because we can collect it — how much data should a system use?

Imagine a university wants to find students who may need extra academic support. Which data should it collect? It could use attendance, assessment history, LMS activity, library use, postcode, family income, browser history, medical information or social media.

Using every possible source would not necessarily give a better system. And the word "should" hides two separate questions.

<!-- ct319:focus -->

<div class="lenses lenses--pair">
<div class="lens"><span class="lens__key">Would it help?</span><span class="lens__gloss">does this information improve the prediction?</span></div>
<div class="lens"><span class="lens__key">Should we?</span><span class="lens__gloss">is it right to use this information at all?</span></div>
</div>

<!-- ct319:endfocus -->

These are different questions. A *yes* to the first does not settle the second.

<!-- ct319:beat -->
## Data minimisation

Under the [GDPR](https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/principles-gdpr_en), **data minimisation** means personal data should be adequate, relevant and limited to what is necessary for the intended purpose. The rule is written into Article 5 of the regulation itself (Figure 5).
<!-- ct319:key Under the GDPR, data minimisation means personal data should be adequate, relevant and limited to what is necessary for the intended purpose. -->

<!-- ct319:focus -->

![The first page of the GDPR in the Official Journal, beside Article 5 with point (c), data minimisation, highlighted](../../media/week-11/gdpr-article-5.svg "hero")

<sub><em>Figure 5. [Regulation (EU) 2016/679](https://eur-lex.europa.eu/eli/reg/2016/679/oj), the General Data Protection Regulation, as published in the Official Journal on 4 May 2016. Pages from EUR-Lex, © European Union, reused under Decision 2011/833/EU. The highlight is ours.</em></sub>

<!-- ct319:endfocus -->

The rule is deliberately strict. It goes against the instinct of most people who build datasets.

<!-- ct319:focus -->

<div class="lenses lenses--pair">
<div class="lens"><span class="lens__key">The instinct</span><span class="lens__gloss">collect everything now, and work out later what turned out to be useful</span></div>
<div class="lens"><span class="lens__key">The principle</span><span class="lens__gloss">define the purpose, identify what is necessary for it, collect only what that justifies</span></div>
</div>

<!-- ct319:endfocus -->

Assessment results may be easier to justify for a support purpose than unrelated browsing history. But every use still needs an appropriate purpose and basis. Data collected for one academic purpose is not automatically allowed to be reused for another.

### More data can mean more risk

Collecting personal information you do not need adds risk. It can be exposed in a data breach, misused, misunderstood, kept too long, combined with other records, or used in ways people never expected. The cost of extra data does not fall on the model. It falls on the people in the dataset.
<!-- ct319:key The cost of extra data does not fall on the model. It falls on the people in the dataset. -->

<!-- ct319:beat -->
## Removing identifiers is not anonymisation

Removing names from a dataset does not make it anonymous. This point is often misunderstood, so it helps to be precise.
<!-- ct319:key Removing names from a dataset does not make it anonymous. -->

<!-- ct319:focus -->

![Identified and pseudonymised data are both personal data; only genuinely anonymised data is not](../../media/week-11/identifiability.svg "hero")

<sub><em>Figure 6. Deleting the name column moves you one box to the right, not two. Diagram created for these pages. No external image licence is used.</em></sub>

<!-- ct319:endfocus -->

**Pseudonymisation** replaces names and other direct identifiers with codes, and keeps the information that links them back somewhere separate. This is real protection. But if the data can still be linked back to a person, it is still personal data.

**Anonymisation** means the person can no longer be identified at all. Truly anonymised data is not personal data under the [GDPR](https://commission.europa.eu/law/law-topic/data-protection/data-protection-explained_en). The test is whether anyone could still identify the person, not whether a column was deleted.

<!-- ct319:focus -->

> **Age, programme, postcode and one rare condition can identify a single person — especially combined with information from somewhere else.**

<!-- ct319:endfocus -->

### What about synthetic data?

Synthetic data is artificial data generated to imitate real data. Whether synthetic data is private, unbiased or safe depends on how it was generated, and on which patterns from the real data it keeps. None of these properties comes automatically.
<!-- ct319:key Whether synthetic data is private, unbiased or safe depends on how it was generated, and on which patterns from the real data it keeps. -->

### Why this matters this week

Every dataset in this module came ready-made. In practice, someone decides what goes into a dataset. That decision is the first place a system can go wrong, before any modelling code is written.

<!-- ct319:beat -->
## Why did the model say no? — what does transparency actually require?

Go back to the loan decision. Compare two systems that reach the same kind of outcome.
<!-- ct319:key Go back to the loan decision. Compare two systems that reach the same kind of outcome. -->

<!-- ct319:focus -->

![A traceable decision tree beside an opaque model emitting the score 0.83 and a rejection](../../media/week-11/interpretable-vs-opaque.svg "hero")

<sub><em>Figure 7. Fictional example. On the left there is a route to show somebody. On the right there is a number. Diagram created for these pages. No external image licence is used.</em></sub>

<!-- ct319:endfocus -->

Suppose an applicant asks why they were sent for review. With the decision tree, we can follow the path that led to the decision. The system on the right gives only a number, so there is no path to follow.
<!-- ct319:key With the decision tree, we can follow the path that led to the decision. The system on the right gives only a number, so there is no path to follow. -->

What would the applicant reasonably want to know? They would want to know what data was used, which factors mattered, what `0.83` means, how reliable the model is, whether a person was involved, and how to challenge the result. Publishing the program's source code answers none of these six questions.

These questions come up in real lending. In Figure 8, the decisions turned out to be explainable, and people still did not trust them.

<!-- ct319:focus -->

![A clipping of the BBC News article of 10 November 2019, Apple's 'sexist' credit card investigated by US regulator](../../media/week-11/news-apple-card.svg "hero")

<sub><em>Figure 8. [BBC News, 10 November 2019](https://www.bbc.com/news/business-50365609). The finding is from the [New York State Department of Financial Services, 23 March 2021](https://www.dfs.ny.gov/reports_and_publications/press_releases/pr202103231). Clipped from the [archived page](https://web.archive.org/web/20191111011757/https://www.bbc.com/news/business-50365609) and laid over the same page, blurred; the three points are our own summary.</em></sub>

<!-- ct319:endfocus -->

<!-- ct319:beat -->
## Three words that are not synonyms

<!-- ct319:focus -->

<div class="lenses">
<div class="lens"><span class="lens__key">Interpretability</span><span class="lens__gloss">the model itself is understandable enough to inspect how inputs relate to output</span></div>
<div class="lens"><span class="lens__key">Explainability</span><span class="lens__gloss">additional methods help describe why a model produced a particular output</span></div>
<div class="lens"><span class="lens__key">Transparency</span><span class="lens__gloss">the wider system communicates how AI is used, what matters, its limits, and who is responsible</span></div>
</div>

<!-- ct319:endfocus -->

Different writers use these terms in slightly different ways. Here we use them in this practical sense. A small decision tree is interpretable. A large neural network is much harder to inspect, although researchers can still look inside one. Figure 9 shows images built to excite single units of an image classifier, layer by layer.
<!-- ct319:key A large neural network is much harder to inspect, although researchers can still look inside one. -->

<!-- ct319:focus -->

![Feature visualisations from GoogLeNet: edges and textures in early layers, patterns and parts in the middle, objects such as dog faces in late layers](../../media/week-11/cnn-feature-visualization.svg "hero")

<sub><em>Figure 9. Adapted from Chris Olah, Alexander Mordvintsev and Ludwig Schubert, [Feature Visualization](https://distill.pub/2017/feature-visualization/), *Distill*, 2017, under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Ten of the thirty images in their opening figure, rearranged.</em></sub>

<!-- ct319:endfocus -->

It is a remarkable view of what the network has learned. But it does not say why one particular image got its label, and it says nothing about whether a decision was fair. Looking inside a model is not the same as understanding a decision.
<!-- ct319:key Looking inside a model is not the same as understanding a decision. -->

For a single decision, tools such as **LIME** and **SHAP** estimate how much each feature contributed to that prediction. You do not need their mathematics this week, only an idea of what their output looks like.

<!-- ct319:focus -->

![A schematic bar display showing debt and missed payments pushing towards reject and income towards approve](../../media/week-11/contribution-display.svg "hero")

<sub><em>Figure 10. **Schematic** — this is the shape of such an output, not a measured LIME or SHAP result. Diagram created for these pages. No external image licence is used.</em></sub>

<!-- ct319:endfocus -->

Figure 11 is real output. It comes from SHAP, applied to one applicant in a public dataset of real credit applications.
<!-- ct319:key Figure 11 is real output. It comes from SHAP, applied to one applicant in a public dataset of real credit applications. -->

<!-- ct319:focus -->

![A SHAP waterfall chart for one credit applicant: loan duration, an overdrawn checking account and being a divorced man push the risk score up](../../media/week-11/shap-waterfall-credit.png "hero")

<sub><em>Figure 11. **Real output.** A model trained on the [South German Credit data](https://doi.org/10.24432/C5QG88), 1,000 real applicants, explained with [SHAP](https://github.com/shap/shap). The score is the model's estimate that this applicant is a bad risk: 0.30 on average, 0.79 here. We chose this applicant because personal status and sex is among the factors. Chart made for these pages from CC BY 4.0 data.</em></sub>

<!-- ct319:endfocus -->

A system can explain a single prediction and still be badly managed and poorly communicated overall. An explanation is one requirement. It is not the whole of transparency.
<!-- ct319:key A system can explain a single prediction and still be badly managed and poorly communicated overall. An explanation is one requirement. It is not the whole of transparency. -->

<!-- ct319:beat -->
## Explanation is not justification

Look at the fourth row of Figure 10. Suppose an explanation shows that postcode strongly influenced a decision. That tells us something true about the model. It does not tell us that postcode *should* have influenced the decision.

<!-- ct319:focus -->

<div class="lenses lenses--pair">
<div class="lens"><span class="lens__key">Explanation</span><span class="lens__gloss">what influenced the output?</span></div>
<div class="lens"><span class="lens__key">Justification</span><span class="lens__gloss">was that influence appropriate?</span></div>
</div>

<!-- ct319:endfocus -->

An explanation can reveal a problem instead of excusing it. That may be the most useful thing an explanation does. Figure 11 is an example. One of the bars that raised the applicant's risk score is their sex and marital status.

<!-- ct319:beat -->
## Transparency as an obligation

The [EU AI Act](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai) takes a risk-based approach. A system's obligations depend on what it is used for, not on which technique it uses.
<!-- ct319:key The EU AI Act takes a risk-based approach. A system's obligations depend on what it is used for, not on which technique it uses. -->

<!-- ct319:focus -->

![Four bands: unacceptable risk, high risk, transparency risk, and minimal or no risk](../../media/week-11/ai-act-risk.svg "hero")

<sub><em>Figure 12. The same technique can sit in different bands depending on its use. Diagram created for these pages. No external image licence is used.</em></sub>

<!-- ct319:endfocus -->

The Act applies in stages. The **Article 50 transparency obligations have applied since 2 August 2026**. They cover telling people when they are interacting directly with an AI system, marking certain AI-generated content in a machine-readable way, and disclosing deepfakes. Each comes with its own conditions and exceptions.

Some systems that already existed get limited extra time. The Commission's [Article 50 FAQ](https://digital-strategy.ec.europa.eu/en/faqs/transparency-obligations-under-article-50-ai-act) describes a narrow grace period, until **2 December 2026**. It covers the Article 50(2) duties to mark and detect AI-generated content, for systems placed on the market before 2 August 2026. It does not delay every transparency duty.

### Why this matters this week

<!-- ct319:focus -->

> **Trustworthy-AI principles now come with concrete deployment obligations attached. The law supports this discussion — it does not replace the judgement about whether a particular system should exist.**

<!-- ct319:endfocus -->

<!-- ct319:beat -->
## From principles to responsibility — who is accountable?

Let us work through one fictional case, one piece at a time.

> **University X proposes an AI system to identify students who may need academic support.**

Six questions guide the discussion. The aim is not to reach a verdict from this short description. The aim is to decide what extra evidence or changes you would need *before* the system is used.

<!-- ct319:focus -->

<ol class="flow" aria-label="Six questions for the University X case, in order">
<li><span>Purpose</span></li>
<li><span>Data</span></li>
<li><span>Fairness</span></li>
<li><span>Transparency</span></li>
<li><span>Oversight</span></li>
<li><span class="is-pivot">Accountability</span></li>
</ol>
<p class="flow__note">The last one is the only question that still has an answer after the system has already caused harm.</p>

<!-- ct319:endfocus -->

### Purpose

What is the system actually for? Predicting who will drop out, finding students who need support, deciding how to use limited staff time, and sending automatic interventions are **four different systems**. If a proposal has not chosen between them, nothing that follows can be justified.
<!-- ct319:key What is the system actually for? -->

### Data

The proposal uses attendance, grades, postcode, library use and LMS activity. Which of these are needed for a support purpose, and which would you remove? What purpose and basis allow the university to use these records at all?

Would postcode improve the prediction? Possibly. Does that mean it should be used? Not automatically. Whether data *helps* and whether it *should be used* are different questions.

### Fairness

Overall accuracy is **88%**. For Group A it is **91%**, and for Group B it is **72%**. Should the system be used as it is?

In the University X case, accuracy for Group B is 19 points lower than for Group A. A gap like that should trigger an investigation, not an automatic verdict of discrimination. Perhaps Group B is under-represented in the training data. Perhaps a feature behaves differently for that group. Perhaps the labels are less reliable for that group. The overall figure cannot tell these causes apart, and each one needs a different fix.
<!-- ct319:key In the University X case, accuracy for Group B is 19 points lower than for Group A. A gap like that should trigger an investigation, not an automatic verdict of discrimination. -->

### Transparency

Now we learn how a prediction becomes an action. The system gives each student a risk score from 0 to 100. Above 75, it automatically sends the student a message and flags them to programme staff. The threshold and the automatic message are choices about how the system is used. They are not outputs of the model.

Should students know that AI is being used? Should they know what data is included, what the score is used for, whether a person reviews it, and how to challenge wrong information? If a system affects people while hiding that it exists, nobody can oversee it properly.
<!-- ct319:key If a system affects people while hiding that it exists, nobody can oversee it properly. -->

<!-- ct319:beat -->
## Oversight

The model says `risk = 82`. Should that decide what happens next?

<!-- ct319:focus -->

<div class="lenses">
<div class="lens"><span class="lens__key">Review</span><span class="lens__gloss">a human checks before any action is taken</span></div>
<div class="lens"><span class="lens__key">Monitor</span><span class="lens__gloss">a human watches an automated action as it runs</span></div>
<div class="lens"><span class="lens__key">Override</span><span class="lens__gloss">a human can stop or reverse what the system did</span></div>
</div>

<!-- ct319:endfocus -->

All three are called "human oversight". What separates real oversight from the appearance of it is a practical question.

<!-- ct319:focus -->

> **Does that person actually have enough information, authority and time to intervene?**

<!-- ct319:endfocus -->

A person who clicks **Approve** on everything is not really overseeing anything. Ask what they can actually check, override or stop.

Oversight can also arrive too late. In England in 2020, a model's exam grades were overridden only after students had received them (Figure 13).

<!-- ct319:focus -->

![A clipping of the Guardian article of 13 August 2020, England A-level downgrades hit pupils from disadvantaged areas hardest](../../media/week-11/news-a-level-grades.svg "hero")

<sub><em>Figure 13. [The Guardian, 13 August 2020](https://www.theguardian.com/education/2020/aug/13/england-a-level-downgrades-hit-pupils-from-disadvantaged-areas-hardest), by Richard Adams and Niamh McIntyre. The government reversed the grades on 17 August 2020. Clipped from the [archived page](https://web.archive.org/web/20200813234058/https://www.theguardian.com/education/2020/aug/13/england-a-level-downgrades-hit-pupils-from-disadvantaged-areas-hardest) and laid over the same page, blurred; the three points are our own summary.</em></sub>

<!-- ct319:endfocus -->

<!-- ct319:beat -->
## Accountability

Now suppose the system causes harm.
<!-- ct319:key Now suppose the system causes harm. -->

<!-- ct319:focus -->

![The vendor, developer, data team, deploying organisation and staff member, and the claim that the AI did it](../../media/week-11/accountability-chain.svg "hero")

<sub><em>Figure 14. Every link in that chain is a person or an organisation. Diagram created for these pages. No external image licence is used.</em></sub>

<!-- ct319:endfocus -->

Responsibility runs through the whole chain, and it does not end when the system goes live. Someone has to monitor the running system, investigate complaints, and have the authority to change it or switch it off.
<!-- ct319:key Responsibility runs through the whole chain, and it does not end when the system goes live. -->

When that fails, the consequences can reach the top of a government (Figure 15).

<!-- ct319:focus -->

![A clipping of the Politico Europe article of 29 March 2022, Dutch scandal serves as a warning for Europe over risks of using algorithms](../../media/week-11/news-dutch-benefits.svg "hero")

<sub><em>Figure 15. [Politico Europe, 29 March 2022](https://www.politico.eu/article/dutch-scandal-serves-as-a-warning-for-europe-over-risks-of-using-algorithms/), by Melissa Heikkilä and Vincent Manancourt. Clipped from the [archived page](https://web.archive.org/web/20220412155940/https://www.politico.eu/article/dutch-scandal-serves-as-a-warning-for-europe-over-risks-of-using-algorithms/) and laid over the same page, blurred; the three points are our own summary.</em></sub>

<!-- ct319:endfocus -->

### Would your judgement change?

Keep the same case, and change one condition at a time.

> **Instead of contacting students automatically, the system only gives academic advisers a ranked list.**

Does that change your judgement? Think about whether advisers can check and question the ranking. Think also about whether the ranking still decides who gets attention.

> **Overall accuracy falls from 88% to 76%, but the gap between groups becomes much smaller.**

Is the less accurate system automatically worse? Is the smaller gap enough to justify it? Before deciding, weigh up the errors that remain, what they lead to, and the purpose of the support.

There is no single correct answer here. What matters is which evidence and which conditions your judgement depends on.

### Why this matters this week

<!-- ct319:focus -->

> **A technically successful system can still be badly designed, badly governed, or inappropriate to deploy at all.**

<!-- ct319:endfocus -->

<!-- ct319:endbeats -->

## What to carry out of this week
<!-- ct319:nodeck -->

Five ideas from this week matter most.
<!-- ct319:key Five ideas from this week matter most. -->

- **Fairness** — check who benefits and who is harmed, across the purpose, data, labels, features, decisions and use. A gap between groups calls for investigation. It is not automatic proof of discrimination.
- **Privacy and data minimisation** — define the purpose first, then use only the personal data that purpose needs. Removing identifiers does not make data anonymous, and it does not give permission to reuse it.
- **Transparency** — explain how AI is used, what its limits are and who is responsible. Interpretability lets you inspect a model. Explainability methods describe its outputs. Neither one shows that an influence was appropriate.
- **Human oversight** — people need information, authority and time. Without them, oversight exists in name only.
- **Accountability** — responsibility stays with the people and organisations who design, deploy and use the system, long after it goes live.

---

## Before the end of the module

Weeks 8 to 11 followed one progression. Here it is in full.

<!-- ct319:focus -->

<ol class="flow" aria-label="The arc from Week 8 to Week 11">
<li><span>learn from data</span></li>
<li><span>classify</span></li>
<li><span>discover structure</span></li>
<li><span>recommend</span></li>
<li><span class="is-pivot">question the system</span></li>
</ol>
<p class="flow__note">The first four build something. The last one asks whether it should have been built, and it is the only step that cannot be automated.</p>

<!-- ct319:endfocus -->

Take one question with you when the module ends.

<!-- ct319:focus -->

> **What evidence and safeguards would justify trusting this system, for this purpose, with these people affected?**

<!-- ct319:endfocus -->

---

## Quick revision

If you can answer these without reopening the page, you have the core of this week.
<!-- ct319:key If you can answer these without reopening the page, you have the core of this week. -->

1. **[WK-11-01]** Why does a single accuracy figure not settle whether a system should be relied on?
2. A classifier scores 92.8% overall, 96% on one group and 80% on another. Why is the overall figure so close to the higher one?
3. What do *lawful*, *ethical* and *robust* add up to, and why is each one insufficient alone?
4. **[WK-11-02]** Name the seven decisions that build a system, and say which of them happen before any model exists.
5. Why is a label not a fact, and what can a questionable label do to a learning objective?
6. Why does removing a protected characteristic from the features not remove the possibility of unfair treatment?
7. **[WK-11-03]** What does data minimisation require, and which two questions does it keep apart?
8. Why is deleting the name column not anonymisation, and what is the actual test?
9. **[WK-11-04]** What is the difference between interpretability, explainability and transparency?
10. Why is an explanation not a justification, and what is the most useful thing an explanation can do?
11. **[WK-11-05]** What makes human oversight meaningful rather than nominal?
12. Why is “the AI did it” not an accountability model?

---

## Sources and licensing notes

### CT319 source material

This week follows selected material from the formal CT319 *Lecture 10: AI Ethics* material on Canvas — fairness across the development process, privacy and data minimisation, synthetic data, transparency and responsibility. The formal slides remain the broader reference; these pages develop selected requirements rather than the whole framework.

### External sources

- European Commission — [Ethics Guidelines for Trustworthy AI](https://digital-strategy.ec.europa.eu/en/library/ethics-guidelines-trustworthy-ai)
- European Commission — [Principles of personal data processing under the GDPR](https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/principles-gdpr_en)
- European Commission — [Data protection explained](https://commission.europa.eu/law/law-topic/data-protection/data-protection-explained_en)
- European Commission — [AI Act — regulatory framework and risk-based approach](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai)
- European Commission — [Guidelines on transparency obligations for providers and deployers of AI systems](https://digital-strategy.ec.europa.eu/en/library/guidelines-transparency-obligations-providers-and-deployers-ai-systems)
- European Commission — [Transparency obligations under Article 50 of the AI Act](https://digital-strategy.ec.europa.eu/en/faqs/transparency-obligations-under-article-50-ai-act)
- EUR-Lex — [Regulation (EU) 2016/679, the General Data Protection Regulation](https://eur-lex.europa.eu/eli/reg/2016/679/oj), Official Journal L 119, 4 May 2016

The Commission sources were checked on **10 September 2026**, and the regulatory overview is deliberately limited to the teaching context and the staged application of Article 50. Dates in this area move; check the linked pages before relying on them.

### News reports and real cases

- Jeffrey Dastin, [Amazon scraps secret AI recruiting tool that showed bias against women](https://www.reuters.com/article/us-amazon-com-jobs-automation-insight/amazon-scraps-secret-ai-recruiting-tool-that-showed-bias-against-women-idUSKCN1MK08G), *Reuters*, 10 October 2018
- BBC News, [Apple's 'sexist' credit card investigated by US regulator](https://www.bbc.com/news/business-50365609), 10 November 2019
- New York State Department of Financial Services, [DFS Issues Findings on the Apple Card and Its Underwriter Goldman Sachs Bank](https://www.dfs.ny.gov/reports_and_publications/press_releases/pr202103231), 23 March 2021
- Richard Adams and Niamh McIntyre, [England A-level downgrades hit pupils from disadvantaged areas hardest](https://www.theguardian.com/education/2020/aug/13/england-a-level-downgrades-hit-pupils-from-disadvantaged-areas-hardest), *The Guardian*, 13 August 2020
- Melissa Heikkilä and Vincent Manancourt, [Dutch scandal serves as a warning for Europe over risks of using algorithms](https://www.politico.eu/article/dutch-scandal-serves-as-a-warning-for-europe-over-risks-of-using-algorithms/), *Politico Europe*, 29 March 2022

These reports were checked on **16 November 2026**.

### Research and data

- Chris Olah, Alexander Mordvintsev and Ludwig Schubert, [Feature Visualization](https://distill.pub/2017/feature-visualization/), *Distill*, 2017
- Ulrike Grömping, [South German Credit Data](https://doi.org/10.24432/C5QG88), UCI Machine Learning Repository, 2019. A corrected version of the older Statlog German Credit data, whose code descriptions were wrong for several attributes.
- [SHAP](https://github.com/shap/shap), the open-source library used to produce Figure 11

### Quotation and licensing

Where the Ethics Guidelines are drawn on in the text, this page cites short factual labels — the lawful/ethical/robust framing and the names of the seven requirements — with attribution. The AI Act and GDPR material is summarised in this page's own words for teaching rather than quoted.

Two figures reproduce pages from EU documents. Figure 2 shows the cover and Figure 1 of the Ethics Guidelines, and Figure 5 shows two pages of the GDPR from EUR-Lex. Both are © European Union and reused, with their source acknowledged, under the Commission's reuse policy, [Decision 2011/833/EU](https://eur-lex.europa.eu/eli/dec/2011/833/oj).

Figures 4, 8, 13 and 15 discuss four news reports. Each shows a clipping of the article's masthead, headline, byline and opening lines, cut from the copy held by the [Internet Archive](https://web.archive.org/), over a blurred image of the same page. They are reproduced for criticism and review, with the source acknowledged in each caption. No article photographs are shown, and the three points beside each clipping summarise the reporting in this page's own words. Follow the links to read the articles in full.

### Fictional teaching material

The University X case, the loan-approval example, and **every numerical value used in them**, are fictional teaching examples constructed for these pages.

They are not findings, measurements or claims about any actual institution, lender or deployed system. The accuracy figures and the feature contributions in Figure 10 were chosen to make a teaching point, not measured from data — Figure 10 is labelled schematic for that reason, and is not the output of LIME, SHAP or any other method.

Figure 11 is the opposite: real output from SHAP for a model trained on real, historical credit data. The model was built for these pages to show what such an explanation looks like. It is not a lender's system.

### Figures

Figures 1, 3, 6, 7, 10, 12 and 14 were **created for these pages** and are original diagrams. They use no external image licence.

Figures 4, 8, 13 and 15 were **composed for these pages** from clippings of the news reports, as described above.

Figures 2 and 5 reproduce EU document pages under the Commission's reuse policy, as described above.

Figure 9 is adapted from Olah, Mordvintsev and Schubert's *Feature Visualization*, published in *Distill* under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Ten of the thirty images in the article's opening figure were rearranged into two rows.

Figure 11 was **created for these pages** with the SHAP library, from the South German Credit data, which is published under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
