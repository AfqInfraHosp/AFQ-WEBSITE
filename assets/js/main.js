const header = document.querySelector(".site-header");
const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".main-nav");
const loader = document.querySelector("[data-site-loader]");
const root = document.documentElement;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const loadStartedAt = performance.now();
let firstPageVisit = true;
let loadFinished = false;

try {
  firstPageVisit = !window.sessionStorage.getItem("afq-page-ready");
} catch {
  firstPageVisit = true;
}

const finishPageLoad = () => {
  if (loadFinished) return;
  loadFinished = true;
  const minimumDisplay = reducedMotion ? 0 : firstPageVisit ? 600 : 220;
  const remaining = Math.max(0, minimumDisplay - (performance.now() - loadStartedAt));

  window.setTimeout(() => {
    root.classList.add("page-ready");
    loader?.setAttribute("aria-hidden", "true");
    try {
      window.sessionStorage.setItem("afq-page-ready", "true");
    } catch {
      // The loader still works when browser storage is unavailable.
    }
  }, remaining);
};

if (document.readyState === "complete") {
  finishPageLoad();
} else {
  window.addEventListener("load", finishPageLoad, { once: true });
  window.setTimeout(finishPageLoad, 3000);
}

window.addEventListener("pageshow", (event) => {
  root.classList.remove("page-leaving");
  if (event.persisted) root.classList.add("page-ready");
});

const meridian = document.createElement("aside");
meridian.className = "signature-meridian";
meridian.setAttribute("aria-hidden", "true");
meridian.innerHTML = `
  <span class="meridian-code">AFQ</span>
  <span class="meridian-to">TO</span>
  <span class="meridian-line"><span></span></span>
  <span class="meridian-code">OM</span>
  <span class="meridian-caption">Signature Route</span>`;
document.body.append(meridian);

const closeNavigation = () => {
  if (!toggle || !nav) return;
  nav.classList.remove("open");
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-label", "Open navigation");
  document.body.classList.remove("nav-open");
};

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    document.body.classList.toggle("nav-open", open);
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNavigation);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeNavigation();
  });

  document.addEventListener("click", (event) => {
    if (!nav.classList.contains("open")) return;
    if (!nav.contains(event.target) && !toggle.contains(event.target)) closeNavigation();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1100) closeNavigation();
  });
}

const currentPage = window.location.pathname.split("/").pop() || "index.html";
document.querySelectorAll(".main-nav a").forEach((link) => {
  const linkPage = link.getAttribute("href");
  if (linkPage === currentPage) link.setAttribute("aria-current", "page");
});

const logoPointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
document.querySelectorAll(".brand").forEach((brand) => {
  brand.classList.add("logo-depth");
  const image = brand.querySelector("img");
  if (image) {
    const stage = document.createElement("span");
    stage.className = "logo-3d-stage";
    image.replaceWith(stage);
    stage.append(image);
  }

  const field = document.createElement("span");
  field.className = "logo-depth-field";
  field.setAttribute("aria-hidden", "true");
  field.innerHTML = Array.from({ length: 7 }, () => '<span class="logo-depth-layer"></span>').join("");
  brand.prepend(field);

  if (!reducedMotion && logoPointerQuery.matches) {
    brand.addEventListener("pointermove", (event) => {
      const bounds = brand.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
      const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
      brand.classList.add("logo-active");
      brand.style.setProperty("--logo-rx", `${(y * -5).toFixed(2)}deg`);
      brand.style.setProperty("--logo-ry", `${(x * 7).toFixed(2)}deg`);
      brand.style.setProperty("--logo-rx-reverse", `${(y * 2.25).toFixed(2)}deg`);
      brand.style.setProperty("--logo-ry-reverse", `${(x * -3.15).toFixed(2)}deg`);
      brand.style.setProperty("--logo-x", `${(x * 7).toFixed(1)}px`);
      brand.style.setProperty("--logo-y", `${(y * 5).toFixed(1)}px`);
      brand.style.setProperty("--logo-x-soft", `${(x * 3.8).toFixed(1)}px`);
      brand.style.setProperty("--logo-x-reverse-soft", `${(x * -2.5).toFixed(1)}px`);
      brand.style.setProperty("--logo-x-reverse-medium", `${(x * -4.2).toFixed(1)}px`);
      brand.style.setProperty("--logo-y-soft", `${(y * 2).toFixed(1)}px`);
      brand.style.setProperty("--logo-y-reverse-soft", `${(y * -1.5).toFixed(1)}px`);
      brand.style.setProperty("--logo-glow-x", `${((x + 1) * 50).toFixed(1)}%`);
      brand.style.setProperty("--logo-glow-y", `${((y + 1) * 50).toFixed(1)}%`);
    });

    brand.addEventListener("pointerleave", () => {
      brand.classList.remove("logo-active");
      ["--logo-rx", "--logo-ry", "--logo-rx-reverse", "--logo-ry-reverse"].forEach((property) =>
        brand.style.setProperty(property, "0deg")
      );
      [
        "--logo-x",
        "--logo-y",
        "--logo-x-soft",
        "--logo-x-reverse-soft",
        "--logo-x-reverse-medium",
        "--logo-y-soft",
        "--logo-y-reverse-soft"
      ].forEach((property) => brand.style.setProperty(property, "0px"));
      brand.style.setProperty("--logo-glow-x", "50%");
      brand.style.setProperty("--logo-glow-y", "40%");
    });
  }
});

