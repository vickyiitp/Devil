
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { SectionHeader } from '../../components/shared/SectionHeader';
import { cmsApi, Blog, API_URL } from '../../api/cms';
import { motion, Variants } from 'framer-motion';

const BlogListPage: React.FC = () => {
    const [posts, setPosts] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const data = await cmsApi.getBlogs({ limit: 100 });
                setPosts(data);
            } catch (err) {
                console.error("Failed to fetch blog posts:", err);
                setError(err instanceof Error ? err.message : "Could not load blog posts.");
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15, delayChildren: 0.2 }
        }
    };
    
    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
    };
    
    const renderContent = () => {
        if (loading) return <div className="text-center p-12">Loading posts...</div>;
        if (error) return <div className="text-center p-12 text-devil-red">{error}</div>;
        if (posts.length === 0) return <div className="text-center p-12 text-neutral-400">No blog posts found.</div>;
        
        return (
            <motion.div 
                className="max-w-3xl mx-auto space-y-12"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {posts.map(post => (
                    <motion.div variants={itemVariants} key={post.id}>
                        <NavLink 
                            to={`/blog/${post.slug}`} 
                            className="group block"
                        >
                            <div className="p-8 glassmorphic rounded-lg border border-devil-gray hover:border-devil-red transition-all duration-300 transform hover:scale-105">
                                {post.thumbnail_image && (
                                    <img
                                        src={post.thumbnail_image?.startsWith('http') ? post.thumbnail_image : `${API_URL}${post.thumbnail_image}`}
                                        alt={post.title}
                                        className="w-full h-48 object-cover rounded-lg mb-4"
                                    />
                                )}
                                <p className="text-sm text-gray-400 font-mono">
                                    {new Date(post.published_at || post.created_at).toLocaleDateString('en-US', { 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                    })}
                                </p>
                                <h2 className="mt-2 text-3xl font-bold text-devil-light group-hover:text-devil-red transition-colors duration-300">{post.title}</h2>
                                <p className="mt-2 text-sm text-gray-400">By {post.author}</p>
                                <p className="mt-4 text-gray-300">{post.excerpt}</p>
                                <div className="mt-6 flex items-center justify-between">
                                    <span className="font-semibold text-devil-red">Read More &rarr;</span>
                                    <div className="flex gap-4 text-sm text-gray-400">
                                        <span>👁️ {post.views}</span>
                                        <span>❤️ {post.likes}</span>
                                    </div>
                                </div>
                            </div>
                        </NavLink>
                    </motion.div>
                ))}
            </motion.div>
        );
    };

    return (
        <div className="pt-24 pb-12">
            <SectionHeader title="Blog" subtitle="AI, Development & Cybersecurity Insights" />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                {renderContent()}
            </div>
        </div>
    );
};

export default BlogListPage;
