const { render } = require('ejs');
const express = require('express');
const app = express();
const path = require('path');
const multer = require('multer');
var mysql = require('mysql');
const syncSql = require("sync-sql");
const moment = require('moment');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require("nodemailer");
const cookieParser = require('cookie-parser');
require('dotenv').config;

//tao thu muc luu anh
const storage = multer.diskStorage({
  destination:function(req,file,cb){
    cb(null,'views/images');
  },
  filename: function (req,file,cb) {
    cb(null,Date.now() + path.extname(file.originalname))
  }
});
const uploadImage = multer({
  storage : storage,
})
//tao server io
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

let users=[];
var hinhanhSend=null;
const getUser = (userId)=>{
  const user =users.find( user=>user.userId === userId)
 
  return user;
}
const addUser=(userId,socketId)=>{
  const user = { userId,socketId};
  !users.some
    users.push(user);

  
}
var time=moment().format('lll'); 
io.on('connection', (socket) => {

  socket.on('addUser',userid=>{
    addUser(userid, socket.id);
    io.emit("getUsers",{users,time})
  })

  
  socket.on("sendMess",({senderId,recevierId,idRoom,image,text})=>{
    const user =getUser(recevierId);
    if(user!=null){
      io.to(user.socketId).emit("getMess",{
        image,
        senderId,
        text,
        time
      })
    }
      var sql = "INSERT INTO messages (idTroChuyen,  idSender, Texts, times) VALUES ('"+idRoom+"', '"+senderId+"','"+text+"','"+time+"')";
      db.query(sql, function (err, result) {
          if (err) throw err;
          console.log("1 record inserted");
      });
  })
  
  app.post("/sendfile",uploadImage.single('sendfile'),(req,res)=>{
    let anh;
    anh = req.file ? req.file.filename: undefined;
    if(anh!=undefined){
      let sql1 = 'INSERT INTO  messages  set ?';
      let param={
          idTroChuyen:req.body.idRoom,
          idSender:req.body.id,
          Texts:anh,
          times:time
      }
     
      db.query(sql1,param,(err,data)=>{
          if(err){
              console.log(err)}
      })
    }
   
    hinhanhSend=anh;
    
    res.redirect(`trangchu/${req.body.id}`)
  })
  
 
  socket.on("sendFile",({senderId,recevierId,image})=>{
    function intervalFunc() {
      const user =getUser(recevierId);
      console.log("da send")
      let sql = "select * from messages ORDER BY id DESC LIMIT 1;";
      let  hinhanh = syncSql.mysql(config,sql).data.rows;
      if(user!=null){
        io.to(user.socketId).emit("getMess",{
          image,
          senderId,
          text: hinhanh[0].Texts,
          time
          
        })
  
       
      }
    }
    
    setTimeout(intervalFunc, 1500, 'funky');
   })
  socket.on('disconnect', () => {
    const index = users.findIndex(user => user.socketId === socket.id);

    if (index !== -1) {
      return users.splice(index, 1)[0];
    }
    io.emit("getUsers",users)
   
  })
});
 //midder
app.use(cookieParser());
app.use(express.json({extended: true}));
app.use(express.static('./views'));
app.set('view engine','ejs');
app.set('views','./views');

var db= mysql.createConnection({
    host: "localhost",
  port: "3306",
  user: "root",
  password: "nhatban1",
  database: "baitap"
  });

  db.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
  });
   var config = {
    host: "localhost",
    port: "3306",
    user: "root",
    password: "nhatban1",
    database: "baitap"
   }

  global.db = db;


// form dang nhap
app.get("/",(req,res)=>{

  res.render("dangnhap",{a:""})
})

// form dang ki
app.get("/dangki",(req,res)=>{

  res.render("dangki",{a:""})
})
//gui email xac nhan
var tranporter = nodemailer.createTransport({
  service :'gmail',
    auth:{
      user:"son2504gg@gmail.com",// thay bang tai khoan email 
      pass:"nhatban1" // thay bang mat khau email 
    },
  })
