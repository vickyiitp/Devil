
import React from 'react';

export interface License {
  type: 'personal' | 'commercial' | 'source';
  price: number;
}

export interface Product {
  id: string | number;
  slug: string;
  title: string;
  short: string;
  description: string;
  tech?: string[];
  tags?: string[]; // For CMS projects
  demo_url?: string;
  repo_url?: string;
  live_url?: string; // For CMS projects
  licenses?: License[];
  images: string[];
  video_preview?: string;
  category: 'AI' | 'Tools' | 'Cybersecurity' | 'Apps' | 'Web Apps' | 'APIs' | 'All';
  featured: boolean;
  createdAt?: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  tags: string[];
  imageUrl: string;
}

export interface Service {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }> | string; // Allow string for API data
    features: string[];
    priceTier: 'Standard' | 'Premium' | 'Enterprise';
    startingPrice: number;
}

// New types for the About section
export interface Skill {
  name: string;
  percent: number;
}
export interface Stat {
  label: string;
  value: number;
}
export interface Slide {
  id: string;
  title: string;
  details: string;
  type: 'image' | 'video';
  src: string;
  poster?: string;
  alt: string;
  demo?: string;
}
export interface AboutData {
  heroName: string;
  heroTitle: string;
  shortBio: string;
  slides: Slide[];
  skills: Skill[];
  stats: Stat[];
  resumeUrls: {
    onePage: string;
    full: string;
    technical?: string; // optional technical resume URL
  };
}
