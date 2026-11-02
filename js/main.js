/**
 * Lama Studio — main.js
 * Vanilla JavaScript
 * Small, independent functions for each interaction.
 */

import { initMobileMenu, initScrollSpy } from "./navigation.js";


/* =========================================================
   HERO LIGHT ANIMATION
========================================================= */

function initHeroLights() {

  const hero = document.querySelector(".hero");
  const primaryLight = document.querySelector(".hero-light");
  const secondaryLight = document.querySelector(".hero-light--secondary");

  if (!hero || !primaryLight || !secondaryLight) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (prefersReducedMotion) {
    primaryLight.style.transform = "translate3d(-50%, -50%, 0)";
    secondaryLight.style.transform = "translate3d(-50%, -50%, 0)";
    return;
  }


  /* =========================
     SETTINGS
  ========================== */

  const MOUSE_STRENGTH = 0.32;
  const SECONDARY_MOUSE_STRENGTH = 0.18;

  const PRIMARY_SMOOTHNESS = 0.055;
  const SECONDARY_SMOOTHNESS = 0.025;

  const AMBIENT_X = 70;
  const AMBIENT_Y = 45;

  const AMBIENT_SPEED_X = 0.00035;
  const AMBIENT_SPEED_Y = 0.00027;


  /* =========================
     STATE
  ========================== */

  let targetX = 0;
  let targetY = 0;

  let currentX = 0;
  let currentY = 0;

  let secondaryX = 0;
  let secondaryY = 0;


  /* =========================
     MOUSE
  ========================== */

  hero.addEventListener(
    "pointermove",
    (event) => {

      const rect = hero.getBoundingClientRect();

      targetX = event.clientX - rect.left - rect.width / 2;
      targetY = event.clientY - rect.top - rect.height / 2;

    },
    { passive: true }
  );

  hero.addEventListener(
    "pointerleave",
    () => {

      targetX = 0;
      targetY = 0;

    },
    { passive: true }
  );


  /* =========================
     ANIMATION
  ========================== */

  const startTime = performance.now();

  function animateLight(time) {

    const elapsed = time - startTime;

    const ambientX = Math.sin(elapsed * AMBIENT_SPEED_X) * AMBIENT_X;
    const ambientY = Math.cos(elapsed * AMBIENT_SPEED_Y) * AMBIENT_Y;

    const primaryTargetX = targetX * MOUSE_STRENGTH + ambientX;
    const primaryTargetY = targetY * MOUSE_STRENGTH + ambientY;

    currentX += (primaryTargetX - currentX) * PRIMARY_SMOOTHNESS;
    currentY += (primaryTargetY - currentY) * PRIMARY_SMOOTHNESS;

    const secondaryTargetX = -targetX * SECONDARY_MOUSE_STRENGTH - ambientX * 0.55;
    const secondaryTargetY = -targetY * SECONDARY_MOUSE_STRENGTH - ambientY * 0.55;

    secondaryX += (secondaryTargetX - secondaryX) * SECONDARY_SMOOTHNESS;
    secondaryY += (secondaryTargetY - secondaryY) * SECONDARY_SMOOTHNESS;

    primaryLight.style.transform =
      `translate3d(calc(-50% + ${currentX}px), calc(-50% + ${currentY}px), 0)`;

    secondaryLight.style.transform =
      `translate3d(calc(-50% + ${secondaryX}px), calc(-50% + ${secondaryY}px), 0)`;

    requestAnimationFrame(animateLight);
  }

  requestAnimationFrame(animateLight);
}


/* =========================================================
   SERVICE CARD + BUTTON GLOW EFFECT (fixed: no forced reflow)
========================================================= */

function initServiceCardEffect() {

  const glowTargets = document.querySelectorAll(
    ".service-card, .hero-btn-primary"
  );

  if (!glowTargets.length) return;

  glowTargets.forEach((el) => {

    let rect = null;

    el.addEventListener(
      "pointerenter",
      () => {
        rect = el.getBoundingClientRect();
      },
      { passive: true }
    );

    el.addEventListener(
      "pointermove",
      (event) => {

        if (!rect) return;

        el.style.setProperty("--x", `${event.clientX - rect.left}px`);
        el.style.setProperty("--y", `${event.clientY - rect.top}px`);

      },
      { passive: true }
    );

  });

}


