import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const base = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: base,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

let refreshPromise: Promise<string | null> | null = null;

function normalizeToken(token: string) {
  return token.replace(/^Bearer\s+/i, '').trim();
}

function saveTokens(accessToken: string, refreshToken?: string) {
  const normalizedAccessToken = normalizeToken(accessToken);
  localStorage.setItem('accessToken', normalizedAccessToken);
  localStorage.setItem('token', normalizedAccessToken);
  if (refreshToken) localStorage.setItem('refreshToken', normalizeToken(refreshToken));
}

async function refreshAccessToken(): Promise<string | null> {
  const storedRefreshToken = localStorage.getItem('refreshToken');
  if (!storedRefreshToken) return null;
  const refreshToken = normalizeToken(storedRefreshToken);

  try {
    const response = await axios.post<{ accessToken: string; refreshToken?: string }>(
      `${base}/api/v1/auth/refresh`,
      { refreshToken },
      { headers: { 'Content-Type': 'application/json' } },
    );
    saveTokens(response.data.accessToken, response.data.refreshToken);
    return response.data.accessToken;
  } catch {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('token');
    return null;
  }
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${normalizeToken(token)}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const status = error.response?.status;
    const isRefreshRequest = originalRequest?.url?.includes('/api/v1/auth/refresh');

    if (status !== 401 || !originalRequest || originalRequest._retry || isRefreshRequest) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    refreshPromise ??= refreshAccessToken().finally(() => {
      refreshPromise = null;
    });

    const accessToken = await refreshPromise;
    if (!accessToken) return Promise.reject(error);

    // O JWT renovado precisa ser usado explicitamente no retry da requisição original.
    const authorization = `Bearer ${normalizeToken(accessToken)}`;
    originalRequest.headers = originalRequest.headers ?? {};
    originalRequest.headers.Authorization = authorization;
    api.defaults.headers.common.Authorization = authorization;
    return api.request(originalRequest);
  },
);

export default api;