// dang ki
const upload = multer();
app.post('/dangki',upload.fields([]),(req,res)=>{
    var a=null;
    let sql = "select * from Users"
    db.query(sql,(err,data)=>{
          if(err){
            console.log(err)
        }else{
          
          for(let i=0 ; i<data.length ; i++){
            if(data[i].sdt==req.body.sdt){
              a=data[i].sdt
             
            }  
          }
          if(a==null){
            if(req.body.ten.trim()==""||req.body.sdt==""||req.body.matkhau==""){
              res.render("dangki",{a:"vui lòng điền đầy đủ thông tin"})
            
            }
            else{
              let sql1 = 'INSERT INTO  Users  set ?';
              let param={
                  ten:req.body.ten,
                  sdt:req.body.sdt,
                  matkhau:req.body.matkhau,
                  email:req.body.email,
                  anh:"/images/avatar.png",
                  emailToken: crypto.randomBytes(64).toString('hex'),
                  isVerify: false 
              }
             
              db.query(sql1,param,(err,data)=>{
                  if(err){
                      console.log(err)}
                      else{
                        let mailOptions = {
                          from:'"Xac minh email"<demo@gmail.com>',
                          to: req.body.email,
                          subject: 'appchat -xac minh email',
                          html:`<h2>${param.ten}! Cam on da dang ky tai khoan </h2>
                          <h4>Nhan duong link phia duoi de xac minh tai khoan..</h4>
                          <a href="http://localhost:3000/verify-email?token=${param.emailToken}">Xac minh tai khoan</a>`
                        }
                        tranporter.sendMail(mailOptions,function(err,info){
                          if(err){
                            console.log(err);
                          }else{
                            console.log("verify email");
                          }
                        })
                        res.redirect("/");
                      }
              })
          }}else{
            res.render("dangki",{a:"số điện thoại này đã được đăng kí"})
          }
            
        
      }
    })  
})
//xac thuc email
app.get("/verify-email",(req,res) =>{
  const token = req.query.token;
  db.query('select emailToken from Users where emailToken =?',[token],(err,data)=>{
    if(err){
      console.log(err);
    }else{
        db.query('UPDATE users SET  emailToken = ?,isVerify =? WHERE emailToken= ?',["",true,token],(err,rows)=>{
          if(err){
            res.redirect("/dangki");
          }else{
            res.redirect("/");
          }
        })
      }
  })
})
// create jwt dang nhap
const createToken =(id) =>{
  return jwt.sign({id},""+process.env.JWT_SECRET);
}
const loginrequire = (req,res,next) =>{
  const token = req.cookies['access-token']
  if(token){
    const validToken = jwt.verify(token,""+process.env.JWT_SECRET);
    if(validToken){
      res.user = validToken.id;
      next();
    }else{
      console.log('token expires');
    }
  }else{
    console.log('token not found');
    res.redirect("/")
  }
}
//dang nhap
app.post("/dangnhap",upload.fields([]),(req,res)=>{
  var kt=null;
  let sql = "select * from Users"
  db.query(sql,(err,data)=>{
        if(err){
          console.log(err)
      }else{
        
        for(let i=0 ; i<data.length ; i++){
          if(data[i].sdt==req.body.sdt&&data[i].matkhau==req.body.mk){  
            if(data[i].isVerify){            
                kt=data[i].id;   
                const token = createToken(kt);
                res.cookie('access-token',token);
            }else{
              res.render("dangnhap",{a:"email chua xac minh"});
            }
          }  
        }
        if(kt!=null){
          res.redirect(`trangchu/${kt}`)
        }else{
          res.render("dangnhap",{a:"sai số điện thoại hoạc mật khẩu"})
        }
      }
      })
})

//dang xuat
app.get("/logout",(req,res) =>{
  res.cookie('access-token',"",{maxAge: 1});
  res.redirect("/")
})
var searchSDT=null;
var idRoom=null;

