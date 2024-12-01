CREATE DATABASE IF NOT EXISTS appDB;
CREATE USER IF NOT EXISTS 'user'@'%' IDENTIFIED BY 'password';
GRANT SELECT,UPDATE,INSERT,DELETE ON appDB.* TO 'user'@'%';
FLUSH PRIVILEGES;

alter database appDB character set utf8mb4 collate utf8mb4_unicode_ci;
set names utf8;

USE appDB;

create table if not exists users(
    id int auto_increment not null,
    name varchar(40) not null,
    login varchar(40) not null,
    password varchar(100) not null,
    primary key(id),
    unique key (login)
);

create table if not exists tasks(
    id int auto_increment not null,
    toplevelid int,
    name varchar(40) not null,
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
    primary key (user, task),
    foreign key (user) references users(id),
    foreign key (task) references tasks(id)
    on delete cascade
    on update cascade
);
