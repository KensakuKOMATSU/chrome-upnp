var appWindow;

chrome.app.runtime.onLaunched.addListener(function(launchData){
	chrome.app.window.create('main.html', {
		width: 680,
		height: 480
	}, function(w){
		appWindow = w;
		appWindow.launchData = launchData;
	});
});