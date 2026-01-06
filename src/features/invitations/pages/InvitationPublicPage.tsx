import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePublicInvitation } from '../api/invitationApi';
import { useRSVPStats, useCreateRSVP } from '../api/rsvpApi';
import { usePublicGuestbooks, useCreateGuestbook } from '../api/guestbookApi';
import type { CreateRSVPRequest } from '@/shared/lib/schemas/rsvpSchema';
import type { CreateGuestbookRequest } from '@/shared/lib/schemas/guestbookSchema';

export function InvitationPublicPage() {
  const { slug } = useParams<{ slug: string }>();
  const [rsvpGuestName, setRsvpGuestName] = useState('');
  const [rsvpPhone, setRsvpPhone] = useState('');
  const [rsvpGuestCount, setRsvpGuestCount] = useState(1);
  const [rsvpAttendanceStatus, setRsvpAttendanceStatus] = useState<'ATTENDING' | 'NOT_ATTENDING' | 'PENDING'>('PENDING');
  const [rsvpMessage, setRsvpMessage] = useState('');
  const [rsvpDietaryRestrictions, setRsvpDietaryRestrictions] = useState('');
  const [guestbookAuthorName, setGuestbookAuthorName] = useState('');
  const [guestbookMessage, setGuestbookMessage] = useState('');
  const [guestbookPhone, setGuestbookPhone] = useState('');

  const { data: invitation, isLoading: invitationLoading, error: invitationError } =
    usePublicInvitation(slug || '');
  
  // 종속 쿼리: invitation이 있을 때만 호출
  const { data: rsvpStats, isLoading: rsvpStatsLoading } = useRSVPStats(slug || '', {
    enabled: !!invitation,
  });
  const { data: guestbooks, isLoading: guestbooksLoading } = usePublicGuestbooks(
    slug || '',
    undefined,
    {
      enabled: !!invitation,
    }
  );
  
  const createRSVPMutation = useCreateRSVP();
  const createGuestbookMutation = useCreateGuestbook();

  const handleRSVPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitation || !rsvpGuestName) return;

    try {
      const rsvpData: CreateRSVPRequest = {
        guest_name: rsvpGuestName,
        guest_count: rsvpGuestCount,
        attendance_status: rsvpAttendanceStatus,
        phone: rsvpPhone || undefined,
        message: rsvpMessage || undefined,
        dietary_restrictions: rsvpDietaryRestrictions || undefined,
      };
      await createRSVPMutation.mutateAsync({
        invitationId: invitation.id,
        data: rsvpData,
      });
      setRsvpGuestName('');
      setRsvpPhone('');
      setRsvpGuestCount(1);
      setRsvpAttendanceStatus('PENDING');
      setRsvpMessage('');
      setRsvpDietaryRestrictions('');
      alert('참석 여부가 등록되었습니다!');
    } catch (error: any) {
      alert('등록에 실패했습니다: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleGuestbookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitation || !guestbookAuthorName || !guestbookMessage) return;

    try {
      const guestbookData: CreateGuestbookRequest = {
        author_name: guestbookAuthorName,
        message: guestbookMessage,
        phone: guestbookPhone || undefined,
        is_public: true,
      };
      await createGuestbookMutation.mutateAsync({
        invitationId: invitation.id,
        data: guestbookData,
      });
      setGuestbookAuthorName('');
      setGuestbookMessage('');
      setGuestbookPhone('');
      alert('방명록이 작성되었습니다!');
    } catch (error: any) {
      alert('작성에 실패했습니다: ' + (error.response?.data?.detail || error.message));
    }
  };

  if (invitationLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>청첩장을 불러오는 중...</div>
    );
  }

  if (invitationError || !invitation) {
    return (
      <div
        style={{
          padding: '20px',
          backgroundColor: '#ffebee',
          border: '1px solid #f44336',
          borderRadius: '4px',
          color: '#d32f2f',
          textAlign: 'center',
        }}
      >
        {invitationError
          ? `에러: ${invitationError.message || '청첩장을 불러오는 중 오류가 발생했습니다.'}`
          : '청첩장을 찾을 수 없습니다.'}
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      {/* 청첩장 정보 */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ marginBottom: '10px', fontSize: '32px' }}>{invitation.title}</h1>
        <p style={{ color: '#666', fontSize: '14px' }}>
          생성일: {new Date(invitation.created_at).toLocaleDateString('ko-KR')}
        </p>
      </div>

      {/* RSVP 통계 */}
      {rsvpStats && (
        <div
          style={{
            marginBottom: '40px',
            padding: '20px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
          }}
        >
          <h2 style={{ marginBottom: '15px', fontSize: '24px' }}>참석 통계</h2>
          {rsvpStatsLoading ? (
            <div>통계를 불러오는 중...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4caf50' }}>
                  {rsvpStats.attending_count}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>참석</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f44336' }}>
                  {rsvpStats.not_attending_count}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>불참</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff9800' }}>
                  {rsvpStats.pending_count}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>미정</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                  {rsvpStats.total_guests}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>예상 인원</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* RSVP 작성 폼 */}
      <div style={{ marginBottom: '40px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2 style={{ marginBottom: '15px', fontSize: '24px' }}>참석 여부 등록</h2>
        <form onSubmit={handleRSVPSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <input
              type="text"
              placeholder="이름 *"
              value={rsvpGuestName}
              onChange={(e) => setRsvpGuestName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <input
              type="tel"
              placeholder="연락처 (선택)"
              value={rsvpPhone}
              onChange={(e) => setRsvpPhone(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <input
              type="number"
              placeholder="참석 인원수 *"
              value={rsvpGuestCount}
              onChange={(e) => setRsvpGuestCount(parseInt(e.target.value) || 1)}
              min="1"
              required
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <select
              value={rsvpAttendanceStatus}
              onChange={(e) => setRsvpAttendanceStatus(e.target.value as 'ATTENDING' | 'NOT_ATTENDING' | 'PENDING')}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            >
              <option value="PENDING">미정입니다</option>
              <option value="ATTENDING">참석합니다</option>
              <option value="NOT_ATTENDING">불참합니다</option>
            </select>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <textarea
              placeholder="메시지 (선택)"
              value={rsvpMessage}
              onChange={(e) => setRsvpMessage(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                resize: 'vertical',
              }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <input
              type="text"
              placeholder="식이 제한사항 (선택)"
              value={rsvpDietaryRestrictions}
              onChange={(e) => setRsvpDietaryRestrictions(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            />
          </div>
          <button
            type="submit"
            disabled={createRSVPMutation.isPending}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {createRSVPMutation.isPending ? '등록 중...' : '등록하기'}
          </button>
        </form>
      </div>

      {/* 방명록 작성 폼 */}
      <div style={{ marginBottom: '40px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2 style={{ marginBottom: '15px', fontSize: '24px' }}>방명록 작성</h2>
        <form onSubmit={handleGuestbookSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <input
              type="text"
              placeholder="이름 *"
              value={guestbookAuthorName}
              onChange={(e) => setGuestbookAuthorName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <input
              type="tel"
              placeholder="연락처 (선택)"
              value={guestbookPhone}
              onChange={(e) => setGuestbookPhone(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <textarea
              placeholder="메시지 *"
              value={guestbookMessage}
              onChange={(e) => setGuestbookMessage(e.target.value)}
              required
              rows={4}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                resize: 'vertical',
              }}
            />
          </div>
          <button
            type="submit"
            disabled={createGuestbookMutation.isPending}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {createGuestbookMutation.isPending ? '작성 중...' : '작성하기'}
          </button>
        </form>
      </div>

      {/* 방명록 목록 */}
      <div>
        <h2 style={{ marginBottom: '15px', fontSize: '24px' }}>방명록</h2>
        {guestbooksLoading ? (
          <div>방명록을 불러오는 중...</div>
        ) : guestbooks && guestbooks.results.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {guestbooks.results.map((guestbook) => (
              <div
                key={guestbook.id}
                style={{
                  padding: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: '#fff',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <strong style={{ fontSize: '16px' }}>{guestbook.author_name}</strong>
                  <span style={{ fontSize: '12px', color: '#999' }}>
                    {new Date(guestbook.created_at).toLocaleDateString('ko-KR')}
                  </span>
                </div>
                <p style={{ margin: 0, color: '#333', lineHeight: '1.6' }}>{guestbook.message}</p>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
            아직 방명록이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}