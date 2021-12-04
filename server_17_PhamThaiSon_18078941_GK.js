const express= require("express");
const multer=require("multer");
const path =require('path');
const app = express();
const {v4:uuid} =require("uuid");

app.use(express.static('.views_17_PhamThaiSon_18078941_GK'));
app.set("view engine","ejs");
app.set("views","./views_17_PhamThaiSon_18078941_GK");

const AWS=require("aws-sdk");




app.get("/",(req,res)=>{
   
  
            return res.render("index_17_PhamThaiSon_18078941_GK")
   
})


// const COLUD_FRONT_URL="https://dxvkj2f1eb7sd.cloudfront.net/";
const storage=multer.memoryStorage({
    destination(req,file,callback){
        callback(null,'');
    }
})

const upload=multer({
    storage,
    limits:{fileSize:2000000},
    fileFilter(req,file,cb){
     
    },
})

app.post("/",upload.single('image'),(req,res)=>{
 
    const image =req.file.originalname.split(".")
    const filetype = image[image.length-1];
    const filePath = `${uuid()+Date.now().toString()}.${filetype}`;
    
    const params={
        Bucket:"baitap.gg",
        Key: filePath,
        Body:req.file.buffer,
        acl: 'public-read',

    }
    s3.upload(params,(err,data)=>{
        if(err){
            console.log(err);
            return res.send("loi upload anh");
            
           
        }
        else{
           
                
        
            res.redirect("/")
        }
   })

   
})

app.get("/delete/:id",(req,res)=>{
   
    docClient.delete({
        TableName:tableName,
        Key:{
            "maTour":req.params.id
        }
    },
    (err,data)=>{
        if(err){
            res.send("loi xoa du lieu")
        }else{
            return res.redirect("/")
        }
    })
})
app.listen(process.env.PORT||3000,()=>{
    console.log("listening on port"+3000)
})