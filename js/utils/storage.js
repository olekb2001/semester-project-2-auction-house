const KEY = "ah_user";

export function saveAuth({ accessToken, name, email, credits, avatar, banner, apiKey }) {
  localStorage.setItem(
    KEY,
    JSON.stringify({ accessToken, name, email, credits, avatar, banner, apiKey })
  );
}

export function getAuth() {
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : null;
}

export function getToken() {
  return getAuth()?.accessToken || null;
}

export function getApiKey() {
  return getAuth()?.apiKey || null;
}

export function clearAuth() {
  localStorage.removeItem(KEY);
}

export function updateCredits(credits) {
  const me = getAuth(); if (!me) return;
  saveAuth({ ...me, credits });
}

export function updateProfileLocal(patch) {
  const me = getAuth(); if (!me) return;
  saveAuth({ ...me, ...patch });
}
