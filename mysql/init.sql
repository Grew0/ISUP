CREATE DATABASE IF NOT EXISTS appDB;
CREATE USER IF NOT EXISTS 'user'@'%' IDENTIFIED BY 'password';
GRANT SELECT,UPDATE,INSERT,DELETE ON appDB.* TO 'user'@'%';
FLUSH PRIVILEGES;

alter database appDB character set utf8mb4 collate utf8mb4_unicode_ci;
set names utf8;

USE appDB;

create table if not exists users(
    id int auto_increment not null,
    name text not null,
    login varchar(40) not null,
    password text not null,
    primary key(id),
    unique key (login)
);

create table if not exists tasks(
    id int auto_increment not null,
    toplevelid int,
    name text not null,
    descript text not null,
    deadline timestamp not null,
    priority smallint not null,
    isclosed smallint(1) not null,
    ownerid int not null,
    primary key(id),
    foreign key(ownerid) references users(id),
    foreign key(toplevelid) references tasks(id)
    on delete cascade
    on update cascade
);

create table if not exists comments (
    id int auto_increment not null,
    task int not null,
    content text not null,
    date timestamp default CURRENT_TIMESTAMP,
    writer int not null,
    primary key (id),
    foreign key (writer) references users(id),
    foreign key (task) references tasks(id)
    on delete cascade
    on update cascade

);

create table if not exists subs (
    user int not null,
    task int not null,
    watched boolean not null default 1,
    foreign key (user) references users(id)
    on delete cascade
    on update cascade,
    foreign key (task) references tasks(id)
    on delete cascade
    on update cascade
);

create table if not exists alerts (
    id int not null auto_increment,
    writer int not null,
    task int not null,
    descript text not null,
    isclosed smallint(1) not null default 0,
    primary key(id),
    foreign key (writer) references users(id)
    on delete cascade 
    on update cascade,
    foreign key (task) references tasks(id)
    on delete cascade
    on update cascade
);