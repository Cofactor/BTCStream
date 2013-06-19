var idl = require('ideal');
var WebSocketClient = require('websocket').client;
var request = require('superagent');

module.exports = {
	Client: idl.Proto.clone().newSlots({
		wsClient: null,
		listeners: null
	}).setSlots({
		init: function()
		{
			this._listeners = {};
		},

		listenersAt: function(event)
		{
			var listeners = this._listeners[event];
			if (!listeners)
			{
				listeners = [];
				this._listeners[event] = listeners;
			}
			return listeners;
		},

		on: function(event, fn)
		{
			this.listenersAt(event).appendIfAbsent(fn);
			return this;
		},

		removeListener: function(event, fn)
		{
			this.listenersAt(event).remove(fn);
			return this;
		},

		fireOp: function(op)
		{
			this.listenersAt(op.op).forEach(function(fn){
				fn(op);
			});
		},

		start: function()
		{
			var self = this;

			var client = new WebSocketClient();

			client.on('connectFailed', function(error){
				console.log('Connect Error: ' + error.toString());
				self.restart();
			});

			client.on('connect', function(connection){
			    connection.on('error', function(error){
			        console.log("Connection Error: " + error.toString());
			    });
			    connection.on('close', function(){
					console.log("Connection Closed");
			        self.restart();
			    });
			    connection.on('message', function(message) {
					if (message.type === 'utf8')
					{
						self.fireOp(JSON.parse(message.utf8Data));
			        }
			    });

				connection.sendUTF(JSON.stringify({
					op: "unconfirmed_sub"
				}));

				connection.sendUTF(JSON.stringify({
					op: "blocks_sub"
				}));
			});

			client.connect('ws://ws.blockchain.info/inv');

			this._wsClient = client;

			return this;
		},
		
		rawBlock: function(pub_160, fn)
		{
			request.get('http://blockchain.info/rawblock/' + pub_160).end(function(err, res){
				if (err)
				{
					fn(err);
				}
				else
				{
					fn(null, res.body);
				}
			})
			
			
		},

		restart: function()
		{
			var client = this._wsClient;
			if (client)
			{
				client.removeAllListeners();
			}

			var self = this;
			setTimeout(function(){
				self.start();
			}, 1000);
		}
	})
}