document.querySelectorAll("[data-logo-slides]").forEach((image) => {
  const slides = image.dataset.logoSlides
    .split("|")
    .map((src) => src.trim())
    .filter(Boolean);

  if (slides.length < 2) return;

  slides.slice(1).forEach((src) => {
    const preload = new Image();
    preload.src = src;
  });

  if (reducedMotion) return;

  let index = 0;
  const interval = Math.max(2800, Number(image.dataset.logoInterval) || 4300);

  window.setInterval(() => {
    index = (index + 1) % slides.length;
    image.classList.add("logo-swapping");

    window.setTimeout(() => {
      image.src = slides[index];
      image.classList.remove("logo-swapping");
    }, 260);
  }, interval);
});

const buttonPointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
const resetButtonDepth = (button) => {
  button.classList.remove("btn-active");
  button.style.setProperty("--btn-rx", "0deg");
  button.style.setProperty("--btn-ry", "0deg");
  button.style.setProperty("--btn-shift-x", "0px");
  button.style.setProperty("--btn-shift-y", "0px");
  button.style.setProperty("--btn-glow-x", "50%");
  button.style.setProperty("--btn-glow-y", "50%");
};

document.querySelectorAll(".btn").forEach((button) => {
  button.classList.add("btn-depth");

  if (!button.querySelector(".btn-label")) {
    const label = document.createElement("span");
    label.className = "btn-label";
    while (button.firstChild) label.append(button.firstChild);
    button.append(label);
  }

  if (!button.querySelector(".btn-depth-field")) {
    const field = document.createElement("span");
    field.className = "btn-depth-field";
    field.setAttribute("aria-hidden", "true");
    field.innerHTML = Array.from({ length: 7 }, () => '<span class="btn-depth-layer"></span>').join("");
    button.prepend(field);
  }

  if (!reducedMotion && buttonPointerQuery.matches) {
    button.addEventListener("pointermove", (event) => {
      const bounds = button.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
      const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
      button.classList.add("btn-active");
      button.style.setProperty("--btn-rx", `${(y * -4).toFixed(2)}deg`);
      button.style.setProperty("--btn-ry", `${(x * 5.4).toFixed(2)}deg`);
      button.style.setProperty("--btn-shift-x", `${(x * 10).toFixed(1)}px`);
      button.style.setProperty("--btn-shift-y", `${(y * 5).toFixed(1)}px`);
      button.style.setProperty("--btn-glow-x", `${((x + 1) * 50).toFixed(1)}%`);
      button.style.setProperty("--btn-glow-y", `${((y + 1) * 50).toFixed(1)}%`);
    });

    button.addEventListener("pointerleave", () => resetButtonDepth(button));
    button.addEventListener("pointercancel", () => resetButtonDepth(button));
  }
});

document.querySelectorAll(".loader-emblem").forEach((emblem) => {
  for (let index = 4; index <= 7; index += 1) {
    const layer = document.createElement("span");
    layer.className = `loader-ring depth-${index}`;
    layer.setAttribute("aria-hidden", "true");
    emblem.prepend(layer);
  }
});

const depthScenes = document.querySelectorAll(".home-hero, .page-hero, .hospitality-hero");
const depthPointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
depthScenes.forEach((scene) => {
  scene.classList.add("depth-scene");
  const field = document.createElement("div");
  field.className = "depth-field";
  field.setAttribute("aria-hidden", "true");
  field.innerHTML = Array.from({ length: 7 }, () => '<span class="depth-layer"></span>').join("");
  scene.prepend(field);
});

