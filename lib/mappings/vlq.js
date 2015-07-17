'use strict';

var VLQ_BASE_SHIFT = 5;

// binary: 100000
var VLQ_BASE = 1 << VLQ_BASE_SHIFT;

// binary: 011111
var VLQ_BASE_MASK = VLQ_BASE - 1;

// binary: 100000
var VLQ_CONTINUATION_BIT = VLQ_BASE;

// Decode result transport object
var DECODE_RESULT = { '0': 0, '1': 0 };

var ENCODE_MAP = {};
var DECODE_MAP = {};

'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('').forEach(function (ch, index) {
    ENCODE_MAP[index] = ch;
    DECODE_MAP[ch] = index;
});

module.exports = {
    encode: encode,
    decode: decode,

    encodeVLQ: encodeVLQ,
    decodeVLQ: decodeVLQ,

    toVLQ: toVLQ,
    fromVLQ: fromVLQ
};

function toVLQ(value) {
    return value < 0 ? (-value << 1) | 1 : value << 1;
}

function fromVLQ(value) {
    return (value & 1) ? -(value >> 1) : (value >> 1);
}

function encode(value) {
    return encodeVLQ(toVLQ(value));
}

function encodeVLQ(value) {
    var digit;
    var result = '';

    do {
        digit = value & VLQ_BASE_MASK;
        value >>>= VLQ_BASE_SHIFT;

        if (value > 0) {
            digit |= VLQ_CONTINUATION_BIT;
        }

        result += ENCODE_MAP[digit];
    } while (value > 0);

    return result;
}

function decode(string, index) {
    decodeVLQ(string, index);
    DECODE_RESULT[0] = fromVLQ(DECODE_RESULT[0]);
    return DECODE_RESULT;
}

function decodeVLQ(string, index) {
    var digit;
    var length = string.length;
    var result = 0;
    var shift = 0;

    index = index || 0;

    do {
        if (index >= length) {
            throw new Error('Expected more digits in base 64 VLQ value.');
        }

        digit = DECODE_MAP[string[index++]];

        if (digit == null) {
            throw new TypeError("Not a valid base 64 digit: "+ string[index - 1]);
        }

        result += (digit & VLQ_BASE_MASK) << shift;
        shift += VLQ_BASE_SHIFT;
    } while (digit >= VLQ_CONTINUATION_BIT);

    DECODE_RESULT[0] = result;
    DECODE_RESULT[1] = index;

    return DECODE_RESULT;
}
