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
 * internal webserver
 */

var Controller = {"url": ""}
  , Proxy = {"url": "", "videourl": "", "videohost": "", "videopath": ""};

(function(){
  var self = Controller;
  self.server = new Server();


  self.server.get('/', function(req, res){
      res.render("this is controller");
  });

  self.server.get('/webintents/devices', function(req, res){
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
    Proxy.videourl = req.params.url;

    // [TODO] Now assuming that protocol is 'http://', so if protocol schema
    // is other than it (ex, https://), it doesn't work. Ofcource, if this support
    // https, proxy feature has to support https features ( that's so hard thing )
    var arr = Proxy.videourl.slice(7).split("/")
    Proxy.videohost = arr[0], Proxy.videopath = "/"+arr.slice(1).join("/")

    var ret = {}
    for(var key in Proxy) if(Proxy.hasOwnProperty(key)) {
      ret[key] = Proxy[key];
    }

    res.setHeader("content-type", "application/json")
    res.send(JSON.stringify(ret));
  });

  self.server.get('/start', function(req, res){
    var avcontrol_url  = req.params.avcontrol_url;
    var rendering_url  = req.params.rendering_url;
    tvController.start(Proxy.url+"/video.mp4", avcontrol_url, rendering_url)

    tvstat.set(Proxy.videourl, "video/mp4");

    var ret = {
      "avcontrol_url": avcontrol_url,
      "rendering_url": rendering_url,
      "proxy_url": Proxy.url
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

  var proxy_ = function(method, res){
   chrome.socket.create('tcp', {}, function(createInfo) {
      var sid = createInfo.socketId;
      chrome.socket.connect(sid, self.videohost, 80, function(e) {
        var request = REQ
          .replace("{%method%}", method)
          .replace("{%path%}", self.videopath)
          .replace("{%host%}", self.videohost);

        chrome.socket.write(sid, encodeToBuffer(request), function(e){
          console.log("=== [PROXY] sent resquest header ===");
          console.log(request)
          console.log("sendHeader completed", e);

          chrome.socket.read(sid, 65535, function(readInfo) {
            console.log("=== [PROXY] received response header ===");
            console.log("method : "+method);
            console.log(decodeFromBuffer(readInfo.data));

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
  self.server = new Server();

  self.server.get('/video.mp4', function(req, res){
    if(!!self.videourl === false) {
      res.render("video url doesn't set");
      return;
    }
    proxy_('GET', res)
  });

  self.server.head('/video.mp4', function(req, res){
    if(!!self.videourl === false) {
      res.render("video url doesn't set");
      return;
    }
    proxy_('HEAD', res)
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


