'use strict';

var util = require('./util');
var segment = require('./segment');
var sortedIndex = util.sortedIndex;

exports.parse = parse;
exports.stringify = stringify;
exports.slice = slice;
exports.add = add;
exports.index = index;
exports.find = find;
exports.findGenerated = findGenerated;
exports.original = original;
exports.optimize = optimize;
exports.apply = apply;

exports.compareGeneratedSort = compareGeneratedSort;
exports.compareGenerated = compareGenerated;
exports.compareOriginalSort = compareOriginalSort;
exports.compareOriginal = compareOriginal;

function slice(mappings, from, to) {
    return to
        ? mappings.slice(index(mappings, from), index(mappings, to))
        : mappings.slice(index(mappings, from));
}

function add(mappings, items) {
    var index_;
    var i = items.length;

    for (;i--;) {
        index_ = index(mappings, items[i]);
        mappings.splice(index_, 0, items[i]);
    }
}

function apply(mappings, target) {
    var i, line, column, item;
    var result = [];

    for (i = target.length; i--;) {
        if (target[i][2] == null) {
            result.unshift(target[i]);
        } else {
            line = target[i][3];
            column = target[i][4];

            item = find(mappings, [ line, column ]);

            if (item) {
                target[i][2] = item[2];
                target[i][3] = item[3];
                target[i][4] = item[4];

                if (target[i][5] != null) {
                    target[i][5] = item[5];
                }

                result.unshift(target[i]);
            }
        }
    }

    return result;
}

function optimize(mappings) {
    var last, item;
    var result = [];
    var removed = [];
    var sources = {};
    var names = {};
    var i = mappings.length;

    for (; i--;) {
        item = mappings[i];
        last = result[0];

        if (last
            && last[0] === item[0]
            && last[1] === item[1]) {
            removed.unshift(item);
        } else if (last
            && last[0] === item[0]
            && last[2] === item[2]
            && last[3] === item[3]
            && last[4] === item[4]
            && last[5] === item[5]) {
            removed.unshift(last);
            result[0] = item;
        } else {
            result.unshift(item);

            if (item[2] != null) {
                sources[item[2]] = true;
            }

            if (item[5] != null) {
                names[item[5]] = true;
            }
        }
    }

    sources = Object.keys(sources).map(Number);
    names = Object.keys(names).map(Number);

    for (i = sources.length; i--;) {
        if (sources[i] !== i) {
            break;
        }
    }

    if (i < 0) {
        for (i = names.length; i--;) {
            if (names[i] !== i) {
                break;
            }
        }
    }

    if (i >= 0) {
        for (i = result.length; i--;) {
            item = result[i];

            if (item[2] != null) {
                item[2] = sources.indexOf(item[2]);
            }

            if (item[5] != null) {
                item[5] = names.indexOf(item[5]);
            }
        }
    }

    return {
        mappings: result,
        sources: sources,
        names: names,
        removed: removed
    };
}

function index(mappings, needle) {
    return sortedIndex(mappings, needle, compareGeneratedSort);
}

function find(mappings, needle, upper) {
    var result = _find(
                    mappings,
                    needle,
                    compareGeneratedSort,
                    compareGenerated,
                    ! upper);

    return result
        && result[0] === needle[0]
        && result;
}

function original(mappings) {
    return mappings.filter(hasOriginal).sort(compareOriginalSort);
}

function findGenerated(original, needle, upper) {
    var result = _find(
                    original,
                    needle,
                    compareOriginalSort,
                    compareOriginal,
                    ! upper);

    return result
        && result[2] === needle[2]
        && result[3] === needle[3]
        && result;
}

function _find(mappings, needle, compareSort, compare, lower) {
    var index = util.sortedIndex(mappings, needle, compareSort);
    var result = mappings[index];

    if (lower && ( ! result || compare(result, needle) > 0)) {
        result = mappings[--index];
    }

    return result;
}

function parse(mappings) {
    var i, l, c, p, segment_, mapping;
    var gline = 0;
    var gcolumn = 0;
    var oline = 0;
    var ocolumn = 0;
    var source = 0;
    var name = 0;
    var result = [];
    var LINE_SEP = ';';
    var SEGMENT_SEP = ',';

    if ( ! mappings) {
        return result;
    }

    for (i = 0, p = 0, l = mappings.length; i <= l; i++) {
        c = mappings[i];

        if ( ! c || c === LINE_SEP || c === SEGMENT_SEP) {
            if (i !== p) {
                segment_ = segment(mappings.slice(p, i));

                mapping = [ gline, gcolumn += segment_[0], null, null, null, null ];

                if (segment_[1] != null) {
                    mapping[2] = source += segment_[1];
                    mapping[3] = oline += segment_[2];
                    mapping[4] = ocolumn += segment_[3];
                }

                if (segment_[4] != null) {
                    mapping[5] = name += segment_[4];
                }

                result.push(mapping);
            }

            p = i + 1;
        }

        if (c === LINE_SEP) {
            gline++;
            gcolumn = 0;
        }
    }

    result.sort(compareGeneratedSort);

    return result;
}

function stringify(mappings) {
    var i, l, mapping, line, segment_, k;
    var last = [ 0, 0, 0, 0, 0, 0 ];
    var diff = [ 0, 0, 0, 0, 0, 0 ];
    var lines = [];

    mappings.sort(compareGeneratedSort);

    for (i = 0, l = mappings.length; i < l; i++) {
        mapping = mappings[i];
        line = lines[mapping[0]];

        if ( ! line) {
            line = [];
            lines[mapping[0]] = line;
            last[1] = 0;
        }

        for (k = 1; mapping[k] != null; k++) {
            diff[k] = mapping[k] - last[k];
            last[k] = mapping[k];
        }

        if (mapping[2] == null) {
            segment_ = segment(diff[1]);
        } else if (mapping[5] == null) {
            segment_ = segment(diff[1], diff[2], diff[3], diff[4]);
        } else {
            segment_ = segment(diff[1], diff[2], diff[3], diff[4], diff[5]);
        }

        line.push(segment_[5]);
    }

    return lines.map(joinSegments).join(';');
}

function compareGeneratedSort(a, b) {
    return compareGenerated(a, b)
        || ((a[2] == null && b[2] == null)
            ? 0 : compareOriginal(a, b));
}

function compareOriginalSort(a, b) {
    return compareOriginal(a, b)
        || compareGenerated(a, b);
}

function compareGenerated(a, b) {
    return compareIndex(a, b, 0)
        || compareIndex(a, b, 1);
}

function compareOriginal(a, b) {
    return compareIndex(a, b, 2)
        || compareIndex(a, b, 3)
        || compareIndex(a, b, 4)
        || compareIndex(a, b, 5);
}

function compareIndex(a, b, i) {
    return (a[i] == null ? -1 : a[i]) - (b[i] == null ? -1 : b[i]);
}

function hasOriginal(item) {
    return item[2] != null;
}

function joinSegments(item) {
    return item ? item.join(',') : '';
}
