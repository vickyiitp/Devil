
import React from 'react';
import { motion } from 'framer-motion';

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle }) => {
    return (
        <motion.div 
            className="text-center"
            initial="offscreen"
            whileInView="onscreen"
            viewport={{ once: true, amount: 0.5 }}
            transition={{ staggerChildren: 0.2 }}
        >
            <motion.h2 
                className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-devil-light uppercase fire-text-animated"
                variants={{
                    offscreen: { y: 30, opacity: 0 },
                    onscreen: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } }
                }}
            >
                {title}
            </motion.h2>
            {subtitle && (
                <motion.p 
                    className="mt-4 text-lg text-gray-400 font-mono"
                    variants={{
                        offscreen: { y: 20, opacity: 0 },
                        onscreen: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } }
                    }}
                >
                    {subtitle}
                </motion.p>
            )}
            <motion.div 
                className="mt-4 h-1 w-24 bg-devil-red mx-auto rounded-full shadow-neon-red-soft"
                variants={{
                    offscreen: { width: 0 },
                    onscreen: { width: '6rem', transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
                }}
            />
        </motion.div>
    );
};