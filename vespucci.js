'use strict';

var key;

var Vespucci = require('./lib/proto');
var main = require('./lib/main');
var mappings = require('./lib/mappings');

exports.create = create;
exports.Vespucci = Vespucci;
exports.mappings = mappings;

for (key in main) {
    exports[key] = main[key];
}

function create(content, map) {
    var instance = new Vespucci(content, map);

    if (instance.mappings) {
        instance.addPoints(mappings.parse(instance.mappings));
    }

    return instance;
}
