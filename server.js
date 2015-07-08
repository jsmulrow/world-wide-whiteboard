var path = require('path');

var http = require('http');
var server = http.createServer();

var express = require('express');
var app = express();

app.get('/jack', function(req, res, next) {
	res.sendFile(__dirname + '/index.html');
});

server.on('request', app);

// sockets
var socketio = require('socket.io');
var io = socketio(server);

// for saving state
var starts = [];
var ends = [];
var strokeColors = [];
var initialState = {
	starts: [],
	ends: [],
	strokeColors: []
};

io.on('connection', function(socket) {
	console.log('A new client has connected!');
	console.log(socket.id);

	// send old strokes
	socket.emit('initialState', initialState.starts, initialState.ends, initialState.strokeColors);

	socket.on('disconnect', function(socket) {
		console.log('A client has disconnected ', socket.id);
		console.log(':(');
	});

	socket.on('draw', function(start, end, strokeColor) {
		starts.push(start);
		ends.push(end);
		strokeColors.push(strokeColor);
		// console.log(starts, ends, strokeColors);
		socket.broadcast.emit('updateBoard', start, end, strokeColor);
	});

	// save state
	socket.on('save', function() {
		// save the drawings
		initialState.starts = initialState.starts.concat(starts);
		initialState.ends = initialState.ends.concat(ends);
		initialState.strokeColors = initialState.strokeColors.concat(strokeColors);
		// reset the temporary info
		starts = [];
		ends = [];
		strokeColors = [];
		console.log(initialState);
	});

	// clear state
	socket.on('clear', function() {
		// reset saved state
		initialState.starts = [];
		initialState.ends = [];
		initialState.strokeColors = [];
	});

	// clear temp state on refresh
	socket.on('clearTemp', function() {
		starts = [];
		ends = [];
		strokeColors = [];
	});
});

// for saving state
var starts2 = [];
var ends2 = [];
var strokeColors2 = [];
var initialState2 = {
	starts: [],
	ends: [],
	strokeColors: []
};

// namespaces
var nsp = io.of('/jack');
nsp.on('connection', function(socket) {
	console.log('someone connected');

	// send old strokes
	socket.emit('initialState', initialState2.starts, initialState2.ends, initialState2.strokeColors);

	socket.on('disconnect', function(socket) {
		console.log('A client has disconnected ', socket.id);
		console.log(':(');
	});

	socket.on('draw', function(start, end, strokeColor) {
		starts2.push(start);
		ends2.push(end);
		strokeColors2.push(strokeColor);
		// console.log(starts, ends, strokeColors);
		socket.broadcast.emit('updateBoard', start, end, strokeColor);
	});

	// save state
	socket.on('save', function() {
		// save the drawings
		initialState2.starts = initialState2.starts.concat(starts2);
		initialState2.ends = initialState2.ends.concat(ends2);
		initialState2.strokeColors = initialState2.strokeColors.concat(strokeColors2);
		// reset the temporary info
		starts2 = [];
		ends2 = [];
		strokeColors2 = [];
		console.log(initialState2);
	});

	// clear state
	socket.on('clear', function() {
		// reset saved state
		initialState2.starts = [];
		initialState2.ends = [];
		initialState2.strokeColors = [];
	});

	// clear temp state on refresh
	socket.on('clearTemp', function() {
		starts2 = [];
		ends2 = [];
		strokeColors2 = [];
	});
});




server.listen(1337, function () {
    console.log('The server is listening on port 1337!');
});

app.use(express.static(path.join(__dirname, 'browser')));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});