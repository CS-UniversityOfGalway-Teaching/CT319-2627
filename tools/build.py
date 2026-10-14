#!/usr/bin/env python3
"""
CT319 teaching-page builder.

Turns weeks/<name>.md into weeks/<name>/index.html using
tools/templates/week.html, assets/ct319.css and assets/ct319.js.

Zero dependencies: runs on any Python 3.9+ with no pip install.

    python3 tools/build.py            # build every week
    python3 tools/build.py week-01    # build one week

Source conventions
------------------
Front matter (--- delimited, simple "key: value" lines) supplies the page
title, the week question and the meta description.

Three markers divide the page:

    <!-- ct319:beats -->        everything above stays permanently visible
    <!-- ct319:beat -->         starts one collapsible teaching beat
    <!-- ct319:beat open -->    ... which starts expanded
    <!-- ct319:endbeats -->     everything below stays permanently visible

Each beat begins with an "## " heading, which becomes its summary line. The
markers are HTML comments, so the same file still reads correctly on GitHub
and in any other Markdown renderer.

A week whose front matter says "deck: yes" also gets weeks/<name>/deck.html,
the whole page as slides, using tools/templates/deck.html, assets/deck.css
and assets/deck.js. A slide of ordinary text takes its main point from a

    <!-- ct319:key A sentence quoted exactly from that text. -->

line placed next to the sentence. The page ignores it.
"""

from __future__ import annotations

import html
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WEEKS = ROOT / "weeks"
TEMPLATE = ROOT / "tools" / "templates" / "week.html"

ALERTS = {"NOTE": "note", "IMPORTANT": "important", "WARNING": "warning", "TIP": "tip"}

# Raw inline HTML we allow through untouched. The Markdown is ours, not
# user input, so this is a formatting affordance rather than a sanitiser.
RAW_INLINE = ("sub", "sup", "em", "strong", "a", "code", "br", "kbd", "abbr")

# A link destination may contain balanced parentheses, as Wikimedia file URLs do
# (".../Alan%20Turing%20(1951).jpg"). Matching one nested level covers every URL
# these pages use and keeps the closing ")" of the Markdown link intact.
# Each alternative consumes exactly one unit, so a FAILING match (for example an
# image carrying a size title inside a table cell) cannot backtrack exponentially.
URL_DEST = r"(?:[^()\s]|\([^()\s]*\))+"


# --------------------------------------------------------------------------
# inline
# --------------------------------------------------------------------------

def slugify(text: str) -> str:
    """GitHub-compatible heading slug, so existing anchors keep working."""
    text = re.sub(r"<[^>]+>", "", text)
    text = re.sub(r"[`*_]", "", text)
    text = text.strip().lower()
    text = re.sub(r"[^\w\s-]", "", text)
    return re.sub(r"\s", "-", text)


def _escape_amp(text: str) -> str:
    return re.sub(r"&(?![A-Za-z][A-Za-z0-9]{1,10};|#\d{1,6};|#x[0-9A-Fa-f]{1,6};)", "&amp;", text)


def inline(text: str) -> str:
    """Render inline Markdown. Code spans are protected before anything else."""
    spans: list[str] = []

    def stash_code(m: re.Match) -> str:
        spans.append("<code>" + html.escape(m.group(1), quote=False) + "</code>")
        return f"\x00{len(spans) - 1}\x00"

    text = re.sub(r"`([^`]+)`", stash_code, text)
    text = _escape_amp(text)

    # images before links: ![alt](src)
    text = re.sub(
        r"!\[([^\]]*)\]\((" + URL_DEST + r")\)",
        lambda m: f'<img src="{html.escape(m.group(2), quote=True)}" alt="{html.escape(m.group(1), quote=True)}">',
        text,
    )
    text = re.sub(
        r"\[([^\]]+)\]\((" + URL_DEST + r")\)",
        lambda m: f'<a href="{html.escape(m.group(2), quote=True)}">{m.group(1)}</a>',
        text,
    )

    text = re.sub(r"\*\*\*(.+?)\*\*\*", r"<strong><em>\1</em></strong>", text, flags=re.S)
    # Bold whose content may itself contain a complete *italic* pair, so that
    # "**a, or *b***" closes the inner emphasis before the outer strong.
    text = re.sub(r"\*\*([^*]*(?:\*[^*]+\*[^*]*)*)\*\*", r"<strong>\1</strong>", text, flags=re.S)
    text = re.sub(r"(?<![\*\w])\*(?!\s)(.+?)(?<!\s)\*(?!\*)", r"<em>\1</em>", text, flags=re.S)

    text = text.replace("  \n", "<br>\n")

    for i, span in enumerate(spans):
        text = text.replace(f"\x00{i}\x00", span)
    return text


