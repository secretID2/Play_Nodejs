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
    //clients.push(socket.id);
    setInterval(function(){socket.emit('date',new Date())},1000);
    
    //io.sockets.connected[clients[0]].emit("chat message", "Howdy, User 1!");
    //io.sockets.connected[clients[1]].emit("chat message", "Hey there, User 2");
    socket.on('disconnect', function () {
        io.emit('date','user:'+socket.id+' disconnected');
    });    
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
