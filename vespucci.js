'use strict';

var Vespucci = require('./lib/proto');
var statics = require('./lib/statics');
var mappings = require('./lib/mappings');

create.Vespucci = Vespucci;
create.statics = statics;
create.mappings = mappings;

module.exports = create;

function create(content, map) {
    var instance = new Vespucci(content, map);

    if (instance.mappings) {
        instance.addPoints(mappings.parse(instance.mappings));
    }

    return instance;
}
