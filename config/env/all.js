'use strict';

var path = require('path'),
rootPath = path.normalize(__dirname + '/../..');

module.exports = {
	root: rootPath,
	port: process.env.PORT || 3000,
    db: process.env.MONGOHQ_URL,
    passkey: "K1*<84;0[36G:D8U:&'w479@j](#Us>85dc'-17:39=k42_0_8j{>8^.)*d5",
    url: "http://localhost:3000"    
}
