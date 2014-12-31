$(function() {

	var canvas = document.getElementById('canvas');
	var context = canvas.getContext('2d');

	var centerY = canvas.height / 2;
	var platformSpace = 10; // feet
	var trackSpace = 20; // feet
	var yellowStripSpace = 1; // feet

	var uptownPlatformY = centerY - trackSpace - yellowStripSpace - platformSpace;
	var downtownPlatformY = centerY + trackSpace + yellowStripSpace;

	var NODE_RADIUS = 2; // feet
	var RANGE_RADIUS = 100; // feet
	var MAX_CONNECTIONS = 5;

	var Node = function(minY) {
		this.x = (Math.random() * canvas.width);
		this.y = minY + (Math.random() * (platformSpace - yellowStripSpace));
		this.id = this.x +", " + this.y;
		this.connections = [];
	};
	Node.prototype = {
		findConnections: function(nodes) {
			this.connections = [];
			for( var ix = 0; ix < nodes.length; ix++){
				var node = nodes[ix];
				if (this.connections.length >= MAX_CONNECTIONS) {
					break;
				} else if (this === node) {
					continue;
				}
				var distance = this.distance(node);
				if (distance < RANGE_RADIUS) {
					if( node.connect(this) ){
						this.connect(node);
					}
				}
			}
			console.log("Connections: "+this.id+" | "+this.connections.length);
		},
		connect: function(node){
			if( this.connections.length <= MAX_CONNECTIONS ){
				this.connections.push(node);
				return true;
			} else {
				return false;
			}
		},
		distance: function(node) {
			return Math.sqrt(Math.pow(node.x - this.x, 2) + Math.pow(node.y - this.y, 2));
		}
	};


	function createRange(position) {
		context.beginPath();
		context.arc(position.x, position.y, RANGE_RADIUS, 0, 2 * Math.PI, false);
		context.fillStyle = 'rgba(10, 255, 200, 0.1)';
		context.fill();
	}

	function createNode(node) {
		context.beginPath();
		context.arc(node.x, node.y, NODE_RADIUS, 0, 2 * Math.PI, false);
		context.fillStyle = 'green';
		context.fill();
		context.lineWidth = 2;
		context.strokeStyle = '#333';
		context.stroke();
	}
	
	function createConnections(node){
		node.connections.forEach(function(connection){
			context.beginPath();
			context.moveTo(node.x, node.y);
			context.lineTo(connection.x, connection.y);
			context.lineWidth = 2;
			context.strokeStyle = "#C8C";
			context.stroke();
		}, this);
	}

	function makeTrack(y) {
		context.beginPath();
		context.moveTo(0, y);
		context.lineTo(canvas.width, y);
		context.lineWidth = trackSpace - 2;
		context.strokeStyle = "#333";
		context.stroke();
	}

	function makePlatform(y) {
		context.beginPath();
		context.moveTo(0, y);
		context.lineTo(canvas.width, y);
		context.lineWidth = platformSpace;
		context.strokeStyle = "#CC3";
		context.stroke();
	}

	function renderStation() {
		makeTrack(centerY + (trackSpace / 2));
		makeTrack(centerY - (trackSpace / 2));
		makePlatform(uptownPlatformY + (platformSpace / 2));
		makePlatform(downtownPlatformY + (platformSpace / 2));
	}

	function renderPhones(nodes, options) {
		function renderNodes(nodes) {
			nodes.forEach(function(node) {
				createRange(node);
			});
			nodes.forEach(function(node) {
				createConnections(node);
			});
			nodes.forEach(function(node) {
				createNode(node);
			});
		}

		if (options.uptown && nodes.uptown) {
			renderNodes(nodes.uptown);
		}
		if (options.downtown && nodes.downtown) {
			renderNodes(nodes.downtown);
		}
	}



	var nodes = {
		uptown: [],
		downtown: [],
		all: []
	};
	for (var ix = 0; ix < 20; ix++) {
		nodes.uptown.push(new Node(uptownPlatformY));
		nodes.downtown.push(new Node(downtownPlatformY));
	}
	nodes.all = nodes.uptown.concat(nodes.downtown);
	nodes.all.forEach(function(node) {
		node.findConnections(nodes.all);
	});

	renderStation();
	renderPhones(nodes, {
		uptown: true,
		downtown: true
	});

});