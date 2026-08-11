import axios from 'axios';

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

export const apiClient = axios.create({
  baseURL: apiRoot,
  withCredentials: true,
  timeout: 30_000,
  headers: { Accept: 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const method = (config.method || 'get').toUpperCase();
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const csrf = cookieValue('csrf');
    if (csrf) config.headers.set('x-toonswap-csrf', csrf);
  }
  return config;
});

let redirectingAfterExpiry = false;
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const payload = error.response?.data;
    error.status = status;
    error.payload = payload;
    const serviceUnavailable = [502, 503, 504].includes(status);
    error.message = serviceUnavailable
      ? 'The ToonSwap service is temporarily unavailable. Please try again shortly.'
      : Array.isArray(payload?.message)
        ? payload.message.join('. ')
        : payload?.message || error.message || 'Request failed';

    if (
      status === 401 &&
      !error.config?.skipAuthRedirect &&
      typeof window !== 'undefined' &&
      !redirectingAfterExpiry
    ) {
      redirectingAfterExpiry = true;
      window.dispatchEvent(new CustomEvent('toonswap:session-expired'));
      window.location.assign('/?session=expired');
    }
    return Promise.reject(error);
  },
);
