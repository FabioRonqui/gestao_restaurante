const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080/api'
).replace(/\/+$/, '');

export async function apiRequest<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
  } catch (error) {
    throw new Error(
      `Não foi possível conectar à API em ${API_BASE_URL}. Verifique se o backend está ativo e se o endereço está correto.`,
      { cause: error },
    );
  }

  if (!response.ok) {
    const details = await response.text();
    throw new Error(
      details || `A API respondeu com o status ${response.status}.`,
    );
  }

  return response.json() as Promise<T>;
}
