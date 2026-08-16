import axios from 'axios';

// Vite proxy resolves empty baseURL requests locally and proxies them to the backend.
const API = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const enquiryService = {
  create: async (data) => {
    const res = await API.post('/api/enquiries', data);
    return res.data;
  },
  createSync: async (data) => {
    const res = await API.post('/api/enquiries/sync', data);
    return res.data;
  },
  list: async (params = {}) => {
    const res = await API.get('/api/enquiries', { params });
    return res.data;
  },
  get: async (id) => {
    const res = await API.get(`/api/enquiries/${id}`);
    return res.data;
  },
};

export const queueService = {
  getStats: async () => {
    const res = await API.get('/api/queue/stats');
    return res.data;
  },
  getRecentJobs: async () => {
    const res = await API.get('/api/queue/jobs');
    return res.data;
  },
};

export const emailService = {
  list: async (params = {}) => {
    const res = await API.get('/api/emails', { params });
    return res.data;
  },
  retry: async (jobId) => {
    const res = await API.post(`/api/emails/${jobId}/retry`);
    return res.data;
  },
  delete: async (jobId) => {
    const res = await API.delete(`/api/emails/${jobId}`);
    return res.data;
  },
};

export default {
  enquiry: enquiryService,
  queue: queueService,
  email: emailService,
};
