var appWindow;

var address = "";


// background process
// chrome.socket.getNetworkList(function(list){
//    console.dir(list);
//    list.forEach(function(if_){
//      if(if_.address.match(/^\d+\.\d+\.\d+\.\d+$/)) address = if_.address;
//     console.log(address);
//   })
//);


// open packaged window
chrome.app.runtime.onLaunched.addListener(function(data){
  console.log(data)
  console.log(proxyurl)
  if(!!data && data.intent.action === "chrome-extension://app2/proxyurl") {
    data.intent.postResult(proxyurl);
  } else {
    chrome.app.window.create('main.html', {
      width: 680,
      height: 480
    }, function(w){
      appWindow = w;

      if(!!address && !!proxyurl) w.contentWindow.proxyurl = proxyurl.replace("localhost", address);
      if(data && data.intent )
        w.contentWindow.webkitIntent = data.intent || null;
    });
  }
});
