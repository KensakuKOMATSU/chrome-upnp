var server = new Server();


var REQ = [
  'GET {%path%} HTTP/1.1',
  'Host: {%host%}',
  'User-Agent: curl/7.24.0 (x86_64-apple-darwin12.0) libcurl/7.24.0 OpenSSL/0.9.8r zlib/1.2.5',
  'Accept: */*',
  '',''
]
REQ = REQ.join("\r\n");

var youtubeurl = "",
  ytHost = "",
  ytPath = ""

server.get('/', function(req, res){
    res.render("hoge");
});

server.get('/set', function(req, res){
  youtubeurl = req.params.url;
  var arr = youtubeurl.slice(7).split("/")
  ytHost = arr[0], ytPath = "/"+arr[1]

  res.render("set complete");
});

server.get('/video.mp4', function(req, res){
  if(!!youtubeurl === false) {
    res.render("youtube url doesn't set");
    return;
  }

  chrome.socket.create('tcp', {}, function(createInfo) {
    var sid = createInfo.socketId;
    chrome.socket.connect(sid, ytHost, 80, function(e) {
      var request = REQ.replace("{%path%}", ytPath).replace("{%host%}", ytHost);
      chrome.socket.write(sid, encodeToBuffer(request), function(e){
        chrome.socket.read(sid, 65535, function(readInfo) {
          console.log("=== [PROXY] ===\n"+decodeFromBuffer(readInfo.data));
          res.sendraw(readInfo.data);

          var read_ = function() {
            chrome.socket.read(sid, 65535, function(readInfo) {
              if(readInfo.resultCode > 0) {
                // console.dir("read", readInfo.resultCode);
                res.sendraw(readInfo.data);
                read_();
              } else {
                chrome.socket.destroy(sid);
              }
            });
          }
          read_();
        });
        console.log("write complete", e);
      });
    });
  });

});

server.head('/video.mp4', function(req, res){
  if(!!youtubeurl === false) {
    res.render("youtube url doesn't set");
    return;
  }

  console.log("=== [PROXY]receive HEAD method ===");
  chrome.socket.create('tcp', {}, function(createInfo) {
    var sid = createInfo.socketId;
    chrome.socket.connect(sid, ytHost, 80, function(e) {
      var request = REQ.replace("{%path%}", ytPath).replace("{%host%}", ytHost).replace("GET", "HEAD")
      chrome.socket.write(sid, encodeToBuffer(request), function(e){
        chrome.socket.read(sid, 65535, function(readInfo) {
          res.sendraw(readInfo.data);
          chrome.socket.destroy(sid);
        });
      });
    });
  });

});

server.listen(0, function(err){
    proxyurl = "http://localhost:"+server.port;
    console.log('listening http://localhost:'+server.port);
});
