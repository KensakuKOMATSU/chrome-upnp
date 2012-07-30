var TIMEOUT = 3500;

// when receive message from content_script.
chrome.extension.onMessage.addListener(function(req, sender, sendResponse){
  console.log(req);
  switch(req.method) {
    case "getNetworkServices":
      // do M-SEARCH
      doMSearch(req.type);
      break;
    default:
      console.log("unknown method --> "+req.method);
      break;
  }
});



/**
 * do M-SEARCCH
 *
 */
function doMSearch(st /* search type */){
  var upnp = new UPnP();
  var res_ = [];
  var usns_ = {};


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

  setTimeout(function(){
    upnp.listen(function(res){
      var d = parse(res.data);
      res_.push({name: d.server, url: d.location, type: d.st, config: ""});
    });
    upnp.search(st);
  }, 100);

  // after timeout, send searched result.
  setTimeout(function(){
    // obtain current tab
    chrome.tabs.getSelected(null, function(tab){
      // send searched result to current tab.
      chrome.tabs.sendMessage(tab.id, {"method": "getNetworkServicesResult", "res": res_});
    });
    upnp.destroy();

    // clear searched result.
    setTimeout(function(){res_.length = 0;}, 1);
  }, TIMEOUT);
}
