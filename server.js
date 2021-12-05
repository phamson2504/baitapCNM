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
var AWS = require('aws-sdk');
const {v4:uuid} =require("uuid");


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
  limits:{fileSize:2000000},
})
const s3= new AWS.S3({
  accessKeyId:'AKIAV76VXQMSDLJVMIMR',
  secretAccessKey:'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',
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
const addUser=(userId,socketId,idRoom)=>{
  const user = { userId,socketId,idRoom};
  !users.some
    users.push(user);

  
}
var time=moment().format('lll'); 
io.on('connection', (socket) => {

  socket.on('addUser',(userid,idRoom)=>{
    addUser(userid, socket.id,idRoom);
    const user =getUser(userid);
    socket.join(user.idRoom);
    io.emit("getUsers",{users,time})
  })

  
  socket.on("sendMess",({senderId,idRoom,image,text})=>{
    const user =getUser(senderId);
    console.log(users)
    
    if(user!=null){
      io.to(user.idRoom).emit("getMess",{
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
  socket.on("sendFile",({senderId,idRoom,image})=>{
    const user =getUser(senderId);
    console.log(users)
    let iRoomZ = user.idRoom;
    function intervalFunc() {
     
      console.log("da send")
      let sql = "select * from messages ORDER BY id DESC LIMIT 1;";
      let  hinhanh = syncSql.mysql(config,sql).data.rows;
      if(user!=null){
        io.to(iRoomZ).emit("getMess",{
          image,
          senderId,
          text: hinhanh[0].Texts,
          time
          
        })
  
       
      }
    }
    
    setTimeout(intervalFunc, 5500, 'funky');
   })
  const storage1=multer.memoryStorage({
    destination(req,file,callback){
        callback(null,'');
    }
  })
  const upload1=multer({
    storage1,
    limits:{fileSize:2000000},
  })
  app.post("/sendfile",upload1.single('sendfile'),(req,res)=>{
    const image =req.file.originalname.split(".")
    const filetype = image[image.length-1];
    const filePath = `${uuid()+Date.now().toString()}.${filetype}`;
    let sql1 = 'INSERT INTO  messages  set ?';
    let param
   
    if(req.body.idRoom!="")
      param={
        idTroChuyen:req.body.idRoom,
        idSender:req.body.id,
        Texts:filePath,
        times:time
    }
    if(req.body.idRoomNC!="")
      param={
        idTroChuyen:req.body.idRoomNC,
        idSender:req.body.id,
        Texts:filePath,
        times:time
    }
      console.log(req.body.idRoom)
      db.query(sql1,param,(err,data)=>{
          if(err){
              console.log(err)}
      })
      const params1={
        Bucket:"baitap.gg",
        Key: filePath,
        Body:req.file.buffer,
        acl: 'public-read',

    }
    s3.upload(params1,(err,data)=>{
      if(err){
          console.log(err);
          return res.send("loi upload anh");
        }else{
      
        }
      });
      function intervalFunc() {
        res.redirect(`trangchu/${req.body.id}`)
      }
      setTimeout(intervalFunc, 3000, 'funky');
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
  // host: "localhost",
  // port: "3306",
  // user: "root",
  // password: "nhatban1",
  // database: "baitap"
  host: "baitapnhomcnm.crkxbwz5flrz.ap-southeast-1.rds.amazonaws.com",
  port: "3306",
  user: "admin",
  password: "Nhatban1",
  database: "baitap"
  });

  db.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
  });
   var config = {
  //   host: "localhost",
  // port: "3306",
  // user: "root",
  // password: "nhatban1",
  // database: "baitap"
  host: "baitapnhomcnm.crkxbwz5flrz.ap-southeast-1.rds.amazonaws.com",
  port: "3306",
  user: "admin",
  password: "Nhatban1",
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
        db.query('UPDATE  Users  SET  emailToken = ?,isVerify =? WHERE emailToken= ?',["1",true,token],(err,rows)=>{
          if(err){
            console.log(err);
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
  idRoom=null;
  idRoomNC=null;
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
var idRoomNC=null;

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
    let search="";
    if(searchSDT!=""){
      let sqlsearch = "select * from Users where sdt = "+searchSDT+""
      search = syncSql.mysql(config,sqlsearch).data.rows;
      if(search.length==0){
        search="";
      }
    }
  
  
  var arraybanbe=[];
  let sqlMenber = "select * from Frends where iduser = "+req.params.id+" or idNhan = "+req.params.id+"";
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
  var arrayBanchat=[];
  if(idRoom!=null){
    let sqlChat = "select * from Frends where idTroChuyen = "+  idRoom+"";
    let chatArr = syncSql.mysql(config,sqlChat).data.rows;
    // var idBanChat=null;
    var userBanChat;
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
  }
  else{
    let sqlChat = "select * from memberNhom where idTroChuyen = "+  idRoomNC+"";
    let chatArr = syncSql.mysql(config,sqlChat).data.rows;
    // var idBanChat=null;
    var userBanChat;
 
    for(let i=0 ; i<chatArr.length;i++){
          // if( chatArr[i].idNhan == req.params.id){
          //       idBan = chatArr[i].iduser
          // }else{
          //     idBan = chatArr[i].idNhan
          // }
        let userchat = "select * from Users where id = "+chatArr[i].iduser+"";
        userBanChat = syncSql.mysql(config,userchat ).data.rows;
        for(let i =0 ;i< userBanChat.length ; i++){
          arrayBanchat.push(userBanChat[i]);
          
        }
     
    }
  }

  let idCT=null;
  if(idRoom!=null){
    idCT=idRoom
  }
  if(idRoomNC!=null){
    idCT=null;
    idCT=idRoomNC
  }
  
  
  let sqlChat1 = "select * from messages where idTroChuyen = "+  idCT+"";
  let chatArrmess = syncSql.mysql(config,sqlChat1).data.rows;

  let sqlTN = "select * from Users where id !="+req.params.id+""
  let arrayTaoNhom = syncSql.mysql(config,sqlTN).data.rows;

  let arrNhomChat=[];

  let sqlmemberNhom = "select * from memberNhom where  iduser ="+req.params.id+"";
  let  memberNhom= syncSql.mysql(config,sqlmemberNhom).data.rows;
  for(let i =0 ;i<  memberNhom.length ; i++){
    let sqlTroCHuyenNC = "select * from TroChuyen where  id ="+memberNhom[i].idTroChuyen+"";
    let TroCHuyenNC= syncSql.mysql(config,sqlTroCHuyenNC).data.rows;
    for(let i =0 ;i< TroCHuyenNC.length ; i++){
      arrNhomChat.push(TroCHuyenNC[i]);
      
    }
    
  }
  
  let sqlChiTietNC = "select * from TroChuyen where id = "+  idRoomNC+"";
  let arrChiTietNC= syncSql.mysql(config,sqlChiTietNC).data.rows;
 

  res.render("trangchu",{id:req.params.id,user:datauserme,search:search,kbUser:array,ban:arraybanbe,Room:Member
    ,chatArr:chatArrmess,arraybc:arrayBanchat,idRoom:idRoom,hinhanhSend:"",arrTN:arrayTaoNhom,arrNC:arrNhomChat,arrChiTietNC:arrChiTietNC
  ,idRoomNC:idRoomNC});
 
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
//add nhom chat
app.post('/addNhomChat',uploadImage.single('fileNhom'),(req, res) => {    
  const { stuhobbies } = req.body;
  let anh;
  anh = req.file ? req.file.filename: undefined;
  if(stuhobbies.length>=2){
    let sqltrochuyen = 'INSERT INTO  TroChuyen  set ?';
    let paramTroChuyen
    
    if(req.body.tenNhom.length==0){
      paramTroChuyen={
        tenTroChuyen:"Nhom",
        anh:"/images/"+anh
       
    }
    }else{
      paramTroChuyen={
        tenTroChuyen:req.body.tenNhom,
        anh:"/images/"+anh
    }
    }
    
    if(anh == undefined){
      paramTroChuyen={
        tenTroChuyen:req.body.tenNhom,
        anh:"/images/nhom.png"
       
    }
  }
   
    db.query(sqltrochuyen,paramTroChuyen,(err,data)=>{
        if(err){
            console.log(err)}
    })

    let sqlidTT = "select * from TroChuyen ORDER BY id DESC LIMIT 1;";
    let  idTT= syncSql.mysql(config,sqlidTT).data.rows;
      let sqlmemberNhomMe = 'INSERT INTO  memberNhom  set ?';
        let parammemberNhomMe={
          idTroChuyen:idTT[0].id,
          iduser:req.body.id,
        }
        db.query(sqlmemberNhomMe,sparammemberNhomMe,(err,data)=>{
          if(err){
              console.log(err)}
      })
      for(let i = 0 ; i <stuhobbies.length ; i++){
        let sqlmemberNhom = 'INSERT INTO  memberNhom  set ?';
        let parammemberNhom={
          idTroChuyen:idTT[0].id,
          iduser:stuhobbies[i],
        }
        db.query(sqlmemberNhom ,parammemberNhom,(err,data)=>{
            if(err){
                console.log(err)}
        })
      }
  }


  res.redirect(`trangchu/${req.body.id}`)
});
//search tim kiem de them ban
app.post("/search",upload.fields([]),(req,res)=>{
  searchSDT=req.body.sdt;
  
  res.redirect(`trangchu/${req.body.id}`)
})
//timkiemNhom
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
  let sqlMenber = 'INSERT INTO  Frends  set ?';
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
  idRoomNC=null;
  idRoom=req.params.idphong;
  res.redirect(`/trangchu/${req.params.id}`)
})
app.get("/getMessNC/:id/:idphong",(req,res)=>{
  idRoom=null;
  idRoomNC=req.params.idphong;
  res.redirect(`/trangchu/${req.params.id}`)
})


server.listen(process.env.PORT || 3000,()=>{
    console.log("Listening on port "+3000);
});