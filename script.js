// Mobile menu
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