var express = require('express'),
    session = require('express-session'),
    app = express(),
    bodyParser = require('body-parser');

//Start the server
app.listen(3000);
console.log('Server listening on port 3000');

//handle the static directories
app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use('/styles', express.static(__dirname + '/public/styles/css'));
app.use('/scripts', express.static(__dirname + '/public/scripts/build'));

//body parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

//sessions
app.use(session({
  secret: 'mysql2mongo',
  resave: false,
  saveUninitialized: true
}));

//Include the routes controller
require('./server/routes/main.js')(app);
