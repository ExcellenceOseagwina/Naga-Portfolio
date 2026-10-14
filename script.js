// For Mobile menu
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

// Close menu after clicking a link
navList.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
});

// Close menu with Escape, or when the viewport grows back to desktop width
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMenu(false);
});

window.addEventListener("resize", () => {
    if (window.innerWidth > 900) setMenu(false);
});


//Scroll Down and Up Reveal Effects
let lastScrollY = window.scrollY;

const observer = new IntersectionObserver(
    (entries) => {
        const currentScrollY = window.scrollY;

        const scrollingDown = currentScrollY > lastScrollY;

        entries.forEach((entry) => {
            const element = entry.target;

            if (entry.isIntersecting) {
                element.classList.remove("reveal-up", "reveal-down");

                element.classList.add(
                    scrollingDown ? "reveal-up" : "reveal-down"
                );

                // Trigger the transition
                requestAnimationFrame(() => {
                    element.classList.add("active");
                });
            } else {
                // Reset so the animation can repeat
                element.classList.remove(
                    "active",
                    "reveal-up",
                    "reveal-down"
                );
            }
        });

        lastScrollY = currentScrollY;
    },
    {
        threshold: 0.15
    }
);

document.querySelectorAll(".reveal").forEach((element) => {
    observer.observe(element);
});

window.addEventListener("scroll", () => {
    lastScrollY = window.scrollY;
}, { passive: true }); 


// Image Display and Navigation

const lightbox = document.getElementById("projectLightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxTitle = document.getElementById("lightboxTitle");
const lightboxCounter = document.getElementById("lightboxCounter");

const closeButton = lightbox.querySelector(".lightbox-close");
const previousButton = lightbox.querySelector(".lightbox-prev");
const nextButton = lightbox.querySelector(".lightbox-next");

const projectItems = [...document.querySelectorAll(".project-item")];

let activeGallery = [];
let activeIndex = 0;
let previousFocus = null;

function showImage(index) {
  if (!activeGallery.length) return;

  activeIndex = (index + activeGallery.length) % activeGallery.length;

  const item = activeGallery[activeIndex];
  const image = item.querySelector("img");

  lightboxImage.src = image.currentSrc || image.src;
  lightboxImage.alt = image.alt;
  lightboxTitle.textContent = item.dataset.title || image.alt;
  lightboxCounter.textContent =
    `${activeIndex + 1} / ${activeGallery.length}`;

  previousButton.disabled = activeGallery.length < 2;
  nextButton.disabled = activeGallery.length < 2;

  previousButton.setAttribute(
    "aria-label",
    `Previous image, ${activeIndex === 0 ? activeGallery.length : activeIndex} of ${activeGallery.length}`
  );

  nextButton.setAttribute(
    "aria-label",
    `Next image, ${(activeIndex + 1) % activeGallery.length + 1} of ${activeGallery.length}`
  );
}

function openLightbox(item) {
  const category = item.dataset.gallery;

  activeGallery = projectItems.filter(
    project => project.dataset.gallery === category
  );

  activeIndex = activeGallery.indexOf(item);
  previousFocus = item;

  showImage(activeIndex);

  lightbox.inert = false;
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  closeButton.focus();
}

function closeLightbox() {
  if (lightbox.getAttribute("aria-hidden") === "true") return;

  lightbox.setAttribute("aria-hidden", "true");
  lightbox.inert = true;
  document.body.style.overflow = "";

  lightboxImage.removeAttribute("src");
  activeGallery = [];

  if (previousFocus) {
    previousFocus.focus();
  }
}

projectItems.forEach(item => {
  item.addEventListener("click", () => openLightbox(item));
});

previousButton.addEventListener("click", () => {
  showImage(activeIndex - 1);
});

nextButton.addEventListener("click", () => {
  showImage(activeIndex + 1);
});

closeButton.addEventListener("click", closeLightbox);

// Close only when the dark backdrop itself is clicked.
lightbox.addEventListener("click", event => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});

// Keyboard navigation.
document.addEventListener("keydown", event => {
  if (lightbox.getAttribute("aria-hidden") !== "false") return;

  if (event.key === "Escape") {
    event.preventDefault();
    closeLightbox();
  } else if (event.key === "ArrowLeft") {
    event.preventDefault();
    showImage(activeIndex - 1);
  } else if (event.key === "ArrowRight") {
    event.preventDefault();
    showImage(activeIndex + 1);
  } else if (event.key === "Tab") {
    // Keep keyboard focus within the modal.
    const controls = [
      closeButton,
      previousButton,
      nextButton
    ].filter(control => !control.disabled);

    const first = controls[0];
    const last = controls[controls.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});
