import React, { useState } from 'react';
// FIX: Import MotionStyle to allow for type casting of style objects with custom properties.
import { motion, useTransform, MotionValue, Variants, MotionStyle } from 'framer-motion';
import { Slide } from '../../../types';

interface AboutCarouselProps {
    slides: Slide[];
    activeIndex: MotionValue<number>;
    onInteractionChange: (isInteracting: boolean) => void;
    onChangeSlide: (direction: number) => void;
}

const CarouselItem: React.FC<{ slide: Slide; index: number; activeIndex: MotionValue<number> }> = ({ slide, index, activeIndex }) => {
    const distance = useTransform(activeIndex, (latest) => index - latest);
    
    // Enhanced transformations for a more dynamic fan/wheel effect
    const scale = useTransform(distance, [-2, -1, 0, 1, 2], [0.7, 0.85, 1, 0.85, 0.7]);
    const opacity = useTransform(distance, [-2.5, 0, 2.5], [0, 1, 0]); // Fade out further away
    const zIndex = useTransform(distance, (val) => 10 - Math.abs(Math.round(val)));
    const rotate = useTransform(distance, [-2, 0, 2], [-50, 0, 50]); // Wider fan angle
    const y = useTransform(distance, (val) => Math.abs(val) * 60); // More pronounced arc
    const z = useTransform(distance, [-2, -1, 0, 1, 2], [-400, -200, 0, -200, -400]); // Deeper 3D effect
    const glowOpacity = useTransform(distance, [-0.5, 0, 0.5], [0, 1, 0]);

    return (
        <motion.div
            className="absolute w-full h-full"
            style={{
                top: 0,
                left: '50%',
                x: '-50%',
                transformOrigin: 'bottom center',
                scale,
                opacity,
                zIndex,
                rotate,
                y,
                z,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
            <div className="relative aspect-[4/3] w-full h-full rounded-2xl overflow-hidden shadow-2xl shadow-devil-black/50">
                <div className="overflow-hidden rounded-2xl w-full h-full">
                    <motion.img
                        src={slide.src}
                        alt={slide.alt}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                </div>
                <motion.div 
                    className="absolute inset-0 border-2 border-devil-red rounded-2xl animate-breathing-glow"
                    // FIX: Cast style object to an intersection type that includes the CSS custom property to resolve TypeScript error.
                    style={{ 
                        opacity: glowOpacity,
                        '--glow-color-1': 'rgba(255, 7, 58, 0.7)',
                    } as MotionStyle & { '--glow-color-1': string }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                 <div className="absolute bottom-0 left-0 p-6">
                    <h3 className="text-xl font-bold text-white drop-shadow-lg">{slide.title}</h3>
                </div>
            </div>
        </motion.div>
    );
};

const Arrow: React.FC<{ direction: 'left' | 'right'; onClick: () => void; onFocus: () => void; onBlur: () => void; }> = ({ direction, onClick, onFocus, onBlur }) => {
    const arrowVariants: Variants = {
        hidden: { opacity: 0, scale: 0.7, x: direction === 'left' ? -20 : 20 },
        visible: { opacity: 1, scale: 1, x: 0, transition: { ease: 'easeOut', duration: 0.2 } }
    };

    return (
        <motion.button
            variants={arrowVariants}
            onClick={onClick}
            onFocus={onFocus}
            onBlur={onBlur}
            className="absolute top-1/2 -translate-y-1/2 bg-devil-black/50 text-white rounded-full h-12 w-12 flex items-center justify-center border-2 border-devil-gray hover:border-devil-red hover:text-devil-red hover:shadow-neon-red-soft focus:outline-none focus:ring-2 focus:ring-devil-red focus:ring-offset-2 focus:ring-offset-devil-black transition-all duration-300 pointer-events-auto group z-20"
            style={direction === 'left' ? { left: '1rem' } : { right: '1rem' }}
            aria-label={direction === 'left' ? 'Previous slide' : 'Next slide'}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {direction === 'left' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                )}
            </svg>
        </motion.button>
    );
};


export const AboutCarousel: React.FC<AboutCarouselProps> = ({ slides, activeIndex, onInteractionChange, onChangeSlide }) => {
    const [isInteracting, setIsInteracting] = useState(false);

    const handleInteractionStart = () => {
        setIsInteracting(true);
        onInteractionChange(true);
    };
    const handleInteractionEnd = () => {
        setIsInteracting(false);
        onInteractionChange(false);
    };

    const navContainerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                when: "beforeChildren",
                staggerChildren: 0.1,
            }
        }
    };

    return (
        <div 
            className="relative w-full max-w-2xl h-[400px] sm:h-[500px]"
            onMouseEnter={handleInteractionStart}
            onMouseLeave={handleInteractionEnd}
            onFocus={handleInteractionStart}
            onBlur={handleInteractionEnd}
            style={{ perspective: '1000px' }}
        >
            <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
                {slides.map((slide, i) => (
                    <CarouselItem key={slide.id} slide={slide} index={i} activeIndex={activeIndex} />
                ))}
            </div>
            
            <motion.div
                className="absolute inset-0 z-20 pointer-events-none"
                initial="hidden"
                animate={isInteracting ? "visible" : "hidden"}
                variants={navContainerVariants}
            >
                <Arrow direction="left" onClick={() => onChangeSlide(-1)} onFocus={handleInteractionStart} onBlur={handleInteractionEnd} />
                <Arrow direction="right" onClick={() => onChangeSlide(1)} onFocus={handleInteractionStart} onBlur={handleInteractionEnd} />
            </motion.div>
        </div>
    );
};