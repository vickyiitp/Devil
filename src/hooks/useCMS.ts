/**
 * React hooks for consuming CMS API
 */

import { useState, useEffect, useCallback } from 'react';
import { cmsApi, Blog, Project, Service, Tool, Stats } from '../api/cms';
import resolveContentMedia from '../lib/resolveMedia';

// Generic data fetching hook with loading and error states
function useAPIData<T>(
  fetcher: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refetch = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetcher();
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [...dependencies, refreshTrigger]);

  return { data, loading, error, refetch };
}

// === Blogs ===

export function useBlogs(params: {
  skip?: number;
  limit?: number;
  category?: string;
  tag?: string;
  search?: string;
  featured?: boolean;
} = {}) {
  const { data, loading, error, refetch } = useAPIData(
    () => cmsApi.getBlogs(params),
    [JSON.stringify(params)]
  );

  return {
    blogs: data || [],
    loading,
    error,
    refetch
  };
}

export function useBlog(slug: string) {
  const { data, loading, error } = useAPIData(
    () => cmsApi.getBlogBySlug(slug),
    [slug]
  );

  const [liking, setLiking] = useState(false);

  const likeBlog = useCallback(async () => {
    if (liking || !data) return;
    
    try {
      setLiking(true);
      const result = await cmsApi.likeBlog(slug);
      // Update local state optimistically
      if (data) {
        (data as any).likes = result.likes;
      }
    } catch (err) {
      console.error('Failed to like blog:', err);
    } finally {
      setLiking(false);
    }
  }, [slug, data, liking]);

  return {
    blog: data,
    loading,
    error,
    likeBlog,
    liking
  };
}

// === Projects ===

export function useProjects(params: {
  skip?: number;
  limit?: number;
  category?: string;
  tag?: string;
  status?: string;
  featured?: boolean;
} = {}) {
  const { data, loading, error, refetch } = useAPIData(
    () => cmsApi.getProjects(params),
    [JSON.stringify(params)]
  );

  return {
    projects: data || [],
    loading,
    error,
    refetch
  };
}

export function useProject(slug: string) {
  const { data, loading, error } = useAPIData(
    () => cmsApi.getProjectBySlug(slug),
    [slug]
  );
  // Ensure any inline media references inside long_description are absolute
  if (data && (data as any).long_description) {
    (data as any).long_description = resolveContentMedia((data as any).long_description as string);
  }
  return {
    project: data,
    loading,
    error
  };
}

// === Services ===

export function useServices(params: {
  active_only?: boolean;
  featured?: boolean;
} = { active_only: true }) {
  const { data, loading, error, refetch } = useAPIData(
    () => cmsApi.getServices(params),
    [JSON.stringify(params)]
  );

  return {
    services: data || [],
    loading,
    error,
    refetch
  };
}

export function useService(slug: string) {
  const { data, loading, error } = useAPIData(
    () => cmsApi.getServiceBySlug(slug),
    [slug]
  );

  if (data && (data as any).long_description) {
    (data as any).long_description = resolveContentMedia((data as any).long_description as string);
  }

  return {
    service: data,
    loading,
    error
  };
}

// === Tools ===

export function useTools(params: {
  category?: string;
  active_only?: boolean;
  featured?: boolean;
} = { active_only: true }) {
  const { data, loading, error } = useAPIData(
    () => cmsApi.getTools(params),
    [JSON.stringify(params)]
  );

  return {
    tools: data || [],
    loading,
    error
  };
}

export function useTool(slug: string) {
  const { data, loading, error } = useAPIData(
    () => cmsApi.getToolBySlug(slug),
    [slug]
  );

  const [tracking, setTracking] = useState(false);

  const trackClick = useCallback(async () => {
    if (tracking || !data) return;
    
    try {
      setTracking(true);
      const result = await cmsApi.trackToolClick(slug);
      // Update local state optimistically
      if (data) {
        (data as any).clicks = result.clicks;
      }
    } catch (err) {
      console.error('Failed to track click:', err);
    } finally {
      setTracking(false);
    }
  }, [slug, data, tracking]);

  return {
    tool: data,
    loading,
    error,
    trackClick,
    tracking
  };
}

// === Stats ===

export function useStats() {
  const { data, loading, error } = useAPIData(
    () => cmsApi.getStats(),
    []
  );

  return {
    stats: data,
    loading,
    error
  };
}

// === Admin Hook ===

export function useAuth() {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('admin_token')
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const login = useCallback(async (username: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await cmsApi.adminLogin(username, password);
      setToken(result.access_token);
      localStorage.setItem('admin_token', result.access_token);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Login failed');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem('admin_token');
  }, []);

  return {
    token,
    isAuthenticated: !!token,
    loading,
    error,
    login,
    logout
  };
}
