import axios from "axios";

const BASE = "/api"; // proxied to http://localhost:5000 via package.json proxy

export const getProjects    = ()       => axios.get(`${BASE}/projects`);
export const createProject  = (data)   => axios.post(`${BASE}/projects`, data);
export const deleteProject  = (id)     => axios.delete(`${BASE}/projects/${id}`);

export const getTasks       = (projectId) => axios.get(`${BASE}/tasks${projectId ? `?project=${projectId}` : ""}`);
export const createTask     = (data)      => axios.post(`${BASE}/tasks`, data);
export const updateTaskStatus = (id, status) => axios.patch(`${BASE}/tasks/${id}/status`, { status });
export const deleteTask     = (id)        => axios.delete(`${BASE}/tasks/${id}`);

export const getDocs    = (projectId) => axios.get(`${BASE}/docs${projectId ? `?project=${projectId}` : ""}`);
export const getDoc     = (id)        => axios.get(`${BASE}/docs/${id}`);
export const createDoc  = (data)      => axios.post(`${BASE}/docs`, data);
export const updateDoc  = (id, data)  => axios.put(`${BASE}/docs/${id}`, data);
export const deleteDoc  = (id)        => axios.delete(`${BASE}/docs/${id}`);

export const getRepos   = (projectId) => axios.get(`${BASE}/repos${projectId ? `?project=${projectId}` : ""}`);
export const createRepo = (data)      => axios.post(`${BASE}/repos`, data);
export const deleteRepo = (id)        => axios.delete(`${BASE}/repos/${id}`);
