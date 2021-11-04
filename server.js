const { render } = require('ejs');
const express = require('express');
const multer = require('multer');
var mysql = require('mysql');
const syncSql = require("sync-sql")
var control = require("./controller")

const app = express();

app.use(express.json({extended: false}));
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
                  anh:"/images/avatar.png"
              }
             
              db.query(sql1,param,(err,data)=>{
                  if(err){
                      console.log(err)}
                      else{
                        res.redirect("/")
                      }
              })
          }}else{
            res.render("dangki",{a:"số điện thoại này đã được đăng kí"})
          }
            
        
      }
    })  

})
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
                kt=data[i].id;   
                console.log(kt) 
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


var searchSDT=null;
var idRoom=null;
// trang chu
app.get("/trangchu/:id",(req,res)=>{
  var array=[];
  let userme = "select * from Users where id = "+req.params.id+"";
  let datauserme = syncSql.mysql(config,userme).data.rows;
  var  userketban; 
  // tim kiem ban bè đang gửi lời mời kết ban
  let sql = "select * from Chapnhanadd where idNhan = "+req.params.id+"";
  var  ketban = syncSql.mysql(config,sql).data.rows;
  {
    for(let i=0 ;i< ketban.length;i++){
      // tìm kiếm người gửi trong lời mời kết ban
      let usersql = "select * from Users where id = "+ketban[i].idGui+"";
      userketban = syncSql.mysql(config,usersql).data.rows;
      for(let i=0 ;i<userketban.length;i++){
        // đẩy những người đã gửi lời mời vào array
        array.push(userketban[i])
      }
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
  console.log(  arrayBanchat)
  
  res.render("trangchu",{id:req.params.id,user:datauserme,search:search,kbUser:array,ban:arraybanbe,Room:Member
    ,chatArr:chatArr,arraybc:arrayBanchat});
 
})
//search tim kiem de them ban
app.post("/search",upload.fields([]),(req,res)=>{
  searchSDT=req.body.sdt;
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
  console.log("id tro chuyen"+idTroChuyen);
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
app.listen(3000,()=>{
    console.log("Listening on port "+3000);
});