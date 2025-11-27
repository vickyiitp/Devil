/**
 * CMS API Client
 * Handles all API calls to the Devil Labs CMS backend
 */

// runtime fallback: use window.__API_URL if set at runtime (allows changing the API host without rebuilding)
const runtimeAPI = (typeof window !== 'undefined' && (window as any).__API_URL) || import.meta.env.VITE_CMS_API_URL;
export const API_URL = runtimeAPI || 'http://localhost:8000';

// Type definitions
export interface Blog {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  featured_image?: string;
  thumbnail_image?: string;
  read_time?: number;
  views: number;
  likes: number;
  published: boolean;
  featured: boolean;
  created_at: string;
  updated_at?: string;
  published_at?: string;
}

export interface Project {
  id: number;
  title: string;
  slug: string;
  description: string;
  long_description?: string;
  featured_image?: string;
  thumbnail_image?: string;
  demo_url?: string;
  github_url?: string;
  live_url?: string;
  tech_stack?: string; // JSON string
  status: string;
  published: boolean;
  featured: boolean;
  views: number;
  created_at: string;
}

export interface Service {
  id: number;
  title: string;
  slug: string;
  description: string;
  long_description?: string;
  price?: number;
  price_range?: string;
  currency: string;
  icon?: string;
  featured_image?: string;
  features?: string; // JSON string
  deliverables?: string; // JSON string
  duration?: string;
  active: boolean;
  featured: boolean;
  order: number;
}

export interface Tool {
  id: number;
  name: string;
  slug: string;
  description: string;
  logo?: string;
  icon?: string;
  website_url?: string;
  demo_url?: string;
  github_url?: string;
  category?: string;
  pricing?: string;
  price?: number;
  views: number;
  clicks: number;
  rating?: number;
  active: boolean;
  featured: boolean;
}

export interface Stats {
  blogs: number;
  projects: number;
  services: number;
  tools: number;
  blog_views: number;
  project_views: number;
  total_views: number;
}

