'use strict';

var vlq = require('./vlq');

module.exports = segment;

function segment(column, source, oline, ocolumn, name) {
    var result;

    if (typeof column === 'string') {
        result = parse([ null, null, null, null, null, column ]);
    } else {
        result = stringify(
            source == null
            ? [ column, null, null, null, null, '' ]
            : name == null
            ? [ column, source, oline, ocolumn, null, '' ]
            : [ column, source, oline, ocolumn, name, '' ]);
    }

    return result;
}

function parse(segment) {
    var i, l, temp;
    var length = 0;
    var string = segment[5];

    for (i = 0, l = string.length; i < l;) {
        temp = vlq.decode(string, i);
        segment[length++] = temp[0];
        i = temp[1];
    }

    if (length === 2) {
        throw new Error('Found a source, but no line and column');
    } else if (length === 3) {
        throw new Error('Found a source and line, but no column');
    }

    return segment;
}

function stringify(segment) {
    var i = 0;
    var l = segment[1] == null ? 1 : segment[4] == null ? 4 : 5;

    for (; i < l; i++) {
        segment[5] += vlq.encode(segment[i]);
    }

    return segment;
}
