import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/shared/lib/apiClient';
import { QUERY_KEYS } from '@/shared/lib/queryKeys';
import {
  RSVPSchema,
  RSVPListResponseSchema,
  RSVPStatsSchema,
  CreateRSVPRequestSchema,
  type RSVP,
  type CreateRSVPRequest,
  type RSVPListResponse,
  type RSVPStats,
} from '@/shared/lib/schemas/rsvpSchema';

export const rsvpApi = {
  // RSVP 생성 (공개)
  createRSVP: async (invitationId: number, data: CreateRSVPRequest): Promise<RSVP> => {
    // 요청 데이터 검증
    const validatedRequest = CreateRSVPRequestSchema.parse(data);
    const response = await apiClient.post(`/invitations/${invitationId}/rsvps/`, validatedRequest);
    // 런타임 검증
    return RSVPSchema.parse(response.data);
  },

  // RSVP 목록 조회 (소유자만)
  getRSVPs: async (invitationId: number, params?: {
    page?: number;
    page_size?: number;
    attendance?: 'ATTENDING' | 'NOT_ATTENDING' | 'PENDING';
  }): Promise<RSVPListResponse> => {
    const response = await apiClient.get(`/invitations/${invitationId}/rsvps/`, { params });
    // 런타임 검증
    return RSVPListResponseSchema.parse(response.data);
  },

  // RSVP 통계 조회 (공개)
  getRSVPStats: async (slug: string): Promise<RSVPStats> => {
    const response = await apiClient.get(`/invitations/slug/${slug}/rsvps/`);
    // 런타임 검증
    return RSVPStatsSchema.parse(response.data);
  },
};

// React Query 훅
export const useCreateRSVP = () => {
  return useMutation({
    mutationFn: ({ invitationId, data }: { invitationId: number; data: CreateRSVPRequest }) =>
      rsvpApi.createRSVP(invitationId, data),
  });
};

export const useRSVPs = (
  invitationId: number,
  params?: {
    page?: number;
    page_size?: number;
    attendance?: 'ATTENDING' | 'NOT_ATTENDING' | 'PENDING';
  },
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: QUERY_KEYS.rsvps.list(invitationId, params),
    queryFn: () => rsvpApi.getRSVPs(invitationId, params),
    enabled: options?.enabled !== undefined ? options.enabled : !!invitationId,
  });
};

export const useRSVPStats = (slug: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: QUERY_KEYS.rsvps.stats(slug),
    queryFn: () => rsvpApi.getRSVPStats(slug),
    enabled: options?.enabled !== undefined ? options.enabled : !!slug,
  });
};

