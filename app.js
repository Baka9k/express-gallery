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



var users = [
    {
        name: "qwerty",
        hash: "wvxsat+LoPV1o19I31LAloo9zTxXfCdp3C8QNZQ7l14=",
        id: "2"
    },
    {
        name: "admin",
        hash: "K7eZhJaJms3YE3+tOkT6+WqEoD1/IwzkLpfNF8euQp4=",
        id: "1"
    }
];

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




//Datetime

var getDateString = function() {
	var dateString = "";
	var newDate = new Date();
	dateString += (newDate.getMonth() + 1) + "/";
	dateString += newDate.getDate() + "/";
	dateString += newDate.getFullYear();
	return dateString;
};

var getTimeString = function() {
	var timeString = "";
	var newDate = new Date();
	timeString += newDate.getHours() + ":";
	timeString += newDate.getMinutes() + ":";
	timeString += newDate.getSeconds();
	return timeString;
};



//Files

var getFileList = function(path, callback) {
    fs.readdir(path, function(err, files) {callback(err, files);});
}

var deleteFile = function(path) {
    fs.unlink(path);
}

var getImages = function(callback) {
	getFileList("uploads", function(err, paths) {
		if (err) console.log("Error while getting file list: " + err);
		else {
			callback('thumbnails', {
				paths: paths.map(x => "uploads/" + x) 
			});
		}
	});
};



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
    getImages(function(template, content) {
	    res.render(template, content);
	});
});

app.post('/postphoto', simpleAuth, upload.array('myfile', 1), function (req, res) {
	// req.files is array of files
	for (var i = 0; i < req.files.length; i++) {
		if (!(req.files[i].mimetype.startsWith("image/"))) {
			console.log(req.files[i].mimetype + " is not image and will be deleted");
			deleteFile(req.files[i].path);
		}
	}
	res.redirect('/');
})


app.listen(3000, function () {
	console.log('Gallery app listening on port 3000!');
});