// API Client
export const cmsApi = {
  // === Public Endpoints ===

  // Blogs
  async getBlogs(params: {
    skip?: number;
    limit?: number;
    category?: string;
    tag?: string;
    search?: string;
    featured?: boolean;
  } = {}): Promise<Blog[]> {
    const query = new URLSearchParams(
      Object.entries(params)
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    ).toString();
    
    const response = await fetch(`${API_URL}/api/blogs?${query}`);
    if (!response.ok) throw new Error('Failed to fetch blogs');
    return response.json();
  },

  async getBlogBySlug(slug: string): Promise<Blog> {
    const response = await fetch(`${API_URL}/api/blogs/${slug}`);
    if (!response.ok) throw new Error('Blog not found');
    return response.json();
  },

  async getAdminBlogBySlug(slug: string, token: string): Promise<Blog> {
    const response = await fetch(`${API_URL}/api/admin/blogs/${slug}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Blog not found (admin)');
    return response.json();
  },
  
  async getAdminProjectBySlug(slug: string, token: string): Promise<Project> {
    const response = await fetch(`${API_URL}/api/admin/projects/${slug}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Project not found (admin)');
    return response.json();
  },
  
  async getAdminServiceBySlug(slug: string, token: string): Promise<Service> {
    const response = await fetch(`${API_URL}/api/admin/services/${slug}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Service not found (admin)');
    return response.json();
  },

  async likeBlog(slug: string): Promise<{ likes: number }> {
    const response = await fetch(`${API_URL}/api/blogs/${slug}/like`, {
      method: 'POST'
    });
    if (!response.ok) throw new Error('Failed to like blog');
    return response.json();
  },

  // Projects
  async getProjects(params: {
    skip?: number;
    limit?: number;
    category?: string;
    tag?: string;
    status?: string;
    featured?: boolean;
  } = {}): Promise<Project[]> {
    const query = new URLSearchParams(
      Object.entries(params)
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    ).toString();
    
    const response = await fetch(`${API_URL}/api/projects?${query}`);
    if (!response.ok) throw new Error('Failed to fetch projects');
    return response.json();
  },

  async getProjectBySlug(slug: string): Promise<Project> {
    const response = await fetch(`${API_URL}/api/projects/${slug}`);
    if (!response.ok) throw new Error('Project not found');
    return response.json();
  },

  

  // Services
  async getServices(params: {
    active_only?: boolean;
    featured?: boolean;
  } = {}): Promise<Service[]> {
    const query = new URLSearchParams(
      Object.entries(params)
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    ).toString();
    
    const response = await fetch(`${API_URL}/api/services?${query}`);
    if (!response.ok) throw new Error('Failed to fetch services');
    return response.json();
  },

  async getServiceBySlug(slug: string): Promise<Service> {
    const response = await fetch(`${API_URL}/api/services/${slug}`);
    if (!response.ok) throw new Error('Service not found');
    return response.json();
  },

  

  // Tools
  async getTools(params: {
    category?: string;
    active_only?: boolean;
    featured?: boolean;
  } = {}): Promise<Tool[]> {
    const query = new URLSearchParams(
      Object.entries(params)
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    ).toString();
    
    const response = await fetch(`${API_URL}/api/tools?${query}`);
    if (!response.ok) throw new Error('Failed to fetch tools');
    return response.json();
  },

  async getToolBySlug(slug: string): Promise<Tool> {
    const response = await fetch(`${API_URL}/api/tools/${slug}`);
    if (!response.ok) throw new Error('Tool not found');
    return response.json();
  },

  async trackToolClick(slug: string): Promise<{ clicks: number }> {
    const response = await fetch(`${API_URL}/api/tools/${slug}/click`, {
      method: 'POST'
    });
    if (!response.ok) throw new Error('Failed to track click');
    return response.json();
  },

  // Stats
  async getStats(): Promise<Stats> {
    const response = await fetch(`${API_URL}/api/stats`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  },

  // === Admin Endpoints ===

  async adminLogin(username: string, password: string): Promise<{ access_token: string; token_type: string }> {
    const response = await fetch(`${API_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  },

  async createBlog(token: string, blogData: Partial<Blog>): Promise<Blog> {
    const response = await fetch(`${API_URL}/api/admin/blogs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(blogData)
    });
    if (!response.ok) throw new Error('Failed to create blog');
    return response.json();
  },
  
  async updateProject(token: string, projectId: number, projectData: Partial<Project>): Promise<Project> {
    const response = await fetch(`${API_URL}/api/admin/projects/${projectId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(projectData)
    });
    if (!response.ok) throw new Error('Failed to update project');
    return response.json();
  },
  
  async updateService(token: string, serviceId: number, serviceData: Partial<Service>): Promise<Service> {
    const response = await fetch(`${API_URL}/api/admin/services/${serviceId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(serviceData)
    });
    if (!response.ok) throw new Error('Failed to update service');
    return response.json();
  },

  async updateBlog(token: string, blogId: number, blogData: Partial<Blog>): Promise<Blog> {
    const response = await fetch(`${API_URL}/api/admin/blogs/${blogId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(blogData)
    });
    if (!response.ok) throw new Error('Failed to update blog');
    return response.json();
  },

  async getAllBlogs(token: string): Promise<Blog[]> {
    const response = await fetch(`${API_URL}/api/admin/blogs`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch all blogs');
    return response.json();
  },

  async getAllProjects(token: string): Promise<Project[]> {
    const response = await fetch(`${API_URL}/api/admin/projects`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch all projects');
    return response.json();
  },

  async createProject(token: string, projectData: Partial<Project>): Promise<Project> {
    const response = await fetch(`${API_URL}/api/admin/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(projectData)
    });
    if (!response.ok) throw new Error('Failed to create project');
    return response.json();
  },


  async getAllServices(token: string): Promise<Service[]> {
    const response = await fetch(`${API_URL}/api/admin/services`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch all services');
    return response.json();
  },

  async createService(token: string, serviceData: Partial<Service>): Promise<Service> {
    const response = await fetch(`${API_URL}/api/admin/services`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(serviceData)
    });
    if (!response.ok) throw new Error('Failed to create service');
    return response.json();
  },

  async deleteBlog(token: string, blogId: number): Promise<void> {
    const response = await fetch(`${API_URL}/api/admin/blogs/${blogId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to delete blog');
  },

  async deleteProject(token: string, projectId: number): Promise<void> {
    const response = await fetch(`${API_URL}/api/admin/projects/${projectId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to delete project');
  },

  async deleteService(token: string, serviceId: number): Promise<void> {
    const response = await fetch(`${API_URL}/api/admin/services/${serviceId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to delete service');
  },

  async uploadImage(
    token: string,
    file: File,
    folder: string = 'general',
    metadata?: {
      used_in?: string;
      used_in_id?: number;
      alt_text?: string;
    }
  ): Promise<{
    id: number;
    filename: string;
    storage_url: string;
    thumbnail_url?: string;
    medium_url?: string;
    large_url?: string;
    width?: number;
    height?: number;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    if (metadata?.used_in) formData.append('used_in', metadata.used_in);
    if (metadata?.used_in_id) formData.append('used_in_id', String(metadata.used_in_id));
    if (metadata?.alt_text) formData.append('alt_text', metadata.alt_text);

    const response = await fetch(`${API_URL}/api/admin/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    if (!response.ok) throw new Error('Failed to upload image');
    return response.json();
  }
};
