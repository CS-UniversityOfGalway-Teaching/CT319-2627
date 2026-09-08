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
URL_DEST = r"(?:[^()\s]+|\([^()\s]*\))+"


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
IMAGE_ONLY_RE = re.compile(r"^!\[([^\]]*)\]\((" + URL_DEST + r")\)\s*$")
LINKED_IMAGE_RE = re.compile(
    r"^\[!\[([^\]]*)\]\((" + URL_DEST + r")\)\]\((" + URL_DEST + r")\)\s*$"
)


class Renderer:
    def __init__(self, lines: list[str]) -> None:
        self.lines = lines
        self.i = 0
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
        cls = f' class="language-{html.escape(lang, quote=True)}"' if lang else ""
        label = f' data-lang="{html.escape(lang, quote=True)}"' if lang else ""
        self.out.append(
            f"<pre{label}><code{cls}>" + html.escape("\n".join(body), quote=False) + "</code></pre>"
        )

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
        self.i += 1
        caption = self.caption_ahead()
        portrait = " is-portrait" if "width=480" in src else ""
        parts = [
            "<figure>",
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
    r = Renderer(markdown.split("\n"))
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


def build_page(md_path: Path) -> str:
    raw = md_path.read_text(encoding="utf-8")
    meta, body = front_matter(raw)

    if BEATS_START not in body:
        raise SystemExit(f"{md_path}: missing {BEATS_START}")
    opening_md, rest = body.split(BEATS_START, 1)
    if BEATS_END in rest:
        beats_md, tail_md = rest.split(BEATS_END, 1)
    else:
        beats_md, tail_md = rest, ""

    opening_html, _ = render(opening_md.strip())

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

    beat_html: list[str] = []
    outline: list[tuple[str, str]] = []
    for is_open, chunk_lines in chunks:
        text = "\n".join(chunk_lines).strip("\n")
        m = re.match(r"^##\s+(.*)$", text.split("\n", 1)[0].strip())
        if not m:
            raise SystemExit(f"{md_path}: a beat does not start with an '## ' heading:\n{text[:120]}")
        title = m.group(1).strip()
        slug = slugify(title)
        rest_md = text.split("\n", 1)[1] if "\n" in text else ""
        inner, _ = render(rest_md.strip())
        outline.append((title, slug))
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
        "HEADING": inline(meta.get("title", md_path.stem)),
        "QUESTION": inline(question) if question else "",
        "OPENING": opening_html,
        "BEATS": "\n".join(beat_html),
        "TAIL": tail_html,
        "SOURCE": html.escape(meta.get("source", md_path.name), quote=True),
    }
    page = template
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


if __name__ == "__main__":
    main()
