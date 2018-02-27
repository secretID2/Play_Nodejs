var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

//deal with post
var bodyParser     =        require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



/*var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = 'd6F3Efeq';*/

//global vars
var chatRooms={};
var RoomUsers={};
var RoomLog={};

/*function encrypt(text){
  var cipher = crypto.createCipher(algorithm,password)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}
 
function decrypt(text){
  var decipher = crypto.createDecipher(algorithm,password)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}*/


function RoomsNamesToCSV(){
    var out='';
    for(roomName in chatRooms){
        //last room
       out+=roomName+'\t';
    }
    //take out the last 2 characters
    out=out.substr(0,out.length-1);
    return out;
}

//------------Main-----------
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.post('/:roomName', function(req, res){
    console.log(req.body);
    
    var roomName=req.body.roomName;
    var pass=req.body.roomPass;
    console.log(chatRooms[roomName]);
    
    if(chatRooms[roomName]==null ){
        chatRooms[roomName]=pass;
        var users={};
        RoomUsers[roomName]=users;
        var log=[];
        RoomLog[roomName]=log;
        console.log('created room:'+roomName);
        
    }
    
    if(pass.localeCompare(chatRooms[roomName])==0){
        res.sendFile(__dirname + '/chat.html');
    }
    else{
        res.writeHead(200);
        return res.end("Access denied"); 
    }

});

io.on('connection', function(socket){
    console.log("Connected to websocket:"+socket.id); 
    setInterval(function(){socket.emit('date',new Date())},1000);
    //chat.html
    socket.on('insert user in chat', function (msg) {
        var room=msg;
        console.log('inserting new user:'+socket.id+' in room:'+room);
        //in RoomUsers there is a a dictionary
        var users=RoomUsers[room];
        console.log('teste:'+ users);
        users[socket.id]=socket;
        socket.emit('insert user in chat','Connected');
        if(RoomLog[room]!=null){
                var room_users=RoomUsers[room];
                for(socket_id in room_users){
                    //room_users value are the users respective socket
                    var log=RoomLog[room];
                    for(i=0;i<log.length;i++){
                        room_users[socket_id].emit('message',log[i]);
                    }
                }
        }
    }); 
    socket.on('message', function (msg) {
        //console.log(msg);
        //io.emit('message',msg);
        var room=msg.split('$#/$')[0];
        var real_msg=msg.split('$#/$')[1];
        var room_users=RoomUsers[room];
        for(socket_id in room_users){
            //room_users value are the users respective socket
            var log=RoomLog[room];
            log.push(real_msg);
            room_users[socket_id].emit('message',real_msg);
        }
    }); 
    //index.html
    socket.on('new room',function(){
        console.log('Someone created new room');
        setTimeout(function(){io.emit('give me rooms',RoomsNamesToCSV())},1000);
    });
    
    socket.on('give me rooms',function(){
        socket.emit('give me rooms',RoomsNamesToCSV());
    });
    //io.sockets.connected[clients[0]].emit("chat message", "Howdy, User 1!");
    //io.sockets.connected[clients[1]].emit("chat message", "Hey there, User 2");
    socket.on('disconnect', function () {
        console.log('Disconnected:'+socket.id);
        //tirar user da RoomUsers e de outros sitios
    });    
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});