
import { AboutData } from '../types';
import { API_URL } from '../api/cms';
import agenticImage from '../assets/agentic.png';
import cyberImage from '../assets/cyber.png';
import webImage from '../assets/web.png';

export const aboutData: AboutData = {
  heroName: "About Me",
  heroTitle: "AI Developer & Founder",
  shortBio: "I'm Vicky Kumar, an AI developer from IIT Patna and the founder of Devil Labs. I specialize in building intelligent systems, from generative AI agents to robust cybersecurity tools. My passion lies in creating technology that is not only powerful but also elegant and user-friendly.",
  slides: [
    {
      id: 'slide-1',
      title: 'Agentic AI Framework',
      details: 'Developing autonomous AI agents that can reason, plan, and execute complex tasks.',
      type: 'image',
      src: agenticImage,
      alt: 'Abstract AI visualization'
    },
    {
      id: 'slide-2',
      title: 'Cybersecurity Research',
      details: 'Building tools to monitor and defend against real-time cyber threats.',
      type: 'image',
      src: cyberImage,
      alt: 'Cybersecurity dashboard'
    },
    {
      id: 'slide-3',
      title: 'Full-Stack Web Apps',
      details: 'Crafting performant and scalable web applications with modern frameworks.',
      type: 'image',
      src: webImage,
      alt: 'Code on a screen'
    }
  ],
  skills: [
    { name: 'Python & AI/ML', percent: 95 },
    { name: 'TypeScript & React', percent: 90 },
    { name: 'Google Cloud & DevOps', percent: 80 },
    { name: 'Cybersecurity Tools', percent: 85 },
  ],
  stats: [
    { label: 'Projects', value: 20 },
    { label: 'Commits', value: 3000 },
    { label: 'Clients', value: 100 },
  ],
  resumeUrls: {
    onePage: `${API_URL}/api/resumes/onepage`,
    full: `${API_URL}/api/resumes/full`,
    technical: `${API_URL}/api/resumes/technical`,
  },
};
