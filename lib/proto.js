'use strict';

var mappings = require('./mappings');
var util = require('./util');
var main = require('./main');

var define = util.define;
var isArray = Array.isArray;
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
    main.setContent(this, content);
    return this;
};

Vespucci.prototype.clone = function () {
    var copy = new Vespucci(this.content, this);
    copy.points = this.points.slice();
    return copy;
};

Vespucci.prototype.addPoints = function (points) {
    main.addPoints(this, arguments.length > 1 ? arguments : points);
    return this;
};

Vespucci.prototype.setPoint = function (index, point) {
    main.setPoint(this, index, point);
    return this;
};

Vespucci.prototype.addSource = function (source, content) {
    return main.addSource(this, source, content);
};

Vespucci.prototype.addName = function (name) {
    return main.addName(this, name);
};

Vespucci.prototype.getMappings = function () {
    return main.getMappings(this);
};

Vespucci.prototype.position = function (index) {
    return main.position(this, index);
};

Vespucci.prototype.index = function (line, column) {
    return main.index(this, line, column);
};

Vespucci.prototype.slice = function (from, to) {
    return main.slice(this, from, to);
};

Vespucci.prototype.clearPoints = function (from, to) {
    main.clearPoints(this, from, to);
    return this;
};

Vespucci.prototype.remove = function (from, to) {
    main.remove(this, from, to);
    return this;
};

Vespucci.prototype.insert = function (index, item) {
    main.insert(this, index, item);
    return this;
};

Vespucci.prototype.append = function () {
    main.append(this, arguments);
    return this;
};

Vespucci.prototype.prepend = function () {
    main.prepend(this, arguments);
    return this;
};

Vespucci.prototype.optimize = function () {
    main.optimize(this);
    return this;
};

Vespucci.prototype.replace = function (pattern, replacement) {
    main.replace(this, pattern, replacement);
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

    main.apply(this, content, map);

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
    this.mappings = mappings.stringify(this.getMappings());
    return this;
};

Vespucci.prototype.toSourceMap = function () {
    var key, i, l;
    var keys = Object.keys(this);
    var map = {};

    this.toJSON();

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
