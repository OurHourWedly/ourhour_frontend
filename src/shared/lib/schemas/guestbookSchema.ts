import { z } from 'zod';

/**
 * 방명록 관련 Zod 스키마
 * 런타임 검증을 통해 서버 응답의 타입 안정성을 보장합니다.
 */

export const GuestbookSchema = z.object({
  id: z.number(),
  author_name: z.string().min(1).max(100),
  message: z.string().min(1).max(1000),
  is_public: z.boolean(),
  phone: z.string().max(20).nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateGuestbookRequestSchema = z.object({
  author_name: z.string().min(1).max(100),
  message: z.string().min(1).max(1000),
  phone: z.string().max(20).optional(),
  is_public: z.boolean().optional(),
});

export const GuestbookListResponseSchema = z.object({
  count: z.number(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(GuestbookSchema),
});

// TypeScript 타입 추론
export type Guestbook = z.infer<typeof GuestbookSchema>;
export type CreateGuestbookRequest = z.infer<typeof CreateGuestbookRequestSchema>;
export type GuestbookListResponse = z.infer<typeof GuestbookListResponseSchema>;

