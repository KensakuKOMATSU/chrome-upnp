chrome.app.runtime.onLaunched.addListener(function(){
	chrome.app.window.create('main.html', {
		width: 680,
		height: 480
	});
});