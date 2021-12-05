const express = require('express');
const multer = require('multer');

const app = express();
const upload = multer();

app.use(express.json({extended: false}));
app.use(express.static('./templates'));
app.set('view engine','ejs');
app.set('views','./templates');

//config AWS
const AWS =require('aws-sdk');
const {on} = require('nodemon');
const config = new AWS.Config({
  accessKeyId:"",
  secretAccessKey:"",
  region:"",
});
AWS.config= config;
const docClient = new AWS.DynamoDB.DocumentClient();
const tableName="CongTy";



app.get("/",(req, res)=>{
 
      return res.render("index",{datas:""});
    

  
});

app.post("/",upload.fields([]),(req, res)=>{
  docClient.put({
    TableName:tableName,

    Item:{
    ma:req.body.ma,
    ten:req.body.ten,
    url:req.body.url,
    }
  },(err,data)=>{
    if(err){
      return res.send("Lỗi thêm dữ liệu");
    }else{
      return res.redirect("/");
      // res.send("sucess");
    }
  });
});

app.get("/delete/:ma",(req, res)=>{
  docClient.delete({
    TableName: tableName,
    Key:{
      "ma":req.params.ma,
    }
  },(err,data)=>{
    if(err){
      return res.send("Lỗi Xóa dữ liệu");
    }else{
      return res.redirect("/");
    }
  });
  
});

app.get("/products/:id",(req, res)=>{
  docClient.get({
    TableName: tableName,
    Key:{
      "ma":req.params.id
    }
  },
    (err,data)=>{
      if(err){
        res.send("Lối chyuển sang form cập nhật dữ liệu");
      }else{
        // return res.send(data.Item);
        // res.render("index",{data1:data.Item});
        //  bao1=data.Item;
        
        res.render("product",{products:data.Item.products,congty:data.Item});
        // res.send(data.Item.products);
        //  res.send(bao);
      }
  });
    // res.render("product");
    
  });

app.listen(3000,()=>{
  console.log("Listening on port" + 3000);
});