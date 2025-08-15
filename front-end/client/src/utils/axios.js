import axios from 'axios';

const API_BASE =
  (import.meta.env.VITE_API_URL?.replace(/\/$/, '')) || window.location.origin;

const instance = axios.create({
  baseURL: `${API_BASE}/api`,
});

delete instance.defaults.headers.post?.['Content-Type'];
delete instance.defaults.headers.put?.['Content-Type'];

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default instance;


