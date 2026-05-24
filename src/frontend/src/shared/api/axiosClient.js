import axios from "axios";

const axiosClient = axios.create({
  // Ortam değişkenlerinden API URL'ini alıyoruz.
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
// REQUEST interceptor — her isteğe token ekle
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
// RESPONSE interceptor — 401 gelince token yenile (kuyruk mekanizması ile)
let isRefreshing = false;
let refreshSubscribers = [];

// Kuyruktaki tüm istekleri yeni token ile serbest bırak
const onRefreshed = (newToken) => {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
};

// Bekleyen isteği kuyruğa ekle
const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Login/token isteği 401 aldıysa refresh deneme, hatayı direkt döndür
    if (originalRequest?.url?.includes("token")) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("role");
        window.location.href = "/";
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      // Zaten bir refresh devam ediyorsa → bu isteği kuyruğa al
      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(axiosClient(originalRequest));
          });
        });
      }

      // İlk 401 → refresh'i tetikle
      isRefreshing = true;

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/auth/token/refresh/`,
          { refresh: refreshToken }
        );
        const newToken = response.data.access;
        const newRefreshToken = response.data.refresh;
        localStorage.setItem("access_token", newToken);
        if (newRefreshToken) {
          localStorage.setItem("refreshToken", newRefreshToken);
        }
        axiosClient.defaults.headers.common.Authorization = `Bearer ${newToken}`;

        // Kuyruktaki istekleri yeni token ile gönder
        onRefreshed(newToken);

        // Bu isteği de yeni token ile tekrarla
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("role");
        window.location.href = "/";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
export default axiosClient;