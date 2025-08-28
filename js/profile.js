import { ENDPOINTS } from "./api/config.js";
import { get, put } from "./api/http.js";
import { $, el } from "./utils/dom.js";
import { money } from "./utils/format.js";
import { getAuth, updateProfileLocal } from "./utils/storage.js";

//pub fallbacks
const PLACEHOLDER_IMG = "https://placehold.co/800x500?text=No+image";
const AVATAR_FALLBACK = "https://placehold.co/256x256?text=Avatar";
const BANNER_FALLBACK = "https://placehold.co/1200x260?text=Banner";

export async function loadProfile() {
  const me = getAuth();
  if (!me) { location.href = "./login.html"; return; }

  //load profile
  const res = await get(ENDPOINTS.profile(me.name));
  const p = res.data;

  //Header
  $("#name").textContent = p.name;
  $("#credits").textContent = p.credits;
  $("#avatar").src = p.avatar?.url || AVATAR_FALLBACK;
  const bannerEl = $("#banner");
  if (bannerEl) bannerEl.src = p.banner?.url || BANNER_FALLBACK;

  //form
  const form = $("#profileForm");
  form.bio.value = p.bio || "";
  form.avatar.value = p.avatar?.url || "";
  if (form.banner) form.banner.value = p.banner?.url || "";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const er = $("#profileError");
    er.textContent = "";
    er.classList.add("hidden");

    const btn = form.querySelector("button");
    if (btn) btn.disabled = true;

    const fd = new FormData(form);
    const bio = (fd.get("bio") || "").toString();
    const avatarUrl = (fd.get("avatar") || "").toString().trim();
    const bannerUrl = (fd.get("banner") || "").toString().trim();

    const isHttpUrl = (u) => /^https?:\/\/\S+$/i.test(u);

    const payload = { bio };

    //avatar
    if (avatarUrl === "") {
      payload.avatar = null; //remove
    } else if (isHttpUrl(avatarUrl)) {
      payload.avatar = { url: avatarUrl, alt: `${p.name} avatar` };
    } else {
      er.textContent = "Avatar must be a full http(s) URL or leave blank to remove.";
      er.classList.remove("hidden");
      if (btn) btn.disabled = false;
      return;
    }

    //Bnanner
    if (bannerUrl === "") {
      payload.banner = null; //remove
    } else if (isHttpUrl(bannerUrl)) {
      payload.banner = { url: bannerUrl, alt: `${p.name} banner` };
    } else {
      er.textContent = "Banner must be a full http(s) URL or leave blank to remove.";
      er.classList.remove("hidden");
      if (btn) btn.disabled = false;
      return;
    }

    try {
      const upd = await put(ENDPOINTS.profileUpdate(me.name), payload);

      updateProfileLocal({
        avatar: upd.data.avatar?.url || "",
        banner: upd.data.banner?.url || "",
      });

      $("#avatar").src = upd.data.avatar?.url || AVATAR_FALLBACK;
      if (bannerEl) bannerEl.src = upd.data.banner?.url || BANNER_FALLBACK;

      form.avatar.value = upd.data.avatar?.url || "";
      if (form.banner) form.banner.value = upd.data.banner?.url || "";
    } catch (e2) {
      er.textContent = e2.message || "Update failed.";
      er.classList.remove("hidden");
    } finally {
      if (btn) btn.disabled = false;
    }
  });

  //listings
  const myLs = await get(ENDPOINTS.profileListings(me.name));
  const myGrid = $("#myListings"); myGrid.innerHTML = "";
  (myLs.data || []).forEach(l => {
    const topBid = l.bids?.length ? Math.max(...l.bids.map(b => b.amount)) : 0;
    myGrid.append(
      el("a", { href: `./listing.html?id=${l.id}`, className: "listing-card card" }, [
        el("img", { src: l.media?.[0]?.url || PLACEHOLDER_IMG, alt: l.title }),
        el("strong", { textContent: l.title }),
        el("span", { textContent: `Top bid: ${money(topBid)}` }),
      ])
    );
  });

  //your bids
  const myBs = await get(ENDPOINTS.profileBids(me.name));
  const bidsGrid = $("#myBids"); bidsGrid.innerHTML = "";
  (myBs.data || []).forEach(b => {
    bidsGrid.append(
      el("a", { href: `./listing.html?id=${b.listing?.id}`, className: "listing-card card" }, [
        el("img", { src: b.listing?.media?.[0]?.url || PLACEHOLDER_IMG, alt: b.listing?.title || "Listing" }),
        el("strong", { textContent: b.listing?.title || "Listing" }),
        el("span", { textContent: `Your bid: ${money(b.amount)}` }),
      ])
    );
  });
}
