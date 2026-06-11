import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@/entities/session';
import { paths } from '@/shared/config';
import { clearOfflineStorage } from '@/shared/lib/clearOfflineStorage';

import { getMe, login, logout } from '../api/authApi';
import type { LoginRequest } from './types';

export const authKeys = {
  me: ['me'] as const,
};

export const useLogin = () => {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: LoginRequest) => login(payload),
    onSuccess: (data) => {
      setAuth(data.token, data.user);
      navigate(paths.dashboard, { replace: true });
    },
  });
};

export const useLogout = () => {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logout(),
    onSettled: () => {
      clearAuth();
      queryClient.clear();
      // 오프라인 캐시·IndexedDB 정리(베스트 에포트, 네비게이션 비차단).
      void clearOfflineStorage();
      navigate(paths.login, { replace: true });
    },
  });
};

export const useMe = () => {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: authKeys.me,
    queryFn: getMe,
    enabled: Boolean(token),
  });
};
