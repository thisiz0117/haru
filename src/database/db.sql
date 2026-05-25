create table if not exists users (
  id integer primary key auto_increment,
  username varchar(32) not null unique,
  email varchar(320) not null unique,
  description varchar(320)
);

create index if not exists user_id_idx on users(id);

create table if not exists login_sessions (
  id varchar(36) primary key,
  user_id integer not null,
  refresh_token integer not null,
  created_at datetime not null default current_timestamp(),
  updated_at datetime not null default current_timestamp() on update current_timestamp(),
  expire_at datetime not null,
  foreign key (user_id) references users(id) on delete cascade
);

create index if not exists session_user_id_idx on login_sessions(user_id);
create index if not exists session_expire_at_idx on login_sessions(expire_at);


create table if not exists notification_types (
  type_code varchar(16) primary key,
);

create table if not exists notifications (
  id integer primary key auto_increment,
  title varchar(32) not null,
  content varchar(256) not null,
  notice_type varchar(16) not null,
  user_id integer,
  created_at datetime default current_timestamp(),
  foreign key(notice_type) references notification_types(type_code) on delete cascade
);

create table if not exists diaries (
  id integer primary key auto_increment,
  title varchar(128) not null,
  content text,
  like_count integer not null default 0,
  dislike_count integer not null default 0,
  writer_id integer not null,
  foreign key(writer_id) references users(id) on delete cascade,
  created_at datetime default current_timestamp()
);

create index if not exists diary_title_idx on diaries(title);
