import axios from "axios";

const setCookie = (name, value, days = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
};

const getCookie = (name) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const removeCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Strict`;
};

const http = axios.create({
  baseURL: import.meta.env.VITE_BASE_API,
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

http.interceptors.request.use((config) => {
  const token = getCookie("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

http.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response) {
      if (error.response.status === 401 && !originalRequest._retry) {
        // Jangan lakukan redirect otomatis jika kita memang sedang mencoba login
        if (originalRequest.url?.includes('auth/login')) {
          return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
          const response = await axios.post(
            `${import.meta.env.VITE_BASE_API}/auth/refresh`,
            {},
            {
              withCredentials: true,
              headers: {
                Authorization: `Bearer ${getCookie("access_token")}`
              }
            }
          );

          const { access_token } = response.data;

          setCookie("access_token", access_token, 1); // 1 day

          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return http(originalRequest);
        } catch (refreshError) {
          console.error("Refresh token failed:", refreshError);
        }

        removeCookie("access_token");
        localStorage.clear();

        // Hanya redirect jika tidak sedang di halaman login
        if (!window.location.pathname.includes('/auth/login')) {
          window.location.href = "/auth/login";
        }
      }

      if (error.response.status === 403) {
        console.error("Forbidden access");
      }

      if (error.response.status === 500) {
        console.error("Server error");
      }
    }
    return Promise.reject(error);
  },
);

export default http;
