const API_BASE_URL = import.meta.env.VITE_API_URL;

export async function checkConnection() {
    const response = await fetch(`${API_BASE_URL}/api/connection`);
    if (!response.ok) {
        throw new Error(`Connection check failed with status: ${response.status}`);
    }
    return response.json();
}