BTCStream
=========

Extensions to blockchain's WS API

Start on port 8080:
=========

node web.js

Get a block:
=========

{"op":"rawblock","pub_160":"000000000000003c790e634e23f1886272157928721c5976cd93016adc0eba8d"}
(same result as http://blockchain.info/rawblock/000000000000003c790e634e23f1886272157928721c5976cd93016adc0eba8d)

Run tests:
=========

npm_modules/.bin/mocha