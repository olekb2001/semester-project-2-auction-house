import { ENDPOINTS, API_BASE } from "./api/config.js";
import { post } from "./api/http.js";
import { saveAuth } from "./utils/storage.js";
import { $, show } from "./utils/dom.js";

function validNoroff(email) {
  return /@stud\.noroff\.no$/i.test(email);
}

async function createApiKeyWithToken(accessToken) {
  const res = await fetch(`${API_BASE}/auth/create-api-key`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({}), 
  });
  const data = await res.json();
  if (!res.ok) {
    const msg = data?.errors?.[0]?.message || data?.message || res.statusText;
    throw new Error(msg || "Failed to create API key");
  }
  return data?.data?.key;
}

async function handleLoginAndStore(formEmail, formPassword) {
  
  const loginRes = await post(ENDPOINTS.login, {
    email: formEmail,
    password: formPassword,
  });

  
  const {
    accessToken,
    name,
    email,
    credits,
    avatar,
    banner,
  } = loginRes.data;

  const apiKey = await createApiKeyWithToken(accessToken);

  saveAuth({
    accessToken,
    name,
    email,
    credits,
    avatar: avatar?.url || "",
    banner: banner?.url || "",
    apiKey,
  });
}

export function initAuthForms() {
  const reg = $("#registerForm");
  const log = $("#loginForm");
  const err = $("#authError");

  if (reg) reg.addEventListener("submit", async (e) => {
    e.preventDefault(); show(err, false);
    const form = new FormData(reg);
    const email = form.get("email").trim();
    const password = form.get("password");
    const name = form.get("name").trim();

    if (!validNoroff(email)) {
      err.textContent = "Registration requires a @stud.noroff.no email.";
      show(err, true); return;
    }

    try {
      //register
      await post(ENDPOINTS.register, { name, email, password });
      await handleLoginAndStore(email, password);
      location.href = "./index.html";
    } catch (e) {
      err.textContent = e.message; show(err, true);
    }
  });

  if (log) log.addEventListener("submit", async (e) => {
    e.preventDefault(); show(err, false);
    const form = new FormData(log);
    const email = form.get("email").trim();
    const password = form.get("password");

    try {
      await handleLoginAndStore(email, password);
      location.href = "./index.html";
    } catch (e) {
      err.textContent = e.message; show(err, true);
    }
  });
}
