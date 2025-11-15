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

  // Show overlay visually but do NOT block pointer events so page stays scrollable.
  overlay?.classList.remove("hidden");
  overlay?.classList.add("visible");
  overlay && (overlay.style.pointerEvents = "none");

  openBtn?.classList.add("hidden");
  closeBtn?.classList.remove("hidden");

  // IMPORTANT: remove any body overflow locking — keep the page scrollable.
  // document.body.style.overflow = "hidden";  <-- removed on purpose
}
function closeSidebar() {
  sidebar.classList.add("-translate-x-full");
  shell.classList.remove("pl-72");

  overlay?.classList.add("hidden");
  overlay?.classList.remove("visible");
  overlay && (overlay.style.pointerEvents = "none");

  openBtn?.classList.remove("hidden");
  closeBtn?.classList.add("hidden");

  // restore body overflow if something else changed it elsewhere (safety)
  // document.body.style.overflow = "";  <-- intentionally not used
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
  "btn-addOns": "#addOns",
  "btn-materials": "#UsefulMaterials",
  "btn-latestReleaseNotes": "#LatestReleaseNotes",
  // Add nested group buttons if you want them to set a hash as well:
  // "btn-addOns-lms": "#addOns-LMs",
  // "btn-addOns-lms-openai": "#addOns-LMs-OpenAI",
};

// For header clicks that correspond to groups
const HASH_TO_GROUP = {
  "#Tutorials": { btn: "btn-tutorials", panel: "sub-tutorials" },
  "#addOns": { btn: "btn-addOns", panel: "sub-addOns" },
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
setupAccordion("btn-addOns", "sub-addOns");
setupAccordion("btn-materials", "sub-materials");
// Nested examples (uncomment when you add them in HTML):
setupAccordion("btn-addOns-lms", "sub-addOns-lms");
setupAccordion("btn-addOns-lms-openai", "sub-addOns-lms-openai");

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
  clearSearchUI();
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
    clearSearchUI();

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
      "#addOns": { btn: "btn-addOns", panel: "sub-addOns" },
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

(function () {
  const toggleBtn = document.getElementById("mobile-search-toggle");
  const drawer = document.getElementById("mobile-search");
  const mobileInput = document.getElementById("mobile-search-input");

  if (!toggleBtn || !drawer) return;

  const open = () => {
    drawer.style.gridTemplateRows = "1fr";
    toggleBtn.setAttribute("aria-expanded", "true");
    setTimeout(() => mobileInput && mobileInput.focus(), 120);
  };

  const close = () => {
    drawer.style.gridTemplateRows = "0fr";
    toggleBtn.setAttribute("aria-expanded", "false");
  };

  let isOpen = false;
  const toggle = () =>
    isOpen ? ((isOpen = false), close()) : ((isOpen = true), open());

  toggleBtn.addEventListener("click", toggle);

  // Close on ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen) toggle();
  });
})();

