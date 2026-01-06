import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useMe } from '@/features/auth/api/authApi';

export function RootLayout() {
  const { data: user, isLoading } = useMe();
  const navigate = useNavigate();

  return (
    <div>
      {/* 헤더 */}
      <header
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid #ddd',
          backgroundColor: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Link to="/" style={{ textDecoration: 'none', color: '#333', fontSize: '20px', fontWeight: 'bold' }}>
          OurHour
        </Link>
        <div style={{ display: 'flex', gap: '10px' }}>
          {isLoading ? (
            <span>로딩 중...</span>
          ) : user ? (
            <>
              <Link
                to="/dashboard"
                style={{
                  padding: '8px 16px',
                  textDecoration: 'none',
                  color: '#1976d2',
                  border: '1px solid #1976d2',
                  borderRadius: '4px',
                }}
              >
                마이페이지
              </Link>
              <Link
                to="/settings"
                style={{
                  padding: '8px 16px',
                  textDecoration: 'none',
                  color: '#666',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                }}
              >
                설정
              </Link>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                로그인
              </button>
              <button
                onClick={() => navigate('/signup')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                회원가입
              </button>
            </>
          )}
        </div>
      </header>
      <div style={{ padding: 16 }}>
        <Outlet />
      </div>
    </div>
  );
}