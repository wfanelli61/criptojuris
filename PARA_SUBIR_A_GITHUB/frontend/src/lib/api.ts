const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

interface FetchOptions extends RequestInit {
    skipAuth?: boolean;
}

export async function apiFetch<T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { skipAuth, ...fetchOptions } = options;

    const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;

    const headers: Record<string, string> = {
        ...((fetchOptions.headers as Record<string, string>) || {}),
    };

    if (!(fetchOptions.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const config: RequestInit = {
        ...fetchOptions,
        headers,
        credentials: 'include',
    };

    // Add access token from cookie if available (client-side)
    if (typeof window !== 'undefined' && !skipAuth) {
        const token = getAccessToken();
        if (token) {
            config.headers = {
                ...config.headers,
                Authorization: `Bearer ${token}`,
            };
        }
    }

    const response = await fetch(url, config);

    if (response.status === 401 && !skipAuth && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
        // Try to refresh token
        const refreshed = await refreshAccessToken();
        if (refreshed) {
            const token = getAccessToken();
            config.headers = {
                ...config.headers,
                Authorization: `Bearer ${token}`,
            };
            const retryResponse = await fetch(url, config);
            if (!retryResponse.ok) {
                const error = await retryResponse.json().catch(() => ({ error: 'Error desconocido' }));
                throw new ApiError(error.error || 'Error en la solicitud', retryResponse.status);
            }
            return retryResponse.json();
        } else {
            // Clear tokens
            clearTokens();
            throw new ApiError('Sesión expirada', 401);
        }
    }

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new ApiError(error.error || 'Error en la solicitud', response.status);
    }

    return response.json();
}

export class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
        super(message);
        this.status = status;
    }
}

// Token Management
export function getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
}

export function setAccessToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('accessToken', token);
}

export function clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('accessToken');
}

async function refreshAccessToken(): Promise<boolean> {
    try {
        const response = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
        });
        if (response.ok) {
            const data = await response.json();
            setAccessToken(data.accessToken);
            return true;
        }
        return false;
    } catch {
        return false;
    }
}
