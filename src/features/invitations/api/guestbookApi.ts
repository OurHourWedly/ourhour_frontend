import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/shared/lib/apiClient';
import { QUERY_KEYS } from '@/shared/lib/queryKeys';
import {
  GuestbookSchema,
  GuestbookListResponseSchema,
  CreateGuestbookRequestSchema,
  type Guestbook,
  type CreateGuestbookRequest,
  type GuestbookListResponse,
} from '@/shared/lib/schemas/guestbookSchema';

export const guestbookApi = {
  // 방명록 작성 (공개)
  createGuestbook: async (invitationId: number, data: CreateGuestbookRequest): Promise<Guestbook> => {
    // 요청 데이터 검증
    const validatedRequest = CreateGuestbookRequestSchema.parse(data);
    const response = await apiClient.post(`/invitations/${invitationId}/guestbooks/`, validatedRequest);
    // 런타임 검증
    return GuestbookSchema.parse(response.data);
  },

  // 방명록 목록 조회
  getGuestbooks: async (invitationId: number, params?: {
    page?: number;
    page_size?: number;
    ordering?: string;
  }): Promise<GuestbookListResponse> => {
    const response = await apiClient.get(`/invitations/${invitationId}/guestbooks/`, { params });
    // 런타임 검증
    return GuestbookListResponseSchema.parse(response.data);
  },

  // 공개 방명록 목록 조회
  getPublicGuestbooks: async (slug: string, params?: {
    page?: number;
    page_size?: number;
    ordering?: string;
  }): Promise<GuestbookListResponse> => {
    const response = await apiClient.get(`/invitations/slug/${slug}/guestbooks/`, { params });
    // 런타임 검증
    return GuestbookListResponseSchema.parse(response.data);
  },

  // 방명록 삭제 (소유자만)
  deleteGuestbook: async (invitationId: number, guestbookId: number): Promise<void> => {
    await apiClient.delete(`/invitations/${invitationId}/guestbooks/${guestbookId}/`);
  },
};

// React Query 훅
export const useCreateGuestbook = () => {
  return useMutation({
    mutationFn: ({ invitationId, data }: { invitationId: number; data: CreateGuestbookRequest }) =>
      guestbookApi.createGuestbook(invitationId, data),
  });
};

export const useGuestbooks = (
  invitationId: number,
  params?: {
    page?: number;
    page_size?: number;
    ordering?: string;
  },
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: QUERY_KEYS.guestbooks.list(invitationId, params),
    queryFn: () => guestbookApi.getGuestbooks(invitationId, params),
    enabled: options?.enabled !== undefined ? options.enabled : !!invitationId,
  });
};

export const usePublicGuestbooks = (
  slug: string,
  params?: {
    page?: number;
    page_size?: number;
    ordering?: string;
  },
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: QUERY_KEYS.guestbooks.public(slug, params),
    queryFn: () => guestbookApi.getPublicGuestbooks(slug, params),
    enabled: options?.enabled !== undefined ? options.enabled : !!slug,
  });
};

export const useDeleteGuestbook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ invitationId, guestbookId }: { invitationId: number; guestbookId: number }) =>
      guestbookApi.deleteGuestbook(invitationId, guestbookId),
    onSuccess: (_, variables) => {
      // 방명록 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.guestbooks.list(variables.invitationId) });
      // 공개 방명록 캐시 무효화 (slug는 알 수 없으므로 모든 publicGuestbooks 무효화)
      queryClient.invalidateQueries({ 
        queryKey: ['publicGuestbooks'],
        exact: false,
      });
    },
  });
};

