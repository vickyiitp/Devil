
import React from 'react';
import { NavLink } from 'react-router-dom';
import { GithubIcon, LinkedinIcon, XTwitterIcon, YoutubeIcon, InstagramIcon, AppIcon } from '../../assets/icons';
import { appLinksData } from '../../data/applinks';

const socialLinks = [
  { name: 'YouTube', icon: YoutubeIcon, url: 'https://youtu.be/4icfPrAuV54' },
  { name: 'LinkedIn', icon: LinkedinIcon, url: 'https://linkedin.com/in/vickyiitp' },
  { name: 'Instagram', icon: InstagramIcon, url: 'https://instagram.com/vickyiitp' },
  { name: 'GitHub', icon: GithubIcon, url: 'https://github.com/vickyiitp' },
  { name: 'X', icon: XTwitterIcon, url: 'https://x.com/vickyiitp' },
];

const Footer: React.FC = () => {
    return (
        <footer id="contact" className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 mt-12 sm:mt-20 border-t border-neutral-800 text-neutral-400">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-2/3 bg-gradient-to-r from-transparent via-accent-blue to-transparent" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12">
            <div className="lg:col-span-4">
              <h4 className="font-bold text-base sm:text-lg text-white">Vicky Kumar</h4>
              <p className="text-xs sm:text-sm mt-1">AI Developer • IIT Patna • Founder @ Devil Labs</p>
              <p className="text-xs mt-3 sm:mt-4 max-w-xs">Building AI apps, cybersecurity tools & luxury-grade dev products. Open for collaborations and custom projects.</p>
              <div className="flex items-center gap-3 sm:gap-4 mt-5 sm:mt-6">
                {socialLinks.map(social => (
                  <a key={social.name} href={social.url} target="_blank" rel="noopener noreferrer" aria-label={social.name} className="text-neutral-500 hover:text-accent-magenta transition-colors">
                    <social.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </a>
                ))}
              </div>
            </div>

            <div className="lg:col-span-8">
              <h5 className="font-semibold text-sm sm:text-base text-white tracking-wider uppercase">Devil Labs Apps & Tools</h5>
              <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {appLinksData.map(app => (
                  <a
                    key={app.id}
                    href={app.domain}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 sm:gap-3 p-2 rounded-lg hover:bg-glass transition-colors"
                  >
                    <div className="flex-shrink-0 bg-devil-gray p-1.5 sm:p-2 rounded-md">
                      {app.icon ? <app.icon className="h-4 w-4 sm:h-5 sm:w-5 text-accent-gold" /> : <AppIcon className="h-4 w-4 sm:h-5 sm:w-5 text-accent-gold" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-white group-hover:text-accent-gold transition-colors truncate">{app.name}</p>
                      <p className="text-xs text-neutral-500 truncate">{app.domain.replace('https://', '')}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-neutral-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-neutral-500">
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
              <NavLink to="/terms" className="hover:text-white transition-colors">Terms of Service</NavLink>
              <NavLink to="/privacy" className="hover:text-white transition-colors">Privacy Policy</NavLink>
              <NavLink to="/resume" className="hover:text-white transition-colors">Resume</NavLink>
            </div>
            <p className="text-center sm:text-left">&copy; {new Date().getFullYear()} Vicky Kumar (vickyiitp.tech). All Rights Reserved.</p>
          </div>
        </footer>
    );
};

export default Footer;
