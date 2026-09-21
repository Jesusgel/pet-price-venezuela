import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { api } from '@/services/api';
import React from 'react';

vi.mock('@/services/api', () => ({
  api: {
    login: vi.fn(),
    getMe: vi.fn(),
    revokeAllSessions: vi.fn(),
  },
}));

describe('useAuth Hook', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('inicia en modo visualizador (sin login) si no hay token en localStorage', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('inicia sesión correctamente y persiste en localStorage', async () => {
    const mockUser = {
      id: 1,
      username: 'admin',
      email: 'admin@elsaman.com',
      full_name: 'Admin Saman',
      role: 'admin',
    };

    (api.login as ReturnType<typeof vi.fn>).mockResolvedValue({
      access_token: 'fake-jwt-token-123',
      token_type: 'bearer',
      user: mockUser,
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('admin', 'password123');
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAdmin).toBe(true);
    expect(localStorage.getItem('auth_token')).toBe('fake-jwt-token-123');
    expect(localStorage.getItem('auth_user')).toContain('Admin Saman');
  });

  it('cierra sesión y limpia localStorage al invocar logout', async () => {
    localStorage.setItem('auth_token', 'sample-token');
    localStorage.setItem(
      'auth_user',
      JSON.stringify({ id: 1, username: 'admin', role: 'admin' }),
    );

    (api.getMe as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 1,
      username: 'admin',
      role: 'admin',
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAdmin).toBe(false);
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('auth_user')).toBeNull();
  });

  it('limpia sesión automáticamente cuando se dispara el evento auth:expired', async () => {
    localStorage.setItem('auth_token', 'sample-token');
    localStorage.setItem(
      'auth_user',
      JSON.stringify({ id: 1, username: 'admin', role: 'admin' }),
    );

    (api.getMe as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 1,
      username: 'admin',
      role: 'admin',
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      window.dispatchEvent(new CustomEvent('auth:expired'));
    });

    await waitFor(() => {
      expect(result.current.user).toBeNull();
      expect(result.current.isAdmin).toBe(false);
      expect(localStorage.getItem('auth_token')).toBeNull();
    });
  });
});
