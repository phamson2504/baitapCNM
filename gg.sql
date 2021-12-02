create database baitap;

use baitap;


CREATE TABLE Users (
	id int NOT NULL AUTO_INCREMENT,
    ten varchar(255) NOT NULL,
    sdt varchar(255) NOT NULL,
    email varchar(255),
    anh varchar(255),
    matkhau varchar(255),
    ngaysinh varchar(255),
	gioitinh varchar(255),
    emailToken varchar(255),
    isVerify boolean, 
    role boolean, 
    ngayKhoitao datetime, 
    PRIMARY KEY (id)
);
CREATE TABLE Chapnhanadd (
    id int NOT NULL AUTO_INCREMENT,
    idGui int NOT NULL,
    idNhan int NOT NULL,
    PRIMARY KEY (id)
);
ALTER TABLE Chapnhanadd ADD FOREIGN KEY(idGui) REFERENCES Users(id);

CREATE TABLE  TroChuyen (
    id int NOT NULL AUTO_INCREMENT,
    tenTroChuyen varchar(255) NOT NULL,
	anh varchar(255),
    PRIMARY KEY (id)
);

CREATE TABLE  Frends (
    id int NOT NULL AUTO_INCREMENT,
    idTroChuyen int NOT NULL,
    iduser int NOT NULL,
	idNhan int NOT NULL,
    PRIMARY KEY (id)
);
ALTER TABLE Frends  ADD FOREIGN KEY(idTroChuyen) REFERENCES TroChuyen(id);
ALTER TABLE Frends  ADD FOREIGN KEY(iduser) REFERENCES Users(id);
CREATE TABLE  messages (
    id int NOT NULL AUTO_INCREMENT,
    idTroChuyen int NOT NULL,
    idSender int NOT NULL,
    Texts varchar(255),
    times varchar(255),
    PRIMARY KEY (id)
);
ALTER TABLE messages ADD FOREIGN KEY(idTroChuyen) REFERENCES TroChuyen(id);
ALTER TABLE messages ADD FOREIGN KEY(idSender) REFERENCES Users(id);
CREATE TABLE  memberNhom (
    id int NOT NULL AUTO_INCREMENT,
    idTroChuyen int NOT NULL,
    iduser int NOT NULL,
    PRIMARY KEY (id)
);
ALTER TABLE memberNhom  ADD FOREIGN KEY(idTroChuyen) REFERENCES TroChuyen(id);
ALTER TABLE memberNhom  ADD FOREIGN KEY(iduser) REFERENCES Users(id);

insert into  messages (idTroChuyen,idSender, Texts) values ("1","1","idSender");
insert into  messages(idTroChuyen,idSender, Texts) values ("1","2","idSender");
select * from Users;
select * from  TroChuyen;
select * from TroChuyen where tenTroChuyen like "%4%" && tenTroChuyen like "%6%";
delete from Chapnhanadd where id=2 ;
delete  from Users where id=3;
use node_twitterclone;
select * from tweest;

