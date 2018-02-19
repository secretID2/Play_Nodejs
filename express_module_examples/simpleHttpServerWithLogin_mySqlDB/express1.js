var express        =        require("express");
var bodyParser     =        require("body-parser");
var mysql=require("mysql");
var app            =        express();
var fs = require('fs');
//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//app.use(express.cookieParser());

//----global vars-----
var out=null;
var users={};
var clients={};
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "users"
});

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
function loadDB(){
    fs.readFile("./DB.txt",'utf8',function(error,data){
        if(error){
            console.log("Error loading DB");
        }
        //data=""+data;//byte to string
        //console.log(data);
        var lines=data.split("\n");
        lines.forEach(function(line){
            //console.log(line);
            users[line.split(",")[0]]=line.split(",")[1];
        });
        for(key in users){
            console.log(key+":"+users[key]);
        }
        
    });
    
}
/*function checklogin(username,pass){
    var send=false;
    con.connect(function(err) {
        var send2;
        if (err) throw err;
        send2=con.query("SELECT * FROM info where username='"+username+"';", function (err, result, fields) {
            if (err) throw err;
            //console.log(result[0]);

            if(result[0].password.localeCompare(pass)==0){
                console.log("It worked!");
                return true;
            }
            else{
                return false;
            }
        });
        console.log("send2:"+send2);
        return send2;    
    });
    console.log("send:"+send);
    return send;
}*/
function CheckValidClient(username,secure_hash){
    for (key in clients){
        //here it does not have the sam eproblem as checklogin because I think here every think is really a string but in check login they were bytes???s
        if(key.localeCompare(username)==0 && clients[key].localeCompare(secure_hash)==0){
            return true;
        }
    }
    return false;
}

//Main sort off------------------



app.get('/', function(req, res) {
    //res.sendFile needs absolut path which means C://.../... __dirname is the working directory
    res.sendFile(__dirname+'/pages/sitepage.html');
});
app.post('/login',function(req,res){
    console.log(req.body);
    var username=req.body.username;
    var pass=req.body.pass;
    //check if user pass is correct
    con.connect(function(err) {
        if (err) throw err;
        con.query("SELECT * FROM info where username='"+username+"';", function (err, result, fields) {
            if (err) throw err;
            //console.log(result[0]);

            if(result[0].password.localeCompare(pass)==0){
                console.log("Valid User");
                var securehash= makeid();
                clients[username]=securehash;
                res.writeHead(302,{'Set-Cookie':username+'='+securehash,'Location':"restricted"});
                return res.end("Welcome "+username+"!");  
            }
            else{
                res.writeHead(200);
                return res.end("Username or password are wrong!");
            }
        });
        
    });
    
    
    /*if(checklogin(username,pass)){
        var securehash= makeid();
        clients[username]=securehash;
        res.writeHead(302,{'Set-Cookie':username+'='+securehash,'Location':"restricted"});
        return res.end("Welcome "+username+"!");   
    }
    else{
        res.writeHead(200);
        return res.end("Username or password are wrong!");
    }*/
    
});
app.get("/restricted",function(req,res){
            const { headers } = req;
            console.log(headers.cookie);
            var cookie=headers.cookie;
            if(cookie==null){
                res.send("Access Denied!");
            }
            var username=cookie.split("=")[0];
            var secret=cookie.split("=")[1];
            if(CheckValidClient(username,secret)){
                res.sendFile(__dirname+"/pages/restricted.html");
                
            }
            else{
                res.writeHead(200);
                return res.end("Access denied"); 
            }
});
//no security serving static files
app.use('/images', express.static('pages/images'));

app.get("/restricted/:page",function(req,res){
    filepath=__dirname+"/pages/"+req.params.page;
    const { headers } = req;    
    console.log(headers.cookie);
    var cookie=headers.cookie;
    if(cookie==null){
            res.send("Access Denied!");
    }
    var username=cookie.split("=")[0];
    var secret=cookie.split("=")[1];
    if(CheckValidClient(username,secret)){
        res.sendFile(filepath);
    }
    else{
        res.send("Access Dinied");
    }
});


app.listen(8080, function() {
  console.log('Example app listening on port 8080!');
});