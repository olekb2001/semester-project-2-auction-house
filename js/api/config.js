export const API_BASE = "https://v2.api.noroff.dev";
export const AUCTION = `${API_BASE}/auction`;
export const AUTH = `${API_BASE}/auth`;
export const ENDPOINTS = {
  register: `${AUTH}/register`,
  login: `${AUTH}/login`,
  profile: (name) => `${AUCTION}/profiles/${encodeURIComponent(name)}`,
  profileUpdate: (name) => `${AUCTION}/profiles/${encodeURIComponent(name)}`,
  profileListings: (name) => `${AUCTION}/profiles/${encodeURIComponent(name)}/listings?sort=created&sortOrder=desc&limit=50&_bids=true`,
  profileBids: (name) => `${AUCTION}/profiles/${encodeURIComponent(name)}/bids?sort=created&sortOrder=desc&limit=50&_listings=true`,
  listings: `${AUCTION}/listings?sort=created&sortOrder=desc&_seller=true&_bids=true`,
  listing: (id) => `${AUCTION}/listings/${id}?_seller=true&_bids=true`,
  createListing: `${AUCTION}/listings`,
  updateListing: (id) => `${AUCTION}/listings/${id}`,
  deleteListing: (id) => `${AUCTION}/listings/${id}`,
  bid: (id) => `${AUCTION}/listings/${id}/bids`,
  searchListings: (q) =>
    `${AUCTION}/listings/search?q=${encodeURIComponent(q)}&_seller=true&_bids=true&sort=created&sortOrder=desc&limit=30`,
};
