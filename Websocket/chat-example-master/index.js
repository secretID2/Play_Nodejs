var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var clients=[];



app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    console.log("Connected to websocket:"+socket.id); 
    clients.push(socket.id);
  socket.on('chat message', function(msg){
     
    //io.emit('chat message', msg);
    
        
    io.sockets.connected[clients[0]].emit("chat message", "Howdy, User 1!");
    io.sockets.connected[clients[1]].emit("chat message", "Hey there, User 2");
        
     
    
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
