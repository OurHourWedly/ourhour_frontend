import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLogin } from '../api/authApi';
import { parseErrorResponse, logErrorResponse } from '@/shared/lib/errorUtils';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const loginMutation = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    try {
      await loginMutation.mutateAsync({ email, password });
      // 로그인 성공 시 마이페이지로 이동
      navigate('/my-invitations');
    } catch (error: any) {
      // 디버깅용 에러 로그
      logErrorResponse(error, '로그인');

      // 통합 에러 파싱 함수 사용
      const errorMessage = parseErrorResponse(error) || '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.';
      setError(errorMessage);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '50px auto' }}>
      <h1 style={{ marginBottom: '30px', textAlign: 'center' }}>로그인</h1>

      <form onSubmit={handleSubmit}>
        {error && (
          <div
            style={{
              padding: '12px',
              marginBottom: '20px',
              backgroundColor: '#ffebee',
              border: '1px solid #f44336',
              borderRadius: '4px',
              color: '#d32f2f',
              fontSize: '14px',
            }}
          >
            {error}
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <label
            htmlFor="email"
            style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}
          >
            이메일
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box',
            }}
            placeholder="이메일을 입력하세요"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label
            htmlFor="password"
            style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}
          >
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box',
            }}
            placeholder="비밀번호를 입력하세요"
          />
        </div>

        <button
          type="submit"
          disabled={loginMutation.isPending}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loginMutation.isPending ? 'not-allowed' : 'pointer',
            opacity: loginMutation.isPending ? 0.6 : 1,
            marginBottom: '20px',
          }}
        >
          {loginMutation.isPending ? '로그인 중...' : '로그인'}
        </button>
      </form>

      <div style={{ textAlign: 'center', fontSize: '14px' }}>
        <span style={{ color: '#666' }}>계정이 없으신가요? </span>
        <Link to="/signup" style={{ color: '#1976d2', textDecoration: 'none' }}>
          회원가입
        </Link>
      </div>
    </div>
  );
}

