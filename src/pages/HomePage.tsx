
import React from 'react';
import { NavLink } from 'react-router-dom';
import { projects } from '../data/projects';
import Hero3DLoader from '../components/shared/home/Hero3DLoader';
import { HomeAbout } from '../components/shared/home/HomeAbout';
import { LuxuryContainer } from '../components/shared/LuxuryContainer';
import { YouTubeEmbed } from '../components/shared/YouTubeEmbed';
import { ToolsGrid } from '../components/shared/ToolsGrid';
import { AnimatedCounter } from '../components/shared/AnimatedCounter';
import { motion } from 'framer-motion';

const FeaturedProjects: React.FC = () => {
    const featuredProjects = projects.filter(p => p.featured);

    if (featuredProjects.length === 0) {
        return <div className="text-center p-8 text-neutral-400">No featured projects to display.</div>
    }

    return (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects.map(p => (
              <LuxuryContainer key={p.id} variant="showcase" glowColor="rgba(246, 200, 95, 0.6)">
                <article className="bg-transparent rounded-xl p-4 h-full flex flex-col">
                    <div className="h-48 bg-neutral-900 rounded-md flex items-center justify-center text-neutral-400 overflow-hidden relative">
                        <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                    <div className="mt-3 flex-grow">
                      <h4 className="font-semibold text-white">{p.title}</h4>
                      <p className="text-sm text-neutral-400 mt-1">{p.short}</p>
                    </div>
                    <div className="mt-3 flex gap-2">
                        <a href={p.repo_url || '#'} target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1 rounded-full bg-black/50 border border-neutral-700 hover:border-neutral-500 transition-colors">Source</a>
                        <a href={p.demo_url || '#'} target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-accent-blue/30 to-accent-gold/30 border border-neutral-700 hover:border-neutral-500 transition-colors">Live</a>
                    </div>
                </article>
              </LuxuryContainer>
            ))}
        </div>
    );
};


const heroStats = [
  { label: 'AI solutions shipped', value: 32 },
  { label: 'Security issues neutralized', value: 140 },
  { label: 'Active product installs', value: 4800 }
];

