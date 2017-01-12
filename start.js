function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    return null;
}
process.nextTick(function() {
    delete require.cache[module.id];
    if(typeof window !== "undefined" && window.mochaPhantomJS)
        mochaPhantomJS.run();
    else {
        var reporter = getQueryVariable('reporter');
        if (reporter) {
            mocha.reporter(reporter);
        }
        var disableTimeouts = getQueryVariable('disableTimeouts');
        if (disableTimeouts) {
            mocha.enableTimeouts(false);
        }
        var timeout = getQueryVariable('timeout');
        if (timeout) {
            mocha.timeout(timeout);
        }
        runner = mocha.run();
        runner.on('end', function() {
            if (reporter === 'json') {
                var result = {
                    stats: runner.testResults.stats,
                    tests: runner.testResults.tests.map(clean),
                    failures: runner.testResults.failures.map(clean),
                    passes: runner.testResults.passes.map(clean),
                    pending: runner.testResults.pending.map(clean)
                };
                document.querySelector('#mocha').innerText = JSON.stringify(result);
            }
        });
    }
});

/**
 * Return a plain-object representation of `test`
 * free of cyclic properties etc.
 *
 * @param {Object} test
 * @return {Object}
 * @api private
 */

function clean(test) {
  var o = {
      title: test.title
    , fullTitle: test.fullTitle
    , duration: test.duration
  };
  if (test.hasOwnProperty("err")) {
    if (test.err.stack) {
      o.error = test.err.stack.toString();
    }
    else if (test.err.message) {
      o.error = test.err.message;
    }
  }
  return o;
}
