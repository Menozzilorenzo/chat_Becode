const express = require('express');
const app = express()
const http = require('http').Server(app);
const io = require('socket.io')(http);
const mongo = require('mongoose'); 

app.use(express.static(__dirname + "/"));

// Connect to mongo
mongo.connect('mongodb+srv://root:admin@cluster0-yubmm.mongodb.net/chats?retryWrites=true&w=majority', {
            useNewUrlParser: true})
            //check if connection is working:
let db = mongo.connection;
let tableChat= new mongo.Schema({
    name:String,
    message:String,
}, {
    timestamps:true,
})


let chat = mongo.model("chats",tableChat);

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log("Mongo connected");
    io.on('connection', function(socket){
        // Create function to send status
        sendStatus = function (s) {
            io.emit('status', s);
        }
    
        // Get chats from mongo collection
        chat.find().then(function (res) {
            // Emit the messages
            socket.emit('output', res);
        }).catch(err => {
            console.log("Error : ", err.message)
        })
        socket.on('chat message', function(msg){
            console.log("message received")
            let name = msg.name;
            let message = msg.message;
           
            
           // let date = new Date();
            // Check for name and message
            if (name == '' || message == '') {
                // Send error status
                sendStatus('Please enter a name and message');
            } else {
                // Insert message
                new chat({
                    name:name,
                    message:message,
                    
                  //  date:date
                }).save().then(data => {
                    socket.emit('output', [data]);
    
                    // Send status object
                    sendStatus({
                        message: 'Message sent',
                        clear: true
                    });
                }).catch(err => {
                    console.log(err)
                })
            }
        });
         // Handle clear
         socket.on('clear', function (data) {
            // Remove all chats from collection
            chat.remove({}, function () {
                // Emit cleared
                socket.emit('cleared');
            });
        })
    });
    let port = process.env.PORT || 3000
    http.listen(port, function(){
        console.log("server is runing on PORT 3000")
    });
})

app.get("/", function(req, res){
     res.sendFile(__dirname + '/index.html');
})