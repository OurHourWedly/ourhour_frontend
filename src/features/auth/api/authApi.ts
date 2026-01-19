import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/shared/lib/apiClient';
import { QUERY_KEYS } from '@/shared/lib/queryKeys';
import {
  AuthResponseSchema,
  UserSchema,
  type AuthResponse,
  type User,
} from '@/shared/lib/schemas/authSchema';
import type { SignupRequest, LoginRequest } from '@/shared/types/api';

export const authApi = {
  // 회원가입
  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/signup/', data);
    // 런타임 검증
    const validatedData = AuthResponseSchema.parse(response.data);
    // 토큰 저장
      localStorage.setItem('accessToken', validatedData.accessToken);
    localStorage.setItem('refreshToken', validatedData.refreshToken);
    return validatedData;
  },

  // 로그인
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login/', data);
    // 런타임 검증
    const validatedData = AuthResponseSchema.parse(response.data);
    // 토큰 저장
    localStorage.setItem('accessToken', validatedData.accessToken);
    localStorage.setItem('refreshToken', validatedData.refreshToken);
    return validatedData;
  },

  // 현재 사용자 정보 조회
  getMe: async (): Promise<User | null> => {
    try {
    const response = await apiClient.get('/auth/me/');
    // 런타임 검증
    return UserSchema.parse(response.data);
    } catch (error: any) {
      // 401 에러는 로그인하지 않은 상태를 의미하므로 null 반환 (에러가 아님)
      if (error.response?.status === 401) {
        return null;
      }
      // 다른 에러는 그대로 throw
      throw error;
    }
  },

  // 로그아웃
  logout: (): void => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
};

// React Query 훅
export const useSignup = () => {
  return useMutation({
    mutationFn: authApi.signup,
  });
};

export const useLogin = () => {
  return useMutation({
    mutationFn: authApi.login,
  });
};

export const useMe = () => {
  return useQuery({
    queryKey: QUERY_KEYS.auth.me(),
    queryFn: authApi.getMe,
    retry: false,
    throwOnError: false, // 401 에러를 에러로 처리하지 않음
  });
};

