// Simple auth utility for getting test tokens
export async function getTestToken(email: string = 'test@example.com') {
  try {
    const response = await fetch('/api/auth/test-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error('Failed to get test token');
    }

    const data = await response.json();
    
    // Store token in localStorage for API requests
    localStorage.setItem('authToken', data.token);
    
    return data;
  } catch (error) {
    console.error('Error getting test token:', error);
    throw error;
  }
}

export function getStoredToken() {
  return localStorage.getItem('authToken');
}

export function clearToken() {
  localStorage.removeItem('authToken');
}

// Add auth header to requests
export function addAuthHeader(headers: Record<string, string> = {}) {
  const token = getStoredToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}