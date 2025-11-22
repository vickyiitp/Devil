import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useMotionValueEvent, animate } from 'framer-motion';
import { AboutData } from '../../../types';
import { getAboutData } from '../../../api/about';
import { AboutCarousel } from './AboutCarousel';
import { AboutDetailPane } from './AboutDetailPane';

export const HomeAbout: React.FC = () => {
    const [aboutData, setAboutData] = useState<AboutData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAboutData = async () => {
            try {
                const data = await getAboutData();
                setAboutData(data);
            } catch (err) {
                console.error("Failed to fetch about data:", err);
                setError(err instanceof Error ? err.message : "Could not load about section data.");
            } finally {
                setLoading(false);
            }
        };
        fetchAboutData();
    }, []);

    const targetRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ['start end', 'end start'],
    });

    const scrollDrivenIndex = useTransform(scrollYProgress, [0.15, 0.85], [0, (aboutData?.slides.length || 1) - 1]);
    
    const [isInteracting, setIsInteracting] = useState(false);
    
    const displayIndex = useMotionValue(0);

    useMotionValueEvent(scrollDrivenIndex, "change", (latest) => {
        if (!isInteracting) {
            displayIndex.set(latest);
        }
    });

    useEffect(() => {
        if (isInteracting || !aboutData) return;

        const interval = setInterval(() => {
            const current = Math.round(displayIndex.get());
            const next = (current + 1) % aboutData.slides.length;
            animate(displayIndex, next, { type: "spring", stiffness: 200, damping: 30 });
        }, 4000);

        return () => clearInterval(interval);
    }, [isInteracting, displayIndex, aboutData]);

    useEffect(() => {
        if (!isInteracting) {
            animate(displayIndex, scrollDrivenIndex.get(), { type: 'spring', stiffness: 100, damping: 30 });
        }
    }, [isInteracting, displayIndex, scrollDrivenIndex]);

    const changeSlide = (direction: number) => {
        if (!aboutData) return;
        const currentRounded = Math.round(displayIndex.get());
        const next = (currentRounded + direction + aboutData.slides.length) % aboutData.slides.length;
        animate(displayIndex, next, { type: "spring", stiffness: 300, damping: 30 });
    };

    if (loading) {
        return <section id="about" className="relative py-24 sm:py-32 h-[800px] flex items-center justify-center">Loading...</section>;
    }

    if (error || !aboutData) {
        return <section id="about" className="relative py-24 sm:py-32 text-center text-devil-red">{error || 'About data could not be loaded.'}</section>;
    }

    return (
        <section ref={targetRef} id="about" className="relative py-24 sm:py-32 overflow-hidden" aria-labelledby="about-heading">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    <div className="lg:h-[600px] flex items-center justify-center">
                         <AboutCarousel 
                            slides={aboutData.slides} 
                            activeIndex={displayIndex}
                            onInteractionChange={setIsInteracting}
                            onChangeSlide={changeSlide}
                         />
                    </div>
                    <div className="relative">
                        <AboutDetailPane data={aboutData} activeIndex={displayIndex} />
                    </div>
                </div>
            </div>
        </section>
    );
};