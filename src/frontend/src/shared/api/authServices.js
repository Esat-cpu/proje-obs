/* authServices.js */
import axiosClient from "./axiosClient";

const authService = {
    async login(credentials) {
        const response = await axiosClient.post("api/auth/token/", credentials);
        return response.data; // { access, refresh, role }
    },

    async refreshToken(refreshToken) {
        const response = await axiosClient.post("api/auth/token/refresh/", { refresh: refreshToken });
        return response.data; // { access }
    },

    async logout() {
        // Eğer backend'te logout endpoint varsa
        await axiosClient.post("api/auth/logout/");
    },

    // Diğer metodlar (profil güncelleme vb.)
};

export default authService;