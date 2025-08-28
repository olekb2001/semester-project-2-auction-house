import { getAuth, clearAuth } from "./utils/storage.js";
import { $, show } from "./utils/dom.js";
import { ENDPOINTS } from "./api/config.js";
import { get } from "./api/http.js";
import { updateProfileLocal } from "./utils/storage.js";


//shared nav
fetch("./nav.html")
  .then(r => r.text())
  .then(html => {
    const slot = document.getElementById("site-header");
    if (!slot) return;
    slot.innerHTML = html;

const current = location.pathname.split("/").pop() || "index.html";
document.querySelectorAll(".nav a:not(.logo)").forEach(a => {
  const href = a.getAttribute("href");
  if (href && href.endsWith(current)) a.classList.add("active");
  });


    renderNav();
  });

function renderNav() {
  const me = getAuth();
  const loginLink = document.getElementById("loginLink");
  const profileLink = document.getElementById("profileLink");
  const createLink = document.getElementById("createLink");
  const logoutBtn = document.getElementById("logoutBtn");
  const creditsBadge = document.getElementById("creditsBadge");

  if (me) {
    if (loginLink) show(loginLink, false);
    [profileLink, createLink, logoutBtn, creditsBadge].forEach(n => n && show(n, true));

    if (creditsBadge) {
      const localCredits = Number.isFinite(me.credits) ? me.credits : null;
      creditsBadge.textContent = `Credits: ${localCredits ?? "…"}`;
      refreshCreditsBadge(me).catch(() => {
        creditsBadge.textContent = `Credits: —`;
      });
    }
  } else {
    [profileLink, createLink, logoutBtn, creditsBadge].forEach(n => n && show(n, false));
    if (loginLink) show(loginLink, true);
  }

  if (logoutBtn) logoutBtn.addEventListener("click", () => {
    clearAuth();
    location.href = "./index.html";
  });

  const search = document.getElementById("globalSearch");
  if (search) search.addEventListener("submit", (e) => {
    e.preventDefault();
    const val = new FormData(search).get("q");
    const q = (val ? String(val) : "").trim();
    location.href = `./index.html?q=${encodeURIComponent(q)}`;
  });
}
async function refreshCreditsBadge(me) {
  const badge = document.getElementById("creditsBadge");
  if (!badge || !me?.name) return;

  try {
    const res = await get(ENDPOINTS.profile(me.name));
    const credits = res?.data?.credits ?? 0;
    badge.textContent = `Credits: ${credits}`;
    try { updateProfileLocal({ credits }); } catch {}
  } catch (err) {
    console.warn("Could not load credits:", err);
    badge.textContent = "Credits: —";
  }
}



export { renderNav };
