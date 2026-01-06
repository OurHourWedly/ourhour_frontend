import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/shared/lib/apiClient';
import { QUERY_KEYS } from '@/shared/lib/queryKeys';
import type {
  Invitation,
  PublicInvitation,
  CreateInvitationRequest,
  UpdateInvitationRequest,
  PublishInvitationRequest,
  InvitationListResponse,
} from '@/shared/types/api';

export const invitationApi = {
  // 청첩장 목록 조회
  getInvitations: async (params?: {
    page?: number;
    page_size?: number;
    ordering?: string;
  }): Promise<InvitationListResponse> => {
    const response = await apiClient.get<InvitationListResponse>('/invitations/', { params });
    return response.data;
  },

  // 청첩장 생성
  createInvitation: async (data: CreateInvitationRequest): Promise<Invitation> => {
    const response = await apiClient.post<Invitation>('/invitations/', data);
    return response.data;
  },

  // 청첩장 상세 조회
  getInvitation: async (id: number): Promise<Invitation> => {
    const response = await apiClient.get<Invitation>(`/invitations/${id}/`);
    return response.data;
  },

  // 청첩장 수정
  updateInvitation: async (id: number, data: UpdateInvitationRequest): Promise<Invitation> => {
    const response = await apiClient.patch<Invitation>(`/invitations/${id}/`, data);
    return response.data;
  },

  // 청첩장 전체 수정
  fullUpdateInvitation: async (id: number, data: CreateInvitationRequest): Promise<Invitation> => {
    const response = await apiClient.put<Invitation>(`/invitations/${id}/`, data);
    return response.data;
  },

  // 청첩장 삭제
  deleteInvitation: async (id: number): Promise<void> => {
    await apiClient.delete(`/invitations/${id}/`);
  },

  // 청첩장 발행
  publishInvitation: async (id: number, data?: PublishInvitationRequest): Promise<Invitation> => {
    const response = await apiClient.patch<Invitation>(`/invitations/${id}/publish/`, data);
    return response.data;
  },

  // 공개 청첩장 조회
  getPublicInvitation: async (slug: string): Promise<PublicInvitation> => {
    const response = await apiClient.get<PublicInvitation>(`/invitations/slug/${slug}/`);
    return response.data;
  },
};

// React Query 훅
export const useInvitations = (params?: {
  page?: number;
  page_size?: number;
  ordering?: string;
}) => {
  return useQuery({
    queryKey: QUERY_KEYS.invitations.list(params),
    queryFn: () => invitationApi.getInvitations(params),
  });
};

export const useInvitation = (id: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.invitations.detail(id),
    queryFn: () => invitationApi.getInvitation(id),
    enabled: !!id,
  });
};

export const useCreateInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: invitationApi.createInvitation,
    onSuccess: () => {
      // 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.invitations.list() });
    },
  });
};

export const useUpdateInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateInvitationRequest }) =>
      invitationApi.updateInvitation(id, data),
    onSuccess: (data) => {
      // 해당 청첩장 캐시 업데이트
      queryClient.setQueryData(QUERY_KEYS.invitations.detail(data.id), data);
      // 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.invitations.list() });
    },
  });
};

export const useFullUpdateInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateInvitationRequest }) =>
      invitationApi.fullUpdateInvitation(id, data),
    onSuccess: (data) => {
      // 해당 청첩장 캐시 업데이트
      queryClient.setQueryData(QUERY_KEYS.invitations.detail(data.id), data);
      // 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.invitations.list() });
    },
  });
};

export const useDeleteInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: invitationApi.deleteInvitation,
    onSuccess: () => {
      // 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.invitations.list() });
    },
  });
};

export const usePublishInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data?: PublishInvitationRequest }) =>
      invitationApi.publishInvitation(id, data),
    onSuccess: (data) => {
      // 해당 청첩장 캐시 업데이트
      queryClient.setQueryData(QUERY_KEYS.invitations.detail(data.id), data);
    },
  });
};

export const usePublicInvitation = (slug: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.invitations.public(slug),
    queryFn: () => invitationApi.getPublicInvitation(slug),
    enabled: !!slug,
  });
};

