var express = require('express');
var path = require('path');
var fs = require('fs');
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser');
var multer = require('multer'); // v1.0.5
var crypto = require('crypto');
var expressHandlebars  = require('express-handlebars');

var app = express();
var upload = multer({ dest: 'uploads/' });

app.use(cookieParser());
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(express.static(__dirname + '/'));




var sessions = {
    hdgrt5ei8dac: true
};
var users = {
    qwerty: "wvxsat+LoPV1o19I31LAloo9zTxXfCdp3C8QNZQ7l14="
};



//Auth

var checkSession = function(key) {
 if (sessions[key]) return sessions[key];
}

function getHash(str) {
    var hash = crypto.createHash('sha256');
    var salt = "salt";
    hash.update(salt+str);
    return hash.digest('base64');
}

var checkLoginPass = function(login, password) {
    if (users[login] === getHash(password)) return true;
}

var simpleAuth = function(req, res, next) {
    if (checkSession(req.cookies.SID)) next();
    else {
        res.status("403").send("<h3>You are not authorized</h3><br /><button onclick='window.location=\"/login\"'>Go to login page</button><script>setTimeout(function(){window.location=\"/login\"}, 5000)</script>");
    }
};

function genExpDate() {
    var d = new Date();
    d.setFullYear(d.getFullYear()+1);
    return d;
}

var createSession = function() {
    var uuid = Math.floor(Math.random() * 1e10).toString() + Math.floor(Math.random() * 1e10).toString();
    sessions[uuid] = true;
    return uuid;
}




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
    fs.readdir(path, function(err, files) {callback(err, files)});
}

var deleteFile = function(path) {
    fs.unlink(path);
}




var getImages = function(callback) {
	getFileList("uploads", function(err, paths) {
		if (err) console.log("Error while getting file list: " + err);
		else {
			callback('thumbnail', {
				paths: paths  
			});
		}
	});
};



//=======================================================================


app.get('/', simpleAuth, function(req, res) {
    readImages(function(template, content) {
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


//Login

app.get('/login', function(req, res) {
	   res.render("login", {});
});

app.post('/login', function (req, res) {
	// req.body will contain the text fields, if there were any
	if (checkLoginPass(req.body.login, req.body.password)) {
		var key = createSession();
		res.cookie('SID', key);
		res.redirect('/');
	} else {
		res.render("notauthorized", {});
	}
});

app.listen(3000, function () {
	console.log('Gallery app listening on port 3000!');
});









