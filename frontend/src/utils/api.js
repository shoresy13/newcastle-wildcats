const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function checkConnection() {
    const response = await fetch(`${API_BASE_URL}/api/connection`);
    if (!response.ok) {
        throw new Error(`Connection check failed with status: ${response.status}`);
    }
    return response.json();
}

export async function loginUser(credentials) {
    const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Login failed');
    }

    return data;
}