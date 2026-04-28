import axios from "axios";

const axiosClient = axios.create({
  // Ortam değişkenlerinden API URL'ini alıyoruz.
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosClient;