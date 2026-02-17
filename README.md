# CrimsonBid — Auction House (Semester Project 2)

Front-end for the **Noroff Auction House API v2**. Built with **vanilla JavaScript**, **HTML**, and **CSS** (no front-end frameworks). Users can browse listings, search, register/login with `@stud.noroff.no`, create/manage listings, and place bids.

> **Status:** MVP complete — responsive (mobile → desktop), accessible dark/red theme.

---

## ✨ Features

- **Public**
  - Browse listings grid
  - Search listings
  - View single listing (media, seller, stats, bid history)
- **Auth**
  - Register + login (**email must end with `@stud.noroff.no`**)
  - Global credits badge (visible when logged in)
- **Profile**
  - View credits, update bio
  - Set/remove **avatar** and **banner** via full `http(s)` URLs
  - See **My Listings** and **My Bids**
- **Listings**
  - Create listing (title, description, end date/time in future, media URLs — one per line)
  - Edit & delete (owner only)
  - Place bids on others’ listings, with history
- **UX**
  - Empty, loading, and error states
  - Keyboard focus rings, high-contrast colors
- **Deploy-friendly**
  - Works on static hosts (GitHub Pages / Netlify / Vercel)

---

## 🛠 Tech & Constraints

- **Vanilla**: HTML + CSS + JavaScript (or TypeScript transpiled to JS if desired)
- **No frameworks**: React, Vue, Next, Nuxt, etc. **not permitted**
- **CSS**: custom (optionally Tailwind/Bootstrap allowed by brief, but this project uses custom CSS)
- **API**: Noroff **v2** (`https://v2.api.noroff.dev`)

---

## 🔧 Portfolio 2 Improvements

For Portfolio 2, I reviewed tutor feedback and made the following improvements:

- Prevented duplicate navigation event listeners in `main.js` by ensuring listeners are only attached once.
- Improved error handling by removing an empty `catch` block and adding proper error logging.
- Minor code cleanup and formatting improvements for better readability.

These changes improve code stability, maintainability, and overall project quality.