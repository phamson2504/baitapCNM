const chatForm = document.getElementById('chat-form');
var a = document.getElementById("myId").value;
var b = document.getElementById("freId").value;
const chatMessages = document.querySelector('.content_chat_center');
var x = document.getElementById("myImg").src;
var idroom = document.getElementById("idRoom").value;
var imageMe = document.getElementById("anhCuaToi").src;

const socket = io();


socket.emit('addUser',a);
var times;
socket.on("getUsers",({users,time})=>{
    times =time;
})
function sendFile(){
    var fullPath = document.getElementById('fileSender').files[0].name;
    var duoi=fullPath.substring(fullPath.length-4,fullPath.length);

    var image = Date.now()+duoi;
    console.log(image);
        socket.emit("sendFile",{
                
            senderId:a,
            recevierId:b,
            image:imageMe,
     
        
        })
      
}
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
  
    // Get message text
    let msg = e.target.elements.msg.value;
  
    msg = msg.trim();
  
    if (!msg) {
      return false;
    }
    // Emit message to server
    socket.emit("sendMess",{
        senderId:a,
        recevierId:b,
        idRoom:idroom,
        image:imageMe,
        text:msg
    })
  
    outputMessage(msg,imageMe);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    // Clear input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
    
  });

  function outputMessage(message,anh) {
    const div = document.createElement('div');
    div.classList.add('outgoing_chats');
    div.innerHTML=`<div class="outgoing_chat_msg">
            <!-- chat -->
            <p>${message}</p>
            <!-- time -->
            <span class="time">${times}</span>

        </div>
        <div class="outgoing_chats">
            <img class="outgoing_chats_img" src="${anh}" alt="">
        </div>
        </div>`
        document.querySelector('.content_chat_center').appendChild(div);
  }
socket.on("getMess",data=>{
    var hinhanhsend=data.text;
    var valTest=hinhanhsend.substring(hinhanhsend.length-4,hinhanhsend.length);
    console.log(data.text)
    if(valTest==".png"||valTest==".jpg"){
        const div = document.createElement('div');
        div.classList.add('received_chats');
        div.innerHTML=` <div class="received_chats_img">
            <img src="${data.image}" alt="">
        </div>
        <div class="received_msg">
            <div class="received_msg_inbox">
                <!-- chat -->
                <p><img src="/images/${data.text}" alt="" style="width: 150px; height: 100px;"></p>
                <!-- time -->
                <span class="time">${data.time}</span>

            </div>
        </div>`
        document.querySelector('.content_chat_center').appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }else{
        const div = document.createElement('div');
        div.classList.add('received_chats');
        div.innerHTML=` <div class="received_chats_img">
            <img src="${data.image}" alt="">
        </div>
        <div class="received_msg">
            <div class="received_msg_inbox">
                <!-- chat -->
                <p>${data.text}</p>
                <!-- time -->
                <span class="time">${data.time}</span>
    
            </div>
        </div>`
        document.querySelector('.content_chat_center').appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
   
})