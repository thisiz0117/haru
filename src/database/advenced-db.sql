/*
# Advenced Database Schema Structure
-> ADSX2

>> # 유저 관련
# 유저, users
?: 실제 서비스는 계정 제공업체 로그인만 지원하므로, sub값과 제공자의 이메일만 저장.
- id int u pk auto_increment
- provider enum('google', 'naver')
- sub vc(21) nn uq
- username vc(32) nn
- description text nn
-t created_at int u nn default unix_timestamp(now())
-t updated_at int u nn default unix_timestamp(now())
&idx: username

>> # 로그인 관련
# 리프레시 토큰 관리, ref_tokens
?: jwt, session 둘 중 하나만 극단적으로 갈려 하니 인생이 망하려는 조짐이 보임.
?: 고로 이 둘을 섞어서 리프레시 토큰만 사용하도록 할 예정임.
- id int pk auto_increment
- user_id int u nn
- ref_token vc(64) nn uq
-t created_at int u nn default unix_timestamp(now())
-t expires_at int u nn
-f fk user_id ref users(id) on delete cascade 

>> # 일기 관련
# 일기, diaries
- id bigint pk auto_increment
- writer int u nn
- title vc(64) nn
- content text
-e state enum('public', 'private') nn 
-t created_at int u nn default unix_timestamp(now())
-c likes_count int u nn default 0
-c dislikes_count int u nn default 0
-f fk writer ref users(id)

# 좋아요, 싫어요 기록, like_records
- diary_id bigint pk
- selecter int u nn pk
-e select enum('not_select', 'like', 'dislike') nn default 'not_select'
-f fk selecter ref users(id)
*/

create database if not exists haru;
use haru;

-- users
create table if not exists users (
  id int unsigned auto_increment primary key,
  provider enum('google', 'naver'),
  sub varchar(21) not null unique,
  username varchar(32) not null,
  description varchar(512) not null default '',
  created_at timestamp not null default current_timestamp,
  updated_at timestamp not null default current_timestamp on update current_timestamp,
  index idx_username (username)
);

-- ref_tokens 테이블
create table if not exists ref_tokens (
  id int unsigned auto_increment primary key,
  user_id int unsigned not null unique,
  ref_token varchar(64) not null unique,
  created_at timestamp not null default current_timestamp,
  expires_at timestamp not null,
  foreign key (user_id) references users(id) on delete cascade
);

-- diaries 테이블
create table if not exists diaries (
  id bigint unsigned auto_increment primary key,
  writer int unsigned not null,
  title varchar(64) not null,
  content text,
  state enum('public', 'private') not null,
  created_at timestamp not null default current_timestamp,
  likes_count int unsigned not null default 0,
  dislikes_count int unsigned not null default 0,
  foreign key (writer) references users(id) on delete cascade
);

-- like_records 테이블
create table if not exists like_records (
  diary_id bigint unsigned not null,
  selecter int unsigned not null,
  reaction enum('like', 'dislike'),
  primary key(diary_id, selecter),
  foreign key (selecter) references users(id) on delete cascade,
  foreign key (diary_id) references diaries(id) on delete cascade
);