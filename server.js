const mongo = require('mongoose');

const client = require('socket.io').listen(4000).sockets;
let dateOne = new Date();


// Connect to mongo
mongo.connect('mongodb+srv://root:admin@cluster0-yubmm.mongodb.net/chats?retryWrites=true&w=majority', {
            useNewUrlParser: true})
            //check if connection is working:
            let db = mongo.connection;
            db.on('error', console.error.bind(console, 'connection error:'));
            db.once('open', () => {
                console.log("Mongo connected");


                // Connect to Socket.io
                client.on('connection', function (socket) {
                    let chat = db.collection('chats');

                    // Create function to send status
                    sendStatus = function (s) {
                        socket.emit('status', s);
                    }

                    // Get chats from mongo collection
                    chat.find().limit(100).sort({
                        _id: 1
                    }).toArray(function (err, res) {
                       if (err) {
                          throw err;
                        }

                        // Emit the messages
                        socket.emit('output', res);
                    });

                    // Handle input events
                    socket.on('input', function (data) {
                        let name = data.name;
                        let message = data.message;
                        let date = new Date();
                        console.log("date");                        

                        // Check for name and message
                        if (name == '' || message == '') {
                            // Send error status
                            sendStatus('Please enter a name and message');
                        } else {
                            // Insert message
                            chat.insert({
                                name: name,
                                message: message,
                                date: date
                                
                            }, function () {
                                client.emit('output', data);

                                // Send status object
                                sendStatus({
                                    message: 'Message sent',
                                    clear: true
                                });
                            });
                        }
                    });

                    // Handle clear
                    socket.on('clear', function (data) {
                        // Remove all chats from collection
                        chat.remove({}, function () {
                            // Emit cleared
                            socket.emit('cleared');
                        });
                    });
                });
          });

    