# --------------------------------------------------------------------------
# blocks
# --------------------------------------------------------------------------

CAPTION_RE = re.compile(r"^<sub><em>(.*)</em></sub>\s*$", re.S)
# An optional Markdown title carries the teaching weight of the figure:
#   ![alt](src "wide")       a short, very wide diagram, widest on the page
#   ![alt](src "hero")       stop-and-discuss anchor
#   ![alt](src "secondary")  important supporting figure, ~80% width
# Anything else (or no title) renders at the ordinary reference size.
IMAGE_ONLY_RE = re.compile(
    r"^!\[([^\]]*)\]\((" + URL_DEST + r")(?:\s+\"([^\"]*)\")?\)\s*$"
)
FIGURE_LEVELS = {"wide", "hero", "secondary"}

# Wraps existing prose in a teaching-focus block. Both markers are HTML
# comments, so the Markdown still reads normally on GitHub.
FOCUS_START = "<!-- ct319:focus -->"
FOCUS_END = "<!-- ct319:endfocus -->"
# A slide's main point, quoted from the text around it. Only the deck shows
# it; the page renders as if the line were not there.
KEY_RE = re.compile(r"^[ \t]*<!--\s*ct319:key\s+(.+?)\s*-->[ \t]*(?:\n|$)", re.M)
LINKED_IMAGE_RE = re.compile(
    r"^\[!\[([^\]]*)\]\((" + URL_DEST + r")\)\]\((" + URL_DEST + r")\)\s*$"
)


