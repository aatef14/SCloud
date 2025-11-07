import { API_BASE_URL } from './api-config';

export interface User {
  email: string;
  username: string;
  gender?: string;
  dateOfBirth?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  gender?: string;
  dateOfBirth?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

/**
 * Register a new user
 */
export async function registerUser(data: RegisterData): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Registration failed' }));
    throw new Error(error.error || 'Failed to register');
  }

  return response.json();
}

/**
 * Login user
 */
export async function loginUser(data: LoginData): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Login failed' }));
    throw new Error(error.error || 'Invalid email or password');
  }

  return response.json();
}

/**
 * Verify JWT token
 */
export async function verifyToken(token: string): Promise<{ valid: boolean; user?: User }> {
  const response = await fetch(`${API_BASE_URL}/auth/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    return { valid: false };
  }

  return response.json();
}

/**
 * Get user profile
 */
export async function getUserProfile(token: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users/profile`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to get profile' }));
    throw new Error(error.error || 'Failed to get profile');
  }

  const data = await response.json();
  return data.user;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  token: string,
  updates: Partial<Pick<User, 'username' | 'gender' | 'dateOfBirth'>>
): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users/profile`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to update profile' }));
    throw new Error(error.error || 'Failed to update profile');
  }

  const data = await response.json();
  return data.user;
}
