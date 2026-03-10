import axios from "axios";

const api = axios.create({
  baseURL: "https://campus-complaint-management-backend.onrender.com",
});

// Attach JWT token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;