class Renderer:
    def __init__(self, lines: list[str]) -> None:
        self.lines = lines
        self.i = 0
        self.focus_depth = 0
        self.out: list[str] = []
        self.headings: list[tuple[int, str, str]] = []

    # -- helpers ----------------------------------------------------------

    def peek(self, offset: int = 0) -> str | None:
        j = self.i + offset
        return self.lines[j] if j < len(self.lines) else None

    def caption_ahead(self) -> str | None:
        """A <sub><em>...</em></sub> line, possibly after one blank line."""
        for offset in (0, 1):
            nxt = self.peek(offset)
            if nxt is None:
                continue
            if offset == 1 and (self.peek(0) or "").strip():
                break
            m = CAPTION_RE.match(nxt.strip())
            if m:
                self.i += offset + 1
                return m.group(1)
        return None

    # -- entry point ------------------------------------------------------

    def run(self) -> str:
        while self.i < len(self.lines):
            line = self.lines[self.i]
            stripped = line.strip()

            if not stripped:
                self.i += 1
            elif stripped == FOCUS_START:
                self.out.append('<div class="focus-block">')
                self.focus_depth += 1
                self.i += 1
            elif stripped == FOCUS_END:
                if not self.focus_depth:
                    raise SystemExit(f"stray {FOCUS_END} at line {self.i + 1}")
                self.out.append("</div>")
                self.focus_depth -= 1
                self.i += 1
            elif stripped.startswith("```"):
                self.code_block()
            elif re.match(r"^#{1,6}\s", stripped):
                self.heading()
            elif stripped in ("---", "***", "___"):
                self.out.append("<hr>")
                self.i += 1
            elif stripped.startswith(">"):
                self.blockquote()
            elif stripped.startswith("|"):
                self.table()
            elif re.match(r"^[-*]\s", stripped):
                self.ulist()
            elif re.match(r"^\d+\.\s", stripped):
                self.olist()
            elif LINKED_IMAGE_RE.match(stripped):
                self.linked_image()
            elif IMAGE_ONLY_RE.match(stripped):
                self.figure()
            else:
                self.paragraph()
        if self.focus_depth:
            raise SystemExit(f"{self.focus_depth} unclosed {FOCUS_START}")
        return "\n".join(self.out)

    # -- block handlers ---------------------------------------------------

    def code_block(self) -> None:
        opener = self.lines[self.i].strip()
        lang = opener[3:].strip()
        self.i += 1
        body: list[str] = []
        while self.i < len(self.lines) and not self.lines[self.i].strip().startswith("```"):
            body.append(self.lines[self.i])
            self.i += 1
        self.i += 1  # closing fence
        text = html.escape("\n".join(body), quote=False)
        # A "prompt" fence is text meant to be copied out and pasted somewhere
        # else, so it is wrapped for the copy button that ct319.js adds. The
        # button is injected rather than emitted here: without JavaScript there
        # is nothing to copy with, and a dead button would be worse than none.
        if lang == "prompt":
            self.out.append(f'<div class="prompt" data-copy><pre><code>{text}</code></pre></div>')
            return
        cls = f' class="language-{html.escape(lang, quote=True)}"' if lang else ""
        label = f' data-lang="{html.escape(lang, quote=True)}"' if lang else ""
        self.out.append(f"<pre{label}><code{cls}>" + text + "</code></pre>")

    def heading(self) -> None:
        m = re.match(r"^(#{1,6})\s+(.*)$", self.lines[self.i].strip())
        assert m
        level, text = len(m.group(1)), m.group(2).strip()
        slug = slugify(text)
        self.headings.append((level, text, slug))
        self.out.append(f'<h{level} id="{slug}">{inline(text)}</h{level}>')
        self.i += 1

    def blockquote(self) -> None:
        body: list[str] = []
        while self.i < len(self.lines) and self.lines[self.i].strip().startswith(">"):
            body.append(re.sub(r"^\s*>\s?", "", self.lines[self.i]))
            self.i += 1

        alert = None
        if body and (m := re.match(r"^\[!(\w+)\]\s*$", body[0].strip())):
            kind = m.group(1).upper()
            if kind in ALERTS:
                alert = ALERTS[kind]
                body = body[1:]

        inner = Renderer(body)
        rendered = inner.run()

        if alert:
            # A heading inside a callout is a label for the callout, not a section
            # of the document, so it must not enter the page's heading outline.
            rendered = re.sub(
                r"<h[1-6][^>]*>(.*?)</h[1-6]>",
                r'<p class="callout__title">\1</p>',
                rendered,
                flags=re.S,
            )
            label = f'<span class="callout__label">{alert.capitalize()}</span>'
            self.out.append(f'<div class="callout callout--{alert}">{label}{rendered}</div>')
        else:
            self.out.append(f"<blockquote>{rendered}</blockquote>")

    def table(self) -> None:
        rows: list[str] = []
        while self.i < len(self.lines) and self.lines[self.i].strip().startswith("|"):
            rows.append(self.lines[self.i].strip())
            self.i += 1
        if len(rows) < 2:
            for r in rows:
                self.out.append(f"<p>{inline(r)}</p>")
            return

        def cells(row: str) -> list[str]:
            return [c.strip() for c in row.strip().strip("|").split("|")]

        header = cells(rows[0])
        aligns = []
        for spec in cells(rows[1]):
            if spec.endswith(":") and spec.startswith(":"):
                aligns.append("center")
            elif spec.endswith(":"):
                aligns.append("num")
            else:
                aligns.append("")

        def cls(idx: int) -> str:
            a = aligns[idx] if idx < len(aligns) else ""
            return f' class="{a}"' if a else ""

        parts = ['<div class="table-scroll"><table>', "<thead><tr>"]
        for idx, cell in enumerate(header):
            parts.append(f"<th{cls(idx)}>{inline(cell)}</th>")
        parts.append("</tr></thead><tbody>")
        for row in rows[2:]:
            parts.append("<tr>")
            for idx, cell in enumerate(cells(row)):
                parts.append(f"<td{cls(idx)}>{inline(cell)}</td>")
            parts.append("</tr>")
        parts.append("</tbody></table></div>")
        self.out.append("".join(parts))

    def _list(self, tag: str, pattern: str) -> None:
        items: list[list[str]] = []
        while self.i < len(self.lines):
            stripped = self.lines[self.i].strip()
            m = re.match(pattern, stripped)
            if m:
                items.append([m.group(1)])
                self.i += 1
                # lazy continuation lines belong to the current item
                while self.i < len(self.lines):
                    nxt = self.lines[self.i]
                    s = nxt.strip()
                    if not s or re.match(pattern, s) or re.match(r"^#{1,6}\s|^```|^\||^>", s):
                        break
                    items[-1].append(s)
                    self.i += 1
            elif not stripped:
                # a blank line only ends the list if no item follows
                j = self.i
                while j < len(self.lines) and not self.lines[j].strip():
                    j += 1
                if j < len(self.lines) and re.match(pattern, self.lines[j].strip()):
                    self.i = j
                else:
                    break
            else:
                break
        rendered = "".join(f"<li>{inline(' '.join(it))}</li>" for it in items)
        self.out.append(f"<{tag}>{rendered}</{tag}>")

    def ulist(self) -> None:
        self._list("ul", r"^[-*]\s+(.*)$")

    def olist(self) -> None:
        self._list("ol", r"^\d+\.\s+(.*)$")

    def figure(self) -> None:
        m = IMAGE_ONLY_RE.match(self.lines[self.i].strip())
        assert m
        alt, src = m.group(1), m.group(2)
        level = (m.group(3) or "").strip().lower()
        self.i += 1
        caption = self.caption_ahead()
        portrait = " is-portrait" if "width=480" in src else ""
        fig_cls = f' class="figure--{level}"' if level in FIGURE_LEVELS else ""
        parts = [
            f"<figure{fig_cls}>",
            f'<img class="figure__img{portrait}" src="{html.escape(src, quote=True)}"'
            f' alt="{html.escape(alt, quote=True)}" loading="lazy" decoding="async">',
        ]
        if caption:
            parts.append(f"<figcaption>{inline(caption)}</figcaption>")
        parts.append("</figure>")
        self.out.append("".join(parts))

    def linked_image(self) -> None:
        m = LINKED_IMAGE_RE.match(self.lines[self.i].strip())
        assert m
        alt, img, href = m.group(1), m.group(2), m.group(3)
        self.i += 1
        caption = self.caption_ahead()
        parts = [
            "<figure>",
            f'<a class="video-link" href="{html.escape(href, quote=True)}">'
            f'<img src="{html.escape(img, quote=True)}" alt="{html.escape(alt, quote=True)}"'
            f' loading="lazy" decoding="async"></a>',
        ]
        if caption:
            parts.append(f"<figcaption>{inline(caption)}</figcaption>")
        parts.append("</figure>")
        self.out.append("".join(parts))

    def paragraph(self) -> None:
        body: list[str] = []
        while self.i < len(self.lines):
            s = self.lines[self.i].strip()
            if not s or re.match(r"^(#{1,6}\s|```|\||>|[-*]\s|\d+\.\s|---$)", s):
                break
            if IMAGE_ONLY_RE.match(s) or LINKED_IMAGE_RE.match(s):
                break
            body.append(self.lines[self.i].rstrip("\n"))
            self.i += 1
        text = "\n".join(body).strip()
        if not text:
            return
        # a standalone raw HTML block passes straight through
        if text.startswith("<") and not text.startswith("<sub>"):
            self.out.append(text)
        elif CAPTION_RE.match(text):
            self.out.append(f'<p class="standalone-caption">{inline(text)}</p>')
        else:
            self.out.append(f"<p>{inline(text)}</p>")


def render(markdown: str) -> tuple[str, list[tuple[int, str, str]]]:
    r = Renderer(KEY_RE.sub("", markdown).split("\n"))
    return r.run(), r.headings


# --------------------------------------------------------------------------
# page assembly
# --------------------------------------------------------------------------

def front_matter(text: str) -> tuple[dict[str, str], str]:
    if not text.startswith("---"):
        return {}, text
    end = text.find("\n---", 3)
    if end == -1:
        return {}, text
    meta: dict[str, str] = {}
    for line in text[3:end].strip().splitlines():
        if ":" in line:
            k, v = line.split(":", 1)
            meta[k.strip()] = v.strip().strip('"')
    body = text[end + 4:]
    return meta, body.lstrip("\n")


BEATS_START = "<!-- ct319:beats -->"
BEATS_END = "<!-- ct319:endbeats -->"
BEAT_RE = re.compile(r"^<!--\s*ct319:beat(?P<flags>[^>]*?)-->\s*$")


def split_page(md_path: Path, body: str) -> tuple[str, list[tuple[bool, str, str]], str]:
    """Opening Markdown, (open, title, body Markdown) per beat, tail Markdown."""
    if BEATS_START not in body:
        raise SystemExit(f"{md_path}: missing {BEATS_START}")
    opening_md, rest = body.split(BEATS_START, 1)
    if BEATS_END in rest:
        beats_md, tail_md = rest.split(BEATS_END, 1)
    else:
        beats_md, tail_md = rest, ""

    # split the beat region on the beat markers
    chunks: list[tuple[bool, list[str]]] = []
    current: list[str] | None = None
    current_open = False
    for line in beats_md.split("\n"):
        m = BEAT_RE.match(line.strip())
        if m:
            if current is not None:
                chunks.append((current_open, current))
            current = []
            current_open = "open" in m.group("flags")
        elif current is not None:
            current.append(line)
    if current is not None:
        chunks.append((current_open, current))

    beats: list[tuple[bool, str, str]] = []
    for is_open, chunk_lines in chunks:
        text = "\n".join(chunk_lines).strip("\n")
        m = re.match(r"^##\s+(.*)$", text.split("\n", 1)[0].strip())
        if not m:
            raise SystemExit(f"{md_path}: a beat does not start with an '## ' heading:\n{text[:120]}")
        rest_md = text.split("\n", 1)[1] if "\n" in text else ""
        beats.append((is_open, m.group(1).strip(), rest_md.strip()))
    return opening_md, beats, tail_md


def build_page(md_path: Path) -> str:
    raw = md_path.read_text(encoding="utf-8")
    meta, body = front_matter(raw)
    opening_md, beats, tail_md = split_page(md_path, body)
    opening_html, _ = render(opening_md.strip())

    beat_html: list[str] = []
    for is_open, title, rest_md in beats:
        slug = slugify(title)
        inner, _ = render(rest_md)
        beat_html.append(
            f'<details class="beat" id="{slug}"{" open" if is_open else ""}>'
            f'<summary><h2 class="beat__title">{inline(title)}</h2></summary>'
            f'<div class="beat__body">{inner}</div>'
            f"</details>"
        )

    tail_html, _ = render(tail_md.strip()) if tail_md.strip() else ("", [])

    template = TEMPLATE.read_text(encoding="utf-8")
    question = meta.get("question", "")
    parts = {
        "TITLE": html.escape(meta.get("title", md_path.stem), quote=True),
        "DESCRIPTION": html.escape(meta.get("description", ""), quote=True),
        "EYEBROW": html.escape(meta.get("eyebrow", ""), quote=True),
        "BARLABEL": html.escape(meta.get("bar", "Sections"), quote=True),
        "HEADING": inline(meta.get("title", md_path.stem)),
        "QUESTION": inline(question) if question else "",
        "OPENING": opening_html,
        "BEATS": "\n".join(beat_html),
        "TAIL": tail_html,
        "SOURCE": html.escape(meta.get("source", md_path.name), quote=True),
        "DECKLINK": ('\n    <a class="beat-bar__deck" href="deck.html">Slides</a>'
                     if meta.get("deck", "").lower() in ("yes", "true") else ""),
    }
    page = template
    for key, value in parts.items():
        page = page.replace("{{" + key + "}}", value)
    return page


# --------------------------------------------------------------------------
# deck
# --------------------------------------------------------------------------

DECK_TEMPLATE = ROOT / "tools" / "templates" / "deck.html"

# Words of ordinary text per slide; longer passages are split between
# paragraphs. A focus block is set larger, so each of its words counts
# FOCUS_WEIGHT times against the slide.
SLIDE_WORDS = 170
FOCUS_WEIGHT = 2
# A slide never ends with less text than this; a short line joins the next.
MIN_WORDS = 40


def plain(markdown: str) -> str:
    """Markdown reduced to its words, for checking a quotation."""
    text = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", markdown)
    return " ".join(re.sub(r"[*`]", "", text).split())


def word_count(markdown: str) -> int:
    return len(re.sub(r"<[^>]+>|\]\([^)]*\)|[#*`>|]", " ", markdown).split())


def segments(markdown: str) -> list[tuple[bool, str]]:
    """(is_focus, Markdown) for the text and the focus blocks, in page order."""
    out: list[tuple[bool, str]] = []
    current: list[str] = []
    for line in markdown.split("\n"):
        stripped = line.strip()
        if stripped in (FOCUS_START, FOCUS_END):
            text = "\n".join(current).strip()
            if text:
                out.append((stripped == FOCUS_END, text))
            current = []
        else:
            current.append(line)
    text = "\n".join(current).strip()
    if text:
        out.append((False, text))
    return out


def slide_parts(block_md: str) -> list[str]:
    """Split Markdown around its figures, so each figure, with its caption,
    can have a slide to itself and fill the screen."""
    parts: list[list[str]] = [[]]
    lines = block_md.split("\n")
    i = 0
    while i < len(lines):
        if lines[i].startswith("!["):
            figure = [lines[i]]
            j = i + 1
            while j < len(lines) and not lines[j].strip():
                j += 1
            if j < len(lines) and lines[j].startswith("<sub><em>"):
                figure += ["", lines[j]]
                i = j
            parts += [figure, []]
        else:
            parts[-1].append(lines[i])
        i += 1
    return [text for text in ("\n".join(part).strip() for part in parts) if text]


def text_blocks(markdown: str) -> list[str]:
    """Blank-line separated blocks, never splitting a code fence or an HTML
    block such as lens cards or a flow strip."""
    blocks: list[str] = []
    current: list[str] = []
    fence = False
    depth = 0
    for line in markdown.split("\n"):
        stripped = line.strip()
        if stripped.startswith("```"):
            fence = not fence
        elif not fence:
            depth += len(re.findall(r"<(?:div|ol|ul|table|details)\b", stripped))
            depth -= len(re.findall(r"</(?:div|ol|ul|table|details)>", stripped))
        if not stripped and not fence and depth <= 0:
            if current:
                blocks.append("\n".join(current))
            current = []
        else:
            current.append(line)
    if current:
        blocks.append("\n".join(current))
    return [b for b in blocks if b.strip() != "---"]


