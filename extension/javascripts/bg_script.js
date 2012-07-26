var TIMEOUT = 3500;

// when receive message from content_script.
chrome.extension.onMessage.addListener(function(req, sender, sendResponse){
	// do M-SEARCH
	doSearch();

});


var parse = function(data) {
  var arr = data.split("\n"), ret = {};

  for(var i = 0, l = arr.length; i < l; i++ ) {
    var a = arr[i].split(":");
    var k = a[0].toLowerCase();
    var v = a.slice(1).join(":").replace("\r", "");

    if(!!v) {
      ret[k] = v;
    }
  }
  return ret;
}


/**
 * do M-SEARCCH
 *
 */
function doSearch(){
	var upnp = new UPnP();
	var res_ = [];

	setTimeout(function(){
		upnp.listen(function(res){
			var d = parse(res.data);
			res_.push({name: d.server, url: d.location, type: d.st, config: ""});
		});
		upnp.search();
	}, 100);

	// after timeout, send searched result.
	setTimeout(function(){
		// obtain current tab
		chrome.tabs.getSelected(null, function(tab){
			// send searched result to current tab.
			chrome.tabs.sendMessage(tab.id, {res: res_});
		});
		upnp.destroy();

		// clear searched result.
		setTimeout(function(){res_.length = 0;}, 1);
	}, TIMEOUT);
}
