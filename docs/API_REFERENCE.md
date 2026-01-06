# API 참조 문서

## 목차

1. [기본 정보](#1-기본-정보)
2. [인증 가이드](#2-인증-가이드)
3. [API 엔드포인트](#3-api-엔드포인트)
   - [3.1 인증 API](#31-인증-api-apiv1auth)
   - [3.2 템플릿 API](#32-템플릿-api-apiv1templates)
   - [3.3 청첩장 API](#33-청첩장-api-apiv1invitations)
   - [3.4 RSVP API](#34-rsvp-api)
   - [3.5 방명록 API](#35-방명록-api)
   - [3.6 공개 청첩장 API](#36-공개-청첩장-api)
4. [데이터 모델](#4-데이터-모델)
5. [에러 처리](#5-에러-처리)
6. [예제 코드](#6-예제-코드)
7. [추가 정보](#7-추가-정보)

---

## 1. 기본 정보

### Base URL
```
/api/v1/
```

### 인증 방식
JWT Bearer Token을 사용합니다. 모든 인증이 필요한 요청에는 `Authorization` 헤더에 토큰을 포함해야 합니다.

### API 버전
현재 버전: `v1`

### Swagger UI
API 문서를 시각적으로 확인할 수 있는 Swagger UI가 제공됩니다:
```
/api/docs/
```

---

## 2. 인증 가이드

### JWT 토큰 사용법

백엔드 API는 JWT (JSON Web Token) 기반 인증을 사용합니다. 로그인 또는 회원가입 성공 시 `accessToken`을 받게 되며, 이후 모든 인증이 필요한 API 요청에 이 토큰을 포함해야 합니다.

### 토큰 저장 및 관리

토큰은 클라이언트 측에서 안전하게 저장해야 합니다. 일반적으로 `localStorage` 또는 `sessionStorage`를 사용합니다.

**localStorage 사용 예시:**
```typescript
// 토큰 저장
localStorage.setItem('accessToken', token);

// 토큰 조회
const token = localStorage.getItem('accessToken');

// 토큰 삭제
localStorage.removeItem('accessToken');
```

**sessionStorage 사용 예시:**
```typescript
// 토큰 저장 (브라우저 탭이 닫히면 자동 삭제)
sessionStorage.setItem('accessToken', token);
```

### 토큰 갱신 방법

현재 API 버전에서는 토큰 갱신 엔드포인트가 제공되지 않습니다. 토큰이 만료되면 다시 로그인해야 합니다.

### 인증 헤더 형식

모든 인증이 필요한 요청에는 다음 형식으로 헤더를 포함해야 합니다:

```
Authorization: Bearer {accessToken}
```

### Axios 인터셉터 설정

Axios 인터셉터를 사용하여 모든 요청에 자동으로 인증 토큰을 추가할 수 있습니다:

```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api/v1',
});

// 요청 인터셉터: 모든 요청에 토큰 자동 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 401 에러 시 자동 로그아웃 처리
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      // 로그인 페이지로 리다이렉트
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## 3. API 엔드포인트

### 3.1 인증 API (`/api/v1/auth/`)

#### POST /signup/ - 회원가입

새로운 사용자 계정을 생성합니다.

**인증 필요:** 없음

**요청 본문:**
```typescript
interface SignupRequest {
  email: string;
  password: string;
  name?: string; // 선택사항
}
```

**요청 예시:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "홍길동"
}
```

**성공 응답 (201 Created):**
```typescript
interface SignupResponse {
  accessToken: string;
  user: {
    id: number;
    email: string;
    name: string | null;
  };
}
```

**응답 예시:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "홍길동"
  }
}
```

**에러 응답:**
- `400 Bad Request`: 이메일 형식 오류, 비밀번호 규칙 위반
- `409 Conflict`: 이미 존재하는 이메일

---

#### POST /login/ - 로그인

기존 사용자로 로그인합니다.

**인증 필요:** 없음

**요청 본문:**
```typescript
interface LoginRequest {
  email: string;
  password: string;
}
```

**요청 예시:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**성공 응답 (200 OK):**
```typescript
interface LoginResponse {
  accessToken: string;
  user: {
    id: number;
    email: string;
    name: string | null;
  };
}
```

**응답 예시:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "홍길동"
  }
}
```

**에러 응답:**
- `401 Unauthorized`: 잘못된 이메일 또는 비밀번호

---

#### GET /me/ - 현재 사용자 정보 조회

현재 로그인한 사용자의 정보를 조회합니다.

**인증 필요:** 있음

**요청 헤더:**
```
Authorization: Bearer {accessToken}
```

**성공 응답 (200 OK):**
```typescript
interface UserResponse {
  id: number;
  email: string;
  name: string | null;
  createdAt: string; // ISO 8601 형식
  updatedAt: string; // ISO 8601 형식
}
```

**응답 예시:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "홍길동",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

**에러 응답:**
- `401 Unauthorized`: 유효하지 않은 토큰 또는 토큰 없음

---

### 3.2 템플릿 API (`/api/v1/templates/`)

#### GET / - 템플릿 목록

템플릿 목록을 조회합니다. 필터링, 검색, 정렬 기능을 지원합니다.

**인증 필요:** 없음

**쿼리 파라미터:**
- `page` (number, 선택): 페이지 번호 (기본값: 1)
- `page_size` (number, 선택): 페이지당 항목 수 (기본값: 20)
- `search` (string, 선택): 검색어 (템플릿 이름 또는 설명에서 검색)
- `category` (string, 선택): 카테고리 필터
- `ordering` (string, 선택): 정렬 기준 (`created_at`, `-created_at`, `name`, `-name` 등)

**요청 예시:**
```
GET /api/v1/templates/?page=1&page_size=10&search=웨딩&ordering=-created_at
```

**성공 응답 (200 OK):**
```typescript
interface TemplateListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Template[];
}

interface Template {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  thumbnail_url: string | null;
  preview_url: string | null;
  created_at: string;
  updated_at: string;
}
```

**응답 예시:**
```json
{
  "count": 50,
  "next": "/api/v1/templates/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "클래식 웨딩",
      "description": "전통적인 웨딩 템플릿",
      "category": "wedding",
      "thumbnail_url": "https://example.com/thumbnails/1.jpg",
      "preview_url": "https://example.com/previews/1.jpg",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

#### GET /{id}/ - 템플릿 상세

특정 템플릿의 상세 정보를 조회합니다.

**인증 필요:** 없음

**경로 파라미터:**
- `id` (number, 필수): 템플릿 ID

**요청 예시:**
```
GET /api/v1/templates/1/
```

**성공 응답 (200 OK):**
```typescript
interface TemplateDetailResponse extends Template {
  content: Record<string, any>; // 템플릿 구성 데이터
  settings: Record<string, any>; // 템플릿 설정
}
```

**응답 예시:**
```json
{
  "id": 1,
  "name": "클래식 웨딩",
  "description": "전통적인 웨딩 템플릿",
  "category": "wedding",
  "thumbnail_url": "https://example.com/thumbnails/1.jpg",
  "preview_url": "https://example.com/previews/1.jpg",
  "content": {
    "sections": [...]
  },
  "settings": {
    "colors": {...},
    "fonts": {...}
  },
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

**에러 응답:**
- `404 Not Found`: 존재하지 않는 템플릿 ID

---

### 3.3 청첩장 API (`/api/v1/invitations/`)

#### GET / - 내 청첩장 목록

현재 로그인한 사용자가 생성한 청첩장 목록을 조회합니다.

**인증 필요:** 있음

**쿼리 파라미터:**
- `page` (number, 선택): 페이지 번호
- `page_size` (number, 선택): 페이지당 항목 수
- `ordering` (string, 선택): 정렬 기준

**요청 예시:**
```
GET /api/v1/invitations/?page=1&ordering=-created_at
```

**성공 응답 (200 OK):**
```typescript
interface InvitationListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Invitation[];
}
```

**응답 예시:**
```json
{
  "count": 5,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "홍길동 & 김영희 결혼식",
      "slug": "hong-kim-wedding",
      "template_id": 1,
      "is_published": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

#### POST / - 청첩장 생성

새로운 청첩장을 생성합니다.

**인증 필요:** 있음

**요청 본문:**
```typescript
interface CreateInvitationRequest {
  title: string;
  template_id: number;
  content?: Record<string, any>; // 선택사항
  settings?: Record<string, any>; // 선택사항
}
```

**요청 예시:**
```json
{
  "title": "홍길동 & 김영희 결혼식",
  "template_id": 1,
  "content": {
    "groom_name": "홍길동",
    "bride_name": "김영희",
    "wedding_date": "2024-06-15"
  },
  "settings": {
    "theme": "classic"
  }
}
```

**성공 응답 (201 Created):**
```typescript
interface InvitationResponse {
  id: number;
  title: string;
  slug: string;
  template_id: number;
  content: Record<string, any>;
  settings: Record<string, any>;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}
```

**에러 응답:**
- `400 Bad Request`: 잘못된 요청 데이터
- `404 Not Found`: 존재하지 않는 템플릿 ID

---

#### GET /{id}/ - 청첩장 상세

특정 청첩장의 상세 정보를 조회합니다. 소유자만 조회 가능합니다.

**인증 필요:** 있음

**경로 파라미터:**
- `id` (number, 필수): 청첩장 ID

**성공 응답 (200 OK):**
```typescript
interface InvitationDetailResponse extends InvitationResponse {
  // 상세 정보 포함
}
```

**에러 응답:**
- `404 Not Found`: 존재하지 않는 청첩장 또는 접근 권한 없음

---

#### PATCH /{id}/ - 청첩장 수정

청첩장의 일부 필드를 수정합니다. 제공된 필드만 업데이트됩니다.

**인증 필요:** 있음 (소유자만)

**경로 파라미터:**
- `id` (number, 필수): 청첩장 ID

**요청 본문:**
```typescript
interface UpdateInvitationRequest {
  title?: string;
  content?: Record<string, any>;
  settings?: Record<string, any>;
}
```

**요청 예시:**
```json
{
  "title": "수정된 제목",
  "content": {
    "wedding_date": "2024-07-15"
  }
}
```

**성공 응답 (200 OK):**
```typescript
interface InvitationResponse
```

**에러 응답:**
- `400 Bad Request`: 잘못된 요청 데이터
- `403 Forbidden`: 소유자가 아님
- `404 Not Found`: 존재하지 않는 청첩장

---

#### PUT /{id}/ - 청첩장 전체 수정

청첩장의 모든 필드를 한 번에 수정합니다. 제공되지 않은 필드는 기본값으로 설정됩니다.

**인증 필요:** 있음 (소유자만)

**경로 파라미터:**
- `id` (number, 필수): 청첩장 ID

**요청 본문:**
```typescript
interface FullUpdateInvitationRequest {
  title: string;
  template_id: number;
  content: Record<string, any>;
  settings: Record<string, any>;
}
```

**성공 응답 (200 OK):**
```typescript
interface InvitationResponse
```

**에러 응답:**
- `400 Bad Request`: 필수 필드 누락 또는 잘못된 데이터
- `403 Forbidden`: 소유자가 아님
- `404 Not Found`: 존재하지 않는 청첩장

---

#### DELETE /{id}/ - 청첩장 삭제

청첩장을 삭제합니다.

**인증 필요:** 있음 (소유자만)

**경로 파라미터:**
- `id` (number, 필수): 청첩장 ID

**성공 응답 (204 No Content):**
응답 본문 없음

**에러 응답:**
- `403 Forbidden`: 소유자가 아님
- `404 Not Found`: 존재하지 않는 청첩장

---

#### PATCH /{id}/publish/ - 청첩장 발행

청첩장을 공개 발행합니다. 발행된 청첩장은 공개 URL을 통해 접근할 수 있습니다.

**인증 필요:** 있음 (소유자만)

**경로 파라미터:**
- `id` (number, 필수): 청첩장 ID

**요청 본문:**
```typescript
interface PublishInvitationRequest {
  slug?: string; // 선택사항, 미제공 시 자동 생성
}
```

**요청 예시:**
```json
{
  "slug": "hong-kim-wedding"
}
```

**성공 응답 (200 OK):**
```typescript
interface InvitationResponse {
  // is_published가 true로 변경됨
  is_published: true;
  slug: string;
}
```

**에러 응답:**
- `400 Bad Request`: 이미 사용 중인 slug
- `403 Forbidden`: 소유자가 아님
- `404 Not Found`: 존재하지 않는 청첩장

---

### 3.4 RSVP API

#### POST /{id}/rsvps/ - RSVP 생성

청첩장에 참석 여부를 등록합니다. 인증이 필요 없으며, 발행된 청첩장에만 가능합니다.

**인증 필요:** 없음

**경로 파라미터:**
- `id` (number, 필수): 청첩장 ID

**요청 본문:**
```typescript
interface CreateRSVPRequest {
  name: string;
  email?: string;
  phone?: string;
  attendance: 'yes' | 'no' | 'maybe';
  guest_count?: number; // 참석 인원 수
  message?: string;
}
```

**요청 예시:**
```json
{
  "name": "김철수",
  "email": "kim@example.com",
  "phone": "010-1234-5678",
  "attendance": "yes",
  "guest_count": 2,
  "message": "축하드립니다!"
}
```

**성공 응답 (201 Created):**
```typescript
interface RSVPResponse {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  attendance: 'yes' | 'no' | 'maybe';
  guest_count: number;
  message: string | null;
  created_at: string;
}
```

**에러 응답:**
- `400 Bad Request`: 잘못된 요청 데이터
- `404 Not Found`: 존재하지 않는 청첩장 또는 발행되지 않은 청첩장

---

#### GET /{id}/rsvps/ - RSVP 목록 조회

청첩장의 RSVP 목록을 조회합니다. 소유자만 조회 가능합니다.

**인증 필요:** 있음 (소유자만)

**경로 파라미터:**
- `id` (number, 필수): 청첩장 ID

**쿼리 파라미터:**
- `page` (number, 선택): 페이지 번호
- `page_size` (number, 선택): 페이지당 항목 수
- `attendance` (string, 선택): 필터링 ('yes', 'no', 'maybe')

**성공 응답 (200 OK):**
```typescript
interface RSVPListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: RSVPResponse[];
}
```

**에러 응답:**
- `403 Forbidden`: 소유자가 아님
- `404 Not Found`: 존재하지 않는 청첩장

---

### 3.5 방명록 API

#### POST /{id}/guestbooks/ - 방명록 작성

청첩장에 방명록을 작성합니다. 인증이 필요 없으며, 발행된 청첩장에만 가능합니다.

**인증 필요:** 없음

**경로 파라미터:**
- `id` (number, 필수): 청첩장 ID

**요청 본문:**
```typescript
interface CreateGuestbookRequest {
  name: string;
  message: string;
  email?: string;
}
```

**요청 예시:**
```json
{
  "name": "이영희",
  "message": "축하드립니다! 행복하게 사세요!",
  "email": "lee@example.com"
}
```

**성공 응답 (201 Created):**
```typescript
interface GuestbookResponse {
  id: number;
  name: string;
  message: string;
  email: string | null;
  created_at: string;
}
```

**에러 응답:**
- `400 Bad Request`: 잘못된 요청 데이터
- `404 Not Found`: 존재하지 않는 청첩장 또는 발행되지 않은 청첩장

---

#### GET /{id}/guestbooks/ - 방명록 목록 조회

청첩장의 공개 방명록 목록을 조회합니다. 인증 없이도 조회 가능합니다.

**인증 필요:** 없음

**경로 파라미터:**
- `id` (number, 필수): 청첩장 ID

**쿼리 파라미터:**
- `page` (number, 선택): 페이지 번호
- `page_size` (number, 선택): 페이지당 항목 수
- `ordering` (string, 선택): 정렬 기준 (`created_at`, `-created_at`)

**성공 응답 (200 OK):**
```typescript
interface GuestbookListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: GuestbookResponse[];
}
```

**에러 응답:**
- `404 Not Found`: 존재하지 않는 청첩장

---

#### DELETE /{id}/guestbooks/{guestbook_id}/ - 방명록 삭제

방명록을 삭제합니다. 청첩장 소유자만 삭제 가능합니다.

**인증 필요:** 있음 (소유자만)

**경로 파라미터:**
- `id` (number, 필수): 청첩장 ID
- `guestbook_id` (number, 필수): 방명록 ID

**성공 응답 (204 No Content):**
응답 본문 없음

**에러 응답:**
- `403 Forbidden`: 소유자가 아님
- `404 Not Found`: 존재하지 않는 청첩장 또는 방명록

---

### 3.6 공개 청첩장 API

#### GET /slug/{slug}/ - 공개 청첩장 조회

발행된 청첩장을 slug를 통해 공개적으로 조회합니다.

**인증 필요:** 없음

**경로 파라미터:**
- `slug` (string, 필수): 청첩장 slug

**요청 예시:**
```
GET /api/v1/invitations/slug/hong-kim-wedding/
```

**성공 응답 (200 OK):**
```typescript
interface PublicInvitationResponse {
  id: number;
  title: string;
  slug: string;
  template_id: number;
  content: Record<string, any>;
  settings: Record<string, any>;
  is_published: true;
  created_at: string;
  updated_at: string;
}
```

**에러 응답:**
- `404 Not Found`: 존재하지 않는 slug 또는 발행되지 않은 청첩장

---

#### GET /slug/{slug}/rsvps/ - RSVP 통계 조회

공개 청첩장의 RSVP 통계를 조회합니다. 개인 정보는 제외되고 통계만 제공됩니다.

**인증 필요:** 없음

**경로 파라미터:**
- `slug` (string, 필수): 청첩장 slug

**성공 응답 (200 OK):**
```typescript
interface RSVPStatsResponse {
  total: number;
  yes: number;
  no: number;
  maybe: number;
  total_guests: number; // 예상 참석 인원 수
}
```

**응답 예시:**
```json
{
  "total": 50,
  "yes": 35,
  "no": 10,
  "maybe": 5,
  "total_guests": 70
}
```

**에러 응답:**
- `404 Not Found`: 존재하지 않는 slug 또는 발행되지 않은 청첩장

---

#### GET /slug/{slug}/guestbooks/ - 공개 방명록 목록 조회

공개 청첩장의 방명록 목록을 조회합니다.

**인증 필요:** 없음

**경로 파라미터:**
- `slug` (string, 필수): 청첩장 slug

**쿼리 파라미터:**
- `page` (number, 선택): 페이지 번호
- `page_size` (number, 선택): 페이지당 항목 수
- `ordering` (string, 선택): 정렬 기준

**성공 응답 (200 OK):**
```typescript
interface GuestbookListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: GuestbookResponse[];
}
```

**에러 응답:**
- `404 Not Found`: 존재하지 않는 slug 또는 발행되지 않은 청첩장

---

## 4. 데이터 모델

### User 모델

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `id` | number | 예 | 사용자 고유 ID |
| `email` | string | 예 | 이메일 주소 (고유) |
| `name` | string \| null | 아니오 | 사용자 이름 |
| `created_at` | string | 예 | 생성 일시 (ISO 8601) |
| `updated_at` | string | 예 | 수정 일시 (ISO 8601) |

**제약 조건:**
- `email`: 유효한 이메일 형식, 최대 255자
- `name`: 최대 100자

---

### Invitation 모델

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `id` | number | 예 | 청첩장 고유 ID |
| `title` | string | 예 | 청첩장 제목 |
| `slug` | string | 예 | 공개 URL용 slug (고유) |
| `template_id` | number | 예 | 사용된 템플릿 ID |
| `content` | object | 예 | 청첩장 내용 데이터 (JSON) |
| `settings` | object | 예 | 청첩장 설정 (JSON) |
| `is_published` | boolean | 예 | 발행 여부 |
| `created_at` | string | 예 | 생성 일시 (ISO 8601) |
| `updated_at` | string | 예 | 수정 일시 (ISO 8601) |

**제약 조건:**
- `title`: 최대 200자
- `slug`: 영문자, 숫자, 하이픈만 허용, 최대 100자
- `content`: JSON 객체
- `settings`: JSON 객체

---

### RSVP 모델

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `id` | number | 예 | RSVP 고유 ID |
| `name` | string | 예 | 참석자 이름 |
| `email` | string \| null | 아니오 | 이메일 주소 |
| `phone` | string \| null | 아니오 | 전화번호 |
| `attendance` | 'yes' \| 'no' \| 'maybe' | 예 | 참석 여부 |
| `guest_count` | number | 예 | 참석 인원 수 |
| `message` | string \| null | 아니오 | 메시지 |
| `created_at` | string | 예 | 생성 일시 (ISO 8601) |

**제약 조건:**
- `name`: 최대 100자
- `email`: 유효한 이메일 형식 (선택사항)
- `phone`: 최대 20자
- `guest_count`: 1 이상의 정수
- `message`: 최대 500자

---

### Guestbook 모델

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `id` | number | 예 | 방명록 고유 ID |
| `name` | string | 예 | 작성자 이름 |
| `message` | string | 예 | 방명록 메시지 |
| `email` | string \| null | 아니오 | 이메일 주소 |
| `created_at` | string | 예 | 생성 일시 (ISO 8601) |

**제약 조건:**
- `name`: 최대 100자
- `message`: 최대 1000자
- `email`: 유효한 이메일 형식 (선택사항)

---

### Template 모델

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `id` | number | 예 | 템플릿 고유 ID |
| `name` | string | 예 | 템플릿 이름 |
| `description` | string \| null | 아니오 | 템플릿 설명 |
| `category` | string \| null | 아니오 | 템플릿 카테고리 |
| `thumbnail_url` | string \| null | 아니오 | 썸네일 이미지 URL |
| `preview_url` | string \| null | 아니오 | 미리보기 이미지 URL |
| `content` | object \| null | 아니오 | 템플릿 구성 데이터 (상세 조회 시) |
| `settings` | object \| null | 아니오 | 템플릿 설정 (상세 조회 시) |
| `created_at` | string | 예 | 생성 일시 (ISO 8601) |
| `updated_at` | string | 예 | 수정 일시 (ISO 8601) |

**제약 조건:**
- `name`: 최대 200자
- `description`: 최대 500자
- `category`: 최대 50자

---

## 5. 에러 처리

### HTTP 상태 코드

백엔드 API는 표준 HTTP 상태 코드를 사용합니다:

| 상태 코드 | 의미 | 사용 시나리오 |
|-----------|------|--------------|
| `200 OK` | 성공 | GET, PATCH, PUT 요청 성공 |
| `201 Created` | 생성 성공 | POST 요청으로 리소스 생성 성공 |
| `204 No Content` | 성공 (본문 없음) | DELETE 요청 성공 |
| `400 Bad Request` | 잘못된 요청 | 요청 데이터 유효성 검증 실패 |
| `401 Unauthorized` | 인증 실패 | 유효하지 않은 토큰 또는 토큰 없음 |
| `403 Forbidden` | 권한 없음 | 인증은 되었으나 권한이 없음 |
| `404 Not Found` | 리소스 없음 | 존재하지 않는 리소스 조회 |
| `409 Conflict` | 충돌 | 중복된 리소스 생성 시도 |
| `500 Internal Server Error` | 서버 오류 | 서버 내부 오류 |

### 에러 응답 형식

모든 에러 응답은 다음 형식을 따릅니다:

```typescript
interface ErrorResponse {
  detail?: string; // 에러 메시지
  message?: string; // 에러 메시지 (detail과 동일)
  errors?: Record<string, string[]>; // 필드별 에러 메시지 (유효성 검증 실패 시)
}
```

**에러 응답 예시:**

**단일 에러:**
```json
{
  "detail": "인증이 필요합니다."
}
```

**필드별 에러 (유효성 검증 실패):**
```json
{
  "errors": {
    "email": ["이 필드는 필수입니다.", "유효한 이메일 주소를 입력하세요."],
    "password": ["비밀번호는 최소 8자 이상이어야 합니다."]
  }
}
```

### 일반적인 에러 케이스 및 해결 방법

#### 401 Unauthorized
**원인:** 토큰이 없거나 만료됨
**해결 방법:**
- 토큰이 저장되어 있는지 확인
- 토큰이 만료되었다면 다시 로그인
- Authorization 헤더 형식 확인 (`Bearer {token}`)

#### 403 Forbidden
**원인:** 리소스에 대한 접근 권한이 없음
**해결 방법:**
- 해당 리소스의 소유자인지 확인
- 필요한 권한이 있는지 확인

#### 404 Not Found
**원인:** 요청한 리소스가 존재하지 않음
**해결 방법:**
- 리소스 ID가 올바른지 확인
- 리소스가 삭제되었는지 확인

#### 400 Bad Request
**원인:** 요청 데이터가 유효하지 않음
**해결 방법:**
- 요청 본문의 필수 필드 확인
- 데이터 타입 및 형식 확인
- `errors` 필드에서 상세한 에러 메시지 확인

### Axios 에러 처리 예제

```typescript
import axios, { AxiosError } from 'axios';

try {
  const response = await apiClient.post('/auth/login', {
    email: 'user@example.com',
    password: 'password'
  });
  console.log('성공:', response.data);
} catch (error) {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ErrorResponse>;
    
    if (axiosError.response) {
      // 서버가 응답했지만 에러 상태 코드
      const status = axiosError.response.status;
      const errorData = axiosError.response.data;
      
      switch (status) {
        case 400:
          console.error('잘못된 요청:', errorData.errors || errorData.detail);
          break;
        case 401:
          console.error('인증 실패:', errorData.detail);
          // 로그인 페이지로 리다이렉트
          break;
        case 403:
          console.error('권한 없음:', errorData.detail);
          break;
        case 404:
          console.error('리소스를 찾을 수 없습니다:', errorData.detail);
          break;
        case 500:
          console.error('서버 오류:', errorData.detail);
          break;
        default:
          console.error('알 수 없는 오류:', errorData.detail);
      }
    } else if (axiosError.request) {
      // 요청은 보냈지만 응답을 받지 못함
      console.error('네트워크 오류: 서버에 연결할 수 없습니다.');
    } else {
      // 요청 설정 중 오류 발생
      console.error('요청 설정 오류:', axiosError.message);
    }
  } else {
    // Axios 오류가 아닌 경우
    console.error('예상치 못한 오류:', error);
  }
}
```

---

## 6. 예제 코드

### TypeScript 인터페이스 정의

프로젝트에서 사용할 수 있는 TypeScript 타입 정의 예시:

```typescript
// types/api.ts

// 인증 관련
export interface SignupRequest {
  email: string;
  password: string;
  name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface User {
  id: number;
  email: string;
  name: string | null;
  created_at: string;
  updated_at: string;
}

// 템플릿 관련
export interface Template {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  thumbnail_url: string | null;
  preview_url: string | null;
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

// 청첩장 관련
export interface Invitation {
  id: number;
  title: string;
  slug: string;
  template_id: number;
  content: Record<string, any>;
  settings: Record<string, any>;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateInvitationRequest {
  title: string;
  template_id: number;
  content?: Record<string, any>;
  settings?: Record<string, any>;
}

export interface UpdateInvitationRequest {
  title?: string;
  content?: Record<string, any>;
  settings?: Record<string, any>;
}

export interface InvitationListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Invitation[];
}

// RSVP 관련
export interface RSVP {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  attendance: 'yes' | 'no' | 'maybe';
  guest_count: number;
  message: string | null;
  created_at: string;
}

export interface CreateRSVPRequest {
  name: string;
  email?: string;
  phone?: string;
  attendance: 'yes' | 'no' | 'maybe';
  guest_count?: number;
  message?: string;
}

export interface RSVPListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: RSVP[];
}

export interface RSVPStats {
  total: number;
  yes: number;
  no: number;
  maybe: number;
  total_guests: number;
}

// 방명록 관련
export interface Guestbook {
  id: number;
  name: string;
  message: string;
  email: string | null;
  created_at: string;
}

export interface CreateGuestbookRequest {
  name: string;
  message: string;
  email?: string;
}

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
```

### Axios API 클라이언트 설정

```typescript
// shared/lib/apiClient.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ErrorResponse } from '@/types/api';

const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: 토큰 자동 추가
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 에러 처리
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorResponse>) => {
    if (error.response?.status === 401) {
      // 토큰 만료 또는 유효하지 않은 토큰
      localStorage.removeItem('accessToken');
      // 로그인 페이지로 리다이렉트 (필요시)
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 인증 API 예제

```typescript
// features/auth/api/authApi.ts
import apiClient from '@/shared/lib/apiClient';
import type { SignupRequest, LoginRequest, AuthResponse, User } from '@/types/api';

export const authApi = {
  // 회원가입
  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/signup/', data);
    // 토큰 저장
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
    }
    return response.data;
  },

  // 로그인
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login/', data);
    // 토큰 저장
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
    }
    return response.data;
  },

  // 현재 사용자 정보 조회
  getMe: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/me/');
    return response.data;
  },

  // 로그아웃
  logout: (): void => {
    localStorage.removeItem('accessToken');
  },
};
```

### React Query를 활용한 데이터 페칭 예제

```typescript
// features/templates/api/templateApi.ts
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/shared/lib/apiClient';
import type { Template, TemplateDetail, TemplateListResponse } from '@/types/api';

export const templateApi = {
  // 템플릿 목록 조회
  getTemplates: async (params?: {
    page?: number;
    page_size?: number;
    search?: string;
    category?: string;
    ordering?: string;
  }): Promise<TemplateListResponse> => {
    const response = await apiClient.get<TemplateListResponse>('/templates/', { params });
    return response.data;
  },

  // 템플릿 상세 조회
  getTemplate: async (id: number): Promise<TemplateDetail> => {
    const response = await apiClient.get<TemplateDetail>(`/templates/${id}/`);
    return response.data;
  },
};

// React Query 훅 예제
export const useTemplates = (params?: {
  page?: number;
  page_size?: number;
  search?: string;
  category?: string;
  ordering?: string;
}) => {
  return useQuery({
    queryKey: ['templates', params],
    queryFn: () => templateApi.getTemplates(params),
  });
};

export const useTemplate = (id: number) => {
  return useQuery({
    queryKey: ['template', id],
    queryFn: () => templateApi.getTemplate(id),
    enabled: !!id, // id가 있을 때만 실행
  });
};
```

```typescript
// features/invitations/api/invitationApi.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/shared/lib/apiClient';
import type {
  Invitation,
  CreateInvitationRequest,
  UpdateInvitationRequest,
  InvitationListResponse,
} from '@/types/api';

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
  publishInvitation: async (id: number, slug?: string): Promise<Invitation> => {
    const response = await apiClient.patch<Invitation>(`/invitations/${id}/publish/`, { slug });
    return response.data;
  },

  // 공개 청첩장 조회
  getPublicInvitation: async (slug: string): Promise<Invitation> => {
    const response = await apiClient.get<Invitation>(`/invitations/slug/${slug}/`);
    return response.data;
  },
};

// React Query 훅 예제
export const useInvitations = (params?: {
  page?: number;
  page_size?: number;
  ordering?: string;
}) => {
  return useQuery({
    queryKey: ['invitations', params],
    queryFn: () => invitationApi.getInvitations(params),
  });
};

export const useInvitation = (id: number) => {
  return useQuery({
    queryKey: ['invitation', id],
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
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
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
      queryClient.setQueryData(['invitation', data.id], data);
      // 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
    },
  });
};

export const useDeleteInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: invitationApi.deleteInvitation,
    onSuccess: () => {
      // 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
    },
  });
};

export const usePublishInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, slug }: { id: number; slug?: string }) =>
      invitationApi.publishInvitation(id, slug),
    onSuccess: (data) => {
      // 해당 청첩장 캐시 업데이트
      queryClient.setQueryData(['invitation', data.id], data);
    },
  });
};

export const usePublicInvitation = (slug: string) => {
  return useQuery({
    queryKey: ['publicInvitation', slug],
    queryFn: () => invitationApi.getPublicInvitation(slug),
    enabled: !!slug,
  });
};
```

### RSVP 및 방명록 API 예제

```typescript
// features/invitations/api/rsvpApi.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/shared/lib/apiClient';
import type { RSVP, CreateRSVPRequest, RSVPListResponse, RSVPStats } from '@/types/api';

export const rsvpApi = {
  // RSVP 생성 (공개)
  createRSVP: async (invitationId: number, data: CreateRSVPRequest): Promise<RSVP> => {
    const response = await apiClient.post<RSVP>(`/invitations/${invitationId}/rsvps/`, data);
    return response.data;
  },

  // RSVP 목록 조회 (소유자만)
  getRSVPs: async (invitationId: number, params?: {
    page?: number;
    page_size?: number;
    attendance?: 'yes' | 'no' | 'maybe';
  }): Promise<RSVPListResponse> => {
    const response = await apiClient.get<RSVPListResponse>(`/invitations/${invitationId}/rsvps/`, { params });
    return response.data;
  },

  // RSVP 통계 조회 (공개)
  getRSVPStats: async (slug: string): Promise<RSVPStats> => {
    const response = await apiClient.get<RSVPStats>(`/invitations/slug/${slug}/rsvps/`);
    return response.data;
  },
};

export const useCreateRSVP = () => {
  return useMutation({
    mutationFn: ({ invitationId, data }: { invitationId: number; data: CreateRSVPRequest }) =>
      rsvpApi.createRSVP(invitationId, data),
  });
};

export const useRSVPs = (invitationId: number, params?: {
  page?: number;
  page_size?: number;
  attendance?: 'yes' | 'no' | 'maybe';
}) => {
  return useQuery({
    queryKey: ['rsvps', invitationId, params],
    queryFn: () => rsvpApi.getRSVPs(invitationId, params),
    enabled: !!invitationId,
  });
};

export const useRSVPStats = (slug: string) => {
  return useQuery({
    queryKey: ['rsvpStats', slug],
    queryFn: () => rsvpApi.getRSVPStats(slug),
    enabled: !!slug,
  });
};
```

```typescript
// features/invitations/api/guestbookApi.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/shared/lib/apiClient';
import type { Guestbook, CreateGuestbookRequest, GuestbookListResponse } from '@/types/api';

export const guestbookApi = {
  // 방명록 작성 (공개)
  createGuestbook: async (invitationId: number, data: CreateGuestbookRequest): Promise<Guestbook> => {
    const response = await apiClient.post<Guestbook>(`/invitations/${invitationId}/guestbooks/`, data);
    return response.data;
  },

  // 방명록 목록 조회
  getGuestbooks: async (invitationId: number, params?: {
    page?: number;
    page_size?: number;
    ordering?: string;
  }): Promise<GuestbookListResponse> => {
    const response = await apiClient.get<GuestbookListResponse>(`/invitations/${invitationId}/guestbooks/`, { params });
    return response.data;
  },

  // 공개 방명록 목록 조회
  getPublicGuestbooks: async (slug: string, params?: {
    page?: number;
    page_size?: number;
    ordering?: string;
  }): Promise<GuestbookListResponse> => {
    const response = await apiClient.get<GuestbookListResponse>(`/invitations/slug/${slug}/guestbooks/`, { params });
    return response.data;
  },

  // 방명록 삭제 (소유자만)
  deleteGuestbook: async (invitationId: number, guestbookId: number): Promise<void> => {
    await apiClient.delete(`/invitations/${invitationId}/guestbooks/${guestbookId}/`);
  },
};

export const useCreateGuestbook = () => {
  return useMutation({
    mutationFn: ({ invitationId, data }: { invitationId: number; data: CreateGuestbookRequest }) =>
      guestbookApi.createGuestbook(invitationId, data),
  });
};

export const useGuestbooks = (invitationId: number, params?: {
  page?: number;
  page_size?: number;
  ordering?: string;
}) => {
  return useQuery({
    queryKey: ['guestbooks', invitationId, params],
    queryFn: () => guestbookApi.getGuestbooks(invitationId, params),
    enabled: !!invitationId,
  });
};

export const usePublicGuestbooks = (slug: string, params?: {
  page?: number;
  page_size?: number;
  ordering?: string;
}) => {
  return useQuery({
    queryKey: ['publicGuestbooks', slug, params],
    queryFn: () => guestbookApi.getPublicGuestbooks(slug, params),
    enabled: !!slug,
  });
};

export const useDeleteGuestbook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ invitationId, guestbookId }: { invitationId: number; guestbookId: number }) =>
      guestbookApi.deleteGuestbook(invitationId, guestbookId),
    onSuccess: (_, variables) => {
      // 방명록 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['guestbooks', variables.invitationId] });
      queryClient.invalidateQueries({ queryKey: ['publicGuestbooks'] });
    },
  });
};
```

### 컴포넌트에서 사용 예제

```typescript
// features/invitations/pages/InvitationPublicPage.tsx
import { useParams } from 'react-router-dom';
import { usePublicInvitation, useRSVPStats, usePublicGuestbooks, useCreateRSVP, useCreateGuestbook } from '../api';

export function InvitationPublicPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: invitation, isLoading } = usePublicInvitation(slug!);
  const { data: rsvpStats } = useRSVPStats(slug!);
  const { data: guestbooks } = usePublicGuestbooks(slug!);
  const createRSVP = useCreateRSVP();
  const createGuestbook = useCreateGuestbook();

  const handleRSVP = async (data: CreateRSVPRequest) => {
    if (!invitation) return;
    try {
      await createRSVP.mutateAsync({
        invitationId: invitation.id,
        data,
      });
      alert('참석 여부가 등록되었습니다!');
    } catch (error) {
      alert('등록에 실패했습니다.');
    }
  };

  const handleGuestbook = async (data: CreateGuestbookRequest) => {
    if (!invitation) return;
    try {
      await createGuestbook.mutateAsync({
        invitationId: invitation.id,
        data,
      });
      alert('방명록이 작성되었습니다!');
    } catch (error) {
      alert('작성에 실패했습니다.');
    }
  };

  if (isLoading) return <div>로딩 중...</div>;
  if (!invitation) return <div>청첩장을 찾을 수 없습니다.</div>;

  return (
    <div>
      <h1>{invitation.title}</h1>
      {/* RSVP 통계 표시 */}
      {rsvpStats && (
        <div>
          <p>참석 예정: {rsvpStats.yes}명</p>
          <p>불참: {rsvpStats.no}명</p>
          <p>미정: {rsvpStats.maybe}명</p>
        </div>
      )}
      {/* 방명록 표시 */}
      <div>
        <h2>방명록</h2>
        {guestbooks?.results.map((guestbook) => (
          <div key={guestbook.id}>
            <p><strong>{guestbook.name}</strong></p>
            <p>{guestbook.message}</p>
            <p>{new Date(guestbook.created_at).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 7. 추가 정보

### 페이지네이션

대부분의 목록 조회 API는 페이지네이션을 지원합니다. 응답 형식은 다음과 같습니다:

```typescript
interface PaginatedResponse<T> {
  count: number;        // 전체 항목 수
  next: string | null;  // 다음 페이지 URL (없으면 null)
  previous: string | null; // 이전 페이지 URL (없으면 null)
  results: T[];         // 현재 페이지의 결과 배열
}
```

**사용 예시:**
```typescript
// 첫 페이지 조회
const response = await apiClient.get('/templates/?page=1&page_size=10');

// 다음 페이지가 있으면 조회
if (response.data.next) {
  const nextResponse = await apiClient.get(response.data.next);
}
```

### 필터링 및 검색

#### 템플릿 API 필터링
- `search`: 템플릿 이름 또는 설명에서 검색
- `category`: 카테고리로 필터링

#### 청첩장 API 필터링
- `ordering`: 정렬 기준 (`created_at`, `-created_at`, `title`, `-title` 등)

#### RSVP API 필터링
- `attendance`: 참석 여부로 필터링 (`yes`, `no`, `maybe`)

### 정렬 옵션

정렬은 `ordering` 쿼리 파라미터를 사용합니다:
- 필드명 앞에 `-`를 붙이면 내림차순 정렬
- 여러 필드로 정렬하려면 쉼표로 구분: `ordering=created_at,-title`

**예시:**
```
GET /api/v1/templates/?ordering=-created_at
GET /api/v1/invitations/?ordering=created_at,-title
```

### CORS 설정

백엔드에서 CORS가 올바르게 설정되어 있어야 프론트엔드에서 API를 호출할 수 있습니다. 개발 환경에서는 일반적으로 다음과 같은 설정이 필요합니다:

- 개발 서버 URL이 백엔드의 허용된 Origin에 포함되어야 합니다
- 인증 토큰을 포함한 요청을 위해 `Access-Control-Allow-Credentials: true`가 설정되어야 합니다

### 환경 변수

프로젝트에서 API Base URL을 환경 변수로 관리하는 것을 권장합니다:

```typescript
// .env 파일
VITE_API_BASE_URL=http://localhost:8000/api/v1

// apiClient.ts
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
});
```

---

## 마무리

이 문서는 OurHour 백엔드 API를 사용하는 프론트엔드 개발자를 위한 참조 가이드입니다. 추가 질문이나 문제가 발생하면 백엔드 팀에 문의하거나 Swagger UI (`/api/docs/`)를 참고하세요.

**최종 업데이트:** 2024년





