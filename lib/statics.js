'use strict';

var util = require('./util');
var mappings = require('./mappings');

var define = util.define;
var isArray = Array.isArray;
var push = Array.prototype.push;
var unshift = Array.prototype.unshift;
var splice = Array.prototype.splice;

exports.setContent  = setContent;
exports.addPoints   = addPoints;
exports.setPoint    = setPoint;
exports.index       = index;
exports.addSource   = addSource;
exports.addName     = addName;
exports.optimize    = optimize;
exports.getMappings = getMappings;
exports.position    = position;
exports.insert      = insert;
exports.remove      = remove;
exports.append      = append;
exports.prepend     = prepend;
exports.replace     = replace;
exports.clearPoints = clearPoints;
exports.slice       = slice;
exports.clone       = clone;
exports.apply       = apply;

function apply(instance, content, mapping) {
    var points = mappings.apply(getMappings(instance), mapping);

    instance.points.length = 0;
    setContent(instance, content);
    addPoints(instance, points);
}

function setContent(instance, content) {
    var lines = instance.$$lines;
    instance.content = content;
    instance.length = content.length;
    instance.points.length = content.length;

    if (isArray(lines)) {
        lines.length = 0;
    }
}

function addPoints(instance, points) {
    var i = 0;
    var l = points.length;

    for (; i < l; i++) {
        setPoint(instance, points[i]);
    }
}

function setPoint(instance, index_, point) {
    var i = 4;

    if ( ! point) {
        point = index_;
        index_ = null;
    }

    if (isArray(point)) {
        index_ = index_ === null ? index(instance, point[0], point[1]) : index_;
        point = point.length > 4 ? point.slice(2) : point;
    } else if ('generated' in point) {
        index_ = index_ === null ? index(instance, point.generated.line, point.generated.column) : index_;
        point = [ point.source, point.original.line, point.original.column, point.name ];
    } else if ('generatedLine' in point) {
        index_ = index_ === null ? index(instance, point.generatedLine, point.generatedColumn) : index_;
        point = [ point.source, point.originalLine, point.originalColumn, point.name ];
    } else if ('line' in point) {
        point = [ point.source, point.line, point.column, point.name ];
    }

    for (; i--;) {
        if (point[i] == null) {
            point[i] = null;
        }
    }

    if (index_ === null) {
        throw new Error('Index not found');
    }

    if (typeof point[0] === 'string') {
        point[0] = addSource(instance, point[0]);
    }

    if (typeof point[3] === 'string') {
        point[3] = addName(instance, point[3]);
    }

    instance.points[index_] = point;
}

function index(instance, line, column) {
    return getLines(instance)[line] + column;
}

function addSource(instance, source, content) {
    var sources = instance.sources;
    var contents = instance.sourcesContent;
    var index = typeof source === 'string' ? sources.indexOf(source) : source;

    if (index < 0) {
        index = sources.push(source) - 1;
    }

    if (content != null) {
        contents[index] = content;
    }

    return index;
}

function addName(instance, name) {
    var names = instance.names;
    var index = typeof name === 'string' ? names.indexOf(name) : name;

    if (index < 0) {
        index = names.push(name) - 1;
    }

    return index;
}

function optimize(instance) {
    var i;
    var optimizatons = mappings.optimize(getMappings(instance));
    var points = instance.points;
    var names = instance.names;
    var sources = instance.sources;
    var sourcesContent = instance.sourcesContent;
    var tnames = names.slice();
    var tsources = sources.slice();
    var tsourcesContent = sourcesContent.slice();
    var onames = optimizatons.names;
    var osources = optimizatons.sources;

    names.length = 0;
    for (i = onames.length; i--;) {
        names[i] = tnames[onames[i]];
    }

    sources.length = 0;
    sourcesContent.length = 0;
    for (i = osources.length; i--;) {
        sources[i] = tsources[osources[i]];
        sourcesContent[i] = tsourcesContent[osources[i]] || null;
    }

    points.length = 0;
    addPoints(instance, optimizatons.mappings);
}

function getMappings(instance) {
    var i, l, point, item;
    var points = instance.points;
    var result = [];

    for (i = 0, l = points.length; i < l; i++) {
        point = points[i];

        if (point) {
            item = position(instance, i);
            item[2] = point[0];
            item[3] = point[1];
            item[4] = point[2];
            item[5] = point[3];
            result.push(item);
        }
    }

    return result;
}

function position(instance, index) {
    var i;
    var lines = getLines(instance);

    for (i = lines.length; lines[--i] > index;) {
        continue;
    }

    return [ i, index - lines[i] ];
}

function remove(instance, from, to) {
    var content = instance.content;

    if (from !== to) {
        instance.points.splice(from, to - from);
        setContent(instance, content.slice(0, from) + content.slice(to));
    }
}

