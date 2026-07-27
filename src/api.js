const TOKEN_KEY = 'webguard_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export async function api(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const auth = token ?? getToken();
  if (auth) headers.Authorization = `Bearer ${auth}`;

  const res = await fetch(path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }
  }

  if (!res.ok) {
    throw new ApiError(data?.error || `Request failed (${res.status})`, res.status);
  }

  return data;
}