if (!reducedMotion && depthPointerQuery.matches) {
  depthScenes.forEach((scene) => {
    scene.addEventListener("pointermove", (event) => {
      const bounds = scene.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
      const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
      scene.style.setProperty("--dx-soft", `${(x * 5).toFixed(1)}px`);
      scene.style.setProperty("--dx-medium", `${(x * 12).toFixed(1)}px`);
      scene.style.setProperty("--dx-strong", `${(x * 22).toFixed(1)}px`);
      scene.style.setProperty("--dx-reverse-soft", `${(x * -4).toFixed(1)}px`);
      scene.style.setProperty("--dx-reverse-medium", `${(x * -11).toFixed(1)}px`);
      scene.style.setProperty("--dy-soft", `${(y * 4).toFixed(1)}px`);
      scene.style.setProperty("--dy-medium", `${(y * 9).toFixed(1)}px`);
      scene.style.setProperty("--dy-strong", `${(y * 17).toFixed(1)}px`);
      scene.style.setProperty("--dy-reverse-soft", `${(y * -3).toFixed(1)}px`);
    });

    scene.addEventListener("pointerleave", () => {
      [
        "--dx-soft",
        "--dx-medium",
        "--dx-strong",
        "--dx-reverse-soft",
        "--dx-reverse-medium",
        "--dy-soft",
        "--dy-medium",
        "--dy-strong",
        "--dy-reverse-soft"
      ].forEach((property) => scene.style.setProperty(property, "0px"));
    });
  });
}

let scrollFrame;
const updateScrollEffects = () => {
  scrollFrame = undefined;
  const scrollTop = window.scrollY;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? Math.min(1, scrollTop / scrollable) : 0;
  root.style.setProperty("--page-progress", String(progress));

  if (header) {
    header.classList.toggle("scrolled", scrollTop > 12);
    header.style.setProperty("--scroll-progress", String(progress));
  }

  if (!reducedMotion) {
    depthScenes.forEach((scene) => {
      const bounds = scene.getBoundingClientRect();
      const distance = bounds.top + bounds.height / 2 - window.innerHeight / 2;
      const offset = Math.max(-80, Math.min(80, distance * -0.08));
      scene.style.setProperty("--ds-soft", `${(offset * 0.16).toFixed(1)}px`);
      scene.style.setProperty("--ds-reverse-soft", `${(offset * -0.1).toFixed(1)}px`);
      scene.style.setProperty("--ds-reverse-medium", `${(offset * -0.22).toFixed(1)}px`);
    });
  }
};

const requestScrollEffects = () => {
  if (scrollFrame) return;
  scrollFrame = window.requestAnimationFrame(updateScrollEffects);
};

updateScrollEffects();
window.addEventListener("scroll", requestScrollEffects, { passive: true });
window.addEventListener("resize", requestScrollEffects);

document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = new Date().getFullYear();
});

document.querySelectorAll("[data-back-to-top]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    window.scrollTo(0, 0);
  });
});

const reveals = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
  );
  reveals.forEach((element) => observer.observe(element));
} else {
  reveals.forEach((element) => element.classList.add("visible"));
}

document.querySelectorAll(
  ".service-grid, .detail-grid, .hospitality-grid, .project-grid, .gallery-grid, .value-grid, .signature-card-grid, .signature-stack, .command-board, .response-actions"
).forEach((group) => {
  group.querySelectorAll(".reveal").forEach((element, index) => {
    element.style.setProperty("--reveal-delay", `${Math.min(index % 3, 2) * 90}ms`);
  });
});

const tiltQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
const tiltTargets = document.querySelectorAll(
  ".division-card, .service-card, .project-card, .detail-card, .gallery-card, .hospitality-card, .value-card, .contact-dept, .capability-item, .cta-box, .office-card, .quick-enquiry, .page-hero-grid > img, .profile-image, .feature-image, .luxury-image, .signature-card, .signature-orb, .command-step, .brand-moodboard, .response-panel"
);

if (!reducedMotion && tiltQuery.matches) {
  let activeTilt = null;
  const resetTilt = (element) => {
    if (!element) return;
    element.classList.remove("tilt-active");
    element.style.setProperty("--tilt-x", "0deg");
    element.style.setProperty("--tilt-y", "0deg");
    element.style.setProperty("--glow-x", "50%");
    element.style.setProperty("--glow-y", "50%");
    if (activeTilt === element) activeTilt = null;
  };

  tiltTargets.forEach((element) => {
    element.classList.add("tilt-surface");

    if (!element.matches("img")) {
      const glow = document.createElement("span");
      glow.className = "tilt-glow";
      glow.setAttribute("aria-hidden", "true");
      element.append(glow);
    }

    element.addEventListener("pointermove", (event) => {
      const bounds = element.getBoundingClientRect();
      const x = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width));
      const y = Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height));
      const rotateX = (0.5 - y) * 6;
      const rotateY = (x - 0.5) * 7.5;

      if (activeTilt && activeTilt !== element) resetTilt(activeTilt);
      activeTilt = element;
      element.classList.add("tilt-active");
      element.style.setProperty("--tilt-x", `${rotateX.toFixed(2)}deg`);
      element.style.setProperty("--tilt-y", `${rotateY.toFixed(2)}deg`);
      element.style.setProperty("--glow-x", `${(x * 100).toFixed(1)}%`);
      element.style.setProperty("--glow-y", `${(y * 100).toFixed(1)}%`);
    });

    element.addEventListener("pointerenter", () => {
      element.classList.add("tilt-active");
    });

    element.addEventListener("pointerleave", () => {
      resetTilt(element);
    });

    element.addEventListener("pointercancel", () => resetTilt(element));
  });

  document.addEventListener(
    "pointermove",
    (event) => {
      if (activeTilt && !activeTilt.contains(event.target)) resetTilt(activeTilt);
    },
    { passive: true }
  );

  window.addEventListener("blur", () => resetTilt(activeTilt));
}

