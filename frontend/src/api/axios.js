import axios from "axios";

const api = axios.create({
  baseURL:
    window.location.hostname === "localhost" ? "" : "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