def text_slides(markdown: str) -> list[str]:
    """Pack blocks into slides of about SLIDE_WORDS words. A heading, a
    sentence ending in a colon, or a one-line lead-in stays with the block
    it introduces."""
    slides: list[list[str]] = []
    current: list[str] = []
    count = 0
    for block in text_blocks(markdown):
        words = word_count(block) + sum(FOCUS_WEIGHT * word_count(k) for k in KEY_RE.findall(block))
        if (current and count + words > SLIDE_WORDS
                and sum(word_count(b) for b in current) >= MIN_WORDS):
            carry: list[str] = []
            while current and (current[-1].lstrip().startswith("#")
                               or KEY_RE.sub("", current[-1]).rstrip().endswith(":")
                               or word_count(current[-1]) <= 12):
                carry.insert(0, current.pop())
            if current:
                slides.append(current)
                current = carry
                count = sum(word_count(b) + sum(FOCUS_WEIGHT * word_count(k) for k in KEY_RE.findall(b))
                            for b in carry)
            else:
                current = carry
        current.append(block)
        count += words
    if current:
        if slides and sum(word_count(b) for b in current) < MIN_WORDS:
            slides[-1] += current
        else:
            slides.append(current)
    return ["\n\n".join(slide) for slide in slides]


def build_deck(md_path: Path) -> str | None:
    """A week with "deck: yes" also gets deck.html: the whole page, in page
    order, as slides. Each section opens with its heading; ordinary text is
    set at reading size, a few paragraphs to a slide; each focus block is a
    slide of its own at display size; each figure gets a slide to itself."""
    meta, body = front_matter(md_path.read_text(encoding="utf-8"))
    if meta.get("deck", "").lower() not in ("yes", "true"):
        return None
    opening_md, beats, tail_md = split_page(md_path, body)

    sections: list[tuple[str, str, str]] = [("This week", "./", opening_md)]
    sections += [(title, f"./#{slugify(title)}", rest_md) for _, title, rest_md in beats]
    # The tail is ordinary Markdown; each of its "## " headings opens a section.
    tail_title, tail_lines = "", []
    for line in tail_md.strip().split("\n") + ["## "]:
        if line.startswith("## "):
            if "\n".join(tail_lines).strip():
                sections.append((tail_title or "This week", "./", "\n".join(tail_lines)))
            tail_title, tail_lines = line[3:].strip(), []
        else:
            tail_lines.append(line)

    slides: list[dict] = []
    warnings: list[str] = []
    for section, href, md in sections:
        first = len(slides)
        pending: list[str] = []  # text blocks still waiting for a slide

        def add(kind: str, prose: str = "", focus: str = "") -> None:
            cost = word_count(prose) + FOCUS_WEIGHT * word_count(focus)
            heading = section if len(slides) == first and section != "This week" else ""
            slides.append({"section": section, "href": href, "kind": kind,
                           "heading": heading, "prose": prose, "focus": focus, "cost": cost})

        def flush() -> None:
            # Text after a focus block closes that block's slide when it fits;
            # otherwise it gets slides of its own.
            text = "\n\n".join(pending)
            pending.clear()
            if not text:
                return
            last = slides[-1] if len(slides) > first else None
            if last and last["kind"] == "focus" and last["cost"] + word_count(text) <= SLIDE_WORDS:
                last["after"] = text
                last["cost"] += word_count(text)
                return
            for chunk in text_slides(text):
                keys = KEY_RE.findall(chunk)
                for key in keys:
                    if plain(key) not in plain(KEY_RE.sub("", chunk)):
                        raise SystemExit(f"{md_path}: key sentence not found in its slide's text:\n  {key}")
                if len(keys) != 1:
                    warnings.append(f"{len(keys)} key sentences on a slide in {section!r}: "
                                    + plain(KEY_RE.sub("", chunk))[:70])
                if keys:
                    # A key sentence that is the slide's whole text is not
                    # repeated under itself.
                    rest = "" if plain(KEY_RE.sub("", chunk)) == plain(keys[0]) else chunk
                    add("key", prose=rest, focus="> **" + keys[0].replace("**", "") + "**")
                else:
                    add("text", prose=chunk)

        for is_focus, text in segments(md):
            for part in slide_parts(text):
                if "![" in part:
                    # A figure, or a table of pictures, has the slide to itself.
                    flush()
                    add("figure", focus=part)
                elif not is_focus:
                    pending.extend(text_blocks(part))
                else:
                    # The text leading into a focus block shares its slide, as
                    # much of it as fits; anything earlier goes before it.
                    room = SLIDE_WORDS - FOCUS_WEIGHT * word_count(part)
                    i, words = len(pending), 0
                    while i > 0 and words + word_count(pending[i - 1]) <= room:
                        i -= 1
                        words += word_count(pending[i])
                    while 0 < i < len(pending) and (pending[i - 1].lstrip().startswith("#")
                                                    or pending[i - 1].rstrip().endswith(":")):
                        i -= 1
                    lead = "\n\n".join(pending[i:])
                    del pending[i:]
                    flush()
                    add("focus", prose=lead, focus=part)
        flush()

    def slide_html(sl: dict) -> str:
        inner = ""
        if sl.get("heading"):
            inner += f'<h2 class="slide__title">{inline(sl["heading"])}</h2>'
        if sl["kind"] == "key":
            sl = dict(sl, after=sl["prose"], prose="")
        if sl.get("prose"):
            inner += f'<div class="slide__prose">{render(sl["prose"])[0]}</div>'
        if sl.get("focus"):
            inner += f'<div class="focus-block">{render(sl["focus"])[0]}</div>'
        if sl.get("after"):
            inner += f'<div class="slide__prose">{render(sl["after"])[0]}</div>'
        return (
            f'<section class="slide slide--{sl["kind"]}">'
            f'<a class="slide__section" href="{sl["href"]}">{inline(sl["section"])}</a>'
            f'<div class="slide__body">{inner}</div>'
            f"</section>"
        )

    for warning in warnings:
        print(f"  {md_path.stem} deck: {warning}", file=sys.stderr)

    question = meta.get("question", "")
    title_slide = (
        f'<section class="slide slide--cover">'
        f'<p class="eyebrow">{html.escape(meta.get("eyebrow", ""), quote=True)}</p>'
        f'<h1>{inline(meta.get("title", md_path.stem))}</h1>'
        + (f'<p class="week-question">{inline(question)}</p>' if question else "")
        + "</section>"
    )
    # Links to a section of the page point at the page, not at the deck.
    deck_html = "\n".join([title_slide] + [slide_html(sl) for sl in slides])
    deck_html = deck_html.replace('href="#', 'href="./#')

    parts = {
        "TITLE": html.escape(meta.get("title", md_path.stem), quote=True),
        "SLIDES": deck_html,
    }
    page = DECK_TEMPLATE.read_text(encoding="utf-8")
    for key, value in parts.items():
        page = page.replace("{{" + key + "}}", value)
    return page


def main() -> None:
    targets = sys.argv[1:]
    files = sorted(WEEKS.glob("*.md"))
    if targets:
        files = [f for f in files if f.stem in targets]
        if not files:
            raise SystemExit(f"no week source matched: {', '.join(targets)}")

    for md in files:
        out_dir = WEEKS / md.stem
        out_dir.mkdir(parents=True, exist_ok=True)
        out = out_dir / "index.html"
        out.write_text(build_page(md), encoding="utf-8")
        print(f"built {out.relative_to(ROOT)}  ({out.stat().st_size // 1024} KB)")
        deck = build_deck(md)
        if deck:
            out = out_dir / "deck.html"
            out.write_text(deck, encoding="utf-8")
            print(f"built {out.relative_to(ROOT)}  ({out.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
