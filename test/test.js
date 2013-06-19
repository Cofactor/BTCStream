var assert = require("assert");
var WebSocketClient = require('websocket').client;
var fs = require('fs');

function fixture(name)
{
	return JSON.parse(fs.readFileSync('test/fixtures/' + name + '.json'));
}

describe('BTC Stream', function(){
  describe('handshake', function(){
    it('should connect', function(done){
      	var client = new WebSocketClient();
		client.connect('ws://localhost:8080/', 'btc-stream');
		
		client.on('connectFailed', done);

		client.on('connect', function(connection) {
			assert(true);
			connection.close();
		    done();
		});
    });

	it('should stream a tx', function(done){
      	var client = new WebSocketClient();
		client.connect('ws://localhost:8080/', 'btc-stream');
		
		var wsConnection;
		client.on('connect', function(connection) {
			connection.sendUTF(JSON.stringify({"op":"sim"}));
			var receivedSimConf = false;
			
			connection.on('message', function(message){
				if (receivedSimConf)
				{
					op = JSON.parse(message.utf8Data);
					assert.equal(op.op, "utx");
					assert.notStrictEqual(op.x.hash, undefined);
					assert.notStrictEqual(op.x.vin_sz, undefined);
					assert.notStrictEqual(op.x.vout_sz, undefined);
					assert.notStrictEqual(op.x.lock_time, undefined);
					assert.notStrictEqual(op.x.size, undefined);
					assert.notStrictEqual(op.x.relayed_by, undefined);
					assert.notStrictEqual(op.x.tx_index, undefined);
					assert.notStrictEqual(op.x.time, undefined);
					assert.notStrictEqual(op.x.inputs[0].prev_out.value, undefined);
					assert.notStrictEqual(op.x.inputs[0].prev_out.type, undefined);
					assert.notStrictEqual(op.x.inputs[0].prev_out.addr, undefined);
					assert.notStrictEqual(op.x.out[0].value, undefined);
					assert.notStrictEqual(op.x.out[0].type, undefined);
					assert.notStrictEqual(op.x.out[0].addr, undefined);
					connection.close();
					done();
				}
				else
				{
					receivedSimConf = true;
					connection.sendUTF(JSON.stringify({"op":"unconfirmed_sub", "sim": true}));
				}
			});
		});
    });

	it('should stream a block', function(done){
      	var client = new WebSocketClient();
		client.connect('ws://localhost:8080/', 'btc-stream');
		
		var wsConnection;
		client.on('connect', function(connection) {
			connection.sendUTF(JSON.stringify({"op":"sim"}));
			var receivedSimConf = false;
			
			connection.on('message', function(message){
				if (receivedSimConf)
				{
					op = JSON.parse(message.utf8Data);
					assert.equal(op.op, "block");
					assert.notStrictEqual(op.x.txIndexes[0], undefined);
					assert.notStrictEqual(op.x.nTx, undefined);
					assert.notStrictEqual(op.x.totalBTCSent, undefined);
					assert.notStrictEqual(op.x.estimatedBTCSent, undefined);
					assert.notStrictEqual(op.x.reward, undefined);
					assert.notStrictEqual(op.x.size, undefined);
					assert.notStrictEqual(op.x.blockIndex, undefined);
					assert.notStrictEqual(op.x.prevBlockIndex, undefined);
					assert.notStrictEqual(op.x.height, undefined);
					assert.notStrictEqual(op.x.hash, undefined);
					assert.notStrictEqual(op.x.mrklRoot, undefined);
					assert.notStrictEqual(op.x.version, undefined);
					assert.notStrictEqual(op.x.time, undefined);
					assert.notStrictEqual(op.x.bits, undefined);
					assert.notStrictEqual(op.x.nonce, undefined);
					connection.close();
					done();
				}
				else
				{
					receivedSimConf = true;
					connection.sendUTF(JSON.stringify({"op":"blocks_sub", "sim": true}));
				}
			});
		});
    });

	it('should return rawblock data', function(done){
      	var client = new WebSocketClient();
		client.connect('ws://localhost:8080/', 'btc-stream');
		
		var wsConnection;
		client.on('connect', function(connection) {
			connection.sendUTF(JSON.stringify({"op":"rawblock", "pub_160": "000000000000003c790e634e23f1886272157928721c5976cd93016adc0eba8d"}));
			var receivedSimConf = false;
			
			connection.on('message', function(message){
				op = JSON.parse(message.utf8Data);
				assert.equal(op.op, "rawblock");
				delete op.op;
				assert.equal(JSON.stringify(fixture('rawblock')), JSON.stringify(op));
				connection.close();
				done();
			});
		});
    });
  })
});