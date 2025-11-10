/*************************
 * Tailwind Dark Mode Init
 *************************/
tailwind.config = { darkMode: "class" };

(function () {
  const saved = localStorage.getItem("theme");
  const startDark = saved ? saved === "dark" : true;
  document.documentElement.classList.toggle("dark", startDark);
})();

/*************************
 * Optional: Fade-in on Scroll
 *************************/
const revealOnScroll = () => {
  document.querySelectorAll(".fade-section").forEach((el) => {
    const trigger = window.innerHeight * 0.9;
    if (el.getBoundingClientRect().top < trigger)
      el.classList.add("is-visible");
  });
};
document.addEventListener("scroll", revealOnScroll, { passive: true });
document.addEventListener("DOMContentLoaded", revealOnScroll);

/*************************
 * Theme Toggle
 *************************/
document.addEventListener("DOMContentLoaded", () => {
  const html = document.documentElement;
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;

  function setIcon() {
    btn.textContent = html.classList.contains("dark") ? "☀️" : "🌙";
  }
  setIcon();

  btn.addEventListener("click", () => {
    const nowDark = html.classList.toggle("dark");
    localStorage.setItem("theme", nowDark ? "dark" : "light");
    setIcon();
  });
});

/*************************
 * Sidebar Elements & Open/Close
 *************************/
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const shell = document.getElementById("shell");
const openBtn = document.getElementById("sidebar-open");
const closeBtn = document.getElementById("sidebar-close");
const sideNav = document.getElementById("side-nav");

function openSidebar() {
  sidebar.classList.remove("-translate-x-full");
  shell.classList.add("pl-72");
  overlay?.classList.remove("hidden"); // overlay purely visual
  openBtn?.classList.add("hidden");
  closeBtn?.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}
function closeSidebar() {
  sidebar.classList.add("-translate-x-full");
  shell.classList.remove("pl-72");
  overlay?.classList.add("hidden");
  openBtn?.classList.remove("hidden");
  closeBtn?.classList.add("hidden");
  document.body.style.overflow = "";
}

openBtn?.addEventListener("click", openSidebar);
closeBtn?.addEventListener("click", closeSidebar);
// Intentionally NOT closing on overlay or submenu clicks

/*************************
 * Hash Normalization + Section Router
 *************************/
function normalizeHash(hash) {
  const h = (hash ?? "").trim();
  if (!h || h === "#" || h === "#  ") return "#Introduction";
  return h.startsWith("#") ? h : `#${h}`;
}
function showSection(id) {
  document
    .querySelectorAll(".content-section")
    .forEach((sec) => sec.classList.add("hidden"));
  const el = document.getElementById(id);
  if (el) {
    el.classList.remove("hidden");
    const h2 = el.querySelector("h2");
    if (h2) {
      h2.setAttribute("tabindex", "-1");
      h2.focus();
    }
  }
}
function navigateToHash(hash) {
  const h = normalizeHash(hash);
  const id = h.slice(1);
  showSection(id);
}

/*************************
 * Header Links (hover/active + sync)
 *************************/
const headerLinks = document.querySelectorAll("header .toplink");
const HEADER_ACTIVE = [
  "bg-pink-100",
  "text-pink-700",
  "rounded",
  "px-1",
  "dark:bg-gray-700/70",
  "dark:text-pink-300",
];

function clearHeaderActive() {
  headerLinks.forEach((l) => l.classList.remove("is-active", ...HEADER_ACTIVE));
}
function setHeaderActive(hash) {
  const target = normalizeHash(hash);
  clearHeaderActive();
  headerLinks.forEach((l) => {
    const h = normalizeHash(l.getAttribute("href"));
    if (h === target) l.classList.add("is-active", ...HEADER_ACTIVE);
  });
}

/*************************
 * Deep Accordion (any depth) + Active Highlight
 *************************/
const ACTIVE_BG = [
  "bg-pink-100",
  "text-pink-700",
  "dark:bg-gray-700/70",
  "dark:text-pink-300",
];

// Buttons that should route when clicked
const BTN_TO_HASH = {
  "btn-introduction": "#Introduction",
  "btn-getStarted": "#GetStarted",
  "btn-tutorials": "#Tutorials",
  "btn-integrations": "#Integrations",
  "btn-materials": "#UsefulMaterials",
  "btn-latestReleaseNotes": "#LatestReleaseNotes",
  // Add nested group buttons if you want them to set a hash as well:
  // "btn-integrations-lms": "#Integrations-LMs",
  // "btn-integrations-lms-openai": "#Integrations-LMs-OpenAI",
};

