'use strict';

var DEF_PROP = { writable: true, enumerable: false, configurable: true };

exports.define = define;

function define(object, key, value) {
    DEF_PROP.value = value;
    Object.defineProperty(object, key, DEF_PROP);
}
