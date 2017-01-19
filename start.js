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

function getTimestamp(date) {
    return '[' +  date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() + '-' +  date.getMilliseconds() + '] ';
}

function log() {
    var line =  Array.prototype.slice.call(arguments).join(' ')
    var existing = document.getElementById('log').innerText;
    var date = new Date();
    var timestamp = getTimestamp(date);
    document.getElementById('log').innerText = timestamp +  line + '\n' + existing;
}

var totalDuration = 0;
function attachLog(runner) {
    var startDate;
    var lastDate = new Date();
    runner.on('test', function() {
        startDate = new Date();
    })
    runner.on('pending', function (test) {
        log("testDuration=", test.duration, 'pending >', test.fullTitle() )
    });

    runner.on('pass', function (test) {
        var msBetween = startDate.getTime() - lastDate.getTime()
        lastDate = new Date();
        totalDuration += test.duration;
        log("msBetween=", msBetween, "testDuration=", test.duration, 'pass >', test.fullTitle())
    });

    runner.on('fail', function (test) {
        log("testDuration=", test.duration, 'fail >', test.fullTitle())
    });
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
        var logParam = getQueryVariable('log');
        if (logParam) {
            console.log = log;
            console.error = log;
            attachLog(runner);
        }
        runner.on('end', function() {
            console.log('runner end');
            console.log('totalDuration: ', totalDuration);
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
