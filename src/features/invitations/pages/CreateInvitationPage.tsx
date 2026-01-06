import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTemplates } from '@/features/templates/api/templateApi';
import { useCreateInvitation } from '../api/invitationApi';
import { parseErrorResponse, logErrorResponse } from '@/shared/lib/errorUtils';

export function CreateInvitationPage() {
  const navigate = useNavigate();
  const { data: templates, isLoading: templatesLoading } = useTemplates();
  const createInvitationMutation = useCreateInvitation();
  
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // 청첩장 생성 폼 상태
  const [title, setTitle] = useState('');
  const [groomName, setGroomName] = useState('');
  const [brideName, setBrideName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const selectedTemplate = templates?.results.find((t) => t.id === selectedTemplateId);

  const handleSelectTemplate = (templateId: number) => {
    setSelectedTemplateId(templateId);
    setShowPreview(true);
    setError(null);
  };

  const handlePreview = (sampleSlug: string) => {
    // 새 탭에서 미리보기 열기
    window.open(`/i/${sampleSlug}`, '_blank');
  };

  const handleUseTemplate = () => {
    if (!selectedTemplateId) return;
    setShowCreateForm(true);
    setShowPreview(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedTemplateId || !title || !groomName || !brideName) {
      setError('모든 필수 필드를 입력해주세요.');
      return;
    }

    setIsCreating(true);
    try {
      await createInvitationMutation.mutateAsync({
        template: selectedTemplateId,
        title,
        groom_name: groomName,
        bride_name: brideName,
      });

      // 생성 성공 시 대시보드로 이동
      navigate('/dashboard');
      alert('청첩장이 생성되었습니다!');
    } catch (error: any) {
      logErrorResponse(error, '청첩장 생성');
      const errorMessage = parseErrorResponse(error) || '청첩장 생성에 실패했습니다.';
      setError(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  if (showCreateForm && selectedTemplateId) {
    return (
      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '30px', fontSize: '28px' }}>청첩장 만들기</h1>

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

        <form onSubmit={handleCreate}>
          <div style={{ marginBottom: '20px' }}>
            <label
              htmlFor="title"
              style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}
            >
              청첩장 제목 *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="예: 홍길동 ♥ 김영희 결혼합니다"
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
              htmlFor="groomName"
              style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}
            >
              신랑 이름 *
            </label>
            <input
              id="groomName"
              type="text"
              value={groomName}
              onChange={(e) => setGroomName(e.target.value)}
              required
              placeholder="신랑 이름"
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
              htmlFor="brideName"
              style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}
            >
              신부 이름 *
            </label>
            <input
              id="brideName"
              type="text"
              value={brideName}
              onChange={(e) => setBrideName(e.target.value)}
              required
              placeholder="신부 이름"
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

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={() => {
                setShowCreateForm(false);
                setShowPreview(true);
              }}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                backgroundColor: 'transparent',
                color: '#666',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              뒤로
            </button>
            <button
              type="submit"
              disabled={isCreating}
              style={{
                flex: 1,
                padding: '12px 24px',
                fontSize: '16px',
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isCreating ? 'not-allowed' : 'pointer',
                opacity: isCreating ? 0.6 : 1,
              }}
            >
              {isCreating ? '생성 중...' : '청첩장 만들기'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (showPreview && selectedTemplate) {
    return (
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '30px', fontSize: '28px' }}>템플릿 미리보기</h1>

        <div style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h2 style={{ marginBottom: '10px', fontSize: '20px' }}>{selectedTemplate.name}</h2>
          {selectedTemplate.description && (
            <p style={{ marginBottom: '20px', color: '#666' }}>{selectedTemplate.description}</p>
          )}
          {selectedTemplate.thumbnail_url && (
            <img
              src={selectedTemplate.thumbnail_url}
              alt={selectedTemplate.name}
              style={{
                width: '100%',
                maxWidth: '500px',
                height: 'auto',
                borderRadius: '8px',
                marginBottom: '20px',
              }}
            />
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          {selectedTemplate.sample_slug && (
            <button
              onClick={() => handlePreview(selectedTemplate.sample_slug!)}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              샘플 보기
            </button>
          )}
          <button
            onClick={handleUseTemplate}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            이 템플릿으로 만들기
          </button>
          <button
            onClick={() => {
              setShowPreview(false);
              setSelectedTemplateId(null);
            }}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: 'transparent',
              color: '#666',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            템플릿 선택으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '30px', fontSize: '28px' }}>템플릿 선택</h1>
      <p style={{ marginBottom: '30px', color: '#666' }}>
        원하는 템플릿을 선택하여 청첩장을 만들어보세요.
      </p>

      {templatesLoading ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>로딩 중...</div>
      ) : templates && templates.results.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px',
          }}
        >
          {templates.results.map((template) => (
            <div
              key={template.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: '#fff',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }}
              onClick={() => handleSelectTemplate(template.id)}
            >
              {template.thumbnail_url && (
                <img
                  src={template.thumbnail_url}
                  alt={template.name}
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    marginBottom: '15px',
                  }}
                />
              )}
              <h3 style={{ margin: '0 0 10px 0', fontSize: '20px' }}>{template.name}</h3>
              {template.description && (
                <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
                  {template.description}
                </p>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span
                  style={{
                    padding: '4px 8px',
                    backgroundColor: template.is_premium ? '#ffd700' : '#e3f2fd',
                    color: template.is_premium ? '#333' : '#1976d2',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500',
                  }}
                >
                  {template.is_premium ? '프리미엄' : '무료'}
                </span>
                {template.sample_slug && (
                  <span style={{ fontSize: '12px', color: '#999' }}>샘플 있음</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
          사용 가능한 템플릿이 없습니다.
        </div>
      )}

      <div style={{ marginTop: '30px' }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: 'transparent',
            color: '#666',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          취소
        </button>
      </div>
    </div>
  );
}

