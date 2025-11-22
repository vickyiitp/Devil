import React, { Suspense, useState, useEffect, lazy } from 'react';
import HeroFallbackSVG from './HeroFallbackSVG';

const Hero3D = lazy(() => import('./Hero3D'));

const isWebGLAvailable = () => {
    try {
        const canvas = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
        return false;
    }
};

const Hero3DLoader: React.FC<{ className?: string }> = (props) => {
    const [showFallback, setShowFallback] = useState(false);

    useEffect(() => {
        const isLite = document.documentElement.classList.contains('lite-mode');
        if (isLite || !isWebGLAvailable()) {
            setShowFallback(true);
        }
    }, []);

    if (showFallback) {
        return <HeroFallbackSVG {...props} />;
    }

    const loadingPlaceholder = (
        <div 
            aria-hidden 
            className={`${props.className || 'w-full h-[420px]'} bg-gradient-to-b from-[#03040a] to-[#09091a] animate-pulse rounded-2xl`} 
        />
    );

    return (
        <Suspense fallback={loadingPlaceholder}>
            <Hero3D {...props} />
        </Suspense>
    );
};

export default Hero3DLoader;