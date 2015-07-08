var socket = io(window.location.href);

socket.on('connect', function() {
	console.log('I have made a persistent two-way connection to the server!');
});

socket.on('initialState', function(starts, ends, strokeColors) {
	// if there is an initial state
	var len = starts.length;
	if (len) {
		// draw each start, end, and stroke color
		for (var i = 0; i < len; i++) {
			whiteboard.draw(starts[i], ends[i], strokeColors[i]);
		}
	}
});

socket.on('updateBoard', function(start, end, strokeColor) {
	whiteboard.draw(start, end, strokeColor, false);
});

whiteboard.on('draw', function() {
	var args = Array.prototype.slice.call(arguments);
	socket.emit('draw', args[0], args[1], args[2]);
});

// button logic
document.getElementById('save').addEventListener('click', function() {
	console.log('you want to save');
	socket.emit('save');
});

document.getElementById('clear').addEventListener('click', function() {
	console.log('you want to clear');
	// clear the display
	whiteboard.clear();
	socket.emit('clear');
});

// for refresh
window.onbeforeunload = function() {
	console.log('refresh');
	socket.emit('clearTemp');
};