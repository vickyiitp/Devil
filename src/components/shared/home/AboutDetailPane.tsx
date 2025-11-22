import React from 'react';
// FIX: Import Variants type from framer-motion to fix type error.
import { motion, MotionValue, useTransform, Variants } from 'framer-motion';
import { AboutData } from '../../../types';
import { usePrefersReducedMotion } from '../../../hooks/usePrefersReducedMotion';
import { AnimatedCounter } from '../AnimatedCounter';
import { DownloadIcon } from '../../../assets/icons';

interface AboutDetailPaneProps {
    data: AboutData;
    activeIndex: MotionValue<number>;
}

const DetailItem: React.FC<{ title: string; details: string; index: number; activeIndex: MotionValue<number> }> = ({ title, details, index, activeIndex }) => {
    const distance = useTransform(activeIndex, (latest) => Math.abs(index - latest));
    const opacity = useTransform(distance, [0, 0.5, 1], [1, 0, 0]);
    const y = useTransform(distance, [0, 0.5], [0, 20]);
    const filter = useTransform(distance, [0, 0.5, 1], ['blur(0px)', 'blur(5px)', 'blur(10px)']);
    
    return (
        <motion.div
            className="absolute inset-0"
            style={{ opacity, y, filter }}
            transition={{ type: 'tween', duration: 0.4, ease: 'easeOut' }}
        >
            <h3 className="text-2xl font-bold text-devil-red">{title}</h3>
            <p className="mt-2 text-gray-300">{details}</p>
        </motion.div>
    );
};

const SkillBar: React.FC<{ name: string; percent: number }> = ({ name, percent }) => {
    const prefersReducedMotion = usePrefersReducedMotion();
    return (
        <div>
            <div className="flex justify-between items-baseline mb-1">
                <span className="text-sm font-medium text-devil-light">{name}</span>
                <span className="text-xs font-mono text-neon-gold">{percent}%</span>
            </div>
            <div className="w-full bg-devil-gray rounded-full h-2 overflow-hidden">
                <motion.div
                    className="bg-gradient-to-r from-devil-red to-neon-gold h-2 rounded-full shimmer-bg"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${percent}%` }}
                    transition={{ duration: prefersReducedMotion ? 0 : 1.5, ease: 'easeOut' }}
                    viewport={{ once: true, amount: 0.8 }}
                />
            </div>
        </div>
    );
};


export const AboutDetailPane: React.FC<AboutDetailPaneProps> = ({ data, activeIndex }) => {
    // FIX: Add Variants type to fix framer-motion type error.
    const textVariants: Variants = {
        hidden: { opacity: 0, y: 30, filter: 'blur(5px)' },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            transition: { delay: i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }
        })
    };
    return (
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
            <motion.h2 variants={textVariants} custom={0} id="about-heading" className="text-4xl sm:text-5xl font-black tracking-tight text-devil-light uppercase">
                <span className="fire-text-animated">{data.heroName}</span>
            </motion.h2>
            <motion.p variants={textVariants} custom={1} className="mt-2 text-lg text-gray-400 font-mono">{data.heroTitle}</motion.p>
            <motion.p variants={textVariants} custom={2} className="mt-4 max-w-xl text-gray-300">{data.shortBio}</motion.p>
            
            <div className="mt-8 h-24 relative">
                {data.slides.map((slide, i) => (
                    <DetailItem key={slide.id} title={slide.title} details={slide.details} index={i} activeIndex={activeIndex} />
                ))}
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h4 className="text-xl font-bold text-neon-gold mb-4">Core Competencies</h4>
                    <div className="space-y-4">
                        {data.skills.map(skill => <SkillBar key={skill.name} {...skill} />)}
                    </div>
                </div>
                <div>
                    <h4 className="text-xl font-bold text-neon-gold mb-4">By The Numbers</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        {data.stats.map(stat => (
                            <div key={stat.label}>
                                <div className="text-4xl font-bold text-devil-light">
                                    <AnimatedCounter to={stat.value} />+
                                </div>
                                <div className="text-xs text-gray-400 uppercase tracking-wider">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                     <div className="mt-6 flex items-center gap-4">
                                <a href={data.resumeUrls.onePage} target="_blank" rel="noopener noreferrer" className="flex-1 text-center px-4 py-2 text-sm font-bold text-devil-red bg-devil-red/10 hover:bg-devil-red hover:text-white border border-devil-red rounded-md transition-all duration-300 inline-flex items-center justify-center gap-2 shimmer-bg">
                           <DownloadIcon className="h-4 w-4" /> One-Page Resume
                        </a>
                                 <a href={data.resumeUrls.full} target="_blank" rel="noopener noreferrer" className="flex-1 text-center px-4 py-2 text-sm font-bold text-white bg-devil-gray hover:bg-gray-700 rounded-md transition-all duration-300 inline-flex items-center justify-center gap-2 shimmer-bg">
                           Full CV
                        </a>
                    </div>
                </div>
            </div>

        </motion.div>
    );
};