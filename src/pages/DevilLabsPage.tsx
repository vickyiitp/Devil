
import React, { useState, useMemo, useEffect } from 'react';
import { ProductCard } from '../components/shared/ProductCard';
import { SectionHeader } from '../components/shared/SectionHeader';
import { Product } from '../types';
import { cmsApi, Project } from '../api/cms';
import { ResumeSection } from '../components/shared/ResumeSection';
import { motion, AnimatePresence } from 'framer-motion';

const categories = ['All', 'AI', 'Tools', 'Cybersecurity', 'Apps', 'Web Apps', 'APIs'];

const DevilLabsPage: React.FC = () => {
    const [activeFilter, setActiveFilter] = useState('All');
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await cmsApi.getProjects({ limit: 100 });
                setProjects(data);
            } catch (err) {
                console.error('Failed to fetch projects:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);
    
    // Convert CMS Project to Product format for ProductCard
    const products: Product[] = projects.map(p => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        short: p.description,
        description: p.long_description || p.description,
        category: 'All', // You can extract from tags or add category field
        images: [p.featured_image || p.thumbnail_image || ''].filter(Boolean),
        repo_url: p.github_url,
        demo_url: p.demo_url,
        live_url: p.live_url,
        featured: p.featured,
        tags: p.tech_stack ? JSON.parse(p.tech_stack) : []
    }));

    const filteredProducts = useMemo(() => {
        if (activeFilter === 'All') {
            return products;
        }
        return products.filter(p => p.category === activeFilter);
    }, [activeFilter, products]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    const renderContent = () => {
        if (loading) {
            return <div className="text-center p-12 text-neutral-400">Loading projects...</div>;
        }
        if (products.length === 0) {
            return <div className="text-center p-12 text-neutral-400">No products found.</div>;
        }
        return (
            <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <AnimatePresence>
                    {filteredProducts.map((product: Product) => (
                        <motion.div
                            key={product.id}
                            variants={itemVariants}
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.3 }}
                        >
                            <ProductCard product={product} />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>
        );
    };

    return (
        <div className="pt-24 pb-12">
            <SectionHeader title="Devil Labs" subtitle="My Store & Project Showcase" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-12">
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setActiveFilter(category)}
                            className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-300 border-2 ${
                                activeFilter === category
                                    ? 'bg-devil-red border-devil-red text-white shadow-neon-red-soft'
                                    : 'bg-transparent border-devil-gray hover:border-devil-red hover:text-devil-red'
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
                {renderContent()}
            </div>
            
            <ResumeSection />
        </div>
    );
};

export default DevilLabsPage;
