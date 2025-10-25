import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_BASEURL, //"http://localhost:3000/api"
});

// attach token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
