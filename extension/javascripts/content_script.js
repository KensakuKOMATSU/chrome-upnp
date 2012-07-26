var  ID = "___discovery___";
var customEvent = document.createEvent('Event');
customEvent.initEvent('myDiscoveryResult', true, true);

function fireCustomEvent(data) {
  var hiddenDiv = document.getElementById(ID);
  hiddenDiv.innerText = JSON.stringify(data);

  hiddenDiv.dispatchEvent(customEvent);
}


chrome.extension.onMessage.addListener(function(req, sender, sendResponse){
	console.log(req);
	fireCustomEvent(req);
});


document.getElementById(ID).addEventListener('myDiscoveryEvent', function() {
	chrome.extension.sendMessage({mesg: "hello"}, function(res){
		console.log(res);
	});
});