(function () {
  // Elements
  const sidebar = document.getElementById("sidebar");
  const sidebarOpenBtn = document.getElementById("sidebar-open");
  const searchDesktop = document.getElementById("search-input");
  const searchMobile = document.getElementById("mobile-search-input");

  // Utility: open sidebar (simulate your existing control)
  function openSidebar() {
    if (!sidebar) return;
    if (sidebar.classList.contains("-translate-x-full")) {
      // Use the existing button so we keep your logic in sync
      sidebarOpenBtn && sidebarOpenBtn.click();
    }
  }

  // Utility: expand accordions based on where the link lives
  function expandAccordionsFor(linkEl) {
    // Tutorials (Parent)
    if (linkEl.closest("#sub-tutorials")) {
      const b = document.getElementById("btn-tutorials");
      b && b.getAttribute("aria-expanded") === "false" && b.click();
    }

    // Useful Materials (Parent)
    if (linkEl.closest("#sub-materials")) {
      const b = document.getElementById("btn-materials");
      b && b.getAttribute("aria-expanded") === "false" && b.click();
    }

    // addOns (Parent)
    if (linkEl.closest("#sub-addOns")) {
      const b = document.getElementById("btn-addOns");
      b && b.getAttribute("aria-expanded") === "false" && b.click();
    }

    // addOns → Language Models (Grandchild)
    if (linkEl.closest("#sub-addOns-lms")) {
      const b1 = document.getElementById("btn-addOns");
      const b2 = document.getElementById("btn-addOns-lms");
      // ensure parent then child
      b1 && b1.getAttribute("aria-expanded") === "false" && b1.click();
      b2 && b2.getAttribute("aria-expanded") === "false" && b2.click();
    }
  }

  // Utility: smooth scroll to main section id
  function goToSection(id) {
    const target = document.getElementById(id);
    if (!target) return;
    // Update hash without jumping instantly
    history.pushState(null, "", "#" + id);
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Utility: highlight a nav link and scroll it into view
  function highlightNav(linkEl) {
    if (!linkEl) return;
    linkEl.classList.add("active-nav");
    linkEl.scrollIntoView({ block: "nearest" });
    setTimeout(() => linkEl.classList.remove("active-nav"), 1500);
  }

  // Build index: all anchors that go to sections (#...)
  // We include top header links and sidebar links
  function buildIndex() {
    const anchors = Array.from(document.querySelectorAll('a[href^="#"]'));
    const items = anchors
      .map((a) => {
        const hash = a.getAttribute("href") || "";
        const id = hash.startsWith("#") ? hash.slice(1) : "";
        const label = a.textContent.trim().replace(/\s+/g, " ");
        if (!id || !label) return null;

        // Build a breadcrumb label based on where it lives
        let breadcrumb = label;
        if (a.closest("#sub-addOns-lms")) {
          breadcrumb = "addOns › Language Models › " + label;
        } else if (a.closest("#sub-addOns")) {
          breadcrumb = "addOns › " + label;
        } else if (a.closest("#sub-tutorials")) {
          breadcrumb = "Tutorials › " + label;
        } else if (a.closest("#sub-materials")) {
          breadcrumb = "Useful Materials › " + label;
        }
        return {
          id,
          label,
          breadcrumb,
          element: a,
        };
      })
      .filter(Boolean);

    // Also include virtual parent buttons that don't have anchors but map to known section ids
    const parents = [
      {
        id: "Introduction",
        label: "Introduction",
        breadcrumb: "Introduction",
        element: document.querySelector("#btn-introduction"),
      },
      {
        id: "GetStarted",
        label: "Get Started",
        breadcrumb: "Get Started",
        element: document.querySelector("#btn-getStarted"),
      },
      {
        id: "Tutorials",
        label: "Tutorials",
        breadcrumb: "Tutorials",
        element: document.querySelector("#btn-tutorials"),
      },
      {
        id: "addOns",
        label: "addOns",
        breadcrumb: "addOns",
        element: document.querySelector("#btn-addOns"),
      },
      {
        id: "UsefulMaterials",
        label: "Useful Materials",
        breadcrumb: "Useful Materials",
        element: document.querySelector("#btn-materials"),
      },
      {
        id: "LatestReleaseNotes",
        label: "Latest Release Notes",
        breadcrumb: "Latest Release Notes",
        element: document.querySelector("#btn-latestReleaseNotes"),
      },
    ];
    parents.forEach((p) => items.push(p));

    return items;
  }

  const index = buildIndex();

  // Create a dropdown under a container (the "relative" wrapper of the input)
  function ensurePopover(inputEl) {
    if (!inputEl) return null;
    const wrapper = inputEl.parentElement; // it's inside a relative container
    if (!wrapper) return null;
    let pop = wrapper.querySelector(".search-popover");
    if (!pop) {
      pop = document.createElement("div");
      pop.className = "search-popover";
      pop.setAttribute("role", "listbox");
      pop.style.display = "none";
      wrapper.appendChild(pop);
    }
    return pop;
  }

  function renderResults(popover, results, query) {
    if (!popover) return;
    popover.innerHTML = "";
    if (!results.length) {
      const empty = document.createElement("div");
      empty.className = "search-item";
      empty.textContent = query ? "No matches" : "Type to search…";
      empty.setAttribute("aria-disabled", "true");
      popover.appendChild(empty);
      return;
    }
    results.forEach((r, i) => {
      const item = document.createElement("div");
      item.className = "search-item";
      item.setAttribute("role", "option");
      item.setAttribute("data-id", r.id);
      item.innerHTML = `<i class="fa-solid fa-arrow-right"></i> <span>${r.label}</span> <small>— ${r.breadcrumb}</small>`;
      if (i === 0) item.setAttribute("aria-selected", "true");
      popover.appendChild(item);
    });
  }

  function filterIndex(q) {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    // basic scoring: label startsWith > includes; breadcrumb includes
    const scored = index
      .map((it) => {
        const l = it.label.toLowerCase();
        const b = it.breadcrumb.toLowerCase();
        let score = -Infinity;
        if (l.startsWith(query)) score = 100 - (l.length - query.length);
        else if (l.includes(query)) score = 70 - l.indexOf(query);
        else if (b.includes(query)) score = 40 - b.indexOf(query);
        return { it, score };
      })
      .filter((s) => s.score > -Infinity);
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 8).map((s) => s.it);
  }

  /*************************
   * Helper: set nav active by hash (clears others)
   *************************/
  // Simple section hashes that correspond to BUTTONS (no <a.navlink>)
  const HASH_TO_SIMPLE_BTN = {
    "#Introduction": "btn-introduction",
    "#GetStarted": "btn-getStarted",
    "#LatestReleaseNotes": "btn-latestReleaseNotes",
  };

  // Ensure the right thing is active in the sidebar for any hash
  function setNavActiveByHash(hash) {
    const h = normalizeHash(hash);

    // 1) Clear current states
    clearAllLinkActive();
    clearAllGroupActive();

    // 2) If there is a real sidebar link, highlight it and keep its chain open
    const link = sideNav.querySelector(`a.navlink[href="${h}"]`);
    if (link) {
      // Keep only this link’s ancestor groups open
      const panel = link.closest('ul[id^="sub-"]');
      const keepBtns = [];
      if (panel) {
        const thisBtn = getButtonForPanel(panel);
        if (thisBtn) keepBtns.push(thisBtn);
        keepBtns.push(...getAncestorButtons(panel));
        closeAllGroups(keepBtns);
        openPanelChain(panel);
        if (keepBtns[0]) setGroupActive(keepBtns[0], true);
      } else {
        closeAllGroups();
      }

      link.classList.add("is-active", ...ACTIVE_BG);
      link.setAttribute("aria-current", "page");
      return;
    }

    // 3) Otherwise it's a "simple" section → highlight its BUTTON
    const btnId = HASH_TO_SIMPLE_BTN[h];
    const btn = btnId ? document.getElementById(btnId) : null;
    if (btn) {
      closeAllGroups(btn);
      setGroupActive(btn, true);
      return;
    }

    // 4) As a fallback, if it’s a top-level group hash, keep that group open/active
    const grp = HASH_TO_GROUP[h];
    if (grp) {
      const gbtn = document.getElementById(grp.btn);
      const gpanel = document.getElementById(grp.panel);
      if (gbtn && gpanel) {
        closeAllGroups([gbtn, ...getAncestorButtons(gpanel)]);
        openPanelChain(gpanel);
        setGroupActive(gbtn, true);
      }
    }
  }

  // Handle selection: open side, expand accordions, highlight, go to section
  function selectItem(item) {
    if (!item) return;

    // Open sidebar if closed (keeps your logic)
    openSidebar();

    const h = `#${item.id}`;

    // If the index entry came from a real anchor, expand its parents
    if (item.element instanceof HTMLElement) {
      const linkEl = item.element;
      expandAccordionsFor(linkEl);

      // Keep its ancestor buttons open, close the rest
      const panel = linkEl.closest('ul[id^="sub-"]');
      const keepBtns = [];
      if (panel) {
        const thisBtn = getButtonForPanel(panel);
        if (thisBtn) keepBtns.push(thisBtn);
        keepBtns.push(...getAncestorButtons(panel));
      }
      closeAllGroups(keepBtns);
      if (panel) openPanelChain(panel);
    } else {
      // Virtual parent (no real anchor) – open relevant top-level group
      if (item.id === "Tutorials") {
        const b = document.getElementById("btn-tutorials");
        b && b.getAttribute("aria-expanded") === "false" && b.click();
      }
      if (item.id === "addOns") {
        const b = document.getElementById("btn-addOns");
        b && b.getAttribute("aria-expanded") === "false" && b.click();
      }
      if (item.id === "UsefulMaterials") {
        const b = document.getElementById("btn-materials");
        b && b.getAttribute("aria-expanded") === "false" && b.click();
      }
      // When choosing a virtual parent, we still want to clear link actives
      clearAllLinkActive();
    }

    // Route + sync UI everywhere
    if (location.hash !== h) history.pushState({ hash: h }, "", h);
    navigateToHash(h); // show section
    setHeaderActive(h); // header highlight
    setNavActiveByHash(h); // sidebar: select one, unselect others

    // Optional: brief visual pulse on the chosen link
    const link = sideNav.querySelector(`a.navlink[href="${normalizeHash(h)}"]`);
    link &&
      (link.classList.add("active-nav"),
      link.scrollIntoView({ block: "nearest" }),
      setTimeout(() => link.classList.remove("active-nav"), 1500));
  }

  function attachSearch(inputEl) {
    if (!inputEl) return;
    const pop = ensurePopover(inputEl);
    let open = false;
    let activeIndex = 0;
    let current = [];

    const openPop = () => {
      if (pop) pop.style.display = "block";
      open = true;
    };
    const closePop = () => {
      if (pop) pop.style.display = "none";
      open = false;
    };

    function update() {
      const q = inputEl.value;
      current = filterIndex(q);
      renderResults(pop, current, q);
      if (!q) {
        closePop();
        return;
      }
      openPop();
      activeIndex = 0;
      updateSelection();
    }

    function updateSelection() {
      if (!pop) return;
      const items = Array.from(
        pop.querySelectorAll('.search-item[role="option"]')
      );
      items.forEach((el, i) =>
        el.setAttribute("aria-selected", i === activeIndex ? "true" : "false")
      );
    }

    function pick(i) {
      const item = current[i];
      if (!item) return;
      selectItem(item);
      inputEl.blur();
      closePop();
    }

    inputEl.addEventListener("input", update);
    inputEl.addEventListener("focus", () => {
      if (inputEl.value.trim()) update();
    });
    document.addEventListener("click", (e) => {
      if (!pop) return;
      if (!pop.contains(e.target) && e.target !== inputEl) closePop();
    });

    // Mouse click on results
    pop &&
      pop.addEventListener("click", (e) => {
        const itemEl = e.target.closest('.search-item[role="option"]');
        if (!itemEl) return;
        const id = itemEl.getAttribute("data-id");
        const i = current.findIndex((x) => x.id === id);
        if (i >= 0) pick(i);
      });

    // Keyboard navigation
    inputEl.addEventListener("keydown", (e) => {
      if (!open) return;
      const items = pop
        ? Array.from(pop.querySelectorAll('.search-item[role="option"]'))
        : [];
      const max = items.length - 1;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        activeIndex = Math.min(max, activeIndex + 1);
        updateSelection();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        activeIndex = Math.max(0, activeIndex - 1);
        updateSelection();
      } else if (e.key === "Enter") {
        e.preventDefault();
        pick(activeIndex);
      } else if (e.key === "Escape") {
        closePop();
      }
    });
  }

  attachSearch(searchDesktop);
  attachSearch(searchMobile);
})();

/*************************
 * Helper: clear search UI (only if there's text)
 *************************/
function clearSearchUI() {
  const desktop = document.getElementById("search-input");
  const mobile = document.getElementById("mobile-search-input");

  const inputs = [desktop, mobile].filter(Boolean);
  const hasText = inputs.some((i) => i.value && i.value.trim().length);

  if (!hasText) return; // nothing to do

  // clear text
  inputs.forEach((i) => (i.value = ""));

  // hide any open popovers
  inputs.forEach((i) => {
    const pop = i.parentElement?.querySelector(".search-popover");
    if (pop) {
      pop.style.display = "none";
      pop.innerHTML = "";
    }
  });

  // close mobile search drawer if open
  const drawer = document.getElementById("mobile-search");
  const toggleBtn = document.getElementById("mobile-search-toggle");
  if (
    drawer &&
    drawer.style.gridTemplateRows &&
    drawer.style.gridTemplateRows !== "0fr"
  ) {
    drawer.style.gridTemplateRows = "0fr";
    toggleBtn?.setAttribute("aria-expanded", "false");
  }
}
