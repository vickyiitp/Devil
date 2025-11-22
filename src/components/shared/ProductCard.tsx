import React, { useRef } from 'react';
// FIX: Import Variants type from framer-motion to fix type error.
import { motion, useMotionValue, useSpring, useTransform, Variants } from 'framer-motion';
import '../../styles/productcard.css';
import { Product } from '../../types';
import { API_URL } from '../../api/cms';
import { ExternalLinkIcon, GithubIcon } from '../../assets/icons';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['10deg', '-10deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-10deg', '10deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };
  
  // FIX: Add Variants type to fix framer-motion type error.
  const overlayVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4, ease: 'easeIn' } }
  };
  
  const contentVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2, duration: 0.4 } }
  }


  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className="relative aspect-[4/5] rounded-xl overflow-hidden glassmorphic border border-devil-gray group"
    >
      {/* eslint-disable-next-line react/no-inline-styles */}
      <div className="absolute inset-0 translate-z-20 preserve-3d">
          <img
            src={
              product.images[0]?.startsWith('/uploads') 
                ? `${API_URL}${product.images[0]}`
                : product.images[0] || 'https://picsum.photos/400/500'
            }
            alt={product.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 transform group-hover:scale-110"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 group-hover:opacity-0" />
          
          <div className="absolute bottom-0 left-0 right-0 p-4 transition-transform duration-300 group-hover:translate-y-full">
            <h3 className="text-2xl font-bold text-white truncate">{product.title}</h3>
            <p className="text-sm text-devil-red font-mono">{product.category}</p>
          </div>

          {/* Glowing Border */}
          <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-devil-red transition-all duration-300 glow-border" />
          <motion.div
            className="absolute inset-0 rounded-xl glow-strong"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />

          {/* Hover Overlay */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-md p-6 flex flex-col"
            variants={overlayVariants}
            initial="hidden"
            whileHover="visible"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <motion.div 
              variants={contentVariants} 
              className="flex flex-col h-full"
              style={{ transform: 'translateZ(50px)' }}
            >
                <motion.h3 variants={contentVariants} className="text-2xl font-bold text-devil-red">{product.title}</motion.h3>
                <motion.p variants={contentVariants} className="mt-2 text-sm text-gray-300 flex-grow overflow-y-auto">{product.description}</motion.p>
                
                <motion.div variants={contentVariants} className="mt-4">
                  <p className="text-xs font-mono text-gray-400 mb-2">TECH STACK:</p>
                  <div className="flex flex-wrap gap-2">
                    {(product.tags || product.tech || []).slice(0, 4).map((t, i) => (
                      <span key={`${t}-${i}`} className="px-2 py-1 text-xs bg-devil-gray rounded-full">{t}</span>
                    ))}
                  </div>
                </motion.div>

                <motion.div variants={contentVariants} className="mt-auto pt-4 border-t border-devil-gray">
                  <div className="flex items-center justify-between gap-2">
                    <a href={product.demo_url || '#'} target="_blank" rel="noopener noreferrer" className="flex-1 text-center px-3 py-2 text-sm font-bold text-white bg-devil-red hover:bg-devil-red-dark rounded-md transition-all duration-300 flex items-center justify-center gap-2 shimmer-bg">
                      <ExternalLinkIcon className="h-4 w-4" />
                      Live Demo
                    </a>
                    <a href={product.repo_url || '#'} target="_blank" rel="noopener noreferrer" className="flex-1 text-center px-3 py-2 text-sm font-bold text-white bg-devil-gray hover:bg-gray-700 rounded-md transition-all duration-300 flex items-center justify-center gap-2">
                      <GithubIcon className="h-4 w-4" />
                      Source
                    </a>
                  </div>
                  <button className="w-full mt-2 px-3 py-2 text-sm font-bold text-devil-red bg-devil-red/10 hover:bg-devil-red hover:text-white border border-devil-red rounded-md transition-all duration-300">
                    Buy License
                  </button>
                </motion.div>
            </motion.div>
          </motion.div>
      </div>
    </motion.div>
  );
};