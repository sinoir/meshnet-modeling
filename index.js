var nodes = {
	uptown: [],
	downtown: [],
	all: []
};

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
	var RANGE_RADIUS = 150; // feet
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
		},
		traceroute: function(target, trail){
			trail.push(this);
			if( this === target ){
				return trail;
			}
			var route = null;
			for( var ix = 0; ix < this.connections.length; ix++ ){
				var conn = this.connections[ix];
				if( trail.indexOf(conn) !== -1){
					continue;
				}
				route = conn.traceroute(target,trail);
				if(route){
					break;
				}
			}
			return route;
		},
		hopStatistics: function(nodes){
			var maxHops = 0;
			var allHops = 0;
			nodes.forEach(function(node){
				var hops = this.traceroute(node, [this]);
				if( hops ){
					allHops += hops.length;
					if( hops.length > maxHops){
						maxHops = hops.length;
					}
				}
			}, this);
			return {
				max: maxHops,
				mean: allHops / nodes.length
			};
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
		context.fillStyle = '#333';
		context.fill();
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
		function renderWifi(nodes) {
			nodes.forEach(function(node) {
				createRange(node);
			});
		}
		function renderConns(nodes){
			nodes.forEach(function(node) {
				createConnections(node);
			});
		}
		function renderNodes(nodes){
			nodes.forEach(function(node) {
				createNode(node);
			});
		}

		if (options.uptown && nodes.uptown) {
			renderWifi(nodes.uptown);
		}
		if (options.downtown && nodes.downtown) {
			renderWifi(nodes.downtown);
		}
		if (options.uptown && nodes.uptown) {
			renderConns(nodes.uptown);
		}
		if (options.downtown && nodes.downtown) {
			renderConns(nodes.downtown);
		}
		if (options.uptown && nodes.uptown) {
			renderNodes(nodes.uptown);
		}
		if (options.downtown && nodes.downtown) {
			renderNodes(nodes.downtown);
		}
	}



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
	
	
	var maxHops = 0;
	var allMeanHops = 0;
	nodes.all.forEach(function(node){
		var nodeStats = node.hopStatistics(nodes.all);
		if( nodeStats.max > maxHops ){
			maxHops = nodeStats.max;
		}
		allMeanHops += nodeStats.mean;
	});
	var meanHops = Math.round(allMeanHops * 100 / nodes.all.length) / 100;
	
	var maxConns = 0;
	var allMeanConns = 0;
	nodes.all.forEach(function(node){
		allMeanConns += node.connections.length;
		if (node.connections.length > maxConns){
			maxConns = node.connections.length;
		}
	});
	var meanConns = Math.round(allMeanConns * 100 / nodes.all.length) / 100;
	
	$("#max_hops").html(maxHops);
	$("#mean_hops").html(meanHops);
	$("#max_conns").html(maxConns);
	$("#mean_conns").html(meanConns);
	$("#wifi_range").html(RANGE_RADIUS + " Feet");
	$("#total_nodes").html(nodes.all.length);
});