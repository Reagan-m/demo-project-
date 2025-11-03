import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:4040/api", // Adjust your backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token automatically if needed
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});
