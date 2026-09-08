# CT319 Artificial Intelligence — 2026/27

Companion teaching material for CT319 at the University of Galway. Formal slides
and notes live on Canvas; this repository holds the pages we teach from live, the
interactive artefacts, and the experiment code students run themselves.

Published at **https://cs-universityofgalway-teaching.github.io/CT319-2627/**

## Layout

| Path | What it is |
| --- | --- |
| `weeks/week-NN.md` | The **source** for a week. Markdown, authored by hand. |
| `weeks/week-NN/index.html` | The **built** page. Generated — do not edit by hand. |
| `assets/ct319.css`, `assets/ct319.js` | Shared presentation layer for every week. |
| `tools/build.py` | The builder. Zero dependencies. |
| `tools/templates/week.html` | Page template. |
| `media/week-NN/` | Diagrams and screenshots for that week. |
| `experiments/week-NN/` | Code students download and run. |
| `search-lab/` | The Weeks 2–4 search visualiser. |
| `index.html` | Module landing page. |

## Building

```bash
python3 tools/build.py            # rebuild every week
python3 tools/build.py week-01    # rebuild one week
```

No `pip install`, no Node, no Ruby, no Jekyll. Any Python 3.9+ will do. Commit the
generated `index.html` alongside the Markdown — GitHub Pages serves it as a static
file with no build step of its own.

## How a week page works

The page opens as an outline. Each teaching beat is collapsed; the lecturer opens
one at a time; **Expand all** turns the page into ordinary revision notes.

The beats are real `<details>` elements written into the HTML at build time, so the
page still works with JavaScript disabled — sections open on click and on keyboard,
and every word is present for in-page search and printing. `assets/ct319.js` only
adds the Expand all / Collapse all buttons and makes links into a collapsed section
open it. Printing expands everything.

## Adding a later week

1. Write `weeks/week-NN.md`.
2. Give it front matter:

   ```yaml
   ---
   title: Week 2 — Problems, states and search
   eyebrow: CT319 Artificial Intelligence · Week 2
   question: How do you turn a messy problem into something a machine can search?
   description: One sentence for search engines and link previews.
   source: week-02.md
   ---
   ```

3. Divide the body with three HTML comments:

   ```markdown
   Opening framing. Always visible.

   <!-- ct319:beats -->

   <!-- ct319:beat -->
   ## First teaching beat

   <!-- ct319:beat open -->
   ## A beat that starts expanded

   <!-- ct319:endbeats -->

   ## Take-home material, always visible
   ```

   Each beat starts with an `## ` heading, which becomes its summary line. The
   markers are HTML comments, so the file still reads correctly on GitHub and in
   any other Markdown renderer.

4. Put images in `media/week-NN/` and reference them as `../../media/week-NN/x.svg`.
5. Run the builder and add the week to `index.html`.

Choose beats that are *teaching beats*, not every subsection — the collapsed
headings should read as the plan for the class.

## Supported Markdown

Headings, paragraphs, bullet and numbered lists, tables (including `---:` for
right-aligned numbers), fenced code blocks, block quotes, horizontal rules, links,
images, and GitHub alert callouts (`> [!NOTE]`, `> [!IMPORTANT]`, `> [!WARNING]`,
`> [!TIP]`).

An image on its own line becomes a `<figure>`. If a `<sub><em>…</em></sub>` caption
follows it, the caption becomes the `<figcaption>`.
