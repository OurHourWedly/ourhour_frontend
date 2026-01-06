import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTemplates } from '../api/templateApi';

export function HomePage() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { data: templatesData, isLoading, error } = useTemplates({
    search: search || undefined,
  });

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>템플릿 목록</h1>

      {/* 검색 입력 */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="템플릿 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: '10px',
            width: '100%',
            maxWidth: '400px',
            fontSize: '16px',
            border: '1px solid #ddd',
            borderRadius: '4px',
          }}
        />
      </div>

      {/* 로딩 상태 */}
      {isLoading && (
        <div style={{ padding: '20px', textAlign: 'center' }}>템플릿을 불러오는 중...</div>
      )}

      {/* 에러 상태 */}
      {error && (
        <div
          style={{
            padding: '20px',
            backgroundColor: '#ffebee',
            border: '1px solid #f44336',
            borderRadius: '4px',
            color: '#d32f2f',
          }}
        >
          에러: {error.message || '템플릿을 불러오는 중 오류가 발생했습니다.'}
        </div>
      )}

      {/* 템플릿 목록 */}
      {templatesData && (
        <div>
          <p style={{ marginBottom: '20px', color: '#666' }}>
            총 {templatesData.count}개의 템플릿
          </p>

          {templatesData.results.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
              템플릿이 없습니다.
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '20px',
              }}
            >
              {templatesData.results.map((template) => (
                <div
                  key={template.id}
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '20px',
                    backgroundColor: '#fff',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}
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
                  {template.category && (
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        backgroundColor: '#e3f2fd',
                        color: '#1976d2',
                        borderRadius: '4px',
                        fontSize: '12px',
                        marginBottom: '10px',
                      }}
                    >
                      {template.category}
                    </span>
                  )}
                  {template.sample_slug && (
                    <button
                      onClick={() => navigate(`/i/${template.sample_slug}`)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        marginTop: '10px',
                        backgroundColor: '#1976d2',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                      }}
                    >
                      예시로 만들어보기
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}