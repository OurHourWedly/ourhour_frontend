// 인증 관련
export interface SignupRequest {
  email: string;
  password: string;
  password_confirm: string;
  name: string;
  phone: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  id: number;
  email: string;
  name: string;
  phone: string;
  provider: 'LOCAL' | 'KAKAO';
  role: 'USER' | 'ADMIN';
  date_joined: string;
  last_login: string | null;
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
}

export interface User {
  id: number;
  email: string;
  name: string;
  phone: string;
  provider: 'LOCAL' | 'KAKAO';
  role: 'USER' | 'ADMIN';
  date_joined: string;
  last_login: string | null;
}

// 템플릿 관련
export interface Template {
  id: number;
  name: string;
  description: string;
  thumbnail_url: string;
  preview_url: string | null;
  category: 'MODERN' | 'CLASSIC' | 'FLORAL' | 'MINIMAL' | 'ROMANTIC';
  is_premium: boolean;
  is_active: boolean;
  usage_count: number;
  sample_slug: string | null;
  created_at: string;
  updated_at: string;
}

export interface TemplateDetail extends Template {
  content: Record<string, any>;
  settings: Record<string, any>;
}

export interface TemplateListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Template[];
}

// 템플릿 목록 아이템 (간소화된 버전)
export interface TemplateListItem {
  id: number;
  name: string;
  thumbnail_url: string;
  category: string;
  is_premium: boolean;
  usage_count: number;
  sample_slug: string | null;
}

// 청첩장 관련
export interface Invitation {
  id: number;
  user: number; // user ID
  template: TemplateListItem | null;
  title: string;
  url_slug: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  
  // 신랑 정보
  groom_name: string;
  groom_father_name: string;
  groom_mother_name: string;
  groom_phone: string;
  
  // 신부 정보
  bride_name: string;
  bride_father_name: string;
  bride_mother_name: string;
  bride_phone: string;
  
  // 예식 정보
  wedding_date: string; // ISO 8601
  wedding_location_name: string;
  wedding_location_address: string;
  wedding_location_lat: string | null; // Decimal as string
  wedding_location_lng: string | null; // Decimal as string
  
  // 메시지
  invitation_message: string;
  greeting_message: string;
  ending_message: string;
  
  // 옵션
  background_animation: string;
  background_color: string;
  font_family: string;
  music_url: string;
  
  // 기능 토글
  enable_rsvp: boolean;
  enable_guestbook: boolean;
  enable_account_transfer: boolean;
  
  // 기타
  is_public: boolean;
  view_count: number;
  is_paid: boolean;
  plan_type: 'FREE' | 'PREMIUM' | 'PREMIUM_PLUS';
  
  // 타임스탬프
  published_at: string | null; // ISO 8601
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}

// 공개 조회용 (민감 정보 제외)
export interface PublicInvitation extends Omit<Invitation, 'groom_phone' | 'bride_phone' | 'user' | 'is_paid'> {
  // groom_phone, bride_phone, user, is_paid 필드 제외
}

export interface CreateInvitationRequest {
  template: number;
  title: string;
  groom_name: string;
  groom_father_name?: string;
  groom_mother_name?: string;
  groom_phone?: string;
  bride_name: string;
  bride_father_name?: string;
  bride_mother_name?: string;
  bride_phone?: string;
  wedding_date?: string;
  wedding_location_name?: string;
  wedding_location_address?: string;
  wedding_location_lat?: string;
  wedding_location_lng?: string;
  invitation_message?: string;
  greeting_message?: string;
  ending_message?: string;
  background_animation?: string;
  background_color?: string;
  font_family?: string;
  music_url?: string;
  enable_rsvp?: boolean;
  enable_guestbook?: boolean;
  enable_account_transfer?: boolean;
  is_public?: boolean;
  plan_type?: 'FREE' | 'PREMIUM' | 'PREMIUM_PLUS';
}

export interface UpdateInvitationRequest {
  title?: string;
  groom_name?: string;
  groom_father_name?: string;
  groom_mother_name?: string;
  groom_phone?: string;
  bride_name?: string;
  bride_father_name?: string;
  bride_mother_name?: string;
  bride_phone?: string;
  wedding_date?: string;
  wedding_location_name?: string;
  wedding_location_address?: string;
  wedding_location_lat?: string;
  wedding_location_lng?: string;
  invitation_message?: string;
  greeting_message?: string;
  ending_message?: string;
  background_animation?: string;
  background_color?: string;
  font_family?: string;
  music_url?: string;
  enable_rsvp?: boolean;
  enable_guestbook?: boolean;
  enable_account_transfer?: boolean;
  is_public?: boolean;
  plan_type?: 'FREE' | 'PREMIUM' | 'PREMIUM_PLUS';
}

export interface PublishInvitationRequest {
  // slug는 자동 생성되므로 선택적
}

export interface InvitationListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Invitation[];
}

// RSVP 관련 (스키마에서 타입을 추론하므로 여기서는 제거하거나 호환성을 위해 유지)
// 실제로는 rsvpSchema.ts에서 타입을 추론하므로 이 부분은 deprecated로 표시

export interface GuestbookListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Guestbook[];
}

// 에러 관련
export interface ErrorResponse {
  detail?: string;
  message?: string;
  errors?: Record<string, string[]>;
}

