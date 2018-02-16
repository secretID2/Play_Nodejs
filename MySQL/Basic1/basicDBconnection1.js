var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "users"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  var sql= "INSERT INTO `info` (`username`, `password`) VALUES ('Luis', 'cjsdnkjsdcn')";//query
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("SUCCESS!");
  });
});
//CREATE DATABASE users
//CREATE TABLE info (id int not null AUTO_INCREMENT, username varchar(30) UNIQUE not null, password varchar(100), PRIMARY KEY(ID))
//INSERT INTO `info` (`username`, `password`) VALUES ('Luis', 'cjsdnkjsdcn');