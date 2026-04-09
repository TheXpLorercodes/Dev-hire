import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

const api = axios.create({ baseURL: API_BASE });

export const submitGenerate = (payload) =>
  api.post("/api/generate", payload).then((r) => r.data);

export const pollJob = (jobId) =>
  api.get(`/api/jobs/${jobId}`).then((r) => r.data);

export const fetchHistory = (limit = 20, skip = 0) =>
  api.get(`/api/history?limit=${limit}&skip=${skip}`).then((r) => r.data);

export const fetchPersonas = () =>
  api.get("/api/personas").then((r) => r.data);

export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_BASE}${path}`;
};
