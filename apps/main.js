var appWindow;

// open packaged window
chrome.app.runtime.onLaunched.addListener(function(data){
  console.log(data)
  console.log(Controller.url)
  if(!!data && data.intent.action === "chrome-extension://komasshu.info/dlnawrapper") {
    // [FIXME] Current implementation replies controll url that is obtained when server process is executed.
    // But, those behavior deesn't support network interface changes. So, it'll be fixed.
    data.intent.postResult(Controller.url);
  } else {
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
