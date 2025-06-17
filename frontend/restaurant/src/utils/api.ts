export const parseApiErrors = (data: any, fieldLabels: Record<string, string> = {}): string => {
  // Handle field-specific errors (e.g., {"email": ["This field is required."]})
  if (typeof data === 'object' && !data.error) {
    const errors: string[] = [];
    Object.keys(data).forEach((field) => {
      if (Array.isArray(data[field])) {
        const label = fieldLabels[field] || field.charAt(0).toUpperCase() + field.slice(1);
        data[field].forEach((msg: string) => errors.push(`${label}: ${msg}`));
      }
    });
    return errors.join(' ') || 'Invalid input';
  }
  // Handle general error (e.g., {"error": "Invalid email or password"})
  return data.error || 'Request failed';
};

import { useAuth } from '@/contexts/AuthContext';

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const { accessToken, refreshAccessToken, logout } = useAuth();

  let currentAccessToken = accessToken;
  if (!currentAccessToken) {
    throw new Error('No access token available');
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${currentAccessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (response.status === 401) {
    try {
      currentAccessToken = await refreshAccessToken();
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${currentAccessToken}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      logout();
      throw new Error('Session expired. Please log in again.');
    }
  }

  return response;
};