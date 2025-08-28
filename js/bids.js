import { ENDPOINTS } from "./api/config.js";
import { post } from "./api/http.js";
import { $, show } from "./utils/dom.js";

export function initBidForm(listingId) {
  const form = $("#bidForm"); if (!form) return;
  const err = $("#bidError");
  form.addEventListener("submit", async (e) => {
    e.preventDefault(); show(err, false);
    const amount = Number(new FormData(form).get("amount"));
    try {
      await post(ENDPOINTS.bid(listingId), { amount });
      location.reload();
    } catch (e) {
      err.textContent = e.message; show(err, true);
    }
  });
}
