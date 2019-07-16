(function () {
    let element = function (id) {
        return document.getElementById(id);
    }
    // Get Elements
    let status = element('status');
    let messages = element('messages');
    let textarea = element('textarea');
    let username = element('username');
    let clearBtn = element('clear');
   

    // Set default status
    let statusDefault = status.textContent;
    let setStatus = function (s) {
        // Set status
        status.textContent = s;
        if (s !== statusDefault) {
            var delay = setTimeout(function () {
                setStatus(statusDefault);
            }, 4000);
        }
    }
    // Connect to socket.io
    let socket = io(); // adresse ip local de celui qui est heberge le serveur 
    // Check for connection
    if (socket !== undefined) {
        console.log('Connected to socket...');
        // Handle Output
        socket.on('output', function (data) {
            if (data.length) {
                for (var x = 0; x < data.length; x++) {
                    // Build out message div
                    var message = document.createElement('div');
                    message.setAttribute('class', 'chat-message');
                    message.innerHTML = `${data[x].name}: ${new Date(data[x].createdAt).toLocaleTimeString()}<br> ${data[x].message} `;
                    messages.appendChild(message);
                  //  messages.insertBefore(message, messages.firstChild);
                }
            }
        });
        // Get Status From Server
        socket.on('status', function (data) {
            // get message status
            setStatus((typeof data === 'object') ? data.message : data);
            // If status is clear, clear text
            if (data.clear) {
                textarea.value = '';
            }
        });
        // Handle Input
        textarea.addEventListener('keydown', function (event) {
           
            if (event.which === 13 && event.shiftKey == false) {
                // Emit to server input
                socket.emit('chat message', {
                    name: username.value,
                    message: textarea.value,
                   
                     
                });
                
                event.preventDefault();
            }
        }) 
        // Handle Chat Clear
        clearBtn.addEventListener('click', function () {
            socket.emit('clear');
           
        });
        // Clear Message
        socket.on('cleared', function () {
            messages.textContent = '';
            
        });
    }
})();

// Your web app's Firebase configuration
 let firebaseConfig = {
    apiKey: "AIzaSyC7-p8jyrob01xdvnB3qbneHGhkxsuA3Qc",
    authDomain: "chatnode-3d474.firebaseapp.com",
    databaseURL: "https://chatnode-3d474.firebaseio.com",
    projectId: "chatnode-3d474",
    storageBucket: "",
    messagingSenderId: "857884631503",
    appId: "1:857884631503:web:2d7fbcdedb9e3c0e"

 };

 firebase.initializeApp(firebaseConfig);
  let logBtn= document.getElementById('login');
 logBtn.addEventListener('click', function () {

 let provider = new firebase.auth.GithubAuthProvider();
 firebase.auth().signInWithPopup(provider).then(function(result) {
// // This gives you a GitHub Access Token. You can use it to access the GitHub API.
 let token = result.credential.accessToken;
// // The signed-in user info.
 let user = result.user;
alert('login firebase OK');
 }).catch(function(error) {
// // Handle Errors here.
 let errorCode = error.code;
 let errorMessage = error.message;
// // The email of the user's account used.
 let email = error.email;
// // The firebase.auth.AuthCredential type that was used.
 let credential = error.credential;
 
 });
 })