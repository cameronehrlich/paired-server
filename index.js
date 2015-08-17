var express = require('express');
var app = express();
var Parse = require('parse').Parse;

Parse.initialize("YM7X3UG99PpU1V65tceqlp9O4gJk9zXVrpbu4Pdl", "0ND7F8dl430jI6AR822WXjRH8cY1IUNA4lfrwdRZ");

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {

	var query = new Parse.Query(Parse.User);
	query.find({
		success: function(returnedUsers) {
			response.render('pages/index', {
				users: returnedUsers
			});
		}
	});
});

app.listen(app.get('port'), function() {
	console.log('Node app is running on port', app.get('port'));
});

