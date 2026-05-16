/* authServices.js */
import axiosClient from "./axiosClient";

const authService = {
  login: async (credentials) => {
    const response = await axiosClient.post("api/auth/token/", credentials);
    return response.data;
  },

  logout: async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      return null;
    }
    const response = await axiosClient.post("api/auth/logout/", {
      refresh: refreshToken,
    });
    return response.data;
  },
};

export default authService;