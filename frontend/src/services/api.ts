import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// API instance for authenticated requests
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API instance for public requests (no authentication)
const publicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface CompanyDetails {
  id: string;
  user_id: string;
  company_name: string;
  logo?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  facebook_url?: string;
  whatsapp_url?: string;
  instagram_url?: string;
  youtube_url?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Itinerary {
  id: string;
  user_id: string;
  title: string;
  content: any;
  cover_image?: string;
  is_published: boolean;
  share_uuid: string;
  created_at: string;
  updated_at: string;
  packages?: Package[];
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    company_details?: CompanyDetails;
  };
}

export interface Package {
  id: string;
  itinerary_id: string;
  title: string;
  start_location: string;
  valid_till: string;
  description: any[];
  price: number;
  price_type: 'per_person' | 'total';
  people?: number;
  locations: string[];
  inclusions: string[];
  exclusions: string[];
  cover_image?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  itinerary?: Itinerary;
}

export const itineraryApi = {
  getAll: () => api.get<Itinerary[]>('/itineraries'),
  getById: (id: string) => api.get<Itinerary>(`/itineraries/${id}`),
  create: (data: { title: string; content: any }) => 
    api.post<Itinerary>('/itineraries', data),
  update: (id: string, data: Partial<Itinerary>) => 
    api.put<Itinerary>(`/itineraries/${id}`, data),
  delete: (id: string) => api.delete(`/itineraries/${id}`),
};

export const packageApi = {
  getAll: () => api.get<Package[]>('/packages'),
  getById: (id: string) => api.get<Package>(`/packages/${id}`),
  create: (data: Omit<Package, 'id' | 'created_at' | 'updated_at'>) => 
    api.post<Package>('/packages', data),
  update: (id: string, data: Partial<Package>) => 
    api.put<Package>(`/packages/${id}`, data),
  delete: (id: string) => api.delete(`/packages/${id}`),
};

export const shareApi = {
  getByShareUuid: (shareUuid: string) => 
    publicApi.get<Itinerary>(`/share/${shareUuid}`),
};

export const companyDetailsApi = {
  get: () => api.get<{ success: boolean; data: CompanyDetails | null }>('/company-details'),
  create: (data: Omit<CompanyDetails, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => 
    api.post<{ success: boolean; message: string; data: CompanyDetails }>('/company-details', data),
  update: (id: string, data: Partial<Omit<CompanyDetails, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => 
    api.put<{ success: boolean; message: string; data: CompanyDetails }>(`/company-details/${id}`, data),
  delete: (id: string) => 
    api.delete<{ success: boolean; message: string }>(`/company-details/${id}`),
};

export const imageApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  uploadMultiple: (files: File[]) => {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`images[${index}]`, file);
    });
    return api.post('/images/upload-multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  delete: (filename: string) => 
    api.delete('/images/delete', { data: { filename } }),
};

export default api;
