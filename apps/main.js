var appWindow;

chrome.app.runtime.onLaunched.addListener(function(data){
  // When invoked by Web Intents w/ dedicated action, it simply returns their IF URL
  if(!!data && data.intent.action === "chrome-extension://komasshu.info/dlnawrapper") {
    // returns WBDO-server's IF Url
    Controller.geturl(function(url){
      data.intent.postResult(url);
    })
  } else {
    // When called as packaged apps, it opens packaged window.
    // I don't think it does work in proper way.
    chrome.app.window.create('main.html', {
      width: 680,
      height: 480
    }, function(w){
      appWindow = w;

      if(!!address && !!controlurl) w.contentWindow.proxyurl = controlurl;
      if(data && data.intent )
        w.contentWindow.webkitIntent = data.intent || null;
    });
  }
});
