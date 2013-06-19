var idl = require('ideal');

module.exports = {
	Request: idl.Proto.clone().newSlots({
		server: null,
		wsRequest: null,
		wsConnection: null,
		sim: false
	}).setSlots({
		process: function()
		{
			//request.origin TODO check origin
			//request.reject(); TODO if its a bad request 

			this._listenersToRemove = [];

		    var connection = this._wsRequest.accept('btc-stream', this._wsRequest.origin);
			var self = this;
		    connection.on('message', function(wsMessage) {
				self.processMessage(wsMessage);
		    });
			connection.on('close', function(wsMessage) {
				self._listenersToRemove.forEach(function(listener){
					self.server().blockchainInfoClient().removeListener(listener.event, listener.fn);
				});
		    });
			this._wsConnection = connection;
		},

		processMessage: function(wsMessage)
		{
			if (wsMessage.type === 'utf8')
			{
				this.processOp(JSON.parse(wsMessage.utf8Data));
	        }
	        else if (wsMessage.type === 'binary')
			{
				this.sendError("Message should be utf8");
	        }
		},

		processOp: function(op)
		{
			if (op.op == "unconfirmed_sub")
			{
				this.processUnconfirmedSub(op);
			}
			else if (op.op == "blocks_sub")
			{
				this.processBlocksSub(op);
			}
			else if (op.op == "rawblock")
			{
				this.processRawBlock(op);
			}
			else if (op.op == "sim")
			{
				this.setSim(true);
				this.sendOp({ op: "confirm_sim" })
			}
			else
			{
				this.sendError("Unknown Op: " + op.op);
			}
		},

		processUnconfirmedSub: function(op)
		{
			var self = this;
			
			function listener(op)
			{
				self.sendOp(op);
			}
			
			this.server().blockchainInfoClient().on('utx', listener);
			this._listenersToRemove.append({event: 'utx', fn: listener});
			
			if (this._sim)
			{
				this.server().blockchainInfoClient().fireOp({
				    "op": "utx",
				    "x": {
				        "hash": "f6c51463ea867ce58588fec2a77e9056046657b984fd28b1482912cdadd16374",
				        "ver": 1,
				        "vin_sz": 4,
				        "vout_sz": 2,
				        "lock_time": "Unavailable",
				        "size": 796,
				        "relayed_by": "209.15.238.250",
				        "tx_index": 3187820,
				        "time": 1331300839,
				        "inputs": [
				            {
				                "prev_out": {
				                    "value": 10000000,
				                    "type": 0,
				                    "addr": "12JSirdrJnQ8QWUaGZGiBPBYD19LxSPXho"
				                }
				            }
				        ],
				        "out": [
				            {
				                "value": 2800000000,
				                "type": 0,
				                "addr": "1FzzMfNt46cBeS41r6WHDH1iqxSyzmxChw"
				            }
				        ]
				    }
				})
			}
		},

		processBlocksSub: function(op)
		{
			var self = this;
			
			function listener(op)
			{
				self.sendOp(op);
			}
			
			this.server().blockchainInfoClient().on('block', listener);
			this._listenersToRemove.append({event: 'block', fn: listener});
			
			if (this._sim)
			{
				this.server().blockchainInfoClient().fireOp({
				    "op": "block",
				    "x": {
				        "txIndexes": [
				            3187871,
				            3187868
				        ],
				        "nTx": 0,
				        "totalBTCSent": 0,
				        "estimatedBTCSent": 0,
				        "reward": 0,
				        "size": 0,
				        "blockIndex": 190460,
				        "prevBlockIndex": 190457,
				        "height": 170359,
				        "hash": "00000000000006436073c07dfa188a8fa54fefadf571fd774863cda1b884b90f",
				        "mrklRoot": "94e51495e0e8a0c3b78dac1220b2f35ceda8799b0a20cfa68601ed28126cfcc2",
				        "version": 1,
				        "time": 1331301261,
				        "bits": 436942092,
				        "nonce": 758889471
				    }
				})
			}
		},

		processRawBlock: function(op)
		{
			var self = this;
			this.server().blockchainInfoClient().rawBlock(op.pub_160, function(err, res){
				if (err)
				{
					self.sendError(err);
				}
				else
				{
					res.op = 'rawblock';
					self.sendOp(res);
				}
			});
		},
		
		sendError: function(error)
		{
			this.sendOp({ op: "error", error: error });
		},
		
		sendOp: function(op)
		{
			this._wsConnection.sendUTF(JSON.stringify(op));
		}
	})
}