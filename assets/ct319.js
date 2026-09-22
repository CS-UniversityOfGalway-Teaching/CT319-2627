/* CT319 teaching pages — progressive enhancement only.
   The page is fully usable with JavaScript disabled: the teaching beats are
   native <details> elements, so they open, close and take keyboard focus
   without any of this file. This adds Expand all / Collapse all and makes
   links into a collapsed beat work. */

(function () {
  "use strict";

  var beats = Array.prototype.slice.call(document.querySelectorAll("details.beat"));
  if (!beats.length) return;

  var bar = document.querySelector("[data-beat-bar]");
  var expandBtn = document.querySelector("[data-expand-all]");
  var collapseBtn = document.querySelector("[data-collapse-all]");

  function setAll(open) {
    beats.forEach(function (b) { b.open = open; });
  }

  if (expandBtn) {
    expandBtn.addEventListener("click", function () { setAll(true); });
  }

  if (collapseBtn) {
    collapseBtn.addEventListener("click", function () {
      setAll(false);
      // Bring the outline back into view so the class can see the structure.
      var first = beats[0];
      if (first && first.getBoundingClientRect().top < 0) {
        first.scrollIntoView({ block: "start", behavior: "auto" });
      }
    });
  }

  /* Open whichever beat contains the element a link points at, so that
     in-page links and shared URLs land on visible content. */
  function revealTarget(hash) {
    if (!hash || hash.length < 2) return;
    var target;
    try {
      target = document.getElementById(decodeURIComponent(hash.slice(1)));
    } catch (e) {
      return;
    }
    if (!target) return;
    var node = target;
    while (node && node !== document.body) {
      if (node.tagName === "DETAILS") node.open = true;
      node = node.parentNode;
    }
    // Re-scroll: the browser measured position before the beat opened.
    window.requestAnimationFrame(function () {
      target.scrollIntoView({ block: "start", behavior: "auto" });
    });
  }

  window.addEventListener("hashchange", function () { revealTarget(location.hash); });

  /* ?open=all renders the page as flat revision notes on load. */
  if (/(^|[?&])open=all(&|$)/.test(location.search)) setAll(true);

  if (location.hash) revealTarget(location.hash);

  /* Reveal beats for in-page find, where the browser supports it. */
  beats.forEach(function (b) {
    b.addEventListener("beforematch", function () { b.open = true; });
  });

  /* Printing should produce complete notes, not a list of headings. Open
     everything for the print job, then put it back as the reader had it. */
  var beforePrintState = null;
  window.addEventListener("beforeprint", function () {
    beforePrintState = beats.map(function (b) { return b.open; });
    setAll(true);
  });
  window.addEventListener("afterprint", function () {
    if (!beforePrintState) return;
    beats.forEach(function (b, i) { b.open = beforePrintState[i]; });
    beforePrintState = null;
  });

  if (bar) bar.removeAttribute("hidden");
})();

/* Copy buttons on prompt blocks. Injected rather than rendered into the page:
   with JavaScript off there is no clipboard to write to, so a button that
   did nothing would be worse than no button at all. */
(function () {
  "use strict";

  var blocks = Array.prototype.slice.call(document.querySelectorAll(".prompt[data-copy]"));
  if (!blocks.length) return;

  function write(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    // Older Safari, and any page not served over https.
    return new Promise(function (resolve, reject) {
      var area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.top = "-1000px";
      document.body.appendChild(area);
      area.select();
      try {
        document.execCommand("copy") ? resolve() : reject();
      } catch (err) {
        reject(err);
      }
      document.body.removeChild(area);
    });
  }

  blocks.forEach(function (block) {
    var source = block.querySelector("pre");
    if (!source) return;

    var button = document.createElement("button");
    button.type = "button";
    button.className = "prompt__copy";
    button.innerHTML =
      '<svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true" focusable="false">' +
      '<path fill="currentColor" d="M5 1.5A1.5 1.5 0 0 1 6.5 0h6A1.5 1.5 0 0 1 14 1.5v8a1.5 1.5 0 0 1-1.5 1.5h-6A1.5 1.5 0 0 1 5 9.5v-8Zm1.5-.5a.5.5 0 0 0-.5.5v8a.5.5 0 0 0 .5.5h6a.5.5 0 0 0 .5-.5v-8a.5.5 0 0 0-.5-.5h-6Z"/>' +
      '<path fill="currentColor" d="M2 5a1.5 1.5 0 0 1 1.5-1.5H4V5h-.5a.5.5 0 0 0-.5.5v8a.5.5 0 0 0 .5.5h6a.5.5 0 0 0 .5-.5V13h1.5v.5A1.5 1.5 0 0 1 10 15H3.5A1.5 1.5 0 0 1 2 13.5V5Z"/>' +
      '</svg><span>Copy</span>';

    var label = button.querySelector("span");
    var reset;

    button.addEventListener("click", function () {
      write(source.innerText).then(
        function () { say("Copied"); },
        function () { say("Press ⌘C"); }
      );
    });

    function say(text) {
      label.textContent = text;
      button.classList.add("is-done");
      window.clearTimeout(reset);
      reset = window.setTimeout(function () {
        label.textContent = "Copy";
        button.classList.remove("is-done");
      }, 1600);
    }

    block.appendChild(button);
  });
})();
