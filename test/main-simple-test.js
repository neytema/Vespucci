'use strict';

var assert = require('assert');
var main = require('../lib/main');

console.log('  main.setContent', 'should convert content argument to string');

[ undefined, null, NaN, Infinity, -Infinity, 0, 1, -1, /a/ ].forEach(function (value) {
    var instance = { points: [] };
    main.setContent(instance, value);
    assert.strictEqual(instance.content, String(value));
});

console.log('  main.setContent', 'should reset length property');

[ 1, 2, 4, 100 ].forEach(function (length) {
    var instance = { points: [] };
    main.setContent(instance, Array(length + 1).join('a'));
    assert.strictEqual(instance.length, length);
});

console.log('  main.setContent', 'should reset points to contents length');

[ 1, 2, 4, 100 ].forEach(function (length) {
    var instance = { points: [] };
    main.setContent(instance, Array(length + 1).join('a'));
    assert.strictEqual(instance.points.length, length);
});

console.log('  main.setContent', 'should reset index/position cache');

[ 1, 2, 4, 100 ].forEach(function (length) {
    var instance = { points: [], $$lines: [ 1 ] };
    main.setContent(instance, Array(length + 1).join('a'));
    assert.strictEqual(instance.$$lines.length, 0);
});

console.log('  main.setContent', "shouldn't create index/position cache");

[ null, 1, true, undefined ].forEach(function (value) {
    var instance = { points: [], $$lines: value };

    if (value === undefined) {
        delete instance.$$lines;
        main.setContent(instance, 'a');
        assert.ok( ! ('$$lines' in instance));
    } else {
        main.setContent(instance, 'a');
        assert.strictEqual(instance.$$lines, value);
    }
});

console.log('  main.addSource', 'should accept source index as argument');

[ 0, 1, 2, 3 ].forEach(function (source) {
    var instance = { sources: 'abcd'.split('') };

    assert.doesNotThrow(function () {
        main.addSource(instance, source);
    }, 'failed with '+ source);
});

console.log('  main.addSource', 'should throw when source argument is not integer or string');

[ null, undefined, NaN, Infinity, {}, [ 0 ] ].forEach(function (source) {
    var instance = { sources: [] };

    assert.throws(function () {
        main.addSource(instance, source);
    }, TypeError, 'failed with '+ source);
});

console.log('  main.addSource', 'should throw when source index is out of range');

[ -1, 4, Infinity, -Infinity ].forEach(function (source) {
    var instance = { sources: [] };

    assert.throws(function () {
        main.addSource(instance, source);
    }, TypeError, 'failed with '+ source);
});

console.log('  main.addSource', 'should add new source to sources');

'abcd'.split('').forEach(function (source) {
    var instance = { sources: 'efg'.split('') };
    main.addSource(instance, source);
    assert.equal(instance.sources.length, 4);
    assert.equal(instance.sources[3], source);
});

console.log('  main.addSource', "shouldn't add existing source to sources");

'abcd'.split('').forEach(function (source) {
    var instance = { sources: 'abcd'.split('') };
    main.addSource(instance, source);
    assert.equal(instance.sources.join(''), 'abcd');
});

console.log('  main.addSource', 'should return correct index');

'abcdefg'.split('').concat([ 0, 1, 2 ]).forEach(function (source) {
    var instance = { sources: 'efg'.split('') };
    var result = main.addSource(instance, source);

    if (typeof source === 'string') {
        assert.equal(result, instance.sources.indexOf(source));
    } else {
        assert.equal(result, source);
    }
});

console.log('  main.addSource', 'should set source content on correct index');

'abc'.split('').concat([ 0, 2 ]).forEach(function (source) {
    var instance = { sources: 'befg'.split(''), sourcesContent: [] };
    var result = main.addSource(instance, source, 'source content');
    assert.equal(instance.sourcesContent[result], 'source content');
});

console.log('  main.addSource', 'should accept null as source content');

'abc'.split('').concat([ 0, 2 ]).forEach(function (source) {
    var instance = { sources: 'befg'.split(''), sourcesContent: 'befg'.split('') };
    var result = main.addSource(instance, source, null);
    assert.strictEqual(instance.sourcesContent[result], null);
});

console.log('  main.addName', 'should add new name to names');

'abcd'.split('').forEach(function (name) {
    var instance = { names: 'efg'.split('') };
    main.addName(instance, name);
    assert.equal(instance.names.length, 4);
    assert.equal(instance.names[3], name);
});

console.log('  main.addName', "shouldn't add existing name to names");

'abcd'.split('').forEach(function (name) {
    var instance = { names: 'abcd'.split('') };
    main.addName(instance, name);
    assert.equal(instance.names.join(''), 'abcd');
});

console.log('  main.addName', 'should return correct index');

'abcdefg'.split('').forEach(function (name) {
    var instance = { names: 'efg'.split('') };
    var result = main.addName(instance, name);
    assert.equal(result, instance.names.indexOf(name));
});

// TODO: implement tests
// function clearPoints(instance, from, to) {}
// function clone(instance) {}
