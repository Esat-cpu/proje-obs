import axios from "axios";

const axiosClient = axios.create({
  // Ortam değişkenlerinden API URL'ini alıyoruz, yoksa varsayılan bir adres kullanıyoruz.
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosClient;