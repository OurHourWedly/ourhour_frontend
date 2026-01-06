import { z } from 'zod';

/**
 * 인증 관련 Zod 스키마
 * 런타임 검증을 통해 서버 응답의 타입 안정성을 보장합니다.
 */

export const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string(),
  phone: z.string(),
  provider: z.enum(['LOCAL', 'KAKAO']),
  role: z.enum(['USER', 'ADMIN']),
  date_joined: z.string(),
  last_login: z.string().nullable(),
});

export const AuthResponseSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string(),
  phone: z.string(),
  provider: z.enum(['LOCAL', 'KAKAO']),
  role: z.enum(['USER', 'ADMIN']),
  date_joined: z.string(),
  last_login: z.string().nullable(),
  accessToken: z.string(),
  refreshToken: z.string(),
  tokenType: z.literal('Bearer'),
});

export const RefreshResponseSchema = z.object({
  access: z.string(),
  refresh: z.string(),
});

// TypeScript 타입 추론
export type User = z.infer<typeof UserSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type RefreshResponse = z.infer<typeof RefreshResponseSchema>;

