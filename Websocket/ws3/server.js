var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var request = require('request');
//deal with post
var bodyParser     =        require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var new_room=false;


var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = 'd6F3Efeq';

//global vars
var chatRooms={'1':'123','2w':'222'};
var RoomUsers={};
var RoomLog={};

function encrypt(text){
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
}


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
app.post('/createRoom',function(req,res){
    console.log(req.body+'->create room');
    var roomName=req.body.roomName;
    var pass=req.body.roomPass;
    res.send(roomName+':'+pass);
    chatRooms[roomName]=pass;
    RoomUsers[roomName]={};
    RoomLog[roomName]=[];
    
    

    
});

app.post('/:roomName', function(req, res){
    console.log(req.body);
    
    var roomName=req.body.roomName;
    var pass=req.body.roomPass;
    console.log(chatRooms[roomName]);
    
    if(chatRooms[roomName]==null ){
        chatRooms[roomName]=pass;
        RoomUsers[roomName]={};
        RoomLog[roomName]=[];
        console.log('created room');
        //new_room=true;
    }
    /*if(new_room){
        //redirect
        res.writeHead(302,{'Location':'/'+roomName})
        return res.end();
    }*/
    if(pass.localeCompare(chatRooms[roomName])==0){
        res.sendFile(__dirname + '/chat.html');
    }
    else{
        res.writeHead(200);
        return res.end("Access denied"); 
    }
 
});


app.post('/accessRoom/:roomName',function(req,res){
    console.log(req.body);
    var roomName=req.params.roomName;
    var pass=req.body.roomPass;
    res.writeHead(301,{'Set-Cookie':roomName+'='+pass+';','Location':'/'+roomName});//});
    res.end('AccessRoom='+roomName+':'+pass);
    
});


io.on('connection', function(socket){
    console.log("Connected to websocket:"+socket.id); 
    //clients.push(socket.id);
    setInterval(function(){socket.emit('date',new Date())},1000);
    
    /*if(new_room){
        io.emit('give me rooms',RoomsNamesToCSV());
        new_room=false;
    }*/
    
    
    
    socket.on('message', function (msg) {
        console.log(msg);
        io.emit('message',msg);
    }); 
    socket.on('new room',function(){
        io.emit('give me rooms',RoomsNamesToCSV());
    });
    
    socket.on('give me rooms',function(){
        socket.emit('give me rooms',RoomsNamesToCSV());
    });
    //io.sockets.connected[clients[0]].emit("chat message", "Howdy, User 1!");
    //io.sockets.connected[clients[1]].emit("chat message", "Hey there, User 2");
    socket.on('disconnect', function () {
        console.log('Disconnected:'+socket.id);
    });    
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
