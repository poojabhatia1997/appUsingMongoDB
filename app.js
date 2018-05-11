var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var basicAuth = require('express-basic-auth');
var multer = require('multer');
var path = require('path');

var Book = require(__dirname + '/model/book.js');
var user = require(__dirname + '/model/user.js');

var db = 'mongodb://localhost/Mydb';
var PORT = 8080;
mongoose.connect(db, function (err) {
 
   if (err) throw err;
 
   console.log('Successfully connected');
 
});

var storage = multer.diskStorage({
	destination: function(req, file, callback) {
              callback(null, __dirname + '/uploads/')
	},
	filename: function(req, file, callback) {
		callback(null,Date.now() + path.extname(file.originalname));
	}
});


app.use(bodyParser.json());	
app.use(basicAuth({
    users: { 'username': 'password' }
}));

app.get('/users', function(req, res) {
	user.find().then(function(err, users){
	 	if (err){
	 		res.send(err)
	 	} else {
           res.json({
           	success: 1,
           	data: users
           })
	 	}
	 })
});

app.post('/users/register', function (req,res) {


    var upload = multer({ storage: storage}).single('profileImage');
	upload(req, res, function(err) {
        console.log('-------In upload function---------')
        console.log(req.body)
        console.log('------Image-----')
		console.log(req.file)

		if (err){ 
			console.log('err => '+err)
			return res.json({
					"success": 0,
					"message": "Request unsuccessfull",
					"error": err
				})
		}else{
             user.findOne({
			              email: req.body.email
				}).then(function (err, usr){

					if (err) {
						res.send(err)
					}

					if (!usr) {
						         if (req.file) {
						             var body = { email: req.body.email , password: req.body.password , profileImage: `${req.file.filename}`}
						         }else{
						         	var body = { email: req.body.email , password: req.body.password , profileImage: "" }
						         }
						     
                                var new_user = new user(body);

					            new_user.save().then(function (usr) {
									     		res.json({ 
									     		"success": 1,
									     		"message": "Registration successfull",

									     		"data": usr
									     	});
								     	});
						} else {

									res.json({
									"success": 0,
									"message": "User already exists",
							});
						}
					
				});
			
			} 
	});
});


app.post('/books', function(req, res) {

      var book = new Book(req.body);
      book.save(function(err, book) {
      	if (err){
      		res.send('error occured')
      	} else {
      		res.json({
		           	success: 1,
		           	data: book
		           })
      	}
      })
});

app.get('/books', function(req, res) {
	Book.find().then(function(err, books){
	 	if (err){
	 		res.send(err)
	 	} else {
           res.json({
           	success: 1,
           	data: books
           })
	 	}
	 })
});


app.listen(PORT, function(){
	console.log('app listening to port' + PORT);
})