const contactDock = document.createElement("aside");
contactDock.className = "contact-dock";
contactDock.setAttribute("aria-label", "Quick contact");
contactDock.innerHTML = `
  <a class="contact-app email-app" href="mailto:divin@afqalasmah.com" aria-label="Email AFQ Al Asmah National">
    <span class="contact-app-icon" aria-hidden="true">@</span><span>Email</span>
  </a>
  <a class="contact-app whatsapp-app" href="https://wa.me/96898710626" data-whatsapp="96898710626" aria-label="WhatsApp AFQ Al Asmah National">
    <span class="contact-app-icon" aria-hidden="true">W</span><span>WhatsApp</span>
  </a>`;
document.body.append(contactDock);

document.querySelectorAll("[data-whatsapp]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const phone = link.dataset.whatsapp;
    const webUrl = `https://wa.me/${phone}`;
    let fallback;

    const stopFallback = () => window.clearTimeout(fallback);
    window.addEventListener("blur", stopFallback, { once: true });
    document.addEventListener(
      "visibilitychange",
      () => {
        if (document.hidden) stopFallback();
      },
      { once: true }
    );

    window.location.href = `whatsapp://send?phone=${phone}`;
    fallback = window.setTimeout(() => {
      if (!document.hidden) window.location.href = webUrl;
    }, 1000);
  });
});

document.querySelectorAll("a[href]").forEach((link) => {
  link.addEventListener("click", (event) => {
    if (reducedMotion || event.defaultPrevented || (event.button && event.button !== 0)) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (link.target === "_blank" || link.hasAttribute("download")) return;

    const href = link.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;

    const destination = new URL(link.href, window.location.href);
    if (destination.origin !== window.location.origin) return;
    if (destination.pathname === window.location.pathname && destination.hash) return;

    event.preventDefault();
    root.classList.add("page-leaving");
    window.setTimeout(() => {
      window.location.href = destination.href;
    }, 300);
  });
});

const form = document.getElementById("enquiry-form");
if (form) {
  const params = new URLSearchParams(window.location.search);
  const departmentSelect = document.getElementById("department");
  const messageField = document.getElementById("enquiry-message");
  const submitButton = form.querySelector('button[type="submit"]');
  const requestedDepartment = params.get("department");
  const isQuotationRequest = params.get("request") === "quotation";

  if (departmentSelect && (requestedDepartment === "infrastructure" || requestedDepartment === "hospitality")) {
    departmentSelect.value = requestedDepartment;
  }

  if (isQuotationRequest && messageField && submitButton) {
    const quotationPlaceholder = requestedDepartment === "hospitality"
      ? "Please mention property name, product category, quantity, branding needs and expected delivery timeline."
      : "Please mention project location, scope, drawings / BOQ, quantities and expected timeline.";
    messageField.placeholder = quotationPlaceholder;
    submitButton.textContent = "Open Quotation Email Draft";
  }

  if ((requestedDepartment || isQuotationRequest) && window.location.hash === "#enquiry-form") {
    window.setTimeout(() => {
      form.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" });
    }, reducedMotion ? 0 : 700);
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const department = departmentSelect.value;
    const name = document.getElementById("enquiry-name").value.trim();
    const email = document.getElementById("enquiry-email").value.trim();
    const phone = document.getElementById("enquiry-phone").value.trim();
    const message = document.getElementById("enquiry-message").value.trim();
    const isHospitality = department === "hospitality";
    const to = isHospitality ? "subhash@afqalasmah.com" : "aneesh@afqalasmah.com";
    const subject = isQuotationRequest
      ? isHospitality
        ? "Hospitality Quotation Request"
        : "Infrastructure Quotation Request"
      : isHospitality
        ? "Hospitality Supply Enquiry"
        : "Infrastructure & Utility Enquiry";
    const body = [
      "Dear Team,",
      "",
      `Name / Company: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone || "Not provided"}`,
      "",
      "Requirement:",
      message,
      "",
      "Regards,",
      name
    ].join("\r\n");

    window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}
