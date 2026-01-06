import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInvitations, useInvitation, useUpdateInvitation, usePublishInvitation, useDeleteInvitation } from '../api/invitationApi';
import { useRSVPs } from '../api/rsvpApi';
import { useGuestbooks, useDeleteGuestbook } from '../api/guestbookApi';

export function MyInvitationsPage() {
  const navigate = useNavigate();
  const [selectedInvitationId, setSelectedInvitationId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'detail'>('list');
  const [updateTitle, setUpdateTitle] = useState('');
  const [publishSlug, setPublishSlug] = useState('');

  const { data: invitations, isLoading: invitationsLoading } = useInvitations();
  const { data: selectedInvitation, isLoading: invitationLoading } = useInvitation(
    selectedInvitationId || 0
  );
  const { data: rsvps, isLoading: rsvpsLoading } = useRSVPs(selectedInvitationId || 0, undefined, {
    enabled: !!selectedInvitationId,
  });
  const { data: guestbooks, isLoading: guestbooksLoading } = useGuestbooks(selectedInvitationId || 0, undefined, {
    enabled: !!selectedInvitationId,
  });

  const updateInvitationMutation = useUpdateInvitation();
  const publishInvitationMutation = usePublishInvitation();
  const deleteInvitationMutation = useDeleteInvitation();
  const deleteGuestbookMutation = useDeleteGuestbook();

  const handleSelectInvitation = (id: number) => {
    setSelectedInvitationId(id);
    setActiveTab('detail');
    setUpdateTitle('');
    setPublishSlug('');
  };

  const handleUpdate = async () => {
    if (!selectedInvitationId || !updateTitle) return;
    try {
      await updateInvitationMutation.mutateAsync({
        id: selectedInvitationId,
        data: { title: updateTitle },
      });
      alert('수정되었습니다!');
      setUpdateTitle('');
    } catch (error: any) {
      alert('수정에 실패했습니다: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handlePublish = async () => {
    if (!selectedInvitationId) return;
    try {
      await publishInvitationMutation.mutateAsync({
        id: selectedInvitationId,
        data: publishSlug ? { slug: publishSlug } : undefined,
      });
      alert('발행되었습니다!');
      setPublishSlug('');
    } catch (error: any) {
      alert('발행에 실패했습니다: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleDelete = async () => {
    if (!selectedInvitationId) return;
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await deleteInvitationMutation.mutateAsync(selectedInvitationId);
      alert('삭제되었습니다!');
      setSelectedInvitationId(null);
      setActiveTab('list');
    } catch (error: any) {
      alert('삭제에 실패했습니다: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleCopyLink = () => {
    if (!selectedInvitation?.url_slug) {
      alert('먼저 청첩장을 발행해주세요.');
      return;
    }
    // 각 청첩장마다 고유한 url_slug를 사용하여 링크 생성
    const url = `${window.location.origin}/i/${selectedInvitation.url_slug}`;
    navigator.clipboard.writeText(url);
    alert('링크가 복사되었습니다!');
  };

  const handleShare = async () => {
    if (!selectedInvitation?.url_slug) {
      alert('먼저 청첩장을 발행해주세요.');
      return;
    }
    // 각 청첩장마다 고유한 url_slug를 사용하여 링크 생성
    const url = `${window.location.origin}/i/${selectedInvitation.url_slug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: selectedInvitation.title,
          text: '청첩장을 확인해보세요!',
          url: url,
        });
      } catch (error) {
        // 사용자가 공유를 취소한 경우는 무시
      }
    } else {
      navigator.clipboard.writeText(url);
      alert('링크가 복사되었습니다!');
    }
  };

  const handleDeleteGuestbook = async (guestbookId: number) => {
    if (!selectedInvitationId) return;
    if (!confirm('방명록을 삭제하시겠습니까?')) return;
    try {
      await deleteGuestbookMutation.mutateAsync({
        invitationId: selectedInvitationId,
        guestbookId,
      });
      alert('삭제되었습니다!');
    } catch (error: any) {
      alert('삭제에 실패했습니다: ' + (error.response?.data?.detail || error.message));
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* 큰 제목 */}
      <h1 style={{ fontSize: '32px', marginBottom: '8px', fontWeight: 'bold' }}>내 청첩장</h1>
      
      {/* 작은 제목 */}
      <h2 style={{ fontSize: '18px', marginBottom: '16px', color: '#666', fontWeight: 'normal' }}>
        내 청첩장 목록
      </h2>

      {/* 청첩장 만들기 버튼 */}
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => navigate('/dashboard/create')}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '500',
          }}
        >
          + 청첩장 만들기
        </button>
      </div>

      {/* 탭 */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #ddd' }}>
        <button
          onClick={() => {
            setActiveTab('list');
            setSelectedInvitationId(null);
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'list' ? '#1976d2' : 'transparent',
            color: activeTab === 'list' ? 'white' : '#333',
            border: 'none',
            borderBottom: activeTab === 'list' ? '2px solid #1976d2' : '2px solid transparent',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          내 청첩장 목록
        </button>
        {selectedInvitationId && (
          <button
            onClick={() => setActiveTab('detail')}
            style={{
              padding: '10px 20px',
              backgroundColor: activeTab === 'detail' ? '#1976d2' : 'transparent',
              color: activeTab === 'detail' ? 'white' : '#333',
              border: 'none',
              borderBottom: activeTab === 'detail' ? '2px solid #1976d2' : '2px solid transparent',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            상세 관리
          </button>
        )}
      </div>

      {/* 목록 탭 */}
      {activeTab === 'list' && (
        <div>
          {invitationsLoading ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>로딩 중...</div>
          ) : invitations && invitations.results.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '20px',
              }}
            >
              {invitations.results.map((invitation) => (
                <div
                  key={invitation.id}
                  onClick={() => handleSelectInvitation(invitation.id)}
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '20px',
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}
                >
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '20px' }}>{invitation.title}</h3>
                  <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
                    {invitation.status === 'PUBLISHED' ? (
                      <span style={{ color: '#4caf50' }}>발행됨</span>
                    ) : (
                      <span style={{ color: '#999' }}>미발행</span>
                    )}
                  </p>
                  {invitation.url_slug && (
                    <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '12px' }}>
                      Slug: {invitation.url_slug}
                    </p>
                  )}
                  <p style={{ margin: 0, color: '#999', fontSize: '12px' }}>
                    {new Date(invitation.created_at).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
              아직 생성한 청첩장이 없습니다.
            </div>
          )}
        </div>
      )}

      {/* 상세 관리 탭 */}
      {activeTab === 'detail' && selectedInvitationId && (
        <div>
          {invitationLoading ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>로딩 중...</div>
          ) : selectedInvitation ? (
            <div>
              {/* 청첩장 정보 */}
              <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
                <h2 style={{ marginBottom: '20px' }}>{selectedInvitation.title}</h2>
                <p style={{ color: '#666', marginBottom: '10px' }}>
                  상태: {selectedInvitation.status === 'PUBLISHED' ? '발행됨' : '미발행'}
                </p>
                {selectedInvitation.url_slug && (
                  <p style={{ color: '#666', marginBottom: '20px' }}>Slug: {selectedInvitation.url_slug}</p>
                )}

                {/* 수정 */}
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ marginBottom: '10px', fontSize: '18px' }}>제목 수정</h3>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      placeholder="새 제목"
                      value={updateTitle}
                      onChange={(e) => setUpdateTitle(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                      }}
                    />
                    <button
                      onClick={handleUpdate}
                      disabled={updateInvitationMutation.isPending || !updateTitle}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#1976d2',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      수정
                    </button>
                  </div>
                </div>

                {/* 발행 */}
                {selectedInvitation.status !== 'PUBLISHED' && (
                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ marginBottom: '10px', fontSize: '18px' }}>청첩장 발행</h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input
                        type="text"
                        placeholder="Slug (선택, 미입력 시 자동 생성)"
                        value={publishSlug}
                        onChange={(e) => setPublishSlug(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '8px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                        }}
                      />
                      <button
                        onClick={handlePublish}
                        disabled={publishInvitationMutation.isPending}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#4caf50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        발행
                      </button>
                    </div>
                  </div>
                )}

                {/* 공유 */}
                {selectedInvitation.status === 'PUBLISHED' && selectedInvitation.url_slug && (
                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ marginBottom: '10px', fontSize: '18px' }}>공유</h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={handleCopyLink}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#fff',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        링크 복사
                      </button>
                      <button
                        onClick={handleShare}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#FEE500',
                          color: '#000',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        카톡으로 공유
                      </button>
                    </div>
                  </div>
                )}

                {/* 삭제 */}
                <div>
                  <button
                    onClick={handleDelete}
                    disabled={deleteInvitationMutation.isPending}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    삭제
                  </button>
                </div>
              </div>

              {/* RSVP 목록 */}
              <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
                <h2 style={{ marginBottom: '20px' }}>참석 여부 (RSVP)</h2>
                {rsvpsLoading ? (
                  <div>로딩 중...</div>
                ) : rsvps && rsvps.results.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {rsvps.results.map((rsvp) => (
                      <div
                        key={rsvp.id}
                        style={{
                          padding: '15px',
                          border: '1px solid #eee',
                          borderRadius: '4px',
                          backgroundColor: '#f9f9f9',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                          <strong>{rsvp.guest_name}</strong>
                          <span
                            style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              backgroundColor:
                                rsvp.attendance_status === 'ATTENDING'
                                  ? '#e8f5e9'
                                  : rsvp.attendance_status === 'NOT_ATTENDING'
                                    ? '#ffebee'
                                    : '#fff3e0',
                              color:
                                rsvp.attendance_status === 'ATTENDING'
                                  ? '#4caf50'
                                  : rsvp.attendance_status === 'NOT_ATTENDING'
                                    ? '#f44336'
                                    : '#ff9800',
                            }}
                          >
                            {rsvp.attendance_status === 'ATTENDING' ? '참석' : rsvp.attendance_status === 'NOT_ATTENDING' ? '불참' : '미정'}
                          </span>
                        </div>
                        {rsvp.phone && <div style={{ fontSize: '12px', color: '#666' }}>{rsvp.phone}</div>}
                        {rsvp.guest_count > 1 && (
                          <div style={{ fontSize: '12px', color: '#666' }}>인원: {rsvp.guest_count}명</div>
                        )}
                        {rsvp.message && (
                          <div style={{ marginTop: '5px', fontSize: '14px' }}>{rsvp.message}</div>
                        )}
                        {rsvp.dietary_restrictions && (
                          <div style={{ marginTop: '5px', fontSize: '12px', color: '#666' }}>
                            식이 제한: {rsvp.dietary_restrictions}
                          </div>
                        )}
                        <div style={{ marginTop: '5px', fontSize: '12px', color: '#999' }}>
                          {new Date(rsvp.created_at).toLocaleDateString('ko-KR')}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: '#999' }}>아직 참석 여부가 등록되지 않았습니다.</div>
                )}
              </div>

              {/* 방명록 목록 */}
              <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
                <h2 style={{ marginBottom: '20px' }}>방명록</h2>
                {guestbooksLoading ? (
                  <div>로딩 중...</div>
                ) : guestbooks && guestbooks.results.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {guestbooks.results.map((guestbook) => (
                      <div
                        key={guestbook.id}
                        style={{
                          padding: '15px',
                          border: '1px solid #eee',
                          borderRadius: '4px',
                          backgroundColor: '#fff',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                          <strong>{guestbook.author_name}</strong>
                          <button
                            onClick={() => handleDeleteGuestbook(guestbook.id)}
                            disabled={deleteGuestbookMutation.isPending}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#ffebee',
                              color: '#d32f2f',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                            }}
                          >
                            삭제
                          </button>
                        </div>
                        <p style={{ margin: 0, color: '#333', lineHeight: '1.6' }}>{guestbook.message}</p>
                        <div style={{ marginTop: '10px', fontSize: '12px', color: '#999' }}>
                          {new Date(guestbook.created_at).toLocaleDateString('ko-KR')}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: '#999' }}>아직 방명록이 없습니다.</div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
              청첩장을 선택해주세요.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

