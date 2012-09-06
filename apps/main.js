var appWindow;

chrome.app.runtime.onLaunched.addListener(function(launchData){
	console.log(launchData)
	chrome.app.window.create('main.html', {
		width: 680,
		height: 480
	}, function(w){
		appWindow = w.dom;
		appWindow.launchData = launchData;
	});
});