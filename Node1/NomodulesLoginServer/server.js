var http = require('http');
//var url = require('url');
var fs = require('fs');
var error=1;
var users={};
var clients={};
var did_something=false;
var restrictedFiles=[];
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
            console.log(key+":"+users[key]);
        }
        
    });
    
}
function LoadRestrictedFiles(){
    fs.readFile("./RestrictedFiles.txt",'utf8',function(error,data){
        if(error){
            console.log("Error loading DB");
        }
        //data=""+data;//byte to string
        //console.log(data);
        var lines=data.split("\n");
        lines.forEach(function(line){
            //console.log(line);
            restrictedFiles.push(""+line);//this is not a string so be carefull!!!!!!
        });
        /*for(i=0;i<restrictedFiles.length;i++){
            console.log(restrictedFiles[i]);
        }*/
        
    });
}
/*not working???
function ReadFile(filename){
            var dir='./'+filename;
            console.log(dir);
            var send=null;
            fs.readFile(dir, function(err, data) {
                if (err) {
                    send= null;
                }
                else{
                    //console.log(""+data);
                    send=""+data;
                }
            });
            console.log(send);
            return send;
}*/
           




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
        //console.log(key+":"+users[key]);
        //console.log(key+":"+users[key]);
        //console.log(pass+":"+users[key]);
        //console.log(key.localeCompare(username)==0);
        //console.log(users[key].localeCompare(pass)==0);
        //console.log("key:"+key+"; username:"+username);
        //console.log("key pass:"+users[key]+"; test_pass:"+pass);
        /*if(key.localeCompare(username)==0 && pass.localeCompare(users[key])==0){
            return true;
        }*/
        
        //console.log(compareStrings(pass,users[key]));
        if(compareStrings(key,username) && compareStrings(pass,users[key])){
            return true;
        }
    }
    return false;
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

function CheckUrlForRestrictedFiles(url){
    console.log(url);
    filename=url.split("/");
    for(i=0;i<restrictedFiles.length;i++){
        //use this fucntion because is possible that restrictedFiles does not have strings
        if(compareStrings(filename[filename.length-1],restrictedFiles[i])){
            return true;
        }
    }
    return false;
}


//Load DB before every thing
loadDB();
LoadRestrictedFiles();
console.log(CheckUrlForRestrictedFiles("/restricted/winter.html"));
//This is the Main where all get and posts come
http.createServer(function (request, response) {
  /*if(request.url=="/"){
        response.writeHead(200,{'Content-Type': 'text/html'});
        response.write('<h1>Welcome o this site !</h1>');
        return response.end();
    }*/
    if(request.url=="/"){
        did_something=true;
        //redirect permantly code
        response.writeHead(301,{'Location':'home'});
        return response.end();
    }
    if(request.url=="/home"){
            
            did_something=true;
            var filename='./pages/sitepage.html'
            fs.readFile(filename, function(err, data) {
                if (err) {
                    //console.log("Error reading file");    
                    response.writeHead(404,{'Content-Type': 'text/html'});
                    response.write('<h1><font color="red">Page Not Found</font></h1>')
                    return response.end();
                }
                //console.log("read file"+data);
                
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
                did_something=true;
                var body = '';
                request.on('data', function(chunk) {

                    body += chunk;
                });
                console.log(body);
                request.on('end', function() {
                        //parser returns a dictionary with all the variables values
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
            did_something=true;
            const { headers } = request;
            console.log(headers.cookie);
            var cookie=headers.cookie;
            var username=cookie.split("=")[0];
            var secret=cookie.split("=")[1];
            if(CheckValidClient(username,secret)){
                fs.readFile("./pages/restricted.html",function(err,data){
                    if(err){
                        response.writeHead(500)
                        return response.end("<h1><font color='red'>Error to read File!</font></h1>")
                    }
                    else{
                        response.writeHead(200,{'Content':'text/html'});
                        return response.end(data);
                    }
                });
                
            }
            else{
                response.writeHead(200);
                return response.end("Access denied"); 
            }
        }
        //if(CheckUrlForRestrictedFiles(request.url)){
        //    console.log("ENtrou");
        //}
        //Accepts anything if the user did not other requests
        //if authenticated user
        /*if(CheckUrlForRestrictedFiles(request.url)){
            const { headers } = request;
            if(headers.cookie!=null){
                did_something=false;
                const { headers } = request;
                console.log(headers.cookie);
                var cookie=headers.cookie;
                var username=cookiea.split("=")[0];
                var secret=cookiea.split("=")[1];
                var filename=request.url.split("/");
                if(CheckValidClient(username,secret)){
                    fs.readFile("./pages/"+filename[filename.length-1],function(err,data){
                            if(err){
                                response.writeHead(500)
                                return response.end("<h1><font color='red'>Error to read File!</font></h1>")
                            }
                            else{
                                response.writeHead(200,{'Content':'text/html'});
                                return response.end(data);
                            }
                        });
                }
            }
        }*/
    /*if(error==1){
        response.writeHead(404,{'Content-Type': 'text/html'});
        response.write('<h1><font color="red">Page Not Found</font></h1>')
        
        return response.end();
    }*/
    
    
    
}).listen(80);
console.log("Serving localhos->port 80!");