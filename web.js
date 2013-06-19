#!/usr/bin/env node
var btcStreamServer = require('./lib/btc-stream/btc-stream').Server;

btcStreamServer.start();