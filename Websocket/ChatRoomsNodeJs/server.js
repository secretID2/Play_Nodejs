var express        =        require("express");
var app            =        express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

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

app.get('/', function(req, res) {
    //res.sendFile needs absolut path which means C://.../... __dirname is the working directory
    res.sendFile(__dirname+'index.html');
});


