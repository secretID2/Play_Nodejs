var http = require('http');
//var url = require('url');
var fs = require('fs');
var error=1;
var users={};
var clients={};
function makeid() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 15; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}
function compareStrings(st1,st2){
			var compare=false;
			var n=0;
			for(i=0;i<st1.length;i++){
				if(st1[i]==st2[i])
					n++;
				else
					break;
			}
			if(n==st1.length)
				compare=true;
				
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
function parseCookie(cookie){
    
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
            console.log(users[key]);
        }
        
    });
    
}



function checklogin(username,pass){
    for(var key in users){
        /*console.log("key:"+key+"; username:"+username);
        console.log("key pass:"+users[key]+"; test_pass:"+pass);
        if(key.localeCompare(username)==0){
            console.log("UsernameMatch");
            if(users[key].localeCompare(pass)==0){
                console.log("pass match");
                return true;
            }
        }*/
        console.log(key+":"+users[key]);
        console.log(key+":"+users[key]);
        console.log(key+":"+users[key]);
        //console.log(key.localeCompare(username)==0);
        //console.log(users[key].localeCompare(pass)==0);
        //console.log("key:"+key+"; username:"+username);
        //console.log("key pass:"+users[key]+"; test_pass:"+pass);
        /*if(key.localeCompare(username)==0 && users[key].localeCompare(pass)==0){
            return true;
        }*/
        if(compareStrings(key,username) && compareStrings(users[key],pass)){
            return true;
        }
    }
    return false;
}

loadDB();

//This is the Main where all get and posts come
http.createServer(function (request, response) {
  /*if(request.url=="/"){
        response.writeHead(200,{'Content-Type': 'text/html'});
        response.write('<h1>Welcome o this site !</h1>');
        return response.end();
    }*/
    if(request.url=="/"){
        //redirect permantly code
        response.writeHead(301,{'Location':'home'});
        return response.end();
    }
    if(request.url=="/home"){
            
            
            var filename='./pages/sitepage.html'
            fs.readFile(filename, function(err, data) {
                if (err) {
                    console.log("Error reading file");    
                    response.writeHead(404,{'Content-Type': 'text/html'});
                    response.write('<h1><font color="red">Page Not Found</font></h1>')
                    return response.end();
                }
                console.log("read file"+data);
                
                response.writeHead(200, {'Content-Type': 'text/html'});
                //response.write(data,function(err){return response.end();});
                response.write(data);
                return response.end();
            });
    }
    //getting post yeah!
    /*if (request.method == 'POST' && request.url == '/login') {
            var body = '';
            request.on('data', function(chunk) {
                
                body += chunk;
            });
            console.log(body);
            request.on('end', function() {
                    var data = parser(body);
                    var out="";
                    // now you can access `data.email` and `data.password`
                    for (var key in data) {
                        // check if the property/key is defined in the object itself, not in parent
                        out+=key+":"+data[key]+"\n";
                    }
                    response.writeHead(200);
                    return response.end(out);
            });
      }*/
        
      //getting post yeah!
        if (request.method == 'POST' && request.url == '/login') {
                var body = '';
                request.on('data', function(chunk) {

                    body += chunk;
                });
                console.log(body);
                request.on('end', function() {
                    
                        var data = parser(body);
                        if(checklogin(data['username'],data['pass'])){
                            var securehash= makeid();
                            clients[data['username']]=securehash;
                            response.writeHead(302,{'Set-Cookie':data['username']+'='+securehash,'Location':"restricted"});
                            return response.end();   
                        }
                        else{
                            response.writeHead(200);
                            return response.end("Username or password are wrong!");
                        }

                        
                
                });

        }
        
        if(request.url=="/restricted"){
            const { headers } = request;
            console.log(headers.cookie);
            var cookie=headers.cookie;
            var username=cookie.split("=")[0];
            var secret=cookie.split("=")[1];
            for(key in clients){
                console.log(key+" "+clients[key]);
                if(key.localeCompare(username)==0){
                    console.log("Username match  "+clients[key]);
                    if(clients[key].localeCompare(secret)==0){
                        console.log("valid user");
                        response.writeHead(200);
                        return response.end(username+" is logged in!"); 
                    }
                }
            }
            response.writeHead(200);
            return response.end("Access denied"); 
        }
    
    /*if(error==1){
        response.writeHead(404,{'Content-Type': 'text/html'});
        response.write('<h1><font color="red">Page Not Found</font></h1>')
        
        return response.end();
    }*/
    
    
    
}).listen(80);
console.log("Serving localhos->port 80!");