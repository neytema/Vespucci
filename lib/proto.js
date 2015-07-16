'use strict';

var mappings = require('./mappings');
var util = require('./util');
var statics = require('./statics');

var define = util.define;
var isArray = Array.isArray;
var max = Math.max;
var xssRex = /^\)\]\}'/;

module.exports = Vespucci;

function Vespucci(content, map) {
    map = typeof map === 'string' ? JSON.parse(map.replace(xssRex, '')) : map || {};

    define(this, 'length', 0);
    define(this, 'content', content || '');
    define(this, 'points', []);
    define(this, '$$lines', []);

    this.version = Number(map.version) || 3;

    if (map.file) {
        this.file = map.file;
    }

    if (map.sourceRoot) {
        this.sourceRoot = map.sourceRoot;
    }

    this.sources = map.sources ? map.sources.slice() : [];
    this.sourcesContent = map.sourcesContent ? map.sourcesContent.slice() : [];
    this.names = map.names ? map.names.slice() : [];
    this.mappings = map.mappings || '';
}

Vespucci.prototype.setContent = function (content) {
    statics.setContent(this, content);
    return this;
};

Vespucci.prototype.clone = function () {
    var copy = new Vespucci(this.content, this);
    copy.points = this.points.slice();
    return copy;
};

Vespucci.prototype.addPoints = function (points) {
    statics.addPoints(this, arguments.length > 1 ? arguments : points);
    return this;
};

Vespucci.prototype.setPoint = function (index, point) {
    statics.setPoint(this, index, point);
    return this;
};

Vespucci.prototype.addSource = function (source, content) {
    return statics.addSource(this, source, content);
};

Vespucci.prototype.addName = function (name) {
    return statics.addName(this, name);
};

Vespucci.prototype.getMappings = function () {
    return statics.getMappings(this);
};

Vespucci.prototype.position = function (index) {
    return statics.position(this, index);
};

Vespucci.prototype.index = function (line, column) {
    return statics.index(this, line, column);
};

Vespucci.prototype.slice = function (from, to) {
    return statics.slice(this, from, to);
};

Vespucci.prototype.clearPoints = function (from, to) {
    var length = this.length;
    from = normalizeIndex(from, length, 0);
    to = normalizeIndex(to, length, length);

    return statics.clearPoints(this, from, to);
};

Vespucci.prototype.remove = function (from, to) {
    var length = this.length;
    from = normalizeIndex(from, length, 0);
    to = normalizeIndex(to, length, length);
    statics.remove(this, from, to);
    return this;
};

Vespucci.prototype.insert = function (index, item) {
    var length = this.length;
    index = normalizeIndex(index, length, 0);
    statics.insert(this, index, item);
    return this;
};

Vespucci.prototype.append = function () {
    statics.append(this, arguments);
    return this;
};

Vespucci.prototype.prepend = function () {
    statics.prepend(this, arguments);
    return this;
};

Vespucci.prototype.optimize = function () {
    statics.optimize(this);
    return this;
};

Vespucci.prototype.replace = function (pattern, replacement) {
    statics.replace(this, pattern, replacement);
    return this;
};

Vespucci.prototype.apply = function (content, map) {
    if (typeof map === 'string') {
        if (map.indexOf('"') > 0) {
            map = new Vespucci(null, map);
        } else {
            map = { mappings: map };
        }
    }

    if ( ! isArray(map)) {
        map = mappings.parse(map.mappings);
    }

    statics.apply(this, content, map);

    return this;
};

Vespucci.prototype.match = function (regexp) { regexp; throw 'Not implemented'; };
Vespucci.prototype.split = function (separator, limit) { limit; throw 'Not implemented'; };
Vespucci.prototype.trim = function () { throw 'Not implemented'; };

Vespucci.prototype.charAt = function (index) {
    return this.content.charAt(index);
};

Vespucci.prototype.charCodeAt = function (index) {
    return this.content.charCodeAt(index);
};

Vespucci.prototype.includes = function (string, from) {
    return this.indexOf(string, from) !== -1;
};

Vespucci.prototype.indexOf = function (string, from) {
    return this.content.indexOf(string, from);
};

Vespucci.prototype.lastIndexOf = function (string, from) {
    return this.content.lastIndexOf(string, from);
};

Vespucci.prototype.search = function (regexp) {
    return this.content.search(regexp);
};

Vespucci.prototype.toString = function () {
    return this.content;
};

Vespucci.prototype.toJSON = function () {
    var key, i, l;
    var keys = Object.keys(this);
    var map = {};

    this.mappings = mappings.stringify(this.getMappings());

    for (i = 0, l = keys.length; i < l; i++) {
        key = keys[i];

        if (isArray(this[key])) {
            map[key] = this[key].slice();
        } else {
            map[key] = this[key];
        }
    }

    return map;
};

Vespucci.prototype.toSourceMap = Vespucci.prototype.toJSON;

function normalizeIndex(value, length, default_) {
    return typeof value === 'undefined' ? default_
        : isNaN(value = Number(value)) ? 0
        : value < 0 ? max(0, length + value)
        : value;
}
