'use strict';

var failed;

require('fs').readdirSync(__dirname)
.filter(function (item) { return item.match(/-test.js$/); })
.forEach(function (item, index, list) {
    if ( ! index) {
        console.log('Starting test suite of %d test file%s...', list.length, list.length > 1 ? 's' : '');
    }

    try {
        console.log('Running \'%s\' file... (%d of %d)', item, index + 1, list.length);
        require('./'+ item);
    } catch (ex) {
        failed = true;
        console.error(ex.stack || ex);
    }
});

if (failed) {
    process.exit(1);
}
