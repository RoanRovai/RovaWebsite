const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Cookie consent and optional analytics
const cookieBanner = document.getElementById("cookie-banner");
const cookieAccept = document.getElementById("cookie-accept");
const cookieDecline = document.getElementById("cookie-decline");
let analyticsLoaded = false;

function loadAnalytics() {
  if (analyticsLoaded) return;
  analyticsLoaded = true;

  const GA_ID = "G-H6KLLQW07C";
  const analyticsScript = document.createElement("script");
  analyticsScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  analyticsScript.async = true;
  document.head.appendChild(analyticsScript);
  analyticsScript.addEventListener("load", () => {
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    gtag("js", new Date());
    gtag("config", GA_ID, { anonymize_ip: true });
  });
}

if (cookieBanner) {
  const consent = localStorage.getItem("cookie-consent");
  if (!consent) {
    window.setTimeout(() => cookieBanner.classList.remove("hidden"), 900);
  } else if (consent === "accepted") {
    loadAnalytics();
  }

  cookieAccept?.addEventListener("click", () => {
    localStorage.setItem("cookie-consent", "accepted");
    cookieBanner.classList.add("hidden");
    loadAnalytics();
  });

  cookieDecline?.addEventListener("click", () => {
    localStorage.setItem("cookie-consent", "declined");
    cookieBanner.classList.add("hidden");
  });
}

// Navigation
const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

function setMenu(open) {
  if (!menuButton || !navLinks) return;
  navLinks.classList.toggle("open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Menu sluiten" : "Menu openen");
  document.body.classList.toggle("menu-open", open);
}

menuButton?.addEventListener("click", () => {
  setMenu(menuButton.getAttribute("aria-expanded") !== "true");
});

navLinks?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenu(false);
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 960) setMenu(false);
});

// Dynamic year
document.querySelectorAll("#year").forEach((element) => {
  element.textContent = new Date().getFullYear();
});

// Back to top
const backToTop = document.getElementById("back-to-top");

backToTop?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
});

// Contact form
const contactForm = document.getElementById("contact-form");

if (contactForm) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitButton = contactForm.querySelector("button[type='submit']");
    const success = contactForm.querySelector(".form-success");
    const errorMessage = contactForm.querySelector(".form-error");
    const originalLabel = submitButton?.textContent || "Verstuur bericht";

    if (submitButton) {
      submitButton.textContent = "Even versturen…";
      submitButton.disabled = true;
    }
    if (success) success.style.display = "none";
    if (errorMessage) errorMessage.style.display = "none";

    try {
      const response = await fetch("https://formspree.io/f/xaqlepyb", {
        method: "POST",
        body: new FormData(contactForm),
        headers: { Accept: "application/json" },
      });

      if (!response.ok) throw new Error("Form submission failed");

      contactForm.reset();
      if (submitButton) submitButton.style.display = "none";
      if (success) success.style.display = "block";
    } catch {
      if (submitButton) {
        submitButton.textContent = originalLabel;
        submitButton.disabled = false;
      }
      if (errorMessage) errorMessage.style.display = "block";
    }
  });
}

// Scroll reveal, staggered per group
const revealElements = [...document.querySelectorAll(".reveal, .fade-in")];

revealElements.forEach((element) => {
  const siblings = [...element.parentElement.children].filter((item) => item.matches(".reveal, .fade-in"));
  const index = siblings.indexOf(element);
  const explicitDelay = element.dataset.revealDelay;
  element.style.setProperty("--reveal-delay", explicitDelay ? `${explicitDelay}ms` : `${Math.min(index * 90, 270)}ms`);
});

if ("IntersectionObserver" in window && !prefersReducedMotion) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("in-view", "visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("in-view", "visible"));
}

// Pointer spotlight on service cards
document.querySelectorAll(".spotlight-card").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mouse-x", `${event.clientX - rect.left}px`);
    card.style.setProperty("--mouse-y", `${event.clientY - rect.top}px`);
  });
});

// Subtle depth on the hero visual
const tiltElement = document.querySelector("[data-tilt]");

if (tiltElement && !prefersReducedMotion) {
  tiltElement.addEventListener("pointermove", (event) => {
    if (window.innerWidth < 960) return;
    const rect = tiltElement.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    tiltElement.style.transform = `rotateX(${-y * 3.5}deg) rotateY(${x * 4.5}deg)`;
  });

  tiltElement.addEventListener("pointerleave", () => {
    tiltElement.style.transform = "rotateX(0deg) rotateY(0deg)";
  });
}

// Scroll progress, parallax and the sticky process story
const progressBar = document.createElement("div");
progressBar.className = "scroll-progress";
progressBar.setAttribute("aria-hidden", "true");
document.body.appendChild(progressBar);

const parallaxElements = [...document.querySelectorAll("[data-parallax]")];
const processSection = document.querySelector(".process-story");
const processSteps = [...document.querySelectorAll("[data-process-step]")];
const meterNumber = document.querySelector(".meter-ring span");
const meterLabel = document.querySelector(".meter-copy strong");
let scrollFrame = 0;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function updateProcessStory() {
  if (!processSection || !processSteps.length) return;

  const rect = processSection.getBoundingClientRect();
  const scrollable = Math.max(processSection.offsetHeight - window.innerHeight, 1);
  const progress = clamp(-rect.top / scrollable, 0, 1);
  processSection.style.setProperty("--process-progress", progress.toFixed(3));

  const viewportFocus = window.innerHeight * 0.53;
  let activeIndex = 0;
  let smallestDistance = Number.POSITIVE_INFINITY;

  processSteps.forEach((step, index) => {
    const stepRect = step.getBoundingClientRect();
    const stepCenter = stepRect.top + stepRect.height / 2;
    const distance = Math.abs(stepCenter - viewportFocus);
    if (distance < smallestDistance) {
      smallestDistance = distance;
      activeIndex = index;
    }
  });

  processSteps.forEach((step, index) => step.classList.toggle("active", index === activeIndex));
  if (meterNumber) meterNumber.textContent = String(activeIndex + 1).padStart(2, "0");
  if (meterLabel) meterLabel.textContent = processSteps[activeIndex].dataset.stepLabel || "";
}

function updateOnScroll() {
  const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
  const pageProgress = scrollMax > 0 ? window.scrollY / scrollMax : 0;
  progressBar.style.transform = `scaleX(${pageProgress})`;
  header?.classList.toggle("scrolled", window.scrollY > 12);
  backToTop?.classList.toggle("visible", window.scrollY > window.innerHeight * 0.6);

  if (!prefersReducedMotion && window.innerWidth > 760) {
    const viewportCenter = window.innerHeight / 2;
    parallaxElements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      const strength = Number.parseFloat(element.dataset.parallax || "0");
      const elementCenter = rect.top + rect.height / 2;
      const offset = clamp((elementCenter - viewportCenter) * strength, -85, 85);
      element.style.setProperty("--parallax-y", `${offset.toFixed(2)}px`);
    });
  }

  updateProcessStory();
  scrollFrame = 0;
}

function requestScrollUpdate() {
  if (scrollFrame) return;
  scrollFrame = window.requestAnimationFrame(updateOnScroll);
}

window.addEventListener("scroll", requestScrollUpdate, { passive: true });
window.addEventListener("resize", requestScrollUpdate);
updateOnScroll();
