---
title: Week 11 — Trustworthy AI
eyebrow: CT319 Artificial Intelligence · Week 11 · Trustworthy AI
question: When should we trust an AI system?
description: CT319 Week 11. Fairness, privacy, transparency and accountability — why one accuracy figure settles nothing, and what evidence would justify deploying a system at all.
bar: Week 11 · Sections
source: week-11.md
---

For three weeks we asked whether a machine can learn from data, classify new examples, discover structure and make recommendations. Every question was a version of *does it work?*

Now suppose it does. Suppose the accuracy is high. Suppose people are already using it.

<!-- ct319:focus -->

> **Is that enough?**

<!-- ct319:endfocus -->

This is the one week on the module where the interesting answers are not technical. They are still answers, though — the discipline is the same one we have used since Week 1: say what the evidence establishes, and say what it does not.

We work through five things.

* [**Accurate, but trustworthy?**](#accurate-but-trustworthy--is-good-performance-enough) — why a headline accuracy figure does not settle whether a system should be relied on.
* [**The data were biased before the model arrived**](#the-data-were-biased-before-the-model-arrived--where-can-unfairness-enter) — where unfairness enters the sequence of choices that builds a system.
* [**Just because we can collect it**](#just-because-we-can-collect-it--how-much-data-should-a-system-use) — how much data a system *should* use, rather than how much it could.
* [**Why did the model say no?**](#why-did-the-model-say-no--what-does-transparency-actually-require) — what transparency actually requires of an explanation.
* [**From principles to responsibility**](#from-principles-to-responsibility--who-is-accountable) — who remains accountable, worked through one fictional university system.

Three ideas carry the page, and it is worth keeping them apart:

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

Imagine a system that helps decide whether loan applications are approved. Its test accuracy is **94%**. That sounds impressive. Then somebody reports the approval rate by group: **78%** for Group A, **42%** for Group B.

A difference in outcomes does not by itself prove unfairness. What it does prove is that one number was never going to settle the question.

<!-- ct319:focus -->

> **94% tells us something real about predictive performance. It tells us nothing about who the performance was for.**

<!-- ct319:endfocus -->

It does not say whether the data were representative, whether particular groups are disadvantaged, whether sensitive information was used appropriately, whether anybody affected understands the decision, whether it can be challenged, or who is responsible when it goes wrong.

<!-- ct319:beat -->
## How does performance vary across the people affected?

Week 9 asked whether a classifier generalises to unseen data. Add a second question to it:

<!-- ct319:focus -->

> **How does performance vary across the people who will actually be affected?**

<!-- ct319:endfocus -->

Here is a classifier with a perfectly respectable headline figure.

<!-- ct319:focus -->

![92.8% overall, which is 96% for Group A with 800 examples and 80% for Group B with 200](../../media/week-11/aggregate-hides-the-gap.svg "hero")

<sub><em>Figure 1. Fictional figures, chosen to make one arithmetic point: the aggregate is an average weighted by group size, so the larger group's experience dominates it. Diagram created for these pages; no external image licence is used.</em></sub>

<!-- ct319:endfocus -->

Sixteen points separate the two groups, and neither number appears in the headline. Generalisation does not require identical performance in every subgroup — but a gap like that needs investigating rather than averaging away.

It does not, on its own, prove unlawful discrimination, and it does not tell us *why* the gap exists. It tells us that one aggregate score is not enough to understand how a system behaves.

<!-- ct319:beat -->
## What does "trustworthy" mean?

The 2019 [Ethics Guidelines for Trustworthy AI](https://digital-strategy.ec.europa.eu/en/library/ethics-guidelines-trustworthy-ai), from the Commission's High-Level Expert Group on AI, describe trustworthy AI under three headings.

<!-- ct319:focus -->

<div class="lenses">
<div class="lens"><span class="lens__key">Lawful</span><span class="lens__gloss">it complies with the law that applies to it</span></div>
<div class="lens"><span class="lens__key">Ethical</span><span class="lens__gloss">it respects the principles and values at stake</span></div>
<div class="lens"><span class="lens__key">Robust</span><span class="lens__gloss">it works reliably, technically and in its social setting</span></div>
</div>

<!-- ct319:endfocus -->

The guidelines then set out seven requirements: human agency and oversight; technical robustness and safety; privacy and data governance; transparency; diversity, non-discrimination and fairness; societal and environmental wellbeing; and accountability.

This week takes selected requirements seriously rather than treating all seven as a list to memorise. Fairness, privacy, transparency and accountability are part of that framework, not the whole of it.

### Why this matters this week

For any system, five questions replace the one we have been asking:

<!-- ct319:focus -->

<ol class="flow" aria-label="Five questions to ask of any AI system">
<li><span>Does it work?</span></li>
<li><span class="is-pivot">Who does it work for?</span></li>
<li><span>What data does it use?</span></li>
<li><span>Can people understand or challenge it?</span></li>
<li><span>Who remains responsible?</span></li>
</ol>
<p class="flow__note">Only the first is answered by a test score. The highlighted one is where most of the trouble on this page starts.</p>

<!-- ct319:endfocus -->

<!-- ct319:beat -->
## The data were biased before the model arrived — where can unfairness enter?

It is tempting to talk as though a model becomes unfair by itself, somewhere during training. It does not. A system is built through a sequence of decisions, and most of them are made before anything is fitted.

<!-- ct319:focus -->

![Purpose, data, labels, features, model, decision rule and use, each with its own fairness question](../../media/week-11/where-unfairness-enters.svg "hero")

<sub><em>Figure 2. Seven decisions. The one most people mean by "the AI" is the fifth, and four have already been made by the time it arrives. Diagram created for these pages; no external image licence is used.</em></sub>

<!-- ct319:endfocus -->

### Who appears in the data?

Suppose a recruitment model is trained mainly on previous successful employees. That sounds sensible — until you ask what the previous hiring process favoured. If it favoured one kind of candidate, the historical record encodes that, and the learner has no way of knowing which patterns were worth preserving.

### Who decided the labels?

Imagine previous employees labelled `successful` or `unsuccessful`. What does `successful` mean? Stayed three years? High manager ratings? Earned promotion? Sold the most? Worked the longest hours?

<!-- ct319:focus -->

> **Labels are not facts because they appear in a spreadsheet. Somebody decided what the target would represent, and a questionable label produces a questionable objective.**

<!-- ct319:endfocus -->

<!-- ct319:beat -->
## Which features are allowed to matter?

Suppose the model receives education, experience, assessment score and postcode. Even with a protected characteristic removed, another feature can correlate strongly with it. Dropping one column does not remove the possibility of unfair treatment — it removes one route to it.

The design question is broader, and it is the one from Week 8 again:

<!-- ct319:focus -->

> **Why is this feature relevant to the decision we are making?**

<!-- ct319:endfocus -->

Available data is not automatically appropriate data.

### What happens after the model produces a score?

Two applicants score `0.71` and `0.69`. Somebody then chooses: *interview if score ≥ 0.70*. The model produced numbers. The threshold turned them into consequences — and the threshold is a design decision made by a person, usually one who is not in the room when the model is discussed.

### Why this matters this week

Fairness is not a checkbox applied after training, because by then most of the decisions that could have caused a problem have already been taken. The audit has to run across all seven steps in Figure 2.

<!-- ct319:beat -->
## Just because we can collect it — how much data should a system use?

Imagine a university wants to identify students who may need additional academic support. Which data should it collect — attendance, assessment history, LMS activity, library use, postcode, family income, browser history, medical information, social media?

Using every available source would not necessarily produce a better system. And there are two separate questions hiding in the word "should".

<!-- ct319:focus -->

<div class="lenses lenses--pair">
<div class="lens"><span class="lens__key">Would it help?</span><span class="lens__gloss">does this information improve the prediction?</span></div>
<div class="lens"><span class="lens__key">Should we?</span><span class="lens__gloss">ought the system to be using this information at all?</span></div>
</div>

<!-- ct319:endfocus -->

Those are not the same question, and the first one answering *yes* does not settle the second.

<!-- ct319:beat -->
## Data minimisation

Under the GDPR, **data minimisation** means personal data should be adequate, relevant and limited to what is necessary for the intended purpose — see the [Commission's guidance on GDPR principles](https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/principles-gdpr_en). The principle is deliberately restrictive, and it runs in the opposite direction to the instinct of anyone who has ever built a dataset.

<!-- ct319:focus -->

<div class="lenses lenses--pair">
<div class="lens"><span class="lens__key">The instinct</span><span class="lens__gloss">collect everything now, and work out later what turned out to be useful</span></div>
<div class="lens"><span class="lens__key">The principle</span><span class="lens__gloss">define the purpose, identify what is necessary for it, collect only what that justifies</span></div>
</div>

<!-- ct319:endfocus -->

Assessment information may be easier to justify for a stated support purpose than unrelated browsing behaviour — but every use still needs an appropriate purpose and basis. Having collected data for one academic purpose does not automatically permit reusing it for another.

### More data can mean more risk

Unnecessary personal information increases what can be exposed in a breach, misused, misunderstood, kept too long, combined with other records, or used for things people never expected. The cost does not sit in the model; it sits with the people in the dataset.

<!-- ct319:beat -->
## Removing identifiers is not anonymisation

This is the point most often got wrong, and it is worth being exact about.

<!-- ct319:focus -->

![Identified and pseudonymised data are both personal data; only genuinely anonymised data is not](../../media/week-11/identifiability.svg "hero")

<sub><em>Figure 3. Deleting the name column moves you one box to the right, not two. Diagram created for these pages; no external image licence is used.</em></sub>

<!-- ct319:endfocus -->

**Pseudonymisation** replaces direct identifiers with codes and keeps the identifying information separately. It is real protection — and data that can still be linked back to a person remains personal data.

**Genuine anonymisation** means the individual is no longer identifiable, and such data is not personal data under the GDPR. The distinction is whether identification remains possible, not whether a column was dropped. See the [Commission's explanation of personal data](https://commission.europa.eu/law/law-topic/data-protection/data-protection-explained_en).

<!-- ct319:focus -->

> **Age, programme, postcode and one rare condition can identify a single person — especially combined with information from somewhere else.**

<!-- ct319:endfocus -->

### What about synthetic data?

Synthetic data is not automatically private, not automatically unbiased and not automatically safe. Those properties depend entirely on how it was generated and which patterns from the original it preserves.

### Why this matters this week

Every dataset in this module arrived ready-made. In practice somebody decides what goes into one, and that decision is the first place a system can go wrong — before a single line of modelling code is written.

<!-- ct319:beat -->
## Why did the model say no? — what does transparency actually require?

Return to the loan decision, and compare two systems that reach the same kind of outcome.

<!-- ct319:focus -->

![A traceable decision tree beside an opaque model emitting the score 0.83 and a rejection](../../media/week-11/interpretable-vs-opaque.svg "hero")

<sub><em>Figure 4. Fictional example. On the left there is a route to show somebody. On the right there is a number. Diagram created for these pages; no external image licence is used.</em></sub>

<!-- ct319:endfocus -->

If an applicant asks why they were sent for review, the tree can be walked. The right-hand system has nothing to walk. What would the affected person reasonably want to know? What data was used, what factors mattered, what `0.83` means, how reliable the model is, whether a human was involved, and how to challenge the result.

Publishing the source code answers none of those six.

<!-- ct319:beat -->
## Three words that are not synonyms

<!-- ct319:focus -->

<div class="lenses">
<div class="lens"><span class="lens__key">Interpretability</span><span class="lens__gloss">the model itself is understandable enough to inspect how inputs relate to output</span></div>
<div class="lens"><span class="lens__key">Explainability</span><span class="lens__gloss">additional methods help describe why a model produced a particular output</span></div>
<div class="lens"><span class="lens__key">Transparency</span><span class="lens__gloss">the wider system communicates how AI is used, what matters, its limits, and who is responsible</span></div>
</div>

<!-- ct319:endfocus -->

These terms are used somewhat differently across the literature; this is the practical sense we use here. A small decision tree is interpretable. For more complicated models, tools such as **LIME** and **SHAP** estimate or attribute how features contributed to a prediction. We do not need their mathematics this week — only the kind of output they try to produce.

<!-- ct319:focus -->

![A schematic bar display showing debt and missed payments pushing towards reject and income towards approve](../../media/week-11/contribution-display.svg "hero")

<sub><em>Figure 5. **Schematic** — this is the shape of such an output, not a measured LIME or SHAP result. Diagram created for these pages; no external image licence is used.</em></sub>

<!-- ct319:endfocus -->

A system can produce an explanation for one prediction while being badly governed and poorly communicated overall. Explanation is one requirement, not the whole of transparency.

<!-- ct319:beat -->
## Explanation is not justification

Look at the fourth row of Figure 5. Suppose an explanation reports that postcode strongly influenced the decision. That tells us something true about the model. It does not tell us that postcode *should* have influenced it.

<!-- ct319:focus -->

<div class="lenses lenses--pair">
<div class="lens"><span class="lens__key">Explanation</span><span class="lens__gloss">what influenced the output?</span></div>
<div class="lens"><span class="lens__key">Justification</span><span class="lens__gloss">was that influence appropriate?</span></div>
</div>

<!-- ct319:endfocus -->

An explanation can reveal a problem rather than excuse one. That is arguably the most useful thing it does.

<!-- ct319:beat -->
## Transparency as an obligation

The [EU AI Act](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai) takes a risk-based approach: the obligations follow what a system is used for, not which technique it uses.

<!-- ct319:focus -->

![Four bands: unacceptable risk, high risk, transparency risk, and minimal or no risk](../../media/week-11/ai-act-risk.svg "hero")

<sub><em>Figure 6. The same technique can sit in different bands depending on its use. Diagram created for these pages; no external image licence is used.</em></sub>

<!-- ct319:endfocus -->

The Act applies in stages. The **Article 50 transparency obligations have applied since 2 August 2026**, covering disclosure of direct AI interaction, machine-readable marking of certain AI-generated content, and disclosure of deepfakes, subject to the relevant conditions and exceptions.

Limited transitional arrangements apply to some pre-existing systems. The Commission's FAQ identifies a narrow grace period until **2 December 2026** for the Article 50(2) content-marking and detection obligations of systems placed on the market before 2 August 2026 — this is not a delay to every transparency duty. See the [Commission's Article 50 FAQ](https://digital-strategy.ec.europa.eu/en/faqs/transparency-obligations-under-article-50-ai-act).

### Why this matters this week

<!-- ct319:focus -->

> **Trustworthy-AI principles now come with concrete deployment obligations attached. The law supports this discussion — it does not replace the judgement about whether a particular system should exist.**

<!-- ct319:endfocus -->

<!-- ct319:beat -->
## From principles to responsibility — who is accountable?

Take one fictional case and work it through, revealing a piece at a time.

> **University X proposes an AI system to identify students who may need academic support.**

Six questions carry the discussion — and the point of the exercise is to decide what further evidence or changes you would require *before* deployment, not to reach a verdict from the description alone.

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

What is the system actually for? Predicting dropout, identifying students who need support, prioritising scarce staff time and triggering automatic intervention are **four different systems**, and a proposal that has not chosen between them makes everything downstream impossible to justify.

### Data

The proposal uses attendance, grades, postcode, library use and LMS activity. Which of those are necessary for a support purpose, and which would you remove? What purpose and basis support using the records at all?

Would postcode improve the prediction? Possibly. Should it therefore be used? Not automatically — and that gap between the two answers is the whole of the previous highlight.

### Fairness

Overall accuracy **88%**; Group A **91%**; Group B **72%**. Should it be deployed unchanged?

That result should trigger investigation, not an automatic verdict of discrimination. Perhaps Group B is under-represented in the training data. Perhaps a feature behaves differently for that group. Perhaps the labels are weaker there. The aggregate cannot distinguish between those, and each one implies a different fix.

### Transparency

Now reveal how a prediction becomes an action: a risk score from 0 to 100, and above 75 an automatic message to the student plus a flag to programme staff. The threshold and the automatic contact are deployment choices, not model outputs.

Should students know that AI is being used, what data is included, what the score is used for, whether a human reviews it, and how to challenge incorrect information? A system that affects people while hiding its own existence makes meaningful oversight impossible by construction.

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

All three are called "human oversight". The question that separates real oversight from the appearance of it is practical:

<!-- ct319:focus -->

> **Does that person actually have enough information, authority and time to intervene?**

<!-- ct319:endfocus -->

A nominal human in the loop who clicks **Approve** on everything is not oversight. Ask what they can genuinely review, override or stop.

<!-- ct319:beat -->
## Accountability

Now suppose the system causes harm.

<!-- ct319:focus -->

![The vendor, developer, data team, deploying organisation and staff member, and the claim that the AI did it](../../media/week-11/accountability-chain.svg "hero")

<sub><em>Figure 7. Every link in that chain is a person or an organisation. Diagram created for these pages; no external image licence is used.</em></sub>

<!-- ct319:endfocus -->

Responsibility exists across the whole chain, and it does not stop at deployment. Who monitors the running system, who investigates complaints, and who has the authority to change or withdraw it?

### Would your judgement change?

Keep the case and change one deployment condition at a time.

> **Instead of contacting students automatically, the system only gives academic advisers a ranked list.**

Does that change your judgement? Consider whether advisers can inspect and challenge the ranking — and whether it still decides who receives attention.

> **Overall accuracy falls from 88% to 76%, but the gap between groups becomes much smaller.**

Is the lower-accuracy system automatically worse? Is the smaller gap enough to justify it? Weigh the remaining errors, their consequences, and the support purpose before deciding.

There is no correct verdict supplied here. What you are asked for is which evidence and which deployment conditions your judgement depends on.

### Why this matters this week

<!-- ct319:focus -->

> **A technically successful system can still be badly designed, badly governed, or inappropriate to deploy at all.**

<!-- ct319:endfocus -->

<!-- ct319:endbeats -->

## What to carry out of this week

- **Fairness** — investigate who benefits and who is harmed, across purpose, data, labels, features, decisions and use. A subgroup gap calls for investigation; it is not automatic proof of discrimination.
- **Privacy and data minimisation** — define the purpose, then use only the personal data that purpose needs. Removing identifiers establishes neither anonymity nor permission to reuse.
- **Transparency** — communicate how AI is used, what its limits are and who is responsible. Interpretability lets you inspect a model; explainability methods describe its outputs. Neither makes an influence appropriate.
- **Human oversight** — people need information, authority and time, or the oversight is nominal.
- **Accountability** — responsibility stays with the people and organisations who design, deploy and use the system, including long after it goes live.

---

## Before the end of the module

Weeks 8 to 11 ran a progression, and it is worth seeing it whole.

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

Carry one question out of the module:

<!-- ct319:focus -->

> **What evidence and safeguards would justify trusting this system, for this purpose, with these people affected?**

<!-- ct319:endfocus -->

---

## Quick revision

If you can answer these without reopening the page, you have the core of this week.

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

The Commission sources were checked on **10 September 2026**, and the regulatory overview is deliberately limited to the teaching context and the staged application of Article 50. Dates in this area move; check the linked pages before relying on them.

### Quotation and licensing

The Commission material is **linked, not reproduced**. Where the Ethics Guidelines are drawn on, this page cites short factual labels — the lawful/ethical/robust framing and the names of the seven requirements — with attribution. The surrounding text is not reproduced, and the AI Act and GDPR material is summarised in this page's own words for teaching rather than quoted.

### Fictional teaching material

The University X case, the loan-approval example, and **every numerical value used in them**, are fictional teaching examples constructed for these pages.

They are not findings, measurements or claims about any actual institution, lender or deployed system. The accuracy figures and the feature contributions in Figure 5 were chosen to make a teaching point, not measured from data — Figure 5 is labelled schematic for that reason, and is not the output of LIME, SHAP or any other method.

### Figures

Figures 1–7 were **created for these pages** and are original diagrams. They use no external image licence.

No external images, videos, papers or interactives are used.
