
import React, { useState, useMemo } from 'react';
import { tools, Tool, toolCategories } from '../../data/tools';
import { motion, AnimatePresence } from 'framer-motion';

const RadialProgress: React.FC<{ percentage: number; className?: string }> = ({ percentage, className }) => {
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <svg className={`w-20 h-20 ${className}`} viewBox="0 0 70 70">
            <circle className="text-devil-gray" strokeWidth="5" stroke="currentColor" fill="transparent" r={radius} cx="35" cy="35" />
            <motion.circle
                className="text-accent-gold"
                strokeWidth="5"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r={radius}
                cx="35"
                cy="35"
                transform="rotate(-90 35 35)"
                initial={{ strokeDashoffset: circumference }}
                whileInView={{ strokeDashoffset: offset }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                viewport={{ once: true }}
            />
            <text x="50%" y="50%" textAnchor="middle" dy=".3em" className="text-sm font-mono fill-current text-white">
                {percentage}%
            </text>
        </svg>
    );
};

const ToolCard: React.FC<{ tool: Tool }> = ({ tool }) => {
    return (
        <div className="relative p-6 lux-glass rounded-xl border border-white/10 h-full flex flex-col items-center text-center group">
            <RadialProgress percentage={tool.proficiency} />
            <h4 className="mt-4 font-bold text-lg text-white">{tool.name}</h4>
            <p className="mt-1 text-sm text-neutral-400 flex-grow">{tool.note}</p>
        </div>
    );
};


export const ToolsGrid: React.FC = () => {
    const [activeFilter, setActiveFilter] = useState('All');

    const filteredTools = useMemo(() => {
        if (activeFilter === 'All') return tools;
        return tools.filter(tool => tool.category === activeFilter);
    }, [activeFilter]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div>
            <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8">
                {['All', ...toolCategories].map(category => (
                    <button
                        key={category}
                        onClick={() => setActiveFilter(category)}
                        className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-300 border ${
                            activeFilter === category
                                ? 'bg-accent-blue text-black border-accent-blue'
                                : 'bg-transparent border-devil-gray hover:border-accent-blue hover:text-accent-blue'
                        }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            <motion.div
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <AnimatePresence>
                    {filteredTools.map(tool => (
                        <motion.div key={tool.name} variants={itemVariants} layout>
                            <ToolCard tool={tool} />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};