function insert(instance, index, item) {
    var content_;
    var args = [ index, 0 ];
    var content = instance.content;
    var points = instance.points;

    if (hasPoints(item)) {
        content_ = item.content;
        push.apply(args, assimilate(instance, item));
    } else {
        content_ = String(item);
        push.apply(args, Array(content_.length));
    }

    splice.apply(points, args);
    setContent(instance, content.slice(0, index) + content_ + content.slice(index));
}

function append(instance, items) {
    var i, l, item;
    var content = instance.content;
    var points = instance.points;

    for (i = 0, l = items.length; i < l; i++) {
        item = items[i];

        if (hasPoints(item)) {
            points.length = content.length;
            content += item.content;
            push.apply(points, assimilate(instance, item));
        } else {
            content += item;
            points.length = content.length;
        }
    }

    setContent(instance, content);
}

function prepend(instance, items) {
    var i, item;
    var content = instance.content;
    var points = instance.points;

    for (i = items.length; i--;) {
        item = items[i];

        if (hasPoints(item)) {
            content = item.content + content;
            unshift.apply(points, assimilate(instance, item));
        } else {
            content = item + content;
            unshift.apply(points, Array(String(item).length));
        }
    }

    setContent(instance, content);
}

function assimilate(instance, target) {
    var i, l, point;
    var sources = target.sources;
    var sourcesContent = target.sourcesContent;
    var names = target.names;
    var points = target.points;
    var sourcesMap = [];
    var namesMap = [];
    var result = Array(target.content.length);

    for (i = 0, l = sources.length; i < l; i++) {
        sourcesMap[i] = addSource(instance, sources[i], sourcesContent[i]);
    }

    for (i = 0, l = names.length; i < l; i++) {
        namesMap[i] = addName(instance, names[i]);
    }

    for (i = 0, l = points.length; i < l; i++) {
        point = points[i];

        result[i] = point && [
            point[0] == null ? null : sourcesMap[point[0]] != null ? sourcesMap[point[0]] : point[0],
            point[1] == null ? null : point[1],
            point[2] == null ? null : point[2],
            point[3] == null ? null : namesMap[point[3]] != null ? namesMap[point[3]] : point[3]
        ];
    }

    return result;
}

function replace(instance, pattern, replacement) {
    var separator, i, item;
    var content = instance.content;
    var replacements = [];

    if (hasPoints(replacement)) {
        content.replace(pattern, function (match) {
            var from = arguments[arguments.length - 2];
            var to = from + match.length;
            replacements.push([ from, to, replacement ]);
        });
    } else if (typeof replacement === 'function') {
        content.replace(pattern, function (match) {
            var from = arguments[arguments.length - 2];
            var to = from + match.length;

            arguments[0] = slice(instance, from, to);
            replacements.push([ from, to, replacement.apply(this, arguments) ]);
        });
    } else {
        separator = '%__REPLACE_SEPARATOR__%';
        replacement = String(replacement);

        content.replace(pattern, function (match) {
            var from = arguments[arguments.length - 2];
            var to = from + match.length;
            replacements.push([ from, to ]);
        });

        content = content.replace(pattern, separator + replacement + separator).split(separator);

        for (i = content.length - 2; i > 0; i -= 2) {
            replacements[(i / 2) | 0][2] = content[i];
        }
    }

    for (i = replacements.length; i--;) {
        item = replacements[i];

        if (typeof item[2] !== 'undefined') {
            remove(instance, item[0], item[1]);
            insert(instance, item[0], item[2]);
        }
    }
}

function clearPoints(instance, from, to) {
    var i;
    var points = instance.points;

    for (i = from; i < to; i++) {
        points[i] = null;
    }
}

function slice(instance, from, to) {
    var copy;
    var content = instance.content.slice(from, to);
    var points = instance.points.slice(from, to);

    if (typeof instance.clone === 'function') {
        copy = instance.clone();
    } else {
        copy = clone(instance);
    }

    copy.points = points;
    setContent(copy, content);

    return copy;
}

function clone(instance) {
    var copy = {
        version: Number(instance.version) || 3,
        sources: instance.sources ? instance.sources.slice() : [],
        sourcesContent: instance.sourcesContent ? instance.sourcesContent.slice() : [],
        names: instance.names ? instance.names.slice() : [],
        mappings: instance.mappings || ''
    };

    define(copy, 'length', 0);
    define(copy, 'content', instance.content);
    define(copy, 'points', instance.points.slice());
    define(copy, '$$lines', []);

    if (instance.file) {
        copy.file = instance.file;
    }

    if (instance.sourceRoot) {
        copy.sourceRoot = instance.sourceRoot;
    }

    return copy;
}

function hasPoints(object) {
    return Boolean(object && object.points);
}

function getLines(instance) {
    var lines = instance.$$lines || [];

    if ( ! lines.length) {
        _fillLines(lines, instance.content);
    }

    return lines;
}

function _fillLines(lines, content) {
    var nl = '\n';
    var i = 0;
    var index = -1;

    do {
        lines[i++] = index += 1;
        index = content.indexOf(nl, index);
    } while (index >= 0);
}
