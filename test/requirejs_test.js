'use strict';

var assert = require('assert');
var Requirejs = require('../lib/requirejs');

function errorHandler(err){
    process.nextTick(function rethrow() { throw err; });
}

(new Requirejs).run(
    [{
        path: __dirname + '/fixtures/main.js'
    }], // inputs
    {
        baseUrl: __dirname + '/fixtures'
    }, // options
    console // logger
).then(function(inputs){
        assert(inputs.toString().indexOf('define') === 0)
}).catch(errorHandler);

(new Requirejs).run(
    [{
        path: __dirname + '/fixtures/main.js'
    }], // inputs
    {
        baseUrl: __dirname + '/fixtures',
        amdClean: true
    }, // options
    console // logger
).then(function(inputs){
        assert(inputs.toString().indexOf('define') === -1)
    }).catch(errorHandler)
