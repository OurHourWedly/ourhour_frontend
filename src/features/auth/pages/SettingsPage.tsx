import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMe, authApi } from '../api/authApi';
import { parseErrorResponse, logErrorResponse } from '@/shared/lib/errorUtils';
import apiClient from '@/shared/lib/apiClient';

export function SettingsPage() {
  const { data: user, isLoading } = useMe();
  const navigate = useNavigate();
  
  // 비밀번호 변경 상태
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // 탈퇴 상태
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (!currentPassword || !newPassword || !newPasswordConfirm) {
      setPasswordError('모든 필드를 입력해주세요.');
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      setPasswordError('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('새 비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    setIsChangingPassword(true);
    try {
      // TODO: API 엔드포인트 확인 후 수정 필요
      // 일반적인 패턴: PATCH /api/v1/auth/password/ 또는 PATCH /api/v1/auth/me/
      await apiClient.patch('/auth/password/', {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirm: newPasswordConfirm,
      });
      
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setNewPasswordConfirm('');
      
      // 3초 후 성공 메시지 제거
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (error: any) {
      logErrorResponse(error, '비밀번호 변경');
      const errorMessage = parseErrorResponse(error) || '비밀번호 변경에 실패했습니다.';
      setPasswordError(errorMessage);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== '탈퇴') {
      setDeleteError('탈퇴를 확인하려면 "탈퇴"를 입력해주세요.');
      return;
    }

    if (!confirm('정말 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      // TODO: API 엔드포인트 확인 후 수정 필요
      // 일반적인 패턴: DELETE /api/v1/auth/me/ 또는 DELETE /api/v1/auth/account/
      await apiClient.delete('/auth/me/');
      
      // 탈퇴 성공 시 로그아웃 및 홈으로 이동
      authApi.logout();
      navigate('/');
      alert('탈퇴가 완료되었습니다.');
    } catch (error: any) {
      logErrorResponse(error, '탈퇴');
      const errorMessage = parseErrorResponse(error) || '탈퇴에 실패했습니다.';
      setDeleteError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>로딩 중...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>로그인이 필요합니다.</p>
        <button onClick={() => navigate('/login')}>로그인하기</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '30px', fontSize: '28px' }}>설정</h1>

      {/* 사용자 정보 */}
      <div style={{ marginBottom: '40px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '20px' }}>내 정보</h2>
        <div style={{ marginBottom: '10px' }}>
          <strong>이메일:</strong> {user.email}
        </div>
        <div style={{ marginBottom: '10px' }}>
          <strong>이름:</strong> {user.name}
        </div>
        {user.phone && (
          <div style={{ marginBottom: '10px' }}>
            <strong>전화번호:</strong> {user.phone}
          </div>
        )}
      </div>

      {/* 비밀번호 변경 */}
      <div style={{ marginBottom: '40px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '20px' }}>비밀번호 변경</h2>
        
        {passwordSuccess && (
          <div
            style={{
              padding: '12px',
              marginBottom: '20px',
              backgroundColor: '#e8f5e9',
              border: '1px solid #4caf50',
              borderRadius: '4px',
              color: '#2e7d32',
              fontSize: '14px',
            }}
          >
            비밀번호가 성공적으로 변경되었습니다.
          </div>
        )}

        {passwordError && (
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
            {passwordError}
          </div>
        )}

        <form onSubmit={handleChangePassword}>
          <div style={{ marginBottom: '20px' }}>
            <label
              htmlFor="currentPassword"
              style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}
            >
              현재 비밀번호
            </label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label
              htmlFor="newPassword"
              style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}
            >
              새 비밀번호 (8자 이상)
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
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
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label
              htmlFor="newPasswordConfirm"
              style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}
            >
              새 비밀번호 확인
            </label>
            <input
              id="newPasswordConfirm"
              type="password"
              value={newPasswordConfirm}
              onChange={(e) => setNewPasswordConfirm(e.target.value)}
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
            />
          </div>

          <button
            type="submit"
            disabled={isChangingPassword}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isChangingPassword ? 'not-allowed' : 'pointer',
              opacity: isChangingPassword ? 0.6 : 1,
            }}
          >
            {isChangingPassword ? '변경 중...' : '비밀번호 변경'}
          </button>
        </form>
      </div>

      {/* 탈퇴하기 */}
      <div style={{ padding: '20px', border: '1px solid #f44336', borderRadius: '8px', backgroundColor: '#ffebee' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '20px', color: '#d32f2f' }}>계정 탈퇴</h2>
        <p style={{ marginBottom: '20px', color: '#666', fontSize: '14px' }}>
          계정을 탈퇴하면 모든 데이터가 삭제되며 복구할 수 없습니다.
        </p>

        {deleteError && (
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
            {deleteError}
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <label
            htmlFor="deleteConfirm"
            style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}
          >
            탈퇴를 확인하려면 "탈퇴"를 입력하세요
          </label>
          <input
            id="deleteConfirm"
            type="text"
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder="탈퇴"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <button
          onClick={handleDeleteAccount}
          disabled={isDeleting || deleteConfirm !== '탈퇴'}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isDeleting || deleteConfirm !== '탈퇴' ? 'not-allowed' : 'pointer',
            opacity: isDeleting || deleteConfirm !== '탈퇴' ? 0.6 : 1,
          }}
        >
          {isDeleting ? '탈퇴 중...' : '계정 탈퇴'}
        </button>
      </div>
    </div>
  );
}

