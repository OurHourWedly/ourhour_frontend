import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSignup } from '../api/authApi';
import { parseErrorResponse, logErrorResponse } from '@/shared/lib/errorUtils';

export function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const signupMutation = useSignup();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password || !passwordConfirm || !name || !phone) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    try {
      await signupMutation.mutateAsync({
        email,
        password,
        password_confirm: passwordConfirm,
        name,
        phone,
      });
      // 회원가입 성공 시 대시보드로 이동
      navigate('/dashboard');
    } catch (error: any) {
      // 디버깅용 에러 로그
      logErrorResponse(error, '회원가입');

      // 통합 에러 파싱 함수 사용
      const errorMessage = parseErrorResponse(error) || '회원가입에 실패했습니다. 입력 정보를 확인해주세요.';
      setError(errorMessage);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '50px auto' }}>
      <h1 style={{ marginBottom: '30px', textAlign: 'center' }}>회원가입</h1>

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
              whiteSpace: 'pre-line',
            }}
          >
            {error}
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <label
            htmlFor="name"
            style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}
          >
            이름 *
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box',
            }}
            placeholder="이름을 입력하세요"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label
            htmlFor="email"
            style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}
          >
            이메일 *
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
            htmlFor="phone"
            style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}
          >
            전화번호 *
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box',
            }}
            placeholder="010-1234-5678"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label
            htmlFor="password"
            style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}
          >
            비밀번호 * (8자 이상)
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
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

        <div style={{ marginBottom: '20px' }}>
          <label
            htmlFor="passwordConfirm"
            style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}
          >
            비밀번호 확인 *
          </label>
          <input
            id="passwordConfirm"
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            required
            minLength={8}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box',
            }}
            placeholder="비밀번호를 다시 입력하세요"
          />
        </div>

        <button
          type="submit"
          disabled={signupMutation.isPending}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: signupMutation.isPending ? 'not-allowed' : 'pointer',
            opacity: signupMutation.isPending ? 0.6 : 1,
            marginBottom: '20px',
          }}
        >
          {signupMutation.isPending ? '회원가입 중...' : '회원가입'}
        </button>
      </form>

      <div style={{ textAlign: 'center', fontSize: '14px' }}>
        <span style={{ color: '#666' }}>이미 계정이 있으신가요? </span>
        <Link to="/login" style={{ color: '#1976d2', textDecoration: 'none' }}>
          로그인
        </Link>
      </div>
    </div>
  );
}

