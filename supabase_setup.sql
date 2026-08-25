-- 위드케어 재가노인복지센터 - 상담 신청 테이블
-- Supabase SQL Editor에서 실행하세요 (한 번만 실행하면 됩니다)

create table consultations (
  id uuid default gen_random_uuid() primary key,
  name text not null,                -- 신청자 이름
  phone text not null,                -- 연락처
  condition text not null,            -- 어르신 상태
  services text[] not null default '{}', -- 희망 서비스 (방문요양/방문목욕/방문간호, 복수 선택)
  message text,                       -- 추가 문의사항
  status text not null default 'pending', -- pending(대기중) / done(완료)
  created_at timestamp with time zone default now()
);

-- 보안 설정 (RLS 활성화)
alter table consultations enable row level security;

-- 누구나(웹사이트 방문자) 상담 신청 폼 제출(insert)은 가능하도록 허용
create policy "Anyone can submit a consultation"
  on consultations for insert
  with check (true);

-- 조회(select)는 별도 관리자 인증 후에만 가능하도록 기본적으로 막아둡니다.
-- (Phase 5 관리자 페이지 연동 시 별도 정책을 추가합니다)
