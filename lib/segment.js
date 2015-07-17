// TODO: Compare performance with and without cache

'use strict';

var vlq = require('./vlq');

var cache = {};

module.exports = segment;

function segment(column, source, oline, ocolumn, name) {
    var result, skey, vkey;
    var s = ' ';

    if (typeof column === 'string') {
        skey = column;
    } else if (source == null) {
        vkey = s + column;
    } else if (name == null) {
        vkey = s + column + s + source + s + oline + s + ocolumn;
    } else {
        vkey = s + column + s + source + s + oline + s + ocolumn + s + name;
    }

    result = cache[skey || vkey];

    if ( ! result) {
        if (skey) {
            result = parse([ null, null, null, null, null, column ]);
            vkey = result[1] == null
                ? (s + result[0])
                : result[4] == null
                ? (s + result[0] + s + result[1] + s + result[2] + s + result[3])
                : (s + result[0] + s + result[1] + s + result[2] + s + result[3] + s + result[4]);
        } else {
            result = stringify(
                source == null
                ? [ column, null, null, null, null, '' ]
                : name == null
                ? [ column, source, oline, ocolumn, null, '' ]
                : [ column, source, oline, ocolumn, name, '' ]);
            skey = result[5];
        }

        cache[skey] = cache[vkey] = result;
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
