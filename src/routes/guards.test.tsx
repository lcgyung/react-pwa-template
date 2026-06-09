import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';

import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import { useAuthStore } from '@/stores/authStore';
import type { Role, User } from '@/types/user';

const makeUser = (role: Role): User => ({
  id: 1,
  name: '테스트',
  email: 'test@example.com',
  role,
  createdAt: '2026-01-01T00:00:00.000Z',
});

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<div>login page</div>} />
        <Route path="/403" element={<div>forbidden page</div>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<div>dashboard page</div>} />
          <Route element={<RoleRoute allowedRoles={['admin', 'manager']} />}>
            <Route path="/users" element={<div>users page</div>} />
          </Route>
        </Route>
      </Routes>
    </MemoryRouter>,
  );

describe('route guards (RBAC)', () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
  });

  it('미인증 사용자는 /login 으로 리다이렉트된다', async () => {
    renderAt('/');
    expect(await screen.findByText('login page')).toBeInTheDocument();
  });

  it('user 역할은 /users 접근 시 /403 으로 리다이렉트된다', async () => {
    useAuthStore.getState().setAuth('token', makeUser('user'));
    renderAt('/users');
    expect(await screen.findByText('forbidden page')).toBeInTheDocument();
  });

  it('admin 역할은 /users 에 접근할 수 있다', async () => {
    useAuthStore.getState().setAuth('token', makeUser('admin'));
    renderAt('/users');
    expect(await screen.findByText('users page')).toBeInTheDocument();
  });
});
