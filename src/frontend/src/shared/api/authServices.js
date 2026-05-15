/* authServices.js */
import axiosClient from "./axiosClient";

const authService = {
  login: async (credentials) => {
    const response = await axiosClient.post("api/auth/token/", credentials);
    return response.data; 
  },
  
  // LOGOUT METODUNU BURADAN TAMAMEN SİLDİK 🗑️
};

export default authService;