const HomePage: React.FC = () => {
  return (
    <>
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 relative">
          <LuxuryContainer
            variant="hero"
            glowColor="rgba(0, 209, 255, 0.7)"
            className="bg-gradient-to-br from-[#0c1427] via-[#0b1220] to-[#130720] border border-white/6"
          >
            <div className="relative rounded-2xl overflow-hidden">
              <div className="absolute inset-0 opacity-60 pointer-events-none bg-[radial-gradient(circle_at_top,_rgba(0,209,255,0.25),_transparent_55%)]" />
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/55 via-transparent to-black/60" />
              <div className="w-full h-[400px] sm:h-[480px] lg:h-[520px]" />
              <div className="absolute inset-0 flex items-center justify-center text-center">
                <div className="relative z-10 px-4 max-w-3xl mx-auto">
                    <div className="mx-auto w-fit mb-4 sm:mb-5 pointer-events-auto">
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 sm:px-4 py-1.5 sm:py-2 text-xs uppercase tracking-widest text-neutral-200">
                        <span className="h-2 w-2 rounded-full bg-accent-blue animate-pulse" aria-hidden />
                        <span className="hidden sm:inline">Crafting Intelligent Digital Experiences</span>
                        <span className="sm:hidden">AI Developer</span>
                      </span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-white drop-shadow-[0_12px_30px_rgba(0,0,0,0.65)]">
                        Vicky — <span className="shimmer-text">AI Developer</span>
                    </h1>
                    <p className="mt-3 sm:mt-4 text-base sm:text-lg text-white/95 font-semibold">Founder @ Devil Labs • IIT Patna</p>
                    <p className="mt-4 sm:mt-6 text-sm sm:text-base text-white/90 max-w-2xl mx-auto px-2">
                        I build premium AI experiences, threat-resilient systems, and polished web products. Gemini, Python, and cloud-native delivery are woven into every engagement.
                    </p>
                    <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center relative z-50 px-2">
                        <NavLink to="/devillabs" className="px-6 py-3 rounded-xl bg-gradient-to-r from-accent-blue via-accent-magenta to-accent-gold text-black font-semibold shadow-[0_12px_30px_rgba(0,209,255,0.35)] hover:opacity-90 hover:scale-105 transition-all cursor-pointer text-center">Explore Tools</NavLink>
                        <NavLink to="/contact" className="px-6 py-3 rounded-xl border border-white/20 text-white/90 hover:text-white hover:border-white hover:scale-105 transition-all bg-black/30 backdrop-blur cursor-pointer text-center">Request Quote</NavLink>
                        <NavLink to="/services" className="px-6 py-3 rounded-xl text-neutral-100 bg-white/8 border border-white/10 hover:bg-white/12 hover:scale-105 transition-all cursor-pointer text-center">View Services</NavLink>
                    </div>
                    <div className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 px-2">
                      {heroStats.map((stat) => (
                        <div key={stat.label} className="rounded-xl bg-white/10 border border-white/10 px-3 sm:px-4 py-4 sm:py-5 backdrop-blur-sm">
                          <div className="text-2xl sm:text-3xl font-black text-white drop-shadow-[0_6px_16px_rgba(0,0,0,0.35)]">
                            <AnimatedCounter to={stat.value} />+
                          </div>
                          <p className="mt-1 text-xs uppercase tracking-wide text-white/80">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                </div>
              </div>
            </div>
          </LuxuryContainer>
        </section>

        <section id="projects" className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <h3 className="text-xl sm:text-2xl font-bold text-white">Featured Projects</h3>
          <p className="text-sm sm:text-base text-neutral-400 mt-2 max-w-2xl">Hand-picked demos and tools from Devil Labs — quick previews and live links.</p>
          <div className="mt-6">
            <FeaturedProjects />
          </div>
        </section>

        <HomeAbout />

        <section id="youtube-feature" className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
            <div className="text-center mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-white">From the Channel</h3>
                <p className="text-sm sm:text-base text-neutral-400 mt-2 max-w-2xl mx-auto">
                    Tutorials, project breakdowns, and tech insights on my YouTube channel. Here's the latest video.
                </p>
            </div>
            <YouTubeEmbed videoId="4icfPrAuV54" title="Featured YouTube Video" />
        </section>
        
        <section id="tools-tech" className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
            <motion.div
                initial="offscreen"
                whileInView="onscreen"
                viewport={{ once: true, amount: 0.3 }}
                transition={{ staggerChildren: 0.2 }}
            >
                <motion.h3 
                    className="text-xl sm:text-2xl font-bold text-white"
                    variants={{
                        offscreen: { y: 20, opacity: 0 },
                        onscreen: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } }
                    }}
                >
                    Tools & Technologies
                </motion.h3>
                <motion.p 
                    className="text-sm sm:text-base text-neutral-400 mt-2 max-w-2xl"
                    variants={{
                        offscreen: { y: 20, opacity: 0 },
                        onscreen: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } }
                    }}
                >
                    The primary languages, frameworks, and tools I use to build powerful applications.
                </motion.p>
            </motion.div>
            <div className="mt-8">
              <ToolsGrid />
            </div>
        </section>

        <section id="devillabs" className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="rounded-xl p-5 sm:p-7 bg-gradient-to-br from-[#071426]/40 to-[#0b1220]/30 border border-neutral-800">
            <h3 className="text-xl sm:text-2xl font-bold text-white">Devil Labs — Store & Tools</h3>
            <p className="mt-2 text-sm sm:text-base text-neutral-300">A curated shop & demo hub for all my AI apps, cybersecurity utilities, and web projects. Use the store to test live demos or buy source code and licenses.</p>
            <div className="mt-4">
              <NavLink to="/devillabs" className="inline-block px-4 py-2 rounded-md bg-accent-magenta text-black font-semibold hover:opacity-90 transition-opacity text-sm sm:text-base">Open Devil Labs →</NavLink>
            </div>
          </div>
        </section>
    </>
  );
};

export default HomePage;
