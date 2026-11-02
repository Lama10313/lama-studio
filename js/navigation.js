/**
 * Lama Studio — navigation.js
 * Handles desktop/mobile navigation.
 */

export function initMobileMenu() {

  const toggle = document.querySelector(".menu-toggle");
  const nav = document.getElementById("main-menu");

  if (!toggle || !nav) return;


  const setOpen = (isOpen) => {

    nav.classList.toggle("is-open", isOpen);

    toggle.setAttribute(
      "aria-expanded",
      String(isOpen)
    );

    toggle.setAttribute(
      "aria-label",
      isOpen
        ? "Lukk navigasjonsmeny"
        : "Åpne navigasjonsmeny"
    );

  };


  /* Toggle menu */

  toggle.addEventListener("click", () => {

    const isOpen =
      nav.classList.contains("is-open");

    setOpen(!isOpen);

  });


  /* Close after clicking a link */

  nav.querySelectorAll("a").forEach((link) => {

    link.addEventListener("click", () => {
      setOpen(false);
    });

  });


  /* Close with Escape */

  document.addEventListener("keydown", (event) => {

    if (
      event.key === "Escape" &&
      nav.classList.contains("is-open")
    ) {

      setOpen(false);
      toggle.focus();

    }

  });


  /* Close when returning to desktop */

  const desktopBreakpoint =
    window.matchMedia("(min-width: 801px)");

  desktopBreakpoint.addEventListener("change", (event) => {

    if (event.matches) {
      setOpen(false);
    }

  });

}


/* =========================================================
   SCROLLSPY — highlight active section in navigation
========================================================= */

export function initScrollSpy() {

  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".main-nav a[href^='#']");

  if (!sections.length || !navLinks.length) return;

  const setActive = (id) => {

    navLinks.forEach((link) => {

      const isActive = link.getAttribute("href") === `#${id}`;

      link.classList.toggle("is-active", isActive);

    });

  };

  const observer = new IntersectionObserver(
    (entries) => {

      entries.forEach((entry) => {

        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }

      });

    },
    {
      // Triggers when a section crosses the vertical center of the viewport
      rootMargin: "-45% 0px -45% 0px",
      threshold: 0,
    }
  );

  sections.forEach((section) => observer.observe(section));

}