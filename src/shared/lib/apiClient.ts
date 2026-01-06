import axios, { AxiosError } from 'axios';
import type { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import type { ErrorResponse } from '@/shared/types/api';
import { RefreshResponseSchema, type RefreshResponse } from '@/shared/lib/schemas/authSchema';

const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Refresh Token 동시성 처리
let refreshPromise: Promise<RefreshResponse> | null = null;

async function handleTokenRefresh(): Promise<RefreshResponse> {
  if (refreshPromise) {
    return refreshPromise; // 이미 진행 중인 요청 재사용
  }

  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    const error = new Error('No refresh token available');
    refreshPromise = null;
    throw error;
  }

  // 순환 참조 방지를 위해 axios를 직접 사용
  refreshPromise = axios
    .post<{ access: string; refresh: string }>('/api/v1/auth/refresh/', { refresh: refreshToken })
    .then((response) => {
      // 런타임 검증
      const validatedData = RefreshResponseSchema.parse(response.data);
      // 새 토큰 저장
      localStorage.setItem('accessToken', validatedData.access);
      localStorage.setItem('refreshToken', validatedData.refresh);
      refreshPromise = null; // 완료 후 초기화
      return validatedData;
    })
    .catch((error) => {
      refreshPromise = null; // 실패 시에도 초기화
      // refresh 실패 시 토큰 삭제
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      throw error;
    });

  return refreshPromise;
}

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
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // 401 에러이고 아직 재시도하지 않은 요청인 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // 토큰 갱신 시도
        const refreshResponse = await handleTokenRefresh();

        // 새 access token으로 원래 요청 재시도
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${refreshResponse.access}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        // 토큰 갱신 실패 시 로그아웃 처리
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        // 로그인 페이지로 리다이렉트 (필요시)
        // window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

