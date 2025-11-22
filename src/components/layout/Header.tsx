import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import profileImg from '../../assets/vicimg.jpg';

const navLinks = [
  { name: 'Projects', path: '/devillabs' },
  { name: 'Services', path: '/services' },
  { name: 'Blog', path: '/blog' },
  { name: 'Contact', path: '/contact' },
];

const MenuIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'py-4 glassmorphic border-b border-devil-gray' : 'py-6'}`}>
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-3 group" onClick={() => setMobileMenuOpen(false)}>
          <img
            src={profileImg}
            alt="Portrait of Vicky Kumar"
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shadow-xl border border-devil-red/60 transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div>
            <h1 className="text-base sm:text-lg font-semibold text-white">Vicky Kumar</h1>
            <p className="text-xs text-neutral-300 hidden sm:block">AI Developer • IIT Patna • Founder @Devil Labs</p>
          </div>
        </NavLink>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-6 text-sm text-neutral-300">
          {navLinks.map(link => (
            <NavLink 
              key={link.name} 
              to={link.path} 
              className={({ isActive }) =>`relative group hover:text-white transition-colors ${isActive ? 'text-devil-red' : ''}`}
            >
              {({ isActive }) => (
                <>
                  {link.name}
                  <span className={`absolute left-0 -bottom-1 h-0.5 bg-devil-red transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}/>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-white p-2 hover:text-devil-red transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[72px] bg-devil-black/95 backdrop-blur-lg z-40">
          <nav className="flex flex-col p-6 space-y-4">
            {navLinks.map(link => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `text-lg font-semibold py-3 px-4 rounded-lg transition-all ${
                    isActive
                      ? 'text-devil-red bg-devil-red/10 border border-devil-red/30'
                      : 'text-neutral-300 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;