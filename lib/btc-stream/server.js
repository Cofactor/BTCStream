var idl = require('ideal');
var http = require('http');
var WebSocketServer = require('websocket').server;
var BlockchainInfoClient = require('blockchain-info').Client;
var Request = require('./request').Request;

module.exports = {
	Server: idl.Proto.clone().newSlots({
		httpServer: null,
		wsServer: null,
		blockchainInfoClient: null
	}).setSlots({
		start: function()
		{
			var self = this;
			
			var server = http.createServer(function(request, response) {
				response.writeHead(404);
				response.end();
			});
			server.listen(8080);
			this._httpServer = server;

			wsServer = new WebSocketServer({
			    httpServer: server,
			    // You should not use autoAcceptConnections for production
			    // applications, as it defeats all standard cross-origin protection
			    // facilities built into the protocol and the browser.  You should
			    // *always* verify the connection's origin and decide whether or not
			    // to accept it.
			    autoAcceptConnections: false
			});

			function originIsAllowed(origin) {
			  // put logic here to detect whether the specified origin is allowed.
			  return true;
			}

			wsServer.on('request', function(request) {
				req = Request.clone();
				req.setServer(self);
				req.setWsRequest(request);
				req.process();
			});

			this._wsServer = wsServer;
			
			this.setBlockchainInfoClient(BlockchainInfoClient.clone().start());

			return this;
		}
	})
}