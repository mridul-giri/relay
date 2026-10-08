import axios from "axios";
import { readToken } from "./session";

export const api = axios.create();

api.interceptors.request.use((config) => {
  const token = readToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
