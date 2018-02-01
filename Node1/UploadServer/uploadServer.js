var http = require('http');
//To use this lib formidable we need to insert this in command prompt
//npm install formidable
//
var formidable = require('formidable');
var fs = require('fs');
http.createServer(function (req, res) {
  if (req.url == '/fileupload') {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
      var oldpath = files.filetoupload.path;
	  var dir='C:/Users/lcristovao/Documents/GitHub/Play_Nodejs/Node1/UploadServer/UploadedFiles/';
	  if (!fs.existsSync(dir)){
			fs.mkdirSync(dir);
	  }
      var newpath = dir + files.filetoupload.name;
      fs.rename(oldpath, newpath, function (err) {
        if (err) throw err;
        res.write('File uploaded and moved!');
        res.end();
      });
 });
  } else {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<form action="fileupload" method="post" enctype="multipart/form-data">');
    res.write('<input type="file" name="filetoupload"><br>');
    res.write('<input type="submit">');
    res.write('</form>');
    return res.end();
  }
}).listen(8080);