var path = require('path');

var http = require('http');
var server = http.createServer();

var express = require('express');
var app = express();

server.on('request', app);

// sockets
var socketio = require('socket.io');
var io = socketio(server);

// main namespace
nameSpace(io);

// other namespaces
var jack = io.of('/jack');
nameSpace(jack);

var turing = io.of('/turing-hall');
nameSpace(turing);

var hopper = io.of('/grace-hopper-atrium');
nameSpace(hopper);

var kitchen = io.of('/the-kitchen');
nameSpace(kitchen);

// creates a namespace for the given io/nsp
function nameSpace(io) {
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
}

// port and route handling

server.listen(1337, function () {
    console.log('The server is listening on port 1337!');
});

app.use(express.static(path.join(__dirname, 'browser')));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/*', function(req, res, next) {
	res.sendFile(__dirname + '/index.html');
});