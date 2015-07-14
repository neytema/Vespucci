'use strict';

var Vespucci = require('./lib/proto');
var statics = require('./lib/statics');
var mappings = require('./lib/mappings');

create.Vespucci = Vespucci;
create.statics = statics;
create.mappings = mappings;

module.exports = create;

function create(content, map) {
    return new Vespucci(content, map);
}
