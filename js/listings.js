import { ENDPOINTS } from "./api/config.js";
import { get, post, put, del } from "./api/http.js";
import { $, el, show } from "./utils/dom.js";
import { money, endsBadge } from "./utils/format.js";
import { getAuth } from "./utils/storage.js";

const PLACEHOLDER_IMG = "https://placehold.co/800x500?text=No+image";
const isHttpUrl = (u) => /^https?:\/\/\S+$/i.test(u);

function card(listing) {
  const img = listing.media?.[0]?.url || PLACEHOLDER_IMG;
  const bids = Array.isArray(listing.bids) ? listing.bids : [];
  const topBid = bids.length ? Math.max(...bids.map(b => b.amount)) : 0;

  return el("a", { className: "listing-card card", href: `./listing.html?id=${listing.id}` }, [
    el("div", { className: "thumb" }, [
      el("img", { src: img, alt: listing.title }),
      el("span", { className: "listing-badge", textContent: endsBadge(listing.endsAt) }),
    ]),
    el("div", { className: "listing-body" }, [
      el("h3", { className: "title", textContent: listing.title }),
      el("div", { className: "meta" }, [
        el("span", { className: "price", textContent: `Top bid: ${money(topBid)}` }),
        el("span", { className: "muted", textContent: `${bids.length} bid${bids.length === 1 ? "" : "s"}` }),
      ]),
    ]),
  ]);
}

export async function listListings({ q = "" } = {}) {
  const grid = $("#listingsGrid");
  const empty = $("#emptyState");

  grid.innerHTML = "";
  show(empty, false);

  const url = (q && q.trim())
    ? ENDPOINTS.searchListings(q.trim())
    : ENDPOINTS.listings + "&limit=30";

  try {
    const res = await get(url);
    const items = res.data || [];
    if (!items.length) { show(empty, true); return; }
    items.forEach(l => grid.append(card(l)));
  } catch (err) {
    console.error("Failed to load listings:", err);
    empty.textContent = err.message || "Failed to load listings.";
    show(empty, true);
  }
}

export async function loadListing(id) {
  const wrap = $("#listing");
  if (!id) {
    wrap.innerHTML = "<p class='error'>No listing ID provided.</p>";
    return;
  }

  try {
    const res = await get(ENDPOINTS.listing(id));
    const l = res.data;

    const me = getAuth();
    const isOwner = me && me.name === l.seller?.name;
    const ended = new Date(l.endsAt) < new Date();
    const bids = (l.bids || []).slice().sort((a, b) => b.amount - a.amount);
    const topBid = bids.length ? bids[0].amount : 0;
    const heroImg = l.media?.[0]?.url || "https://placehold.co/1200x750?text=No+image";
    const sellerAvatar = l.seller?.avatar?.url || "https://placehold.co/64x64?text=User";

    //Build the page 
    wrap.innerHTML = "";

    wrap.append(
      el("nav", { className: "crumbs" }, [
        el("a", { href: "./index.html" }, ["← Back to listings"])
      ])
    );

    const hero = el("section", { className: "listing-hero card" });

    const media = el("div", { className: "hero-media" }, [
      el("img", { src: heroImg, alt: l.title })
    ]);

    const info = el("div", { className: "hero-info" }, [
      el("h1", { className: "hero-title", textContent: l.title }),
      el("div", { className: "hero-row" }, [
        el("span", { className: "pill" }, [
          el("img", { src: sellerAvatar, alt: `${l.seller?.name || "Seller"} avatar` }),
          el("span", { textContent: l.seller?.name || "Unknown" }),
        ]),
        el("span", { className: "badge-soft", textContent: endsBadge(l.endsAt) }),
      ]),
      el("ul", { className: "stat-list" }, [
        el("li", {}, [ el("span", { className: "stat-label", textContent: "Top bid" }), el("strong", { className: "stat-value", textContent: money(topBid) }) ]),
        el("li", {}, [ el("span", { className: "stat-label", textContent: "Bids"    }), el("strong", { className: "stat-value", textContent: String(bids.length) }) ]),
        el("li", {}, [ el("span", { className: "stat-label", textContent: "Status"  }), el("strong", { className: "stat-value", textContent: ended ? "Ended" : "Live" }) ]),
      ]),
      // actionss
      el("div", { className: "actions" }, [
        ...(isOwner ? [
          el("a", { href: `./create.html?id=${l.id}`, className: "btn" }, ["Edit listing"]),
          (() => {
            const b = el("button", { className: "btn danger", textContent: "Delete" });
            b.addEventListener("click", async () => {
              if (!confirm("Delete this listing?")) return;
              try {
                await del(ENDPOINTS.deleteListing(id));
                location.href = "./index.html";
              } catch (e) { alert(e.message || "Failed to delete listing."); }
            });
            return b;
          })()
        ] : [
          (() => {
            const b = el("button", { className: "btn", textContent: ended ? "Auction ended" : "Place a bid" });
            b.disabled = ended;
            b.addEventListener("click", () => {
              const s = document.getElementById("bidSection");
              if (s) s.scrollIntoView({ behavior: "smooth", block: "start" });
            });
            return b;
          })()
        ])
      ])
    ]);

    hero.append(media, info);
    wrap.append(hero);

    //desc
    wrap.append(
      el("section", { className: "card section" }, [
        el("h3", { textContent: "Description" }),
        el("p", { className: l.description ? "" : "muted", textContent: l.description || "No description provided." })
      ])
    );

    const rest = (l.media || []).slice(1);
    if (rest.length) {
      const g = el("section", { className: "card section" }, [
        el("h3", { textContent: "Gallery" }),
        el("div", { className: "gallery" })
      ]);
      const gl = g.querySelector(".gallery");
      rest.forEach(m => gl.append(el("img", { src: m.url, alt: l.title })));
      wrap.append(g);
    }

    const bidsSec = el("section", { className: "card section" }, [
      el("h3", { textContent: "Bid history" }),
      (() => {
        if (!bids.length) return el("p", { className: "muted", textContent: "No bids yet." });
        const ul = el("ul", { className: "bid-list" });
        bids.forEach(b => {
          ul.append(
            el("li", { className: "bid-item" }, [
              el("div", { className: "bid-user", textContent: b.bidder?.name || "Bidder" }),
              el("div", { className: "bid-amount", textContent: money(b.amount) })
            ])
          );
        });
        return ul;
      })()
    ]);
    wrap.append(bidsSec);

    const canBid = getAuth() && (!isOwner) && !ended;
    show($("#bidSection"), !!canBid);

  } catch (err) {
    console.error("Failed to load listing:", err);
    $("#listing").innerHTML = `<p class="error">${err.message || "Failed to load listing."}</p>`;
    show($("#bidSection"), false);
  }
}

