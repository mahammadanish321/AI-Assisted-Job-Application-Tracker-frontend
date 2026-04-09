import axios from 'axios';

// Ensure the base URL always has the /api suffix if not provided
const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (!envUrl) return 'http://localhost:5000/api';
  return envUrl.endsWith('/api') ? envUrl : `${envUrl.replace(/\/$/, '')}/api`;
};

export const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const userInfoStr = localStorage.getItem('userInfo');
  if (userInfoStr) {
    const userInfo = JSON.parse(userInfoStr);
    if (userInfo.accessToken) {
      config.headers.Authorization = `Bearer ${userInfo.accessToken}`;
    }
  }
  return config;
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Fixed path checks to be more robust
    const isLoginOrRefresh = originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && !originalRequest._retry && !isLoginOrRefresh) {
      
      if (isRefreshing) {
        try {
          const token = await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        } catch (err) {
          return Promise.reject(err);
        }
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post('/auth/refresh');
        
        const userInfoStr = localStorage.getItem('userInfo');
        if (userInfoStr) {
          const userInfo = JSON.parse(userInfoStr);
          userInfo.accessToken = data.accessToken;
          localStorage.setItem('userInfo', JSON.stringify(userInfo));
        }

        api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        
        processQueue(null, data.accessToken);
        
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem('userInfo');
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Auth
export const loginUser = async (data: any) => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

export const googleAuth = async (googleAccessToken: string) => {
  const response = await api.post('/auth/google', { googleAccessToken });
  return response.data;
};

export const registerUser = async (userInfo: any) => {
  const { data } = await api.post('/auth/register', userInfo);
  return data;
};

// ... existing application and profile functions stay the same, 
// but will now use the corrected baseURL correctly ...
export const getApplications = async () => {
  const { data } = await api.get('/applications');
  return data;
};
export const createApplication = async (appData: any) => {
  const { data } = await api.post('/applications', appData);
  return data;
};
export const updateApplication = async (id: string, updateData: any) => {
  const { data } = await api.put(`/applications/${id}`, updateData);
  return data;
};
export const deleteApplication = async (id: string) => {
  const { data } = await api.delete(`/applications/${id}`);
  return data;
};
export const parseJobDescription = async (jdText: string) => {
  const { data } = await api.post('/applications/parse', { jdText });
  return data;
};

// Profile
export const getProfile = async () => {
  const { data } = await api.get('/users/profile');
  return data;
};
export const updateProfile = async (profileData: any) => {
  const { data } = await api.put('/users/profile', profileData);
  return data;
};
export const addResume = async (resumeData: any) => {
  const { data } = await api.post('/users/resumes', resumeData);
  return data;
};
export const deleteResume = async (resumeId: string) => {
  const { data } = await api.delete(`/users/resumes/${resumeId}`);
  return data;
};

export const getCloudinarySignature = async (folder?: string) => {
  const { data } = await api.get('/users/cloudinary-signature', { params: { folder } });
  return data;
};

// Notifications
export const getNotifications = async () => {
  const { data } = await api.get('/notifications');
  return data;
};
export const getUnreadCount = async () => {
  const { data } = await api.get('/notifications/unread-count');
  return data;
};
export const markAsRead = async (id: string) => {
  const { data } = await api.put(`/notifications/${id}/read`);
  return data;
};
export const markAllAsRead = async () => {
  const { data } = await api.put('/notifications/read-all');
  return data;
};
export const deleteNotification = async (id: string) => {
  const { data } = await api.delete(`/notifications/${id}`);
  return data;
};

export const syncGmailNotifications = async (googleAccessToken: string) => {
  const { data } = await api.post('/notifications/sync-gmail', { googleAccessToken });
  return data;
};
