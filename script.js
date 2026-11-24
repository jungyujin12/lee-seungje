const scroller = document.querySelector(".slides");
const chapters = [...document.querySelectorAll(".slide")];
const railLinks = [...document.querySelectorAll(".rail-tracks a")];
const currentNumber = document.querySelector(".rail-current");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let activeIndex = 0;
let ticking = false;

function setActive(index) {
  if (index === activeIndex && chapters[index].classList.contains("is-active")) return;
  activeIndex = index;
  document.body.classList.toggle("site-light", ["form", "lookbook", "process", "contact"].includes(chapters[index].id));
  chapters.forEach((chapter, chapterIndex) => {
    chapter.classList.toggle("is-active", chapterIndex === index);
  });
  railLinks.forEach((link, linkIndex) => {
    link.classList.toggle("active", linkIndex === index);
    if (linkIndex === index) link.setAttribute("aria-current", "true");
    else link.removeAttribute("aria-current");
  });
  currentNumber.textContent = String(index + 1).padStart(2, "0");
}

function findActive() {
  const middle = scroller.scrollTop + scroller.clientHeight / 2;
  let closest = 0;
  let distance = Infinity;
  chapters.forEach((chapter, index) => {
    const center = chapter.offsetTop + chapter.offsetHeight / 2;
    const nextDistance = Math.abs(center - middle);
    if (nextDistance < distance) {
      closest = index;
      distance = nextDistance;
    }
  });
  setActive(closest);
  ticking = false;
}

scroller.addEventListener("scroll", () => {
  if (!ticking) {
    requestAnimationFrame(findActive);
    ticking = true;
  }
}, { passive: true });

railLinks.forEach((link, index) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    scroller.scrollTop = chapters[index].offsetTop;
    setActive(index);
    history.replaceState(null, "", link.getAttribute("href"));
  });
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  if (link.closest(".rail-tracks")) return;
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    scroller.scrollTop = target.offsetTop;
    setActive(chapters.indexOf(target));
    history.replaceState(null, "", link.getAttribute("href"));
  });
});

window.addEventListener("keydown", (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  if (["ArrowDown", "PageDown"].includes(event.key) && activeIndex < chapters.length - 1) {
    event.preventDefault();
    scroller.scrollTop = chapters[activeIndex + 1].offsetTop;
    setActive(activeIndex + 1);
  } else if (["ArrowUp", "PageUp"].includes(event.key) && activeIndex > 0) {
    event.preventDefault();
    scroller.scrollTop = chapters[activeIndex - 1].offsetTop;
    setActive(activeIndex - 1);
  }
});

const strip = document.querySelector(".look-strip");
const cards = [...strip.querySelectorAll(".look-card")];
const previous = document.querySelector('[data-look-nav="prev"]');
const next = document.querySelector('[data-look-nav="next"]');

function lookIndex() {
  const midpoint = strip.scrollLeft + strip.clientWidth / 2;
  let best = 0;
  let distance = Infinity;
  cards.forEach((card, index) => {
    const delta = Math.abs(card.offsetLeft + card.offsetWidth / 2 - midpoint);
    if (delta < distance) {
      best = index;
      distance = delta;
    }
  });
  return best;
}

function updateLookButtons() {
  previous.disabled = strip.scrollLeft <= 2;
  next.disabled = strip.scrollLeft + strip.clientWidth >= strip.scrollWidth - 2;
}

previous.addEventListener("click", () => {
  cards[Math.max(0, lookIndex() - 1)].scrollIntoView({ behavior: reducedMotion.matches ? "instant" : "smooth", inline: "center", block: "nearest" });
});
next.addEventListener("click", () => {
  cards[Math.min(cards.length - 1, lookIndex() + 1)].scrollIntoView({ behavior: reducedMotion.matches ? "instant" : "smooth", inline: "center", block: "nearest" });
});
strip.addEventListener("scroll", updateLookButtons, { passive: true });
window.addEventListener("resize", () => { findActive(); updateLookButtons(); });

function openHash() {
  if (!location.hash) return;
  const start = document.querySelector(location.hash);
  if (!start) return;
  scroller.scrollTop = start.offsetTop;
  setActive(chapters.indexOf(start));
}
window.addEventListener("load", openHash);
window.addEventListener("hashchange", openHash);
openHash();
findActive();
updateLookButtons();
