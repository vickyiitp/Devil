
import React, { Suspense, lazy, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import { AnimatePresence, motion } from 'framer-motion';
import { usePointerGlow } from './hooks/usePointerGlow';
import FullPage3D from './components/layout/FullPage3D';
import { TechnoBoyzChat } from './components/shared/TechnoBoyzChat';

const HomePage = lazy(() => import('./pages/HomePage'));
const DevilLabsPage = lazy(() => import('./pages/DevilLabsPage'));
const BlogListPage = lazy(() => import('./pages/Blog/BlogListPage'));
const BlogDetailPage = lazy(() => import('./pages/Blog/BlogDetailPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const AnimatedRoutes: React.FC = () => {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/" element={<MotionWrapper><HomePage /></MotionWrapper>} />
                <Route path="/devillabs" element={<MotionWrapper><DevilLabsPage /></MotionWrapper>} />
                <Route path="/blog" element={<MotionWrapper><BlogListPage /></MotionWrapper>} />
                <Route path="/blog/:slug" element={<MotionWrapper><BlogDetailPage /></MotionWrapper>} />
                <Route path="/services" element={<MotionWrapper><ServicesPage /></MotionWrapper>} />
                <Route path="/contact" element={<MotionWrapper><ContactPage /></MotionWrapper>} />
                <Route path="/admin" element={<MotionWrapper><AdminPage /></MotionWrapper>} />
                <Route path="/terms" element={<MotionWrapper><TermsPage /></MotionWrapper>} />
                <Route path="/privacy" element={<MotionWrapper><PrivacyPage /></MotionWrapper>} />
            </Routes>
        </AnimatePresence>
    );
};

const MotionWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
        {children}
    </motion.div>
);

const App: React.FC = () => {
  const [pointerStyle, handleMouseMove] = usePointerGlow();

  return (
    <HashRouter>
      <ScrollToTop />
      <div className="min-h-screen bg-background text-white font-sans" onMouseMove={handleMouseMove}>
        <FullPage3D />
        {/* eslint-disable-next-line react/no-inline-styles */}
        <div style={pointerStyle} className="fixed inset-0 z-10" />
        <div className="relative z-20 flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            <Suspense fallback={<LoadingSpinner />}>
              <AnimatedRoutes />
            </Suspense>
          </main>
          <Footer />
          <TechnoBoyzChat />
        </div>
      </div>
    </HashRouter>
  );
};

const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center h-screen">
        <svg width="80" height="80" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="text-devil-red">
            <style>{`.spinner_V8m1{transform-origin:center;animation:spinner_zKoa 2s linear infinite}.spinner_V8m1 circle{stroke-linecap:round;animation:spinner_YpZS 1.5s ease-in-out infinite}@keyframes spinner_zKoa{100%{transform:rotate(360deg)}}@keyframes spinner_YpZS{0%{stroke-dasharray:0 150;stroke-dashoffset:0}47.5%{stroke-dasharray:42 150;stroke-dashoffset:-16}95%,100%{stroke-dasharray:42 150;stroke-dashoffset:-59}}`}</style>
            <g className="spinner_V8m1">
                <circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" strokeWidth="2"></circle>
            </g>
        </svg>
    </div>
);

export default App;