var appWindow;

chrome.app.runtime.onLaunched.addListener(function(launchData){
	if (appWindow && !appWindow.closed) {
    	if (launchData && launchData.intent) {
    		appWindow.handleIntent(launchData.intent);
    	}
    } else {
		chrome.app.window.create('sandbox.html', {
			width: 680,
			height: 480,
			type:'panel'
		}, function(w){
			appWindow = w.dom;
			appWindow.launchData = launchData;
		});
	}
});