// For header clicks that correspond to groups
const HASH_TO_GROUP = {
  "#Tutorials": { btn: "btn-tutorials", panel: "sub-tutorials" },
  "#Integrations": { btn: "btn-integrations", panel: "sub-integrations" },
  "#UsefulMaterials": { btn: "btn-materials", panel: "sub-materials" },
};

function setGroupActive(btn, isActive) {
  if (!btn) return;
  const BTN_ACTIVE = [
    "bg-pink-100",
    "text-pink-700",
    "dark:bg-gray-700/70",
    "dark:text-pink-300",
  ];
  btn.classList.toggle("is-active", isActive);
  BTN_ACTIVE.forEach((c) => btn.classList.toggle(c, isActive));
  btn.setAttribute("aria-expanded", String(isActive));
  const chev = btn.querySelector("[data-chevron]");
  if (chev) chev.classList.toggle("rotate-90", isActive);
}
function getPanel(btn) {
  const id = btn?.getAttribute("aria-controls");
  return id ? document.getElementById(id) : null;
}
function getButtonForPanel(panel) {
  return panel?.previousElementSibling || null;
}
function getAncestorButtons(panel) {
  const chain = [];
  let p = panel?.parentElement?.closest('ul[id^="sub-"]');
  while (p) {
    const b = getButtonForPanel(p);
    if (b) chain.push(b);
    p = p.parentElement?.closest('ul[id^="sub-"]');
  }
  return chain;
}
function openPanelChain(panel) {
  let p = panel;
  while (p) {
    p.classList.remove("hidden");
    const b = getButtonForPanel(p);
    if (b) setGroupActive(b, true);
    p = p.parentElement?.closest('ul[id^="sub-"]');
  }
}
function closeAllGroups(exceptBtns = []) {
  const keep = new Set(Array.isArray(exceptBtns) ? exceptBtns : [exceptBtns]);
  sideNav.querySelectorAll("button[aria-controls]").forEach((b) => {
    if (keep.has(b)) return;
    const p = getPanel(b);
    if (p) p.classList.add("hidden");
    setGroupActive(b, false);
  });
}
function clearAllLinkActive() {
  sideNav
    .querySelectorAll('a.navlink.is-active, a.navlink[aria-current="page"]')
    .forEach((x) => {
      x.classList.remove("is-active", ...ACTIVE_BG);
      x.setAttribute("aria-current", "false");
    });
}
function clearAllGroupActive() {
  sideNav
    .querySelectorAll("button.is-active")
    .forEach((btn) => setGroupActive(btn, false));
}

/** Accordion binder (parent/child/grandchild…) */
function setupAccordion(btnId, panelId) {
  const btn = document.getElementById(btnId);
  const panel = document.getElementById(panelId);
  if (!btn || !panel) return;

  btn.addEventListener("click", () => {
    const willOpen = panel.classList.contains("hidden");
    const keepBtns = [btn, ...getAncestorButtons(panel)];
    closeAllGroups(keepBtns);
    panel.classList.toggle("hidden", !willOpen);
    if (willOpen) openPanelChain(panel);
    setGroupActive(btn, willOpen);

    const h = BTN_TO_HASH[btn.id];
    if (h) {
      const nh = normalizeHash(h);
      if (location.hash !== nh) history.pushState({ hash: nh }, "", nh);
      navigateToHash(nh);
      setHeaderActive(nh);
      clearAllLinkActive();
    }
  });
}

/** Simple buttons (no panel) */
function setupSimpleButton(btnId) {
  const btn = document.getElementById(btnId);
  if (!btn) return;

  // Treat as "simple" if there is NO real panel element
  const panel = getPanel(btn);
  if (panel) return; // if you actually have a panel, let setupAccordion handle it

  btn.addEventListener("click", () => {
    closeAllGroups();
    clearAllLinkActive();
    clearAllGroupActive();
    setGroupActive(btn, true);

    const h = normalizeHash(BTN_TO_HASH[btn.id]);
    if (location.hash !== h) history.pushState({ hash: h }, "", h);
    navigateToHash(h);
    setHeaderActive(h);
  });
}

/** Init groups/simple buttons */
// Top-level groups
setupAccordion("btn-tutorials", "sub-tutorials");
setupAccordion("btn-integrations", "sub-integrations");
setupAccordion("btn-materials", "sub-materials");
// Nested examples (uncomment when you add them in HTML):
setupAccordion("btn-integrations-lms", "sub-integrations-lms");
setupAccordion("btn-integrations-lms-openai", "sub-integrations-lms-openai");

