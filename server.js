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

app.get("/",(req,res)=>{

  res.render("dangnhap",{a:""})
})
app.get("/dangki",(req,res)=>{

  res.render("dangki",{a:""})
})




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
                  matkhau:req.body.matkhau
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
var ac=null;

app.get("/trangchu/:id",(req,res)=>{
  var array=[];
  var  userketban; 
  let sql = "select * from Chapnhanadd where idNhan = "+req.params.id+"";
  var  ketban = syncSql.mysql(config,sql).data.rows;
  {
    for(let i=0 ;i< ketban.length;i++){
      let usersql = "select * from Users where id = "+ketban[i].idGui+"";
      userketban = syncSql.mysql(config,usersql).data.rows;
      for(let i=0 ;i<userketban.length;i++){
        array.push(userketban[i])
      
      }
 
    }
    
  }

  let sqlsearch = "select * from Users where sdt = "+ac+""
  search = syncSql.mysql(config,sqlsearch).data.rows;
  if(search.length==0){
    search="";
  }
  
  var arraybanbe=[];
  let sqlMenber = "select * from menber where iduser = "+req.params.id+"";
  Member = syncSql.mysql(config,sqlMenber).data.rows;
  for(let i=0 ;i<  Member.length;i++){
    let usersql1 = "select * from Users where id = "+ Member[i].idNhan+"";
    let userketban1 = syncSql.mysql(config,usersql1).data.rows;
    for(let i=0 ;i<userketban1.length;i++){
      arraybanbe.push(userketban1[i])
    
    }
  }


  res.render("trangchu",{id:req.params.id,search:search,kbUser:array,ban:arraybanbe});
 
})
app.post("/search",upload.fields([]),(req,res)=>{
  ac=req.body.sdt;
  res.redirect(`trangchu/${req.body.id}`)
})
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
  
  res.redirect(`http://localhost:3000/trangchu/${req.params.idGui}`)
})

app.get("/luubanbe/:id/:idkb",(req,res)=>{
  var tenTrCh = req.params.id+req.params.idkb
  // let sqltrochuyen = 'INSERT INTO  TroChuyen  set ?';
  // let paramTroChuyen={
  //     tenTroChuyen:tenTrCh,
  // }
  // db.query(sqltrochuyen,paramTroChuyen,(err,data)=>{
  //     if(err){
  //         console.log(err)}
  // })

  let sqlTimTenTT = "select * from TroChuyen where tenTroChuyen = "+tenTrCh+"";
  TimTenTT = syncSql.mysql(config,sqlTimTenTT).data.rows;
  var idTroChuyen= TimTenTT[0].id;
  console.log("id tro chuyen"+idTroChuyen);

  let sqlMenber = 'INSERT INTO  menber  set ?';
  let param={
      idTroChuyen:idTroChuyen,
      iduser:req.params.id,
      idNhan:req.params.idkb,
  }
 
  db.query(sqlMenber,param,(err,data)=>{
      if(err){
          console.log(err)}
  })
  let sql2 = 'INSERT INTO  menber  set ?';
  let param2={
    idTroChuyen:idTroChuyen,
    iduser:req.params.idkb,
    idNhan:req.params.id,
  }
 
  db.query(sql2,param2,(err,data)=>{
      if(err){
          console.log(err)}
  })
  let sqldele = 'DELETE FROM  Chapnhanadd  Where idGui= '+req.params.idkb+'';
 
  db.query(sqldele,(err,data)=>{
      if(err){
          console.log(err)}
  })
  res.redirect(`http://localhost:3000/trangchu/${req.params.id}`)
})
app.listen(3000,()=>{
    console.log("Listening on port "+3000);
  });