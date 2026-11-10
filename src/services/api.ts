import Constants from 'expo-constants';

function getDefaultApiBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location.hostname) {
    return `http://${window.location.hostname}:8080/api`;
  }

  const expoHost =
    process.env.EXPO_PUBLIC_API_HOST ??
    Constants.expoConfig?.hostUri?.split(':')[0];
  return `http://${expoHost || 'localhost'}:8080/api`;
}

const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? getDefaultApiBaseUrl()
).replace(/\/+$/, '');

export async function apiRequest<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(
      details || `A API respondeu com o status ${response.status}.`,
    );
  }

  return response.json() as Promise<T>;
}