// Simple buttons without panels
setupSimpleButton("btn-introduction");
setupSimpleButton("btn-getStarted");
setupSimpleButton("btn-latestReleaseNotes");

/*************************
 * Submenu link clicks (keep chain open, highlight one)
 *************************/
sideNav.addEventListener("click", (e) => {
  const a = e.target.closest("a.navlink");
  if (!a) return;

  e.preventDefault();
  e.stopPropagation();

  const h = normalizeHash(a.getAttribute("href"));
  if (location.hash !== h) history.pushState({ hash: h }, "", h);
  navigateToHash(h);
  setHeaderActive(h);

  const panel = a.closest('ul[id^="sub-"]');
  const keepBtns = [];
  if (panel) {
    const thisBtn = getButtonForPanel(panel);
    if (thisBtn) keepBtns.push(thisBtn);
    keepBtns.push(...getAncestorButtons(panel));
  }

  closeAllGroups(keepBtns);
  if (panel) openPanelChain(panel);

  clearAllLinkActive();
  a.classList.add("is-active", ...ACTIVE_BG);
  a.setAttribute("aria-current", "page");
});

/*************************
 * Restore from hash on load / back-forward
 *************************/
function restoreFromHash() {
  const h = normalizeHash(location.hash);

  // 1) If hash matches a sidebar link
  const link = sideNav.querySelector(`a.navlink[href="${h}"]`);
  if (link) {
    clearAllLinkActive();
    link.classList.add("is-active", ...ACTIVE_BG);
    link.setAttribute("aria-current", "page");
    setHeaderActive(h);

    const panel = link.closest('ul[id^="sub-"]');
    if (panel) {
      const keepBtns = [];
      const thisBtn = getButtonForPanel(panel);
      if (thisBtn) keepBtns.push(thisBtn);
      keepBtns.push(...getAncestorButtons(panel));
      closeAllGroups(keepBtns);
      openPanelChain(panel);
      setGroupActive(thisBtn, true);
    } else {
      closeAllGroups();
      clearAllGroupActive();
    }
    return;
  }

  // 2) If hash matches a group/simple button
  const btnId = Object.keys(BTN_TO_HASH).find(
    (id) => normalizeHash(BTN_TO_HASH[id]) === h
  );
  if (btnId) {
    const btn = document.getElementById(btnId);
    const panel = getPanel(btn);
    const keepBtns = [btn, ...(panel ? getAncestorButtons(panel) : [])];
    closeAllGroups(keepBtns);
    if (panel) panel.classList.remove("hidden");
    setGroupActive(btn, true);
    clearAllLinkActive();
    setHeaderActive(h);
    return;
  }

  // 3) Default fallback: Introduction
  const fallback = "#Introduction";
  setHeaderActive(fallback);
  const introBtn = document.getElementById("btn-introduction");
  closeAllGroups(introBtn);
  setGroupActive(introBtn, true);
  clearAllLinkActive();
}

window.addEventListener("popstate", () => {
  const h = normalizeHash(location.hash);
  navigateToHash(h);
  setHeaderActive(h);
  restoreFromHash();
});
document.addEventListener("DOMContentLoaded", () => {
  const h = normalizeHash(location.hash);
  navigateToHash(h);
  setHeaderActive(h);
  restoreFromHash();
});

/*************************
 * Header link clicks → route + sync sidebar
 * + OPEN SIDEBAR IF CLOSED (requested)
 *************************/
headerLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const h = normalizeHash(link.getAttribute("href"));

    // Open sidebar if it's closed
    if (sidebar.classList.contains("-translate-x-full")) {
      openSidebar();
    }

    if (location.hash !== h) history.pushState({ hash: h }, "", h);
    navigateToHash(h);
    setHeaderActive(h);

    // If header targets a group, open it; else sync from hash
    const m = {
      "#Tutorials": { btn: "btn-tutorials", panel: "sub-tutorials" },
      "#Integrations": { btn: "btn-integrations", panel: "sub-integrations" },
      "#UsefulMaterials": { btn: "btn-materials", panel: "sub-materials" },
    }[h];

    if (m) {
      const btn = document.getElementById(m.btn);
      const panel = document.getElementById(m.panel);
      if (btn && panel) {
        const keep = [btn, ...getAncestorButtons(panel)];
        closeAllGroups(keep);
        openPanelChain(panel);
        setGroupActive(btn, true);
        clearAllLinkActive();
        btn.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    } else {
      restoreFromHash(); // sync sidebar button/link highlights for simple sections
    }
  });
});
