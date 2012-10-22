console.log(location.href)

if(location.href.indexOf('#webkitIntentProxy') !== -1) {
	$("button").text("found");

	window.addEventListener('message', function(e){
		console.dir(e);
	}, false)
}