/* =========================================================
   HEADER SCROLL STATE
========================================================= */

function initHeaderScrollState() {

  const header = document.querySelector(".site-header");

  if (!header) return;

  const THRESHOLD = 20;

  const update = () => {

    header.classList.toggle("is-scrolled", window.scrollY > THRESHOLD);

  };

  window.addEventListener("scroll", update, { passive: true });

  update();

}


/* =========================================================
   FOOTER YEAR
========================================================= */

function initFooterYear() {

  const yearEl = document.getElementById("year");

  if (!yearEl) return;

  yearEl.textContent = new Date().getFullYear();

}


/* =========================================================
   PROJECTS CAROUSEL
========================================================= */

function initProjectsCarousel() {

  const carousel = document.querySelector(".projects-carousel");
  const track = carousel?.querySelector(".projects-grid");
  const previousButton = document.querySelector("[data-projects-previous]");
  const nextButton = document.querySelector("[data-projects-next]");

  if (!carousel || !track || !previousButton || !nextButton) return;

  const cards = Array.from(track.querySelectorAll(".project-card"));

  if (!cards.length) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let dragPointer = null;
  let suppressClick = false;

  const updateButtons = () => {
    const maxScrollLeft = carousel.scrollWidth - carousel.clientWidth;

    previousButton.disabled = carousel.scrollLeft <= 1;
    nextButton.disabled = carousel.scrollLeft >= maxScrollLeft - 1;
  };

  const moveByCard = (direction) => {
    const step = cards.length > 1
      ? cards[1].offsetLeft - cards[0].offsetLeft
      : cards[0].getBoundingClientRect().width;

    carousel.scrollBy({
      left: step * direction,
      behavior: reducedMotion.matches ? "auto" : "smooth",
    });
  };

  previousButton.addEventListener("click", () => moveByCard(-1));
  nextButton.addEventListener("click", () => moveByCard(1));

  carousel.addEventListener("scroll", updateButtons, { passive: true });
  carousel.addEventListener("keydown", (event) => {
    if (event.target !== carousel) return;

    if (event.key === "ArrowLeft" && !previousButton.disabled) {
      event.preventDefault();
      moveByCard(-1);
    } else if (event.key === "ArrowRight" && !nextButton.disabled) {
      event.preventDefault();
      moveByCard(1);
    }
  });

  carousel.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;

    const card = event.target.closest(".project-card");
    const captureTarget =
      event.target.closest(".project-card-action") || card || carousel;

    dragPointer = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startScrollLeft: carousel.scrollLeft,
      captureTarget,
      moved: false,
      dragging: false,
    };

    captureTarget.setPointerCapture(event.pointerId);
  });

  carousel.addEventListener("pointermove", (event) => {
    if (!dragPointer || event.pointerId !== dragPointer.id) return;

    const deltaX = event.clientX - dragPointer.startX;
    const deltaY = event.clientY - dragPointer.startY;

    if (!dragPointer.moved) {
      if (Math.hypot(deltaX, deltaY) < 6) return;

      dragPointer.moved = true;
      if (Math.abs(deltaX) <= Math.abs(deltaY)) return;

      dragPointer.dragging = true;
      carousel.classList.add("is-dragging");
    }

    if (!dragPointer.dragging) return;

    event.preventDefault();
    carousel.scrollLeft = dragPointer.startScrollLeft - deltaX;
  });

  const finishDrag = (event) => {
    if (!dragPointer || event.pointerId !== dragPointer.id) return;

    const { captureTarget, moved } = dragPointer;
    dragPointer = null;
    carousel.classList.remove("is-dragging");

    if (captureTarget.hasPointerCapture(event.pointerId)) {
      captureTarget.releasePointerCapture(event.pointerId);
    }

    if (moved) {
      suppressClick = true;
      window.setTimeout(() => {
        suppressClick = false;
      }, 0);
    }
  };

  carousel.addEventListener("pointerup", finishDrag);
  carousel.addEventListener("pointercancel", finishDrag);

  carousel.addEventListener(
    "click",
    (event) => {
      if (!suppressClick) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      suppressClick = false;
    },
    true
  );

  const resizeObserver = new ResizeObserver(updateButtons);
  resizeObserver.observe(carousel);

  updateButtons();

}


/* =========================================================
   PROJECT IMAGE LIGHTBOX
========================================================= */

function initProjectLightbox() {

  const dialog = document.querySelector(".project-lightbox");
  const image = dialog?.querySelector(".project-lightbox-image");
  const title = dialog?.querySelector(".project-lightbox-title");
  const closeButton = dialog?.querySelector("[data-lightbox-close]");
  const cards = document.querySelectorAll("[data-lightbox-src]");

  if (!dialog || !image || !title || !closeButton || !cards.length) return;

  let opener = null;
  let pageScrollPosition = null;

  const lockPageScroll = () => {
    pageScrollPosition = {
      left: window.scrollX,
      top: window.scrollY,
    };

    document.body.style.setProperty(
      "--project-lightbox-scroll-left",
      `${-pageScrollPosition.left}px`
    );
    document.body.style.setProperty(
      "--project-lightbox-scroll-top",
      `${-pageScrollPosition.top}px`
    );
    document.body.style.setProperty(
      "--project-lightbox-page-width",
      `${document.documentElement.clientWidth}px`
    );
    document.documentElement.classList.add("project-lightbox-open");
    document.body.classList.add("project-lightbox-open");
  };

  const unlockPageScroll = () => {
    if (!pageScrollPosition) return;

    const { left, top } = pageScrollPosition;
    document.documentElement.classList.remove("project-lightbox-open");
    document.body.classList.remove("project-lightbox-open");
    document.body.style.removeProperty("--project-lightbox-scroll-left");
    document.body.style.removeProperty("--project-lightbox-scroll-top");
    document.body.style.removeProperty("--project-lightbox-page-width");
    pageScrollPosition = null;

    window.scrollTo({ left, top, behavior: "instant" });
  };

  const closeLightbox = () => {
    if (!dialog.open) return;

    const returnFocusTo = opener;
    opener = null;
    dialog.close();
    unlockPageScroll();

    window.setTimeout(() => {
      if (returnFocusTo?.isConnected) returnFocusTo.focus();
    }, 50);
  };

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      const originalImage = card.closest(".project-card").querySelector(
        ".project-card-image img"
      );

      opener = card;
      image.src = card.dataset.lightboxSrc;
      image.alt = originalImage.alt;
      title.textContent = card.dataset.lightboxTitle;
      lockPageScroll();
      dialog.showModal();
    });
  });

  closeButton.addEventListener("click", closeLightbox);

  dialog.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    event.preventDefault();
    closeLightbox();
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeLightbox();
  });

}


/* =========================================================
   CONTACT FORM — Web3Forms submission
========================================================= */

function initContactForm() {

  const form = document.getElementById("contactForm");

  if (!form) return;

  const successMsg = form.querySelector(".form-status--success");
  const errorMsg = form.querySelector(".form-status--error");
  const submitBtn = form.querySelector(".contact-btn");

  form.addEventListener("submit", async (event) => {

    event.preventDefault();

    successMsg.hidden = true;
    errorMsg.hidden = true;

    submitBtn.disabled = true;
    submitBtn.textContent = "Sender...";

    try {

      const formData = new FormData(form);

      const response = await fetch(form.action, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      const result = await response.json();

      // TEMPORARY — remove after confirming delivery works correctly
      console.log("Web3Forms response:", result);

      if (result.success) {
        successMsg.hidden = false;
        form.reset();
      } else {
        errorMsg.hidden = false;
      }

    } catch (err) {
      console.log("Web3Forms request failed:", err); // TEMPORARY
      errorMsg.hidden = false;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Send melding";
    }

  });

}


/* =========================================================
   INITIALIZE
========================================================= */

function init() {

  initHeroLights();
  initServiceCardEffect();
  initMobileMenu();
  initHeaderScrollState();
  initContactForm();
  initFooterYear();
  initProjectsCarousel();
  initProjectLightbox();
  initScrollSpy();

}


/* =========================================================
   DOM READY
========================================================= */

if (document.readyState === "loading") {

  document.addEventListener("DOMContentLoaded", init);

} else {

  init();

}