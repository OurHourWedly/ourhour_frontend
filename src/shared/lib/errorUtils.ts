/**
 * 에러 처리 유틸리티
 * 백엔드 API의 다양한 에러 응답 형식을 파싱하여 사용자 친화적인 메시지로 변환합니다.
 */

/**
 * 백엔드 에러 응답 형식
 * 
 * 형식 1: DRF 기본 형식 (시리얼라이저 검증 실패)
 * {
 *   "email": ["이 필드는 필수입니다."],
 *   "password": ["비밀번호가 일치하지 않습니다."]
 * }
 * 
 * 형식 2: 커스텀 에러 형식
 * {
 *   "error": {
 *     "status_code": 400,
 *     "message": "에러 메시지",
 *     "detail": {
 *       "field": ["에러 메시지"]
 *     }
 *   }
 * }
 * 
 * 형식 3: 단순 에러 메시지
 * {
 *   "error": "이메일 또는 비밀번호가 올바르지 않습니다."
 * }
 * 
 * 형식 4: 단순 detail
 * {
 *   "detail": "에러 메시지"
 * }
 */
interface ErrorResponse {
  error?: string | {
    status_code?: number;
    message?: string;
    detail?: any;
  };
  detail?: string | Record<string, any>;
  message?: string;
  [key: string]: any; // DRF 기본 형식: 필드명이 키인 객체
}

/**
 * 에러 응답을 파싱하여 사용자 친화적인 메시지를 반환합니다.
 * 
 * @param error - Axios 에러 객체 또는 일반 에러 객체
 * @returns 사용자 친화적인 에러 메시지
 */
export function parseErrorResponse(error: any): string {
  // 에러 응답이 없는 경우
  if (!error?.response?.data) {
    return error?.message || '알 수 없는 오류가 발생했습니다.';
  }

  const data: ErrorResponse = error.response.data;

  // 형식 3: 단순 에러 메시지
  if (typeof data.error === 'string') {
    return data.error;
  }

  // 형식 2: 커스텀 에러 형식
  if (data.error && typeof data.error === 'object') {
    // error.message가 있으면 우선 사용
    if (data.error.message) {
      return data.error.message;
    }
    
    // error.detail 처리
    if (data.error.detail) {
      // detail이 문자열인 경우
      if (typeof data.error.detail === 'string') {
        return data.error.detail;
      }
      
      // detail이 객체인 경우 (필드별 에러)
      if (typeof data.error.detail === 'object' && !Array.isArray(data.error.detail)) {
        const fieldErrors = Object.entries(data.error.detail)
          .filter(([key]) => key !== 'detail') // detail 필드 자체는 제외
          .map(([field, messages]) => {
            const msgArray = Array.isArray(messages) ? messages : [messages];
            return `${field}: ${msgArray.join(', ')}`;
          });
        
        if (fieldErrors.length > 0) {
          return fieldErrors.join('\n');
        }
      }
    }
  }

  // 형식 4: 단순 detail
  if (data.detail) {
    if (typeof data.detail === 'string') {
      return data.detail;
    }
    // detail이 객체인 경우 (필드별 에러)
    if (typeof data.detail === 'object' && !Array.isArray(data.detail)) {
      const fieldErrors = Object.entries(data.detail)
        .map(([field, messages]) => {
          const msgArray = Array.isArray(messages) ? messages : [messages];
          return `${field}: ${msgArray.join(', ')}`;
        })
        .join('\n');
      return fieldErrors || '오류가 발생했습니다.';
    }
  }

  // 형식 3: 단순 message
  if (data.message) {
    return data.message;
  }

  // 형식 1: DRF 기본 형식 (필드별 에러 객체)
  // error 필드를 제외한 모든 키가 필드명으로 간주
  const fieldErrors = Object.entries(data)
    .filter(([key]) => key !== 'error' && key !== 'detail' && key !== 'message')
    .map(([field, messages]) => {
      const msgArray = Array.isArray(messages) ? messages : [messages];
      return `${field}: ${msgArray.join(', ')}`;
    });

  if (fieldErrors.length > 0) {
    return fieldErrors.join('\n');
  }

  // 모든 형식에 해당하지 않는 경우
  return '오류가 발생했습니다.';
}

/**
 * 필드별 에러를 추출하여 반환합니다.
 * 폼에서 필드별 에러 메시지를 표시할 때 사용합니다.
 * 
 * @param error - Axios 에러 객체 또는 일반 에러 객체
 * @returns 필드명을 키로 하고 에러 메시지 배열을 값으로 하는 객체
 */
export function getFieldErrors(error: any): Record<string, string[]> {
  if (!error?.response?.data) {
    return {};
  }

  const data: ErrorResponse = error.response.data;
  const fieldErrors: Record<string, string[]> = {};

  // 형식 1: DRF 기본 형식 (필드명이 키인 객체)
  Object.entries(data).forEach(([field, messages]) => {
    if (field !== 'error' && field !== 'detail' && field !== 'message' && messages) {
      fieldErrors[field] = Array.isArray(messages) ? messages : [String(messages)];
    }
  });

  // 형식 2: 커스텀 에러의 detail에서 필드별 에러 추출
  if (data.error && typeof data.error === 'object' && data.error.detail) {
    if (typeof data.error.detail === 'object' && !Array.isArray(data.error.detail)) {
      Object.entries(data.error.detail).forEach(([field, messages]) => {
        if (field !== 'detail') {
          fieldErrors[field] = Array.isArray(messages) ? messages : [String(messages)];
        }
      });
    }
  }

  // 형식 4: detail이 객체인 경우
  if (data.detail && typeof data.detail === 'object' && !Array.isArray(data.detail)) {
    Object.entries(data.detail).forEach(([field, messages]) => {
      fieldErrors[field] = Array.isArray(messages) ? messages : [String(messages)];
    });
  }

  return fieldErrors;
}

/**
 * 에러 응답을 콘솔에 출력합니다. (디버깅용)
 * 
 * @param error - Axios 에러 객체 또는 일반 에러 객체
 * @param context - 에러가 발생한 컨텍스트 (예: "회원가입", "로그인")
 */
export function logErrorResponse(error: any, context?: string): void {
  const prefix = context ? `[${context}]` : '';
  console.error(`${prefix} 에러:`, error);
  console.error(`${prefix} 에러 응답:`, error?.response?.data);
  console.error(`${prefix} 에러 상태 코드:`, error?.response?.status);
}

