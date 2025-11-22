
import { Service } from '../types';
import { AiIcon, AppIcon, CodeIcon, SearchIcon } from '../assets/icons';

export const services: Service[] = [
    {
        title: 'AI Model Integration',
        description: 'Integrate cutting-edge AI models like Google Gemini into your existing applications to unlock new capabilities.',
        icon: 'AiIcon',
        features: ['API Integration', 'Custom Fine-Tuning', 'Agentic Workflow Development', 'Performance Optimization'],
        priceTier: 'Premium',
        startingPrice: 1500,
    },
    {
        title: 'Generative-AI Integration',
        description: 'Design conversational and creative AI features powered by Gemini and bespoke prompt systems that feel native to your product.',
        icon: 'AiIcon',
        features: ['Conversational Support Agents', 'Automated Content Pipelines', 'Insight Dashboards & Summaries', 'Prompt Lifecycle Playbooks'],
        priceTier: 'Premium',
        startingPrice: 2200,
    },
    {
        title: 'Custom App Development',
        description: 'Full-stack development of web and mobile applications, from concept to deployment, tailored to your business needs.',
        icon: 'AppIcon',
        features: ['MERN Stack', 'Python/Flask Backend', 'Responsive UI/UX Design', 'Cloud Deployment'],
        priceTier: 'Enterprise',
        startingPrice: 3000,
    },
    {
        title: 'Web App Development',
        description: 'Ship end-to-end web platforms with resilient frontends, performant delivery pipelines, and long-term maintainability built in.',
        icon: 'WebDevIcon',
        features: ['Design System & Accessibility Audits', 'Edge-ready Rendering Strategies', 'Performance Budget Monitoring', 'Full CI Test Harness'],
        priceTier: 'Enterprise',
        startingPrice: 4000,
    },
    {
        title: 'Cybersecurity Audit',
        description: 'Comprehensive security analysis of your web applications and APIs to identify and mitigate vulnerabilities.',
        icon: 'SearchIcon',
        features: ['Vulnerability Scanning', 'Penetration Testing', 'Security Code Review', 'Detailed Reporting'],
        priceTier: 'Premium',
        startingPrice: 2000,
    },
    {
        title: 'Source Code Licensing',
        description: 'Purchase commercial or enterprise licenses for my pre-built tools and applications to accelerate your development.',
        icon: 'CodeIcon',
        features: ['Full Source Code', 'Commercial Use Rights', 'Optional Support Packages', 'Documentation'],
        priceTier: 'Standard',
        startingPrice: 249,
    },
    {
        title: 'API Development',
        description: 'Design and deliver secure REST and GraphQL services with the governance, observability, and billing hooks your teams need.',
        icon: 'ApiIcon',
        features: ['GraphQL + REST Cohesion', 'JWT/OAuth2 Trust Chains', 'Billing & Payment Webhooks', 'Adaptive Rate Shielding'],
        priceTier: 'Premium',
        startingPrice: 1800,
    },
];
