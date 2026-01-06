import { useQuery } from '@tanstack/react-query';
import apiClient from '@/shared/lib/apiClient';
import { QUERY_KEYS } from '@/shared/lib/queryKeys';
import {
  TemplateListResponseSchema,
  TemplateDetailSchema,
  type TemplateListResponse,
  type TemplateDetail,
} from '@/shared/lib/schemas/templateSchema';
import type { PublicInvitation } from '@/shared/types/api';

export const templateApi = {
  // 템플릿 목록 조회
  getTemplates: async (params?: {
    page?: number;
    page_size?: number;
    search?: string;
    category?: string;
    ordering?: string;
  }): Promise<TemplateListResponse> => {
    const response = await apiClient.get('/templates/', { params });
    
    // 응답이 문자열인 경우 (에러 응답 등)
    if (typeof response.data === 'string') {
      console.error('API 응답이 문자열입니다:', response.data);
      throw new Error('템플릿 목록을 불러오는 중 오류가 발생했습니다. 서버 응답을 확인해주세요.');
    }
    
    // 응답이 객체가 아닌 경우
    if (typeof response.data !== 'object' || response.data === null) {
      console.error('API 응답이 객체가 아닙니다:', typeof response.data, response.data);
      throw new Error('템플릿 목록을 불러오는 중 오류가 발생했습니다. 응답 형식이 올바르지 않습니다.');
    }
    
    // 런타임 검증
    try {
      return TemplateListResponseSchema.parse(response.data);
    } catch (error) {
      console.error('템플릿 스키마 검증 실패:', error);
      console.error('응답 데이터:', response.data);
      throw new Error('템플릿 데이터 형식이 올바르지 않습니다.');
    }
  },

  // 템플릿 상세 조회
  getTemplate: async (id: number): Promise<TemplateDetail> => {
    const response = await apiClient.get(`/templates/${id}/`);
    
    // 응답이 문자열인 경우 (에러 응답 등)
    if (typeof response.data === 'string') {
      console.error('API 응답이 문자열입니다:', response.data);
      throw new Error('템플릿을 불러오는 중 오류가 발생했습니다. 서버 응답을 확인해주세요.');
    }
    
    // 응답이 객체가 아닌 경우
    if (typeof response.data !== 'object' || response.data === null) {
      console.error('API 응답이 객체가 아닙니다:', typeof response.data, response.data);
      throw new Error('템플릿을 불러오는 중 오류가 발생했습니다. 응답 형식이 올바르지 않습니다.');
    }
    
    // 런타임 검증
    try {
      return TemplateDetailSchema.parse(response.data);
    } catch (error) {
      console.error('템플릿 스키마 검증 실패:', error);
      console.error('응답 데이터:', response.data);
      throw new Error('템플릿 데이터 형식이 올바르지 않습니다.');
    }
  },

  // 템플릿 샘플 조회
  getTemplatePreview: async (id: number): Promise<PublicInvitation> => {
    const response = await apiClient.get<PublicInvitation>(`/templates/${id}/preview/`);
    return response.data;
  },
};

// React Query 훅
export const useTemplates = (params?: {
  page?: number;
  page_size?: number;
  search?: string;
  category?: string;
  ordering?: string;
}) => {
  return useQuery({
    queryKey: QUERY_KEYS.templates.list(params),
    queryFn: () => templateApi.getTemplates(params),
  });
};

export const useTemplate = (id: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.templates.detail(id),
    queryFn: () => templateApi.getTemplate(id),
    enabled: !!id, // id가 있을 때만 실행
  });
};

export const useTemplatePreview = (id: number) => {
  return useQuery({
    queryKey: ['template', id, 'preview'],
    queryFn: () => templateApi.getTemplatePreview(id),
    enabled: !!id, // id가 있을 때만 실행
  });
};

