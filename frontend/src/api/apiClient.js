import axios from "axios"
import {API_BASE_URL} from '@/config/index';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {"Content-Type":"application/json"},
    timeout: 60000, // 60 seconds - AI generation can take time
    withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/auth' && currentPath !== '/') {
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;