import { z } from 'zod';

/**
 * RSVP 관련 Zod 스키마
 * 런타임 검증을 통해 서버 응답의 타입 안정성을 보장합니다.
 */

export const RSVPSchema = z.object({
  id: z.number(),
  guest_name: z.string().min(1).max(100),
  guest_count: z.number().int().min(1),
  attendance_status: z.enum(['ATTENDING', 'NOT_ATTENDING', 'PENDING']),
  phone: z.string().max(20).nullable(),
  message: z.string().max(500).nullable(),
  dietary_restrictions: z.string().max(200).nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateRSVPRequestSchema = z.object({
  guest_name: z.string().min(1).max(100),
  guest_count: z.number().int().min(1).optional(),
  attendance_status: z.enum(['ATTENDING', 'NOT_ATTENDING', 'PENDING']).optional(),
  phone: z.string().max(20).optional(),
  message: z.string().max(500).optional(),
  dietary_restrictions: z.string().max(200).optional(),
});

export const RSVPListResponseSchema = z.object({
  count: z.number(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(RSVPSchema),
});

export const RSVPStatsSchema = z.object({
  total_count: z.number(),
  attending_count: z.number(),
  not_attending_count: z.number(),
  pending_count: z.number(),
  total_guests: z.number(),
});

// TypeScript 타입 추론
export type RSVP = z.infer<typeof RSVPSchema>;
export type CreateRSVPRequest = z.infer<typeof CreateRSVPRequestSchema>;
export type RSVPListResponse = z.infer<typeof RSVPListResponseSchema>;
export type RSVPStats = z.infer<typeof RSVPStatsSchema>;

