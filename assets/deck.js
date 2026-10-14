/* CT319 slide decks. One slide at a time: arrows, space, PageUp/PageDown
   (so a clicker works) or a swipe to move; F for fullscreen. The slide number
   sits in the URL, so a reload keeps your place. */
(function () {
  var slides = Array.prototype.slice.call(document.querySelectorAll(".slide"));
  var count = document.querySelector(".deck__count");
  var current = 0;

  // Blow each figure up to the slide's width, then give back height until
  // the slide fits the screen. Anything else too tall scrolls.
  function fit(slide) {
    var body = slide.querySelector(".slide__body");
    if (!body) return;
    var imgs = Array.prototype.slice.call(body.querySelectorAll(".focus-block figure img"))
      .filter(function (img) { return img.naturalWidth && img.naturalHeight; });
    if (!imgs.length) return;
    imgs.forEach(function (img) { img.style.width = body.clientWidth + "px"; });
    var over = slide.scrollHeight - slide.clientHeight;
    if (over > 0) {
      imgs.forEach(function (img) {
        var aspect = img.naturalWidth / img.naturalHeight;
        var w = body.clientWidth - (over / imgs.length) * aspect;
        img.style.width = Math.max(body.clientWidth * 0.3, w) + "px";
      });
    }
  }

  function show(i) {
    current = Math.max(0, Math.min(slides.length - 1, i));
    slides.forEach(function (s, j) { s.classList.toggle("is-current", j === current); });
    fit(slides[current]);
    slides[current].scrollTop = 0;
    count.textContent = (current + 1) + " / " + slides.length;
    history.replaceState(null, "", "#" + (current + 1));
  }

  document.addEventListener("keydown", function (e) {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    var k = e.key;
    if (k === "ArrowRight" || k === "ArrowDown" || k === "PageDown" || k === " ") show(current + 1);
    else if (k === "ArrowLeft" || k === "ArrowUp" || k === "PageUp") show(current - 1);
    else if (k === "Home") show(0);
    else if (k === "End") show(slides.length - 1);
    else if (k === "f" || k === "F") {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen();
    } else return;
    e.preventDefault();
  });

  var x0 = null;
  document.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  document.addEventListener("touchend", function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    x0 = null;
  });

  window.addEventListener("resize", function () { fit(slides[current]); });
  // Images change a slide's height once they load.
  document.querySelectorAll(".slide img").forEach(function (img) {
    img.addEventListener("load", function () { fit(slides[current]); });
  });

  show((parseInt(location.hash.slice(1), 10) || 1) - 1);
})();
