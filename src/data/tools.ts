
export const toolCategories = ['Languages', 'Frameworks', 'Cloud/DB', 'APIs', 'Tools'];

export type ToolCategory = typeof toolCategories[number];

export interface Tool {
    name: string;
    proficiency: number;
    category: ToolCategory;
    note: string;
}

export const tools: Tool[] = [
    {
        name: 'Python',
        proficiency: 95,
        category: 'Languages',
        note: 'AI/ML, Backend, Scripts'
    },
    {
        name: 'TypeScript',
        proficiency: 90,
        category: 'Languages',
        note: 'Full-Stack Web Apps'
    },
    {
        name: 'React / Next.js',
        proficiency: 95,
        category: 'Frameworks',
        note: 'Interactive UIs'
    },
    {
        name: 'Flask',
        proficiency: 85,
        category: 'Frameworks',
        note: 'Lightweight APIs'
    },
    {
        name: 'Google Cloud',
        proficiency: 80,
        category: 'Cloud/DB',
        note: 'Scalable Infrastructure'
    },
    {
        name: 'MongoDB',
        proficiency: 85,
        category: 'Cloud/DB',
        note: 'NoSQL Databases'
    },
    {
        name: 'Gemini API',
        proficiency: 90,
        category: 'APIs',
        note: 'Generative AI Apps'
    },
    {
        name: 'Git & GitHub',
        proficiency: 98,
        category: 'Tools',
        note: 'Version Control'
    },
    {
        name: 'Nmap',
        proficiency: 80,
        category: 'Tools',
        note: 'Network Scanning'
    },
    {
        name: 'Burp Suite',
        proficiency: 75,
        category: 'Tools',
        note: 'Web App Security'
    },
    {
        name: 'Three.js / R3F',
        proficiency: 70,
        category: 'Frameworks',
        note: '3D Web Experiences'
    },
     {
        name: 'Docker',
        proficiency: 80,
        category: 'Tools',
        note: 'Containerization'
    },
];
