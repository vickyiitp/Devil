const API_URL = import.meta.env.VITE_CMS_API_URL || 'http://localhost:8000';

export const loginAdmin = async (credentials: {username: string, password: string}): Promise<{token: string}> => {
    console.log('Admin login attempt:', credentials.username);
    
    const response = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
    });

    if (!response.ok) {
        const error = await response.text();
        console.error('Login failed:', error);
        throw new Error('Invalid username or password.');
    }

    const data = await response.json();
    console.log('Login successful');
    return { token: data.access_token };
}
