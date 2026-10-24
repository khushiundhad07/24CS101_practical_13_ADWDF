// One place for the backend URL — every request in the app goes through this file.
// On its own the client calls the Express server directly (CORS is enabled there);
// inside the combined landing app it is pointed at /api/p13 instead.
export const BASE_URL: string = import.meta.env.VITE_P13_API_URL ?? 'http://localhost:5000';

export const PRIORITIES = ['low', 'medium', 'high'] as const;
export type Priority = (typeof PRIORITIES)[number];

export interface Task {
  _id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: Priority;
  createdAt: string;
}

export interface User {
  _id: string;
  email: string;
  createdAt: string;
}

export type TaskInput = Partial<Pick<Task, 'title' | 'description' | 'completed' | 'priority'>>;

// ---- token -------------------------------------------------------------------------------

const TOKEN_KEY = 'awdf-p13-token';

export const tokenStore = {
  get(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token: string | null) {
    try {
      if (token) localStorage.setItem(TOKEN_KEY, token);
      else localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* storage unavailable: the session lasts until reload */
    }
  },
};

/** Called when a request that carried a token comes back 401 (expired or invalid). Set by AuthProvider. */
let onUnauthorized: (message: string) => void = () => {};
export const setUnauthorizedHandler = (fn: (message: string) => void) => {
  onUnauthorized = fn;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public fields: Record<string, string> = {},
  ) {
    super(message);
  }
}

// ---- requests ----------------------------------------------------------------------------

/** Adds the Bearer token, and turns any failed response into an ApiError with the server's message. */
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = tokenStore.get();
  const headers: Record<string, string> = {};
  if (init.body) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  } catch {
    throw new ApiError('Cannot reach the server — is the backend running on port 5000?', 0);
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message = data?.error ?? `Request failed with ${res.status}`;
    if (res.status === 401 && token) onUnauthorized(message);
    const fields = (data?.fields ?? {}) as Record<string, string>;
    const detail = Object.keys(fields).length ? ` (${Object.values(fields).join(', ')})` : '';
    throw new ApiError(`${message}${detail}`, res.status, fields);
  }
  return data as T;
}

const json = (method: string, body: unknown): RequestInit => ({ method, body: JSON.stringify(body) });

export const register = (email: string, password: string) =>
  request<{ user: User }>('/auth/register', json('POST', { email, password }));

export const login = (email: string, password: string) =>
  request<{ token: string; expiresIn: string; user: User }>('/auth/login', json('POST', { email, password }));

export const me = () => request<{ user: User }>('/auth/me');

export const getTasks = () => request<Task[]>('/tasks');

export const createTask = (input: TaskInput) => request<Task>('/tasks', json('POST', input));

export const updateTask = (id: string, input: TaskInput) => request<Task>(`/tasks/${id}`, json('PUT', input));

export const deleteTask = (id: string) => request<{ message: string; task: Task }>(`/tasks/${id}`, { method: 'DELETE' });

export interface AiSuggestion {
  description: string;
  fallback: boolean;
  message?: string;
}

/** Asks our own backend for a suggested description; the AI provider and its key stay on the server. */
export const generateDescription = (title: string) =>
  request<AiSuggestion>('/api/ai/generate-description', json('POST', { title }));
