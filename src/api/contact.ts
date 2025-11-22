
interface ContactFormData {
    name: string;
    email: string;
    message: string;
    service?: string;
    project_type?: string;
    budget?: string;
}

interface ContactResponse {
    message: string;
}

import { API_URL } from './cms';

export const sendContactMessage = async (formData: ContactFormData): Promise<ContactResponse> => {
    const response = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    });
    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Failed to send contact message');
    }
    return response.json();
};
