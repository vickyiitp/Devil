
import { AboutData } from '../types';
import { aboutData } from '../data/aboutData';

export const getAboutData = async (): Promise<AboutData> => {
    console.log("Fetching mock about data...");
    // Simulate network delay for a realistic loading experience
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (aboutData) {
        return aboutData;
    }
    
    // This provides a fallback error if the mock data file is ever empty
    throw new Error('About data could not be found in the mock data file.');
};
