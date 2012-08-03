// content script is working as proxy page between frontend page and background page


var  ID = "___discovery___";

/**
 * background to frontend
 *
 */

// receive message from background page
chrome.extension.onMessage.addListener(function(req, sender, sendResponse){
	console.log(req);
	var method = req.method;

	switch(method) {
		case "getNetworkServicesResult":
			fireGetNetworkServicesResult({"res": req.res});
			break;
		default:
			console.log("unknown method --> "+method);
			break;
	}
});


// send background page's result to frontend via Custom DOM Event.
//
function fireGetNetworkServicesResult(data) {
  var ev = document.createEvent('Event');
  var hiddenDiv = document.getElementById(ID);

  ev.initEvent('getNetworkServicesResult', true, true);
  hiddenDiv.innerText = JSON.stringify(data);

  hiddenDiv.dispatchEvent(ev);
}


/**
 * frontend to background
 *
 */

// transport received data from frontend page to background page.
//
document.getElementById(ID).addEventListener('getNetworkServices', function() {
	var dataFromFront = this.innerText
		,obj = JSON.parse(dataFromFront);
	console.log(obj);
	
	chrome.extension.sendMessage({"method": "getNetworkServices", type: obj.type}, function(res){
		console.log(res);
	});
});

