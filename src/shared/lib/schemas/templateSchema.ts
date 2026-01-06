import { z } from 'zod';

/**
 * 템플릿 관련 Zod 스키마
 * 런타임 검증을 통해 서버 응답의 타입 안정성을 보장합니다.
 */

export const TemplateSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  thumbnail_url: z.string().url().nullable().or(z.literal('')),
  preview_url: z.string().url().nullable().or(z.literal('')),
  category: z.enum(['MODERN', 'CLASSIC', 'FLORAL', 'MINIMAL', 'ROMANTIC']).nullable(),
  is_premium: z.boolean().optional(),
  is_active: z.boolean().optional(),
  usage_count: z.number().optional(),
  sample_slug: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const TemplateDetailSchema = TemplateSchema.extend({
  content: z.record(z.string(), z.any()),
  settings: z.record(z.string(), z.any()),
});

export const TemplateListResponseSchema = z.object({
  count: z.number(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(TemplateSchema),
});

// TypeScript 타입 추론
export type Template = z.infer<typeof TemplateSchema>;
export type TemplateDetail = z.infer<typeof TemplateDetailSchema>;
export type TemplateListResponse = z.infer<typeof TemplateListResponseSchema>;

