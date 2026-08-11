const backendOrigin = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export const apiRoot = `${backendOrigin}/api`;

function cookieValue(suffix) {
  const match = document.cookie
    .split('; ')
    .find(
      (item) =>
        item.startsWith(`toonswap_${suffix}=`) || item.startsWith(`__Host-toonswap_${suffix}=`),
    );
  return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : '';
}

export async function apiFetch(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const headers = new Headers(options.headers || {});
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const csrf = cookieValue('csrf');
    if (csrf) headers.set('x-toonswap-csrf', csrf);
  }
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const response = await fetch(`${apiRoot}${path}`, {
    ...options,
    method,
    headers,
    credentials: 'include',
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(
      Array.isArray(payload?.message)
        ? payload.message.join('. ')
        : payload?.message || 'Request failed',
    );
    error.status = response.status;
    error.payload = payload;
    throw error;
  }
  return payload;
}

export async function loginFetch(path, body, loginCsrf) {
  const response = await fetch(`${apiRoot}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'x-toonswap-login-csrf': loginCsrf,
    },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(
      Array.isArray(payload?.message)
        ? payload.message.join('. ')
        : payload?.message || 'Sign-in failed',
    );
    error.status = response.status;
    throw error;
  }
  return payload;
}
