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