export function initCreateForm() {
  if (!getAuth()) { location.href = "./login.html"; return; }

  const form = $("#createForm");
  const err = $("#createError");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    err.textContent = "";
    err.classList.add("hidden");

    const fd = new FormData(form);

    const endsLocal = fd.get("endsAt");
    const endsAtISO = new Date(endsLocal).toISOString();
    if (Number.isNaN(new Date(endsLocal).getTime()) || new Date(endsAtISO) <= new Date()) {
      err.textContent = "Please choose an end date/time in the future.";
      err.classList.remove("hidden");
      return;
    }

    const mediaLines = (fd.get("media") || "").toString()
      .split("\n").map(s => s.trim()).filter(Boolean)
      .filter(isHttpUrl);

    const payload = {
      title: fd.get("title").toString().trim(),
      description: (fd.get("description") || "").toString(),
      endsAt: endsAtISO,
      media: mediaLines.map(url => ({ url })),
    };

    try {
      const res = await post(ENDPOINTS.createListing, payload);
      location.href = `./listing.html?id=${res.data.id}`;
    } catch (e) {
      err.textContent = e.message || "Failed to create listing.";
      err.classList.remove("hidden");
    }
  });
}

export async function initEditMode(id) {
  
  if (!getAuth()) { location.href = "./login.html"; return; }

  const form = $("#createForm");
  const err = $("#createError");
  if (!form) return;

  try {
    const res = await get(ENDPOINTS.listing(id));
    const l = res.data;
    form.title.value = l.title || "";
    form.description.value = l.description || "";
    form.endsAt.value = new Date(l.endsAt).toISOString().slice(0, 16);
    form.media.value = (l.media || []).map(m => m.url).join("\n");
  } catch (e) {
    err.textContent = e.message || "Failed to load listing.";
    err.classList.remove("hidden");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    err.textContent = ""; err.classList.add("hidden");

    const fd = new FormData(form);
    const endsAtISO = new Date(fd.get("endsAt")).toISOString();
    if (Number.isNaN(new Date(endsAtISO).getTime()) || new Date(endsAtISO) <= new Date()) {
      err.textContent = "Please choose an end date/time in the future.";
      err.classList.remove("hidden");
      return;
    }

    const mediaLines = (fd.get("media") || "").toString()
      .split("\n").map(s => s.trim()).filter(Boolean)
      .filter(isHttpUrl);

    const payload = {
      title: fd.get("title").toString().trim(),
      description: (fd.get("description") || "").toString(),
      endsAt: endsAtISO,
      media: mediaLines.map(url => ({ url })),
    };

    try {
      await put(ENDPOINTS.updateListing(id), payload);
      location.href = `./listing.html?id=${id}`;
    } catch (e2) {
      err.textContent = e2.message || "Failed to update listing.";
      err.classList.remove("hidden");
    }
  });
}
