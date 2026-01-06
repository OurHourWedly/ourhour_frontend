# OurHour Frontend

OurHour는 모바일 청첩장 생성 및 RSVP 관리를 위한 웹 서비스입니다.  
본 저장소는 OurHour 서비스의 프론트엔드 레포지토리입니다.

## Tech Stack

- React 18
- TypeScript
- Vite
- React Router
- (예정) Zustand or Redux Toolkit
- (예정) Tailwind CSS

## Project Structure

src/
├─ pages/ # 페이지 단위 컴포넌트
├─ components/ # 공용 UI 컴포넌트
├─ features/ # 도메인별 기능 단위
├─ hooks/
├─ api/
└─ utils/

markdown
코드 복사

## Main Features

- 청첩장 템플릿 목록 조회
- 청첩장 생성 / 수정
- RSVP 응답 관리
- 마이페이지에서 청첩장 및 응답 현황 확인

## Development

```bash
npm install
npm run dev
Notes
본 프로젝트는 백엔드(Django)와 분리된 구조로 개발됩니다.

실서비스를 가정한 설계 및 확장성을 고려합니다.