
import { AppIcon } from '../assets/icons';
import React from 'react';

export interface AppLink {
    id: string;
    name: string;
    domain: string;
    icon?: React.ComponentType<{ className?: string }>;
    platforms: ('web' | 'ios' | 'android' | 'pwa')[];
    tags: string[];
}

export const appLinksData: AppLink[] = [
    {
        id: 'devillabs-store',
        name: 'Devil Labs Store',
        domain: 'https://vickyiitp.tech/#/devillabs',
        icon: AppIcon,
        platforms: ['web', 'pwa'],
        tags: ['store', 'ai', 'tools']
    },
    {
        id: 'mva-platform',
        name: 'Team MVA Platform',
        domain: 'https://teammva.com',
        icon: AppIcon,
        platforms: ['web'],
        tags: ['community', 'cybersecurity']
    },
    {
        id: 'portfolio-v1',
        name: 'Portfolio v1',
        domain: 'https://v1.vickyiitp.tech',
        icon: AppIcon,
        platforms: ['web'],
        tags: ['archive', 'portfolio']
    },
    // Add more apps here
];
