import { getToken, getApiKey } from "../utils/storage.js";

async function handle(res) {
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const msg = data?.errors?.[0]?.message || data?.message || res.statusText;
    throw new Error(msg);
  }
  return data;
}

function commonHeaders() {
  const token = getToken();
  const apiKey = getApiKey();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(apiKey ? { "X-Noroff-API-Key": apiKey } : {}),
  };
}

export async function get(url) {
  const res = await fetch(url, { headers: commonHeaders() });
  return handle(res);
}

export async function post(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: commonHeaders(),
    body: JSON.stringify(body),
  });
  return handle(res);
}

export async function put(url, body) {
  const res = await fetch(url, {
    method: "PUT",
    headers: commonHeaders(),
    body: JSON.stringify(body),
  });
  return handle(res);
}

export async function del(url) {
  const res = await fetch(url, {
    method: "DELETE",
    headers: commonHeaders(),
  });
  return handle(res);
}


