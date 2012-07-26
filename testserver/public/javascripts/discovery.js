(function(){
	var ID = "___discovery___";
	var callback_;

	var div = document.createElement('div');
	div.setAttribute("id", ID);
	div.style.width = "1px";
	div.style.height = "1px";
	div.style.overflow = "hidden";
	document.querySelector('body').appendChild(div);

	div.addEventListener("myDiscoveryResult", function(e){
		var res = JSON.parse(this.innerText);

		console.log(res);
		if(typeof(callback_) === "function") {
			callback_(res);
		}
	}, false);


	var customEvent = document.createEvent('Event');
	customEvent.initEvent('myDiscoveryEvent', true, true);

	function fireCustomEvent(data) {
	  var hiddenDiv = document.getElementById(ID);
	  hiddenDiv.dispatchEvent(customEvent);
	}

	navigator.getNetworkServices = function(type, callback) {
		fireCustomEvent(type);
		callback_ = callback;
	}
}());



