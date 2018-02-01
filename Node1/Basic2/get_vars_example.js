var http = require('http');
var url = require('url');

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  //Automatic to get variables of request
  var q = url.parse(req.url, true).query;
  var txt;
  if (typeof q.year != 'undefined' && typeof q.month!='undefined'){
	txt = q.year + " " + q.month;
	res.end(txt);
  }
  else{
	  txt=getAllRequestVar(req.url)
	  res.end(txt);
  }
  
}).listen(80);

function getAllRequestVar(url){
	var true_request=url.split('?')[1];
	var txt="";
	var all_vars=true_request.split('&');
	all_vars.forEach(function(variable){
			var value=variable.split('=')[1];
			txt+=value+' ';
	}); 
	return txt;
	
}