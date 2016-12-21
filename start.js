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
		mocha.run();
        var reporter = getQueryVariable('reporter');
        if (reporter) {
            mocha.reporter(reporter);
        }
        runner = mocha.run();
        runner.on('end', function() {
            if (reporter === 'json') {
                document.querySelector('#mocha').innerText = JSON.stringify(runner.testResults);
            }
        });
    }
});
