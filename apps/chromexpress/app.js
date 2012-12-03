var TVSTATUS = {}

TVSTATUS.INIT = 0;
TVSTATUS.SET = 1;
TVSTATUS.PLAY = 2;
TVSTATUS.PAUSE = 3;
TVSTATUS.STOP = 4;
TVSTATUS.TERMINATE = 5;

var TVStat = function(){
  this.status = TVSTATUS.INIT;
  this.mediatype = null;
  this.mediaurl = null;
  this.volume = -1;
}

TVStat.prototype.init = function(){
  this.status = TVSTATUS.INIT;
}
TVStat.prototype.set = function(url, mediatype){
  this.status = TVSTATUS.SET;
  this.mediaurl = url;
  this.mediatype = mediatype;
}
TVStat.prototype.play = function(){
  this.status = TVSTATUS.PLAY;
}
TVStat.prototype.pause = function(){
  this.status = TVSTATUS.PAUSE;
}
TVStat.prototype.stop = function(){
  this.status = TVSTATUS.STOP;
}
TVStat.prototype.terminate = function(){
  this.status = TVSTATUS.TERMINATE;
  this.meditatype = null;
  this.meditaurl = null;
}

TVStat.prototype.setVolume = function(level){
  this.volume = level;
}
TVStat.prototype.stopped = function(){
  return (this.status === TVSTATUS.STOP || this.status === TVSTATUS.TERMINATE);
}

var tvstat = new TVStat();


/**
 * internal webservers
 */

var Controller = {"url": "", "server": null};

(function(){
  var self = Controller;
  self.server = new Server();


  self.server.get('/', function(req, res){
      res.render("this is controller");
  });

  self.server.get('/webintents/devices', function(req, res){
    // [FIXME] Discovery is static object that below code means mixturing UDP's receive status.
    // to address this phenomenon, Discovery should not be static object and treat as
    // separate object.
    Discovery.start(function(data){
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(data))
    }, "urn:schemas-webintents-org:service:WebIntents:1", true);
  })

  self.server.get('/upnpdevices', function(req, res){
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(UPnPDevices))
  })


  self.server.get('/set', function(req, res){
    var video_url = req.params.video_url;
    var avcontrol_url  = req.params.avcontrol_url;
    var rendering_url  = req.params.rendering_url;

    var proxy_url = Proxy.set(video_url)
    tvController.start(proxy_url, avcontrol_url, rendering_url)
    // tvController.start("http://192.168.2.3:3000/video.mp4", avcontrol_url, rendering_url)

    tvstat.set(video_url, "video/mp4");

    var ret = {
      "avcontrol_url": avcontrol_url,
      "rendering_url": rendering_url,
      "proxy_url": proxy_url
    }

    res.setHeader("content-type", "application/json")
    res.send(JSON.stringify(ret));
  })

  self.server.get('/play', function(req, res){
    tvController.play(function(){});
    tvstat.play();
    res.render("play")
  })

  self.server.get('/stop', function(req, res){
    tvController.stop(function(){});
    tvstat.stop();
    res.render("stop")
  })

  self.server.get('/pause', function(req, res){
    tvController.pause(function(){});
    tvstat.pause();
    res.render("pause")
  })

  self.server.get('/setVolume', function(req, res){
    var level  = req.params.level;
    tvController.setVolume(level, function(e){
      res.setHeader('Content-Type', 'text/plain');
      var level = e.querySelector("CurrentVolume").textContent
      tvstat.setVolume(parseInt(level));
      res.send(level)
    });
  })

  self.server.get('/getVolume', function(req, res){
    tvController.getVolume(function(e){
      var level = e.querySelector("CurrentVolume").textContent
      res.setHeader('Content-Type', 'text/plain');
      tvstat.setVolume(parseInt(level));
      res.send(level)
    });
  })

  self.server.listen(0, function(err){
    chrome.socket.getNetworkList(function(list){
      var address = "";
      console.log("=== detected network interfaces ===")
      console.dir(list);

      self.url = "http://localhost:"+self.server.port;
      list.forEach(function(if_){
        if(if_.address.match(/^\d+\.\d+\.\d+\.\d+$/)) address = if_.address;
      })
      if(!!address) self.url = self.url.replace('localhost', address);
      console.log('listening control url : '+self.url);
    });
  });
}());

var Proxy = {"url": "", "videourl": "", "videohost": "", "videopath": "", "server": null};

/**
 * Proxy implementations
 *
 */
