import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import type { ErrorResponse } from '@/shared/types/api';

const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: 토큰 자동 추가
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 에러 처리
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ErrorResponse>) => {
    // 401 에러 발생 시 즉시 로그아웃 처리
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      const currentPath = window.location.pathname;
      
      // /auth/me 엔드포인트의 401은 정상적인 응답(로그인하지 않은 상태)이므로 무시
      // 이미 로그인/회원가입 페이지에 있으면 리다이렉트하지 않음 (무한 루프 방지)
      if (requestUrl.includes('/auth/me/') || currentPath === '/login' || currentPath === '/signup') {
        // 토큰만 삭제하고 리다이렉트는 하지 않음
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return Promise.reject(error);
      }
      
      // 토큰 삭제
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      // 로그인 페이지로 리다이렉트
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default apiClient;