// trang chu
app.get("/trangchu/:id",loginrequire,(req,res)=>{
  var array=[];
  let userme = "select * from Users where id = "+req.params.id+"";
  let datauserme = syncSql.mysql(config,userme).data.rows;
  var  userketban; 
  // tim kiem ban bè đang gửi lời mời kết ban
  let sql = "select * from Chapnhanadd where idNhan = "+req.params.id+"";
  let  ketban = syncSql.mysql(config,sql).data.rows;
 

    for(let i=0 ;i< ketban.length;i++){
      // tìm kiếm người gửi trong lời mời kết ban
      let usersql = "select * from Users where id = "+ketban[i].idGui+"";
      userketban = syncSql.mysql(config,usersql).data.rows;
      for(let i=0 ;i<userketban.length;i++){
        // đẩy những người đã gửi lời mời vào array
        array.push(userketban[i])
      }
    }
  let sqlsearch = "select * from Users where sdt = "+searchSDT+""
  search = syncSql.mysql(config,sqlsearch).data.rows;
  if(search.length==0){
    search="";
  }
  
  var arraybanbe=[];
  let sqlMenber = "select * from member where iduser = "+req.params.id+" or idNhan = "+req.params.id+"";
  Member = syncSql.mysql(config,sqlMenber).data.rows;
  var idBan;
  
  
   for(let i=0 ;i<  Member.length;i++){
    if( Member[i].idNhan == req.params.id){
          idBan = Member[i].iduser
    }else{
        idBan = Member[i].idNhan
    }
    let usersql1 = "select * from Users where id = "+  idBan+"";
    let userketban1 = syncSql.mysql(config,usersql1).data.rows;
    for(let i=0 ;i<userketban1.length;i++){
      arraybanbe.push(userketban1[i])
    }
  }
  let sqlChat = "select * from member where idTroChuyen = "+  idRoom+"";
  let chatArr = syncSql.mysql(config,sqlChat).data.rows;
  var idBanChat=null;
  var userBanChat;
  var arrayBanchat=[];
  for(let i=0 ; i<chatArr.length;i++){
        if( chatArr[i].idNhan == req.params.id){
              idBan = chatArr[i].iduser
        }else{
            idBan = chatArr[i].idNhan
        }
      let userchat = "select * from Users where id = "+idBan+"";
      userBanChat = syncSql.mysql(config,userchat ).data.rows;
      for(let i =0 ;i< userBanChat.length ; i++){
        arrayBanchat.push(userBanChat[i]);
      }
   
  }
  let sqlChat1 = "select * from messages where idTroChuyen = "+  idRoom+"";
  let chatArrmess = syncSql.mysql(config,sqlChat1).data.rows;

 
  res.render("trangchu",{id:req.params.id,user:datauserme,search:search,kbUser:array,ban:arraybanbe,Room:Member
    ,chatArr:chatArrmess,arraybc:arrayBanchat,idRoom:idRoom,hinhanhSend:""});
 
})
// update profile
app.post("/trangchu/:id",uploadImage.single('profile'),(req,res) =>{
  let anh;
  anh = req.file ? req.file.filename: undefined;
  let ten = req.body.ten;
  let ngaysinh = req.body.ngaysinh;
  let gioitinh = req.body.gioitinh;
  if(anh == undefined){
    db.query('UPDATE users SET  ten =?,ngaysinh=?,gioitinh = ? WHERE id= ?',
  [ten,ngaysinh,gioitinh,req.params.id],(err,rows) =>{
    if(!err){
      res.redirect(`/trangchu/${req.params.id}`);
    }else{  
      console.log(err);
    }
    
  })
  }
  else{
    hinhanh = "/images/"+anh;
    db.query('UPDATE users SET  anh = ?,ten =?,ngaysinh=?,gioitinh = ? WHERE id= ?',
    [hinhanh,ten,ngaysinh,gioitinh,req.params.id],(err,rows) =>{
      if(!err){
        res.redirect(`/trangchu/${req.params.id}`);
      }else{  
        console.log(err);
      }
      
    })
  }

})
//search tim kiem de them ban
app.post("/search",upload.fields([]),(req,res)=>{
  searchSDT=req.body.sdt;
  
  res.redirect(`trangchu/${req.body.id}`)
})
//sendfile

//gui messs
app.post("/guiMess",upload.fields([]),(req,res)=>{
  res.redirect(`trangchu/${req.body.id}`)
})
// them vao danh sach dang gui loi moi ket ban
app.get("/them/:idGui/:idNhan",(req,res)=>{
  
    let sql1 = 'INSERT INTO  Chapnhanadd  set ?';
    let param={
        idGui:req.params.idGui,
        idNhan:req.params.idNhan,
    }
   
    db.query(sql1,param,(err,data)=>{
        if(err){
            console.log(err)}
    })
  
  res.redirect(`/trangchu/${req.params.idGui}`)
})

// tạo room trò chuyện
// luu ban be vào danh sách
// xóa và xóa khỏi danh sách gửi lời mời 
app.get("/luubanbe/:id/:idkb",(req,res)=>{
  // tạo room trò chuyện
  var tenTrCh = req.params.id+req.params.idkb
  let sqltrochuyen = 'INSERT INTO  TroChuyen  set ?';
  let paramTroChuyen={
      tenTroChuyen:tenTrCh,
  }
  db.query(sqltrochuyen,paramTroChuyen,(err,data)=>{
      if(err){
          console.log(err)}
  })
  // tìm kiếm  room da tạo
  let sqlTimTenTT = "select * from TroChuyen where tenTroChuyen = "+tenTrCh+"";
  TimTenTT = syncSql.mysql(config,sqlTimTenTT).data.rows;
  var idTroChuyen= TimTenTT[0].id;
  // luu ban be vào danh sách
  let sqlMenber = 'INSERT INTO  member  set ?';
  let param={
      idTroChuyen:idTroChuyen,
      iduser:req.params.id,
      idNhan:req.params.idkb,
  }
 
  db.query(sqlMenber,param,(err,data)=>{
      if(err){
          console.log(err)}
  })
  // xóa và xóa khỏi danh sách gửi lời mời 
  let sqldele = 'DELETE FROM  Chapnhanadd  Where idGui= '+req.params.idkb+'';
 
  db.query(sqldele,(err,data)=>{
      if(err){
          console.log(err)}
  })
  res.redirect(`/trangchu/${req.params.id}`)
})
app.get("/getMess/:id/:idphong",(req,res)=>{
  idRoom=req.params.idphong;
  res.redirect(`/trangchu/${req.params.id}`)
})

server.listen(3000,()=>{
    console.log("Listening on port "+3000);
});