(function(){
  var self = Proxy;

  var REQ = [
    '{%method%} {%path%} HTTP/1.1',
    'Host: {%host%}',
    'User-Agent: curl/7.24.0 (x86_64-apple-darwin12.0) libcurl/7.24.0 OpenSSL/0.9.8r zlib/1.2.5',
    'Accept: */*',
    '',''
  ], LFCR = "\r\n"
  REQ = REQ.join(LFCR);

  // [FIXME] Now, connecting to real server is implemented w/ SOCKET API. but, it should be changed and
  // make use of XMLHTTPRequest. Because it will well work with HTTPS, redirection, etc...
  var proxy_ = function(method, videourl, res){
    var arr = videourl.slice(7).split("/")
    var videohost = arr[0], videopath = "/"+arr.slice(1).join("/")
    
    var a = videohost.split(":")
      , host = a[0]
      , port = (!!a[1] && parseInt(a[1])) || 80
      console.log(host, port);
    chrome.socket.create('tcp', {}, function(createInfo) {
      var sid = createInfo.socketId;
      chrome.socket.connect(sid, host, port, function(e) {
        var request = REQ
          .replace("{%method%}", method)
          .replace("{%path%}", videopath)
          .replace("{%host%}", videohost);

        // send HTTP Request Header
        chrome.socket.write(sid, encodeToBuffer(request), function(e){
          console.log("=== [PROXY] sent resquest header ===");
          console.log(request)

          // receive HTTP Response Header
          chrome.socket.read(sid, 65535, function(readInfo) {
            console.log("=== [PROXY] received response header ===");
            console.log("[[ method : "+method+" ]]");

            var headers = decodeFromBuffer(readInfo.data).split("\r\n");


            console.dir("response header from origin server");
            console.log(headers);

            // If response header includes redirection.
            if(headers[0].indexOf("HTTP/1.1 30") === 0) {
              console.log("Now, receive redirection message "+ headers[0]);
              for(var i = 0, l = headers.length; i < l; i += 1) {
                if(headers[i].indexOf("Location: ") === 0) {
                  console.log("Found Location header" + headers[i])
                  var location = headers[i].slice("Location: ".length);
                  chrome.socket.destroy(sid);
                  proxy_(method, location, res);
                  return;
                }
              }

              console.log("Cannot obtain Location header, so simply close this session.");
              chrome.socket.destroy(sid);
              res.close();
            }

            // Now, assuming 20x headers (that is wrong assumption...)
            // relay received data to client.
            res.sendraw(readInfo.data);

            var read_ = function() {
              if(tvstat.stopped()){
                res.close();
                chrome.socket.destroy(sid);
                return;
              }
              chrome.socket.read(sid, 65535, function(readInfo) {
                if(readInfo.resultCode > 0) {
                  res.sendraw(readInfo.data);
                  read_();
                } else {
                  res.close();
                  chrome.socket.destroy(sid);
                }
              });
            }
            read_();
          });
        });
      });
    });
  }

  // Because of !!0 returns false, without dummy data below logic(check parameters of id) makes error.
  self.videourls = ['prevent 0'];

  self.set = function(url) {
    if(self.videourls.indexOf(url) === -1) {
      self.videourls.push(url);
    }
    return self.url + "/video.mp4?id="+self.videourls.indexOf(url);
  };

  self.server = new Server();

  self.server.get('/', function(req, res) {
    res.render(self.videourl);
  });

  self.server.get('/video.mp4', function(req, res){
    console.dir(req);
    var id = (req.params.id && parseInt(req.params.id)) || false;
    if(!!id === false && !!self.videourls[id] === false) {
      res.render("video url doesn't set");
      return;
    }
    proxy_('GET', self.videourls[id], res)
  });

  self.server.head('/video.mp4', function(req, res){
    var id = (req.params.id && parseInt(req.params.id)) || false;
    if(!!id === false && !!self.videourls[id] === false) {
      res.render("video url doesn't set");
      return;
    }
    proxy_('GET', self.videourls[id], res)
  });

  self.server.listen(0, function(err){
    chrome.socket.getNetworkList(function(list){
      var address = "";
      console.log("=== detected network interfaces ===")
      console.dir(list);

      self.url = "http://localhost:"+self.server.port;
      list.forEach(function(if_){
        if(if_.address.match(/^\d+\.\d+\.\d+\.\d+$/)) address = if_.address;
      })
      if(!!address) self.url = self.url.replace('localhost', address);
      console.log('listening proxy url : '+self.url);
    });
  });
}())


