import React, { useState, useEffect } from 'react';
import { SectionHeader } from '../components/shared/SectionHeader';
import { loginAdmin } from '../api/admin';
import { cmsApi, Blog, Project, Service } from '../api/cms';
import { BlogForm } from '../components/admin/BlogForm';
import { ProjectForm } from '../components/admin/ProjectForm';
import { ServiceForm } from '../components/admin/ServiceForm';

type TabType = 'overview' | 'services' | 'blogs' | 'projects';
type ViewMode = 'list' | 'create' | 'edit';

const AdminPage: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [token, setToken] = useState<string | null>(null);
    const [blogViewMode, setBlogViewMode] = useState<ViewMode>('list');
    const [projectViewMode, setProjectViewMode] = useState<ViewMode>('list');
    const [serviceViewMode, setServiceViewMode] = useState<ViewMode>('list');
    const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [selectedService, setSelectedService] = useState<Service | null>(null);

    const [services, setServices] = useState<Service[]>([]);
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

    const fetchData = async () => {
        if (!token) return;
        
        setLoading(true);
        setFetchError(null);
        try {
            const [servicesData, blogsData, projectsData] = await Promise.all([
                cmsApi.getAllServices(token),
                cmsApi.getAllBlogs(token),
                cmsApi.getAllProjects(token)
            ]);
            setServices(servicesData);
            setBlogs(blogsData);
            setProjects(projectsData);
        } catch (err) {
            console.error('Failed to fetch data:', err);
            setFetchError('Failed to load data. Please check your connection or try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isLoggedIn && token) {
            fetchData();
        }
    }, [isLoggedIn, token]);
    // Remove stray admin token reference and use the standard authToken key
    useEffect(() => {
        const savedToken = localStorage.getItem('authToken');
        if (savedToken) {
            setToken(savedToken);
            setIsLoggedIn(true);
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCredentials(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus('submitting');
        setError('');

        try {
            const { token } = await loginAdmin(credentials);
            localStorage.setItem('authToken', token);
            setToken(token);
            setIsLoggedIn(true);
            setStatus('idle');
        } catch (err) {
            setStatus('error');
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        setToken(null);
        setIsLoggedIn(false);
        setCredentials({ username: '', password: '' });
        setActiveTab('overview');
    }

    const handleDeleteService = async (id: number) => {
        if (!token || !window.confirm('Are you sure you want to delete this service?')) return;
        try {
            await cmsApi.deleteService(token, id);
            fetchData();
        } catch (err) {
            console.error('Failed to delete service:', err);
            alert('Failed to delete service');
        }
    };

    const handleDeleteBlog = async (id: number) => {
        if (!token || !window.confirm('Are you sure you want to delete this blog post?')) return;
        try {
            await cmsApi.deleteBlog(token, id);
            fetchData();
        } catch (err) {
            console.error('Failed to delete blog:', err);
            alert('Failed to delete blog');
        }
    };

    const handleDeleteProject = async (id: number) => {
        if (!token || !window.confirm('Are you sure you want to delete this project?')) return;
        try {
            await cmsApi.deleteProject(token, id);
            fetchData();
        } catch (err) {
            console.error('Failed to delete project:', err);
            alert('Failed to delete project');
        }
    };

    return (
        <div className="pt-24 pb-12">
            <SectionHeader title="Admin Panel" subtitle="Site Management" />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                {isLoggedIn ? (
                    <div className="max-w-7xl mx-auto">
                        {/* Tabs */}
                        <div className="flex gap-2 sm:gap-4 mb-6 sm:mb-8 overflow-x-auto pb-2 scrollbar-hide">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-md font-semibold transition-colors whitespace-nowrap text-sm sm:text-base ${
                                    activeTab === 'overview'
                                        ? 'bg-devil-red text-white'
                                        : 'bg-devil-gray text-gray-400 hover:text-white'
                                }`}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('services')}
                                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-md font-semibold transition-colors whitespace-nowrap text-sm sm:text-base ${
                                    activeTab === 'services'
                                        ? 'bg-devil-red text-white'
                                        : 'bg-devil-gray text-gray-400 hover:text-white'
                                }`}
                            >
                                <span className="hidden sm:inline">Services ({services.length})</span>
                                <span className="sm:hidden">Services</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('blogs')}
                                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-md font-semibold transition-colors whitespace-nowrap text-sm sm:text-base ${
                                    activeTab === 'blogs'
                                        ? 'bg-devil-red text-white'
                                        : 'bg-devil-gray text-gray-400 hover:text-white'
                                }`}
                            >
                                <span className="hidden sm:inline">Blogs ({blogs.length})</span>
                                <span className="sm:hidden">Blogs</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('projects')}
                                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-md font-semibold transition-colors whitespace-nowrap text-sm sm:text-base ${
                                    activeTab === 'projects'
                                        ? 'bg-devil-red text-white'
                                        : 'bg-devil-gray text-gray-400 hover:text-white'
                                }`}
                            >
                                <span className="hidden sm:inline">Projects ({projects.length})</span>
                                <span className="sm:hidden">Projects</span>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="glassmorphic rounded-lg p-4 sm:p-6 lg:p-8">
                            {fetchError && (
                                <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-md text-red-400 flex justify-between items-center">
                                    <span>{fetchError}</span>
                                    <button onClick={fetchData} className="text-sm underline hover:text-white">Retry</button>
                                </div>
                            )}
                            {activeTab === 'overview' && (
                                <div>
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                        <h3 className="text-xl sm:text-2xl font-bold text-devil-red">Management Dashboard</h3>
                                        <button onClick={handleLogout} className="w-full sm:w-auto px-4 sm:px-6 py-2 font-bold text-white bg-devil-red/80 hover:bg-devil-red rounded-md transition-colors text-sm sm:text-base">
                                            Logout
                                        </button>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                                        <div className="bg-devil-gray/50 p-4 sm:p-6 rounded-lg border border-devil-red/20">
                                            <h4 className="text-base sm:text-lg font-semibold text-devil-red mb-2">Services</h4>
                                            <p className="text-2xl sm:text-3xl font-bold text-white">{services.length}</p>
                                            <p className="text-xs sm:text-sm text-gray-400 mt-2">Active offerings</p>
                                        </div>
                                        <div className="bg-devil-gray/50 p-4 sm:p-6 rounded-lg border border-devil-red/20">
                                            <h4 className="text-base sm:text-lg font-semibold text-devil-red mb-2">Blog Posts</h4>
                                            <p className="text-2xl sm:text-3xl font-bold text-white">{blogs.length}</p>
                                            <p className="text-xs sm:text-sm text-gray-400 mt-2">Published articles</p>
                                        </div>
                                        <div className="bg-devil-gray/50 p-4 sm:p-6 rounded-lg border border-devil-red/20 sm:col-span-2 lg:col-span-1">
                                            <h4 className="text-base sm:text-lg font-semibold text-devil-red mb-2">Projects</h4>
                                            <p className="text-2xl sm:text-3xl font-bold text-white">{projects.length}</p>
                                            <p className="text-xs sm:text-sm text-gray-400 mt-2">Portfolio items</p>
                                        </div>
                                    </div>

                                    <div className="bg-devil-gray/30 p-4 sm:p-6 rounded-lg border border-gray-700">
                                        <h4 className="text-base sm:text-lg font-semibold text-white mb-4">Quick Actions</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                            <button onClick={() => setActiveTab('services')} className="p-3 sm:p-4 bg-devil-gray hover:bg-devil-red/20 border border-gray-700 hover:border-devil-red rounded-md text-left transition-colors">
                                                <span className="text-devil-red font-semibold text-sm sm:text-base">Manage Services</span>
                                                <p className="text-xs sm:text-sm text-gray-400 mt-1">Add, edit, or remove service offerings</p>
                                            </button>
                                            <button onClick={() => setActiveTab('blogs')} className="p-3 sm:p-4 bg-devil-gray hover:bg-devil-red/20 border border-gray-700 hover:border-devil-red rounded-md text-left transition-colors">
                                                <span className="text-devil-red font-semibold text-sm sm:text-base">Manage Blogs</span>
                                                <p className="text-xs sm:text-sm text-gray-400 mt-1">Create and publish blog posts</p>
                                            </button>
                                            <button onClick={() => setActiveTab('projects')} className="p-3 sm:p-4 bg-devil-gray hover:bg-devil-red/20 border border-gray-700 hover:border-devil-red rounded-md text-left transition-colors">
                                                <span className="text-devil-red font-semibold text-sm sm:text-base">Manage Projects</span>
                                                <p className="text-xs sm:text-sm text-gray-400 mt-1">Showcase portfolio projects</p>
                                            </button>
                                            <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer" className="p-3 sm:p-4 bg-devil-gray hover:bg-devil-red/20 border border-gray-700 hover:border-devil-red rounded-md text-left transition-colors block">
                                                <span className="text-devil-red font-semibold text-sm sm:text-base">API Documentation</span>
                                                <p className="text-xs sm:text-sm text-gray-400 mt-1">View full API reference</p>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'services' && (
                                <div>
                                    {serviceViewMode === 'list' ? (
                                        <>
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                                <h3 className="text-xl sm:text-2xl font-bold text-devil-red">Services Management</h3>
                                                <button
                                                    onClick={() => setServiceViewMode('create')}
                                                    className="w-full sm:w-auto text-center px-4 sm:px-6 py-2 font-bold text-white bg-devil-red hover:bg-devil-red-dark rounded-md transition-colors text-sm sm:text-base"
                                                >
                                                    Add Service
                                                </button>
                                            </div>
                                            {loading ? (
                                                <p className="text-gray-400 text-sm sm:text-base">Loading services...</p>
                                            ) : fetchError ? (
                                                <p className="text-devil-red text-sm sm:text-base">{fetchError}</p>
                                            ) : (
                                                <div className="space-y-3 sm:space-y-4">
                                                    {services.map(service => (
                                                        <div key={service.id} className="bg-devil-gray/50 p-4 sm:p-6 rounded-lg border border-gray-700 hover:border-devil-red transition-colors">
                                                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                                                <div className="flex-1 w-full">
                                                                    <h4 className="text-lg sm:text-xl font-semibold text-white">{service.title}</h4>
                                                                    <p className="text-gray-400 mt-2 text-sm sm:text-base">{service.description}</p>
                                                                    <div className="flex flex-wrap gap-2 sm:gap-4 mt-4 text-xs sm:text-sm">
                                                                        <span className="text-devil-red font-semibold">${service.price}</span>
                                                                        <span className="text-gray-500">•</span>
                                                                        <span className="text-gray-400">{service.duration}</span>
                                                                        <span className="text-gray-500">•</span>
                                                                        <span className={service.active ? 'text-green-400' : 'text-gray-500'}>
                                                                            {service.active ? 'Active' : 'Inactive'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-2 w-full sm:w-auto">
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedService(service);
                                                                            setServiceViewMode('edit');
                                                                        }}
                                                                        className="flex-1 sm:flex-none text-center px-4 py-2 text-sm font-semibold text-devil-red border border-devil-red hover:bg-devil-red hover:text-white rounded-md transition-colors"
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteService(service.id)}
                                                                        className="flex-1 sm:flex-none text-center px-4 py-2 text-sm font-semibold text-white bg-red-600 border border-red-600 hover:bg-red-700 rounded-md transition-colors"
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <ServiceForm
                                            token={token!}
                                            service={selectedService ?? undefined}
                                            onSuccess={() => {
                                                setServiceViewMode('list');
                                                setSelectedService(null);
                                                fetchData();
                                            }}
                                            onCancel={() => {
                                                setServiceViewMode('list');
                                                setSelectedService(null);
                                            }}
                                        />
                                    )}
                                </div>
                            )}

                            {activeTab === 'blogs' && (
                                <div>
                                    {blogViewMode === 'list' ? (
                                        <>
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                                <h3 className="text-xl sm:text-2xl font-bold text-devil-red">Blog Management</h3>
                                                <button
                                                    onClick={() => setBlogViewMode('create')}
                                                    className="w-full sm:w-auto text-center px-4 sm:px-6 py-2 font-bold text-white bg-devil-red hover:bg-devil-red-dark rounded-md transition-colors text-sm sm:text-base"
                                                >
                                                    Create Blog
                                                </button>
                                            </div>
                                            {loading ? (
                                                <p className="text-gray-400 text-sm sm:text-base">Loading blogs...</p>
                                            ) : fetchError ? (
                                                <p className="text-devil-red text-sm sm:text-base">{fetchError}</p>
                                            ) : (
                                                <div className="space-y-3 sm:space-y-4">
                                                    {blogs.map(blog => (
                                                        <div key={blog.id} className="bg-devil-gray/50 p-4 sm:p-6 rounded-lg border border-gray-700 hover:border-devil-red transition-colors">
                                                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                                                <div className="flex-1 w-full">
                                                                    <h4 className="text-lg sm:text-xl font-semibold text-white">{blog.title}</h4>
                                                                    <p className="text-gray-400 mt-2 text-sm sm:text-base line-clamp-2">{blog.excerpt}</p>
                                                                    <div className="flex flex-wrap gap-2 sm:gap-4 mt-4 text-xs sm:text-sm">
                                                                        <span className="text-gray-400">By {blog.author}</span>
                                                                        <span className="text-gray-500">•</span>
                                                                        <span className="text-gray-400">{blog.views} views</span>
                                                                        <span className="text-gray-500">•</span>
                                                                        <span className={blog.published ? 'text-green-400' : 'text-yellow-400'}>
                                                                            {blog.published ? 'Published' : 'Draft'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedBlog(blog);
                                                                            setBlogViewMode('edit');
                                                                        }}
                                                                        className="flex-1 sm:flex-none text-center px-4 py-2 text-sm font-semibold text-devil-red border border-devil-red hover:bg-devil-red hover:text-white rounded-md transition-colors"
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                    <button
                                                                        onClick={async () => {
                                                                            // Toggle published state quickly
                                                                            if (!token) return;
                                                                            try {
                                                                                await cmsApi.updateBlog(token, blog.id, { published: !blog.published });
                                                                                fetchData();
                                                                            } catch (err) {
                                                                                console.error(err);
                                                                            }
                                                                        }}
                                                                        className="flex-1 sm:flex-none text-center px-4 py-2 text-sm font-semibold text-white bg-devil-gray border border-gray-700 hover:bg-devil-red rounded-md transition-colors"
                                                                    >
                                                                        {blog.published ? 'Unpublish' : 'Publish'}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteBlog(blog.id)}
                                                                        className="flex-1 sm:flex-none text-center px-4 py-2 text-sm font-semibold text-white bg-red-600 border border-red-600 hover:bg-red-700 rounded-md transition-colors"
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <BlogForm
                                            token={token!}
                                            blog={selectedBlog ?? undefined}
                                            onSuccess={() => {
                                                setBlogViewMode('list');
                                                setSelectedBlog(null);
                                                fetchData();
                                            }}
                                            onCancel={() => {
                                                setBlogViewMode('list');
                                                setSelectedBlog(null);
                                            }}
                                        />
                                    )}
                                </div>
                            )}

                            {activeTab === 'projects' && (
                                <div>
                                    {projectViewMode === 'list' ? (
                                        <>
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                                <h3 className="text-xl sm:text-2xl font-bold text-devil-red">Project Management</h3>
                                                <button
                                                    onClick={() => setProjectViewMode('create')}
                                                    className="w-full sm:w-auto text-center px-4 sm:px-6 py-2 font-bold text-white bg-devil-red hover:bg-devil-red-dark rounded-md transition-colors text-sm sm:text-base"
                                                >
                                                    Create Project
                                                </button>
                                            </div>
                                            {loading ? (
                                                <p className="text-gray-400 text-sm sm:text-base">Loading projects...</p>
                                            ) : fetchError ? (
                                                <p className="text-devil-red text-sm sm:text-base">{fetchError}</p>
                                            ) : (
                                                <div className="space-y-3 sm:space-y-4">
                                                    {projects.map(project => (
                                                        <div key={project.id} className="bg-devil-gray/50 p-4 sm:p-6 rounded-lg border border-gray-700 hover:border-devil-red transition-colors">
                                                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                                                <div className="flex-1 w-full">
                                                                    <h4 className="text-lg sm:text-xl font-semibold text-white">{project.title}</h4>
                                                                    <p className="text-gray-400 mt-2 text-sm sm:text-base line-clamp-2">{project.description}</p>
                                                                    <div className="flex flex-wrap gap-2 sm:gap-4 mt-4 text-xs sm:text-sm">
                                                                        <span className="text-gray-400">{project.status}</span>
                                                                        <span className="text-gray-500">•</span>
                                                                        <span className="text-gray-400">{project.views} views</span>
                                                                        {project.demo_url && (
                                                                            <>
                                                                                <span className="text-gray-500">•</span>
                                                                                <a href={project.demo_url} target="_blank" rel="noopener noreferrer" className="text-devil-red hover:underline">Demo</a>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-2 w-full sm:w-auto">
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedProject(project);
                                                                            setProjectViewMode('edit');
                                                                        }}
                                                                        className="flex-1 sm:flex-none text-center px-4 py-2 text-sm font-semibold text-devil-red border border-devil-red hover:bg-devil-red hover:text-white rounded-md transition-colors"
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteProject(project.id)}
                                                                        className="flex-1 sm:flex-none text-center px-4 py-2 text-sm font-semibold text-white bg-red-600 border border-red-600 hover:bg-red-700 rounded-md transition-colors"
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <ProjectForm
                                            token={token!}
                                            project={selectedProject ?? undefined}
                                            onSuccess={() => {
                                                setProjectViewMode('list');
                                                setSelectedProject(null);
                                                fetchData();
                                            }}
                                            onCancel={() => {
                                                setProjectViewMode('list');
                                                setSelectedProject(null);
                                            }}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="max-w-lg mx-auto p-8 glassmorphic rounded-lg">
                        <div className="text-center">
                             <h3 className="text-2xl font-bold text-devil-red">Admin Login</h3>
                            <p className="mt-4 text-gray-300">
                                Enter your credentials to access the site management dashboard.
                            </p>
                            <form onSubmit={handleSubmit} className="space-y-4 mt-8 text-left">
                                <div>
                                    <label htmlFor="username" className="sr-only">Username</label>
                                    <input type="text" id="username" name="username" value={credentials.username} onChange={handleChange} placeholder="Username" required className="w-full bg-devil-gray border border-gray-700 rounded-md p-3 focus:ring-devil-red focus:border-devil-red" />
                                </div>
                                <div>
                                    <label htmlFor="password" className="sr-only">Password</label>
                                    <input type="password" id="password" name="password" value={credentials.password} onChange={handleChange} placeholder="Password" required className="w-full bg-devil-gray border border-gray-700 rounded-md p-3 focus:ring-devil-red focus:border-devil-red" />
                                </div>
                                 {error && <p className="text-sm text-devil-red text-center">{error}</p>}
                                <button type="submit" disabled={status === 'submitting'} className="w-full px-6 py-3 font-bold text-white bg-devil-red hover:bg-devil-red-dark border border-devil-red rounded-md transition-colors disabled:bg-devil-red/50 disabled:cursor-not-allowed">
                                    {status === 'submitting' ? 'Logging in...' : 'Login'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPage;