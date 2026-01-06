/**
 * React Query queryKey 상수 관리
 * 모든 queryKey를 중앙에서 관리하여 무효화 실수를 방지합니다.
 */

export const QUERY_KEYS = {
  auth: {
    me: () => ['auth', 'me'] as const,
  },
  templates: {
    list: (params?: {
      page?: number;
      page_size?: number;
      search?: string;
      category?: string;
      ordering?: string;
    }) => ['templates', params] as const,
    detail: (id: number) => ['template', id] as const,
  },
  invitations: {
    list: (params?: {
      page?: number;
      page_size?: number;
      ordering?: string;
    }) => ['invitations', params] as const,
    detail: (id: number) => ['invitation', id] as const,
    public: (slug: string) => ['publicInvitation', slug] as const,
  },
  rsvps: {
    list: (invitationId: number, params?: {
      page?: number;
      page_size?: number;
      attendance?: 'ATTENDING' | 'NOT_ATTENDING' | 'PENDING';
    }) => ['rsvps', invitationId, params] as const,
    stats: (slug: string) => ['rsvpStats', slug] as const,
  },
  guestbooks: {
    list: (invitationId: number, params?: {
      page?: number;
      page_size?: number;
      ordering?: string;
    }) => ['guestbooks', invitationId, params] as const,
    public: (slug: string, params?: {
      page?: number;
      page_size?: number;
      ordering?: string;
    }) => ['publicGuestbooks', slug, params] as const,
  },
} as const;

