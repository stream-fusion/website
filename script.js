// Section fade-in (optional nicety)
tailwind.config = { darkMode: "class" };

(function () {
  const saved = localStorage.getItem("theme"); // 'dark' | 'light' | null
  const startDark = saved ? saved === "dark" : true; // your requirement: default dark
  document.documentElement.classList.toggle("dark", startDark);
})();

const revealOnScroll = () => {
  document.querySelectorAll(".fade-section").forEach((el) => {
    const trigger = window.innerHeight * 0.9;
    if (el.getBoundingClientRect().top < trigger)
      el.classList.add("is-visible");
  });
};
document.addEventListener("scroll", revealOnScroll, { passive: true });
document.addEventListener("DOMContentLoaded", revealOnScroll);

// Theme toggle (works because light defaults are correct now)
document.addEventListener("DOMContentLoaded", () => {
  const html = document.documentElement;
  const btn = document.getElementById("theme-toggle");

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
