var express        =        require("express");
var app            =        express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
//deal with post
var bodyParser     =        require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = 'd6F3Efeq';

//global vars
var chatRooms={'1':'123'};
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

function makeid() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 50; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}
function compareStrings(st1,st2){
			var compare=false;
			var n=0;
            console.log(st1+"="+st2+" size:"+st1.length+":"+st2.length);
			for(i=0;i<st1.length;i++){
				if(st1[i]==st2[i])
					n++;
				else
					break;
			}
			if(n==st1.length) {//&& st1.length==st2.length)//this does not work because the password is not a string is something else because fs.ReadFile returns bytes.
				compare=true;
            }
			return compare	
}
function parser(data){
    var d={};
    var vars=data.split("&");
    vars.forEach(function(variable){
                    var name=variable.split("=")[0];
                    var value=variable.split("=")[1];
                    d[name]=value;
                                   
                });
    return d;
}

function CheckValidClient(username,secure_hash){
    for (key in clients){
        //here it does not have the sam eproblem as checklogin because I think here every think is really a string but in check login they were bytes???s
        if(key.localeCompare(username)==0 && clients[key].localeCompare(secure_hash)==0){
            return true;
        }
    }
    return false;
}
function RoomsNamesToCSV(){
    var out='';
    for(i=0;i<chatRooms.length;i++){
        //last room
        if(i==chatRooms.length-1){
            out+=chatRooms[i];
        }
        else{
            out+=chatRooms+'\t';
        }
    }
    return out;
}
//Main-------------------
app.get('/', function(req, res) {
    //res.sendFile needs absolut path which means C://.../... __dirname is the working directory
    res.sendFile(__dirname+'/index.html');
});

app.post('/accessRoom/:roomName',function(req,res){
    var roomName=req.params.roomName;
    var pass=req.body.roomPass;
    if(pass.localeCompare(chatRooms[roomName])==0){
        //valid user
        res.writeHead(302,{'Set-Cookie':'','Location':'/'+roomName});
        res.end();
    }
    else{
        res.send('Access Denied!');
    }
    
});

app.get('/:roomName',function(req,res){
    roomName=req.params.roomName;
    if(roomName.localeCompare('')==0){
        
    }
    else{
        
        const { headers } = req;
        console.log(headers.cookie);
        var cookie=headers.cookie;
        if(cookie==null){
            res.send("Access Denied!");
        }
        var room_name=cookie.split("=")[0];
        var roomPass=cookie.split("=")[1];
        roomPass=decrypt(roomPass);
        if(roomName.localeCompare(room_name)==0 && roomPass.localeCompare(chatRooms[room_name])==0){
            //valid user
            res.sendFile(__dirname+'/chat.html')
        }
    }
    
});
app.post('/createRoom',function(req,res){
    var room_name=req.body.roomName;
    var room_pass=req.body.roomPass;
    
    for(key in chatRooms){
        if(room_name.localeCompare(key)==0){
            //match
            res.send('Room Name already exists');
        }
    }
    chatRooms[room_name]=room_pass;
    var clients=[];
    clients.push(socket.id);
    RoomUsers[room_name]=clients;
    var log=[];
    RoomLog[room_name]=log;
    
    res.writeHead(302,{'Set-Cookie':'roomName='+encrypt(room_pass),'Location':'/'+room_name});
    res.end();
});


http.listen(port, function(){
  console.log('listening on *:' + port);
});


//Handling websockets
io.on('connection', function(socket){
    console.log("Connected to websocket:"+socket.id);
    
    //clients.push(socket.id);
    socket.on('give me rooms', function(msg){
             //io.emit to send to all socket.emit to send to individual
             socket.emit('give me rooms', RoomsNamesToCSV());

            /*clients.forEach(function(client){
                io.sockets.connected[client].emit("chat message", msg);

            });    */
            //io.sockets.connected[clients[0]].emit("chat message", "Howdy, User 1!");
            //io.sockets.connected[clients[1]].emit("chat message", "Hey there, User 2");

    });
    
    
    /*socket.on('disconnect', function () {
        //io.emit('user disconnected');
        console.log("user:"+socket.id+" disconnected!");
    });    */
    
});
    
