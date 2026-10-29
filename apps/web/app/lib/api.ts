import axios from "axios";
import { readToken } from "./session";
import { config } from "./config";

export const api = axios.create({ baseURL: config.API_URL });

api.interceptors.request.use((config) => {
  const token = readToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
