'use strict';

var key;

var Vespucci = require('./lib/proto');
var statics = require('./lib/statics');
var mappings = require('./lib/mappings');

exports.create = create;
exports.Vespucci = Vespucci;
exports.mappings = mappings;

for (key in statics) {
    exports[key] = statics[key];
}

function create(content, map) {
    var instance = new Vespucci(content, map);

    if (instance.mappings) {
        instance.addPoints(mappings.parse(instance.mappings));
    }

    return instance;
}
