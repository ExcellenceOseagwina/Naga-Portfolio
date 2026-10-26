document.documentElement.classList.add("js");
const header = document.querySelector("header");

function updateHeaderHeight() {
  document.documentElement.style.setProperty("--header-h", `${header.offsetHeight}px`);
}

updateHeaderHeight();
window.addEventListener("resize", updateHeaderHeight);
window.addEventListener("load", updateHeaderHeight); // logo image may change the height

const menuBtn = document.querySelector(".menu-btn");
const navList = document.querySelector(".nav-list");

function setMenu(open) {
  navList.classList.toggle("active", open);
  menuBtn.setAttribute("aria-expanded", String(open));

  const icon = menuBtn.querySelector("i");
  icon.classList.toggle("fa-bars", !open);
  icon.classList.toggle("fa-xmark", open);
}

menuBtn.addEventListener("click", () => {
  setMenu(!navList.classList.contains("active"));
});

// Close after choosing a link
navList.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

// Close on outside click
document.addEventListener("click", (event) => {
  if (!navList.classList.contains("active")) return;
  if (!header.contains(event.target)) setMenu(false);
});

// Close on Escape (only when the lightbox is not the thing handling Escape)
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && navList.classList.contains("active")) setMenu(false);
});

// Close if the viewport grows back to desktop width
window.addEventListener("resize", () => {
  if (window.innerWidth > 900) setMenu(false);
});

const revealEls = document.querySelectorAll(".reveal");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!("IntersectionObserver" in window) || prefersReducedMotion) {
  // No animation possible/wanted: just show everything.
  revealEls.forEach((el) => el.classList.add("active"));
} else {
  // Track direction in the scroll handler itself. The old code compared values AFTER the
  // scroll listener had already overwritten them, so it always thought you scrolled up.
  let lastY = window.scrollY;
  let direction = "down";

  window.addEventListener(
    "scroll",
    () => {
      const y = window.scrollY;
      if (y !== lastY) {
        direction = y > lastY ? "down" : "up";
        lastY = y;
      }
    },
    { passive: true }
  );

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const el = entry.target;

        if (entry.isIntersecting) {
          el.classList.remove("reveal-up", "reveal-down");
          el.classList.add(direction === "down" ? "reveal-up" : "reveal-down");

          void el.offsetWidth; // force a reflow so the starting offset is painted before "active"
          el.classList.add("active");
        } else {
          // Reset so the animation can repeat
          el.classList.remove("active", "reveal-up", "reveal-down");
        }
      });
    },
    {
      // threshold 0 + rootMargin: works for very tall sections (e.g. Projects on a phone),
      // where "15% visible" could be taller than the screen and never trigger.
      threshold: 0,
      rootMargin: "0px 0px -10% 0px",
    }
  );

  revealEls.forEach((el) => revealObserver.observe(el));
}
document.querySelectorAll(".view-more").forEach((button) => {
  const grid = document.getElementById(button.getAttribute("aria-controls"));
  if (!grid) return;

  const extras = grid.querySelectorAll(".extra");

  // Nothing extra in this category -> no button needed
  if (extras.length === 0) {
    button.hidden = true;
    return;
  }

  button.addEventListener("click", () => {
    const expanding = button.getAttribute("aria-expanded") === "false";

    extras.forEach((item) => {
      item.hidden = !expanding;
    });

    button.setAttribute("aria-expanded", String(expanding));
    button.textContent = expanding ? "View Less" : "View More";

    // Collapsing from far down the grid? Keep the user oriented.
    if (!expanding) {
      const top = grid.getBoundingClientRect().top;
      if (top < 0) grid.scrollIntoView({ block: "start" });
    }
  });
});

const lightbox = document.getElementById("projectLightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxTitle = document.getElementById("lightboxTitle");
const lightboxCounter = document.getElementById("lightboxCounter");

const closeButton = lightbox.querySelector(".lightbox-close");
const previousButton = lightbox.querySelector(".lightbox-prev");
const nextButton = lightbox.querySelector(".lightbox-next");

let activeGallery = [];
let activeIndex = 0;

function getGallery(category) {
  return [...document.querySelectorAll(".project-item")].filter(
    (item) => item.dataset.gallery === category && !item.hidden
  );
}

function showImage(index) {
  if (!activeGallery.length) return;

  activeIndex = (index + activeGallery.length) % activeGallery.length;

  const item = activeGallery[activeIndex];
  const thumb = item.querySelector("img");

  // Optional: add data-full="path/to/large.jpg" on a .project-item to show a bigger file in the lightbox
  lightboxImage.src = item.dataset.full || thumb.currentSrc || thumb.src;
  lightboxImage.alt = thumb.alt;
  lightboxTitle.textContent = item.dataset.title || thumb.alt;
  lightboxCounter.textContent = `${activeIndex + 1} / ${activeGallery.length}`;

  const single = activeGallery.length < 2;
  previousButton.disabled = single;
  nextButton.disabled = single;

  const total = activeGallery.length;
  const prevNumber = ((activeIndex - 1 + total) % total) + 1;
  const nextNumber = ((activeIndex + 1) % total) + 1;
  previousButton.setAttribute("aria-label", `Previous image, ${prevNumber} of ${total}`);
  nextButton.setAttribute("aria-label", `Next image, ${nextNumber} of ${total}`);
}

lightboxImage.addEventListener("error", () => {
  lightboxTitle.textContent = "Image failed to load";
});

function openLightbox(item) {
  activeGallery = getGallery(item.dataset.gallery);
  showImage(activeGallery.indexOf(item));

  lightbox.showModal();                    // native focus trap, Esc to close, inert page behind
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  if (lightbox.open) lightbox.close();
}

// Runs for every way of closing (button, Esc, backdrop) and restores the page.
lightbox.addEventListener("close", () => {
  document.body.style.overflow = "";
  lightboxImage.removeAttribute("src");
  activeGallery = [];
  // <dialog> returns focus to the thumbnail that opened it automatically.
});

// Event delegation: works for every item, including ones added later.
document.querySelector(".projects-container").addEventListener("click", (event) => {
  const item = event.target.closest(".project-item");
  if (item) openLightbox(item);
});

previousButton.addEventListener("click", () => showImage(activeIndex - 1));
nextButton.addEventListener("click", () => showImage(activeIndex + 1));
closeButton.addEventListener("click", closeLightbox);

// Click on the dark backdrop (the dialog element itself, not its children) closes it.
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});

// Arrow-key navigation while open (Esc is handled natively by <dialog>).
document.addEventListener("keydown", (event) => {
  if (!lightbox.open) return;

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    showImage(activeIndex - 1);
  } else if (event.key === "ArrowRight") {
    event.preventDefault();
    showImage(activeIndex + 1);
  }
});