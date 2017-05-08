// OK
var _mappings = require('../lib/mappings');

module.exports = generate;

function generate(content, map) {
    var output = [ _head() ];
    var mappings = _mappings.parse(map.mappings);
    output.push(
        '<div class="left-side">',
            '<pre id="code">', _generated(content, map, mappings), '</pre>',
            // '<pre id="map"></pre>',
        '</div>',
        '<div class="right-side">',
            _sources(map, mappings),
        '</div>');

    return output.join('');
}

function _sources(map, mappings) {
    return map.sources.map(function (source, index) {
        return '<pre>'+ _source(index, map.sourcesContent[index], mappings) +'</pre>';
    }).join('');
}

function _source(index, content, mappings) {
    var i, item;
    var lines = getLines(content);
    var lastIndex = 0;
    var output = [];

    mappings = mappings
        .filter(function (item) { return item[2] === index; })
        .sort(_mappings.compareOriginalSort)
        .filter(function (item, i, list) {
            var prev = list[i - 1];
            return ! prev || item[3] !== prev[3] || item[4] !== prev[4];
        });

    for (i = 0; i < mappings.length; i++) {
        item = mappings[i];
        index = lines[item[3]] + item[4];

        output.push(htmlEscape(content.slice(lastIndex, index)));

        output.push('<span class="mapping" tabindex="0" id="src-', item[2], '-', item[3], '-', item[4] ,'">');
        output.push(htmlEscape(content.slice(index, ++index)));
        output.push('</span>');

        lastIndex = index;
    }

    output.push(htmlEscape(content.slice(lastIndex)));

    return output.join('');
}

function _generated(content, map, mappings) {
    var i, index, item;
    var lines = getLines(content);
    var lastIndex = 0;
    var output = [];
    var open = false;

    for (i = 0; i < mappings.length; i++) {
        item = mappings[i];
        index = lines[item[0]] + item[1];

        output.push(htmlEscape(content.slice(lastIndex, index)));

        if (open) {
            output.push('</span>');
            open = false;
        }

        if (item[2] != null) {
            open = true;
            output.push('<span class="mapping" tabindex="0" onclick="document.getElementById(\'src-', item[2], '-', item[3], '-', item[4] ,'\').focus()">');
            output.push('<span class="data">', map.sources[item[2]], ':', item[3] + 1, ':', item[4] + 1);

            if (item[5] != null) {
                output.push(' (', map.names[item[5]], ')');
            }

            output.push('</span>');
        }

        lastIndex = index;
    }

    output.push(htmlEscape(content.slice(lastIndex)));

    if (open) {
        output.push('<span>');
    }

    return output.join('');
}

function htmlEscape(string) {
    var m = { '>' : '&gt;', '<' : '&lt;', '\'' : '&#x27;', '"' : '&quot;'};

    return string.replace(/[<>'"]/g, function (c) {
        return m[c];
    });
}

function getLines(content) {
    var lines = [];
    var nl = '\n';
    var i = 0;
    var index = -1;

    do {
        lines[i++] = index += 1;
        index = content.indexOf(nl, index);
    } while (index >= 0);

    return lines;
}

function _head() {
    return ''
        +'<!DOCTYPE html>'
        +'<title>Map Point Representation</title>'
        +'<style>'
        +'html, body {'
            +'height: 100%;'
            +'margin: 0;'
        +'}'
        +'pre {'
            +'border: solid 4px #eee;'
            +'overflow: auto;'
            +'margin: 0 0 4px;'
            +'max-height: 100%;'
            +'box-sizing: border-box;'
            +'padding: 1px 1px 20px;'
        +'}'
        +'.mapping {'
            +'position: relative;'
        +'}'
        +'.mapping:focus {'
            +'background: #c00;'
        +'}'
        +'.mapping .data {'
            +'position: absolute;'
            +'top: 100%; left: 0;'
            +'background: #000;'
            +'color: #fff;'
            +'padding: 1px 3px;'
            +'border: solid 1px #eee;'
            +'z-index: 1;'
            +'display: none;'
        +'}'
        +'.mapping:hover {'
            +'background: #eec;'
        +'}'
        +'.mapping:hover .data {'
            +'display: block;'
        +'}'
        +'.right-side,'
        +'.left-side {'
            +'float: left;'
            +'width: 50%;'
            +'height: 100%;'
            +'overflow: auto;'
        +'}'
        +'</style>'
        +'<body>';
}
