import http from "./http";

const setCookie = (name, value, days = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
};

const removeCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Strict`;
};

export const authService = {
  login: async (nik, password) => {
    const response = await http.post("auth/login", { nik, password });
    const { access_token } = response.data;

    setCookie("access_token", access_token, 1); // 1 day

    return response;
  },
  logout: async () => {
    try {
      await http.post("auth/logout");
    } catch (error) {
      console.error("Logout from server failed:", error);
    }
    removeCookie("access_token");
    localStorage.clear();
    return true;
  },
  getUser: () => http.get("user-auth"),
};
