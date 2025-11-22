
import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { cmsApi, Blog, API_URL } from '../../api/cms';
import ErrorBoundary from '../../components/shared/ErrorBoundary';
import resolveContentMedia from '../../lib/resolveMedia';
import { useLocation } from 'react-router-dom';

const BlogDetailPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const location = useLocation();
    const [post, setPost] = useState<Blog | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) return;
        
        const queryParams = new URLSearchParams(location.search);
        const isPreview = queryParams.get('preview') === '1';

        const fetchPost = async () => {
            try {
            console.debug(`Fetching blog by slug: ${slug} (preview=${isPreview})`);
                let data;
                // If preview flag set and we have a token, fetch via admin endpoint to allow unpublished previews
                if (isPreview) {
                    const token = localStorage.getItem('admin_token');
                    if (!token) throw new Error('Preview requires admin authentication');
                    data = await cmsApi.getAdminBlogBySlug(slug, token);
                } else {
                    data = await cmsApi.getBlogBySlug(slug);
                }

                if (data.content) data.content = resolveContentMedia(data.content);
                setPost(data);
            } catch (err) {
                console.error(`Failed to fetch blog post with slug ${slug}:`, err);
                setError(err instanceof Error ? err.message : "Could not load blog post.");
                if (err instanceof Error && err.message === 'Post not found') {
                    // This allows the redirect to happen for 404s
                    setPost(null); 
                }
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [slug, location.search]);

    if (loading) {
        return <div className="pt-24 pb-12 text-center">Loading post...</div>;
    }

    if (error) { // Show error message when errors occur
        return <div className="pt-24 pb-12 text-center text-devil-red">{error}</div>;
    }

    if (!post) {
        return <Navigate to="/blog" />;
    }

    return (
        <ErrorBoundary>
        <div className="pt-24 pb-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <article>
                        <header className="text-center mb-12">
                            <p className="text-devil-red font-mono">
                                {new Date(post.published_at || post.created_at).toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                })}
                            </p>
                            <h1 className="mt-4 text-4xl md:text-6xl font-black text-devil-light tracking-tight">{post.title}</h1>
                            <p className="mt-2 text-gray-400">By {post.author}</p>
                            <div className="mt-6 flex justify-center gap-4 text-gray-400">
                                <span>👁️ {post.views} views</span>
                                <span>❤️ {post.likes} likes</span>
                                {post.read_time && <span>📖 {post.read_time} min read</span>}
                            </div>
                        </header>
                        {post.featured_image && (
                            <img
                                src={post.featured_image?.startsWith('http') ? post.featured_image : `${API_URL}${post.featured_image}`}
                                alt={post.title}
                                className="w-full h-auto rounded-lg shadow-lg mb-12"
                            />
                        )}
                        <div 
                            className="prose prose-invert prose-lg max-w-none" 
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />
                    </article>
                </div>
            </div>
        </div>
        </ErrorBoundary>
    );
};

export default BlogDetailPage;