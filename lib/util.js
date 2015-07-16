'use strict';

var DEF_PROP = { writable: true, enumerable: false, configurable: true };
var GREATEST_LOWER_BOUND = 1;
var LEAST_UPPER_BOUND    = 2;

exports.define = define;
exports.toMapping = toMapping;
exports.validMapping = validMapping;
exports.validBias = validBias;
exports.GREATEST_LOWER_BOUND = GREATEST_LOWER_BOUND;
exports.LEAST_UPPER_BOUND = LEAST_UPPER_BOUND;

function define(object, key, value) {
    DEF_PROP.value = value;
    Object.defineProperty(object, key, DEF_PROP);
}

function toMapping(map, mapping) {
    var result, line, column, source, oline, ocolumn, name;

    if (Array.isArray(mapping)) {
        validMapping(mapping);
        result = mapping;
    } else {
        line = null;
        column = null;
        source = null;
        oline = null;
        ocolumn = null;
        name = null;

        if (mapping.generated) {
            line = mapping.generated.line;
            column = mapping.generated.column;
        } else if (mapping.generatedLine) {
            line = mapping.generatedLine;
            column = mapping.generatedColumn;
        }

        if (mapping.original) {
            oline = mapping.original.line;
            ocolumn = mapping.original.column;
        } else if (mapping.originalLine) {
            oline = mapping.originalLine;
            ocolumn = mapping.originalColumn;
        }

        if (mapping.source) {
            if ( ! map.sources) {
                map.sources = [];
            }

            source = map.sources.indexOf(mapping.source);

            if (source < 0) {
                source = map.sources.length;
            }
        }

        if (mapping.name) {
            if ( ! map.names) {
                map.names = [];
            }

            name = map.names.indexOf(mapping.name);

            if (name < 0) {
                name = map.names.length;
            }
        }

        result = [ line, column, source, oline, ocolumn, name ];
        validMapping(result);

        if (map.sources && source === map.sources.length) {
            map.sources[source] = mapping.source;
        }

        if (map.names && name === map.names.length) {
            map.names[name] = mapping.name;
        }
    }

    return result;
}

function validBias(bias) {
    if (bias != null && bias !== LEAST_UPPER_BOUND && bias !== GREATEST_LOWER_BOUND) {
        throw new TypeError('Bias value must be equal to GREATEST_LOWER_BOUND or LEAST_UPPER_BOUND, got '+ bias);
    }
}

function validMapping(mapping) {
    var line    = mapping[0];
    var column  = mapping[1];
    var source  = mapping[2];
    var oline   = mapping[3];
    var ocolumn = mapping[4];
    var name    = mapping[5];

    if (source != null && source < 0 || source == null && (oline != null || ocolumn != null || name != null)) {
        throw new TypeError('Source value must be greater than or equal to 0, got '+ source);
    }

    if (oline != null && oline < 0 || oline == null && (ocolumn != null || name != null)) {
        throw new TypeError('Source line must be greater than or equal to 0, got '+ oline);
    }

    if (ocolumn != null && ocolumn < 0 || ocolumn == null && name != null) {
        throw new TypeError('Source column must be greater than or equal to 0, got '+ ocolumn);
    }

    if (name != null && name < 0) {
        throw new TypeError('Name value must be greater than or equal to 0, got '+ name);
    }

    if (line != null && line < 0 || line == null && (source != null || column != null)) {
        throw new TypeError('Line must be greater than or equal to 0, got '+ line);
    }

    if (column != null && column < 0) {
        throw new TypeError('Column must be greater than or equal to 0, got '+ column);
    }
}
