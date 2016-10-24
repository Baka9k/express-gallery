var express = require('express');
var path = require('path');
var fs = require('fs');
var bodyParser = require('body-parser');
var multer = require('multer'); // v1.0.5
var crypto = require('crypto');
var expressHandlebars  = require('express-handlebars');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var expressSession = require('express-session');
var thumb = require('node-thumbnail').thumb;
var mongoose = require('mongoose');
var md5File = require('md5-file');



var users = JSON.parse(fs.readFileSync('users.json', 'utf8'));
var config = JSON.parse(fs.readFileSync('config.json', 'utf8'));


users.find = function(field, value) {
    for (var i = 0; i < this.length; i++) {
        if (!(typeof this[i] == "object")) continue;
        if (this[i][field] === value) return this[i];
    }
    return false;
}


passport.use(new Strategy({
		usernameField: 'login',
		passwordField: 'password'
	},
	function(username, password, cb) {
		var user = users.find("name", username);
		if (user) {
			if (user.hash == getHash(password)) {
				return cb(null, user);
			}
		}
		return cb(null, false);
	})
);

passport.serializeUser(function(user, cb) {
    cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
    cb(null, users.find("id", id));
});



var app = express();
var upload = multer({ dest: 'uploads/' });
app.engine('handlebars', expressHandlebars({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use("/", express.static(__dirname + "/build"));
app.use("/uploads", express.static(__dirname + "/uploads"));
app.use("/thumbnails", express.static(__dirname + "/thumbnails"));

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(expressSession({
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());




//Auth

function getHash(str) {
    var hash = crypto.createHash('sha256');
    var salt = "salt";
    hash.update(salt+str);
    return hash.digest('base64');
}


var simpleAuth = function(req, res, next) {
    if (req.user) next();
    else {
        res.status("403").render("notauthorized", {});
    }
};



//Files

var getFileList = function(path, callback) {
    fs.readdir(path, function(err, files) {callback(err, files);});
}

var deleteFile = function(path) {
    fs.unlink(path);
}



const imagesOnPage = parseInt(config.thumbsOnPage);


var getImagesForRendering = function(from, to, callback) {
	db.getImageRecords(from, to + 1, function(images) {
		var paths = [];
		for (var i=0; i < images.length; i++) {
			paths.push(images[i].name);
		}
		if (!paths[to]) {
			var last = "true";
		} else {
			var last = "false";
			paths.pop();
		}
		callback('thumbnails', {
			paths: paths.map(path => "thumbnails/" + path),
			last: last,
		});
	});
};


var getImagesForAjax = function(from, to, callback) {
	db.getImageRecords(from, to, function(images) {
		var paths = [];
		for (var i=0; i < images.length; i++) {
			paths.push(images[i].name);
		}
		callback(paths);
	});
};



//===========================MONGODB============================

// Create a schema
var gallerySchema = new mongoose.Schema({
	originalName: String,
	name: String,
	hash: String,
	size: Number,
	mimetype: String,
	date: { type: Date, default: Date.now },
});

function MongoStorage(dbName, schema) {
	// Connect to MongoDB and create/use database called <dbName>
	mongoose.connect('mongodb://localhost/' + dbName);
	// Create a model based on the schema
	this.model = mongoose.model(dbName, schema);
	return this;
};

MongoStorage.prototype.addImageRecord = function(originalName, name, hash, size, mimetype, date, callback) {
	var model = this.model;
	model.create(
		{
			originalName: originalName,
			name: name,
			hash: hash,
			size: size,
			mimetype: mimetype,
			date: date
		}, 
		function(err) {
			if(err) console.log("MongoDB error:", err);
			callback();
		}
	);
};

MongoStorage.prototype.getImageRecords = function(from, to, callback) {
	var model = this.model;
	var nRecords = to - from;
	model
		.find({})
		.skip(from)
		.limit(nRecords)
		.exec(function(err, records) {
			if (err) console.log("MongoDB error:", err);
			callback(records);
		});
};

MongoStorage.prototype.countImageRecords = function(callback) {
	var model = this.model;
	model.count({}, function(err, count) {
        if (err) console.log("MongoDB error:", err);
		callback(count);
     });
};

var db = new MongoStorage("Images", gallerySchema);




//=======================================================================

//Login

app.get('/login', function(req, res) {
	res.render("login", {});
});


app.post('/login', passport.authenticate('local', { failureRedirect: '/login' }), function(req, res) {
	res.redirect('/');
});


app.get('/logout', simpleAuth, function(req, res) {
	req.logout();
	res.redirect('/');
});


app.get('/', simpleAuth, function(req, res) {
    getImagesForRendering(0, imagesOnPage, function(template, content) {
	    res.render(template, content);
	});
});


app.post('/postphoto', simpleAuth, upload.array('myfile', 1), function (req, res) {
	
	//req.files is array of files
	//req.files[i] looks like:
		/*
		{
		fieldname: 'myfile',
		originalname: '12912531_225240144508422_22998161_n.jpg',
		encoding: '7bit',
		mimetype: 'image/jpeg',
		destination: 'uploads/',
		filename: '2b0831e79589b8cd722568c9e5259b63',
		path: 'uploads/2b0831e79589b8cd722568c9e5259b63',
		size: 54728
		}
		*/
			
	for (var i = 0; i < req.files.length; i++) {
		
		var file = req.files[i];
		
		if (!(file.mimetype.startsWith("image/"))) {
			console.log(file.mimetype + " is not image and will be deleted");
			deleteFile(file.path);
			continue;
		}
		
		var extension = file.originalname.match(/\.\w+$/);
		
		if (!extension) {
			console.log(file.originalname + " has no extension and will be deleted");
			deleteFile(file.path);
		} else {

			file.pathWithExtension = file.path + extension[0];
			fs.rename(file.path, file.pathWithExtension, function() {
				//Generate thumbnail
				thumb({
						source: file.pathWithExtension, // could be a filename: dest/path/image.jpg 
						destination: "thumbnails/",
						suffix: '',
						width: 350
					}, function(err) {
						if (err) console.log("Thumbnail generation error: file " + file.originalname);
						//Add entry in DB
						//addImageRecord(originalName, name, hash, size, mimetype, date, callback);
						var name = file.pathWithExtension.replace(/uploads\//, "");
						const hash = md5File.sync(file.pathWithExtension);
						db.addImageRecord(file.originalname, name, hash, file.size, file.mimetype, Date.now(), function() {
							res.redirect('/');
						});
				});
			});
			
		}
	
	}
	
})


app.post('/ajax/getpage', simpleAuth, function (req, res) {
	//req.body.page must be a page number (page numbers starts with 1)
	var pageNumber = req.body.page - 1;
	var from = pageNumber * imagesOnPage;
	var to = from + imagesOnPage;
	var n = to - from;
	getImagesForAjax(from, to + 1, function(paths) {
		if (!paths[n]) {
			var last = true;
		} else {
			var last = false;
			paths.pop();
		}
	    res.end(JSON.stringify({paths: paths, last: last}));
	});
});


app.listen(3000, function () {
	console.log('Gallery app listening on port 3000!');
});









