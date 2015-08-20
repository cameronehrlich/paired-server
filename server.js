
// Packages
var express = require('express');
var app = express();

var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');

var jwt = require('jsonwebtoken');
var config = require('./config');

// Models
var User = require('./models/user');

// Configuration
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

mongoose.connect(config.database);
app.set('superSecret', config.secret);

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));

// views is directory for all template files
app.set('views', __dirname + '/public');
app.set('view engine', 'ejs');

app.get('/admin', function(request, response) {
	response.render('index');
});

// Routes

app.get('/', function(req, res) {
	res.send('The API is a http://localhost:' + process.env.PORT + '/api');
});

// API

var apiRouter = express.Router();

apiRouter.get('/', function(req, res) {
	res.json({
		message: 'Welcome to the best API ever.'
	});
});

apiRouter.post('/users/new', function(req, res) {
	var newUser = new User({
		name: req.body.name,
		password: req.body.password,
		admin: false
	});

	if (!newUser.name || !newUser.password) {
		res.json({
			success: false,
			message: 'missing parameters'
		});
	}

	newUser.save(function(err){
		if (err) throw err;

		res.json({
			success: true,
			user: newUser
		});
	});
});

apiRouter.post('/users/authenticate', function(req, res) {
	User.findOne({
		name: req.body.name
	}, function(err, user){
		if (err) throw err;

		if (!user) {
			res.json({
				success: false,
				message: 'user not found'
			});
		} else if (user) {
			if (user.password != req.body.password) {
				res.json({
					success: false,
					message: 'wrong password'
				});
			} else {

				var token = jwt.sign(user, app.get('superSecret'), {
					// expiresInMinutes: 1440 // expires in 24 hours
				});

				res.json({
					success: true,
					message: 'authenticated',
					token: token
				});
			}
		}
	});
});

/* 
	ROUTES AFTER THIS POINT MUST BE AUTHENTICTED
*/

// Check for valid token before preceeding
apiRouter.use(function(req, res, next) {
	var token = req.body.token || req.query.token || req.headers['x-access-token'];
	if (token) {
		// decode token and verify secret and checks exp
		jwt.verify(token, app.get('superSecret'), function(err, decoded) {
			if (err) {
				res.json({ success: false, message: 'invalid token.' });
			} else {
				// if everything is good, save to request for use in other routes
				req.decoded = decoded;
				next();
			}
		});
	} else {
		// if there is no token return an error
		res.status(403).send({
			success: false,
			message: 'missing token'
		});
	}
});


// Get all users
apiRouter.get('/users', function(req, res) {
	User.find({}, function(err, users){
		res.json(users);
	});
});

// Apply all the routers to /api
app.use('/api', apiRouter);

// Start app listening

app.listen(process.env.PORT, function() {
	console.log('Node app is running on port', process.env.PORT);
});
