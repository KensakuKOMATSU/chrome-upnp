var UPnP;

console.log("upnp");

(function(){ 
  /**
   * utilities
   *
   */
  var socket = chrome.experimental.socket || chrome.socket;

  // translate text string to Arrayed buffer
  //
  function t2ab(str /* String */) {
    var buffer = new ArrayBuffer(str.length);
    var view = new DataView(buffer);
    for(var i = 0, l = str.length; i < l; i++) {
      view.setInt8(i, str.charAt(i).charCodeAt());
    }
    return buffer;
  }

  // translate Arrayed buffer to text string
  //
  function ab2t(buffer /* ArrayBuffer */) {
    var arr = new Int8Array(buffer);
    var str = "";
    for(var i = 0, l = arr.length; i < l; i++) {
      str += String.fromCharCode.call(this, arr[i]);
    }
    console.log(str);
    return str;
  }


  /**
   * You can find API documentaion for raw socket api in 
   * http://code.google.com/chrome/extensions/trunk/experimental.socket.html
   *
   */

  // SSDP definitions
  var M_SEARCH_REQUEST = "M-SEARCH * HTTP/1.1\r\n" +
    "MX: 3\r\n" +
    "HOST: 239.255.255.250:1900\r\n" +
    "MAN: \"ssdp:discover\"\r\n" +
    "ST: {{st}}\r\n\r\n"

  // UPnP classes
  UPnP = function(){
    this.sid = null;
    this.MIP_ = "239.255.255.250";
    this.PORT_ = 1900;

    var self = this;
    socket.create('udp', {}, function(socketInfo) {
      self.sid = socketInfo.socketId;
      socket.bind(self.sid, "0.0.0.0", 0, function(res) {
        if(res !== 0) {
          throw('cannot bind socket');
        }
        self.onready();
      });
    });
  }

  // interface to onready
  UPnP.prototype.onready = function() {
  }

  // do M-SEARCH
  UPnP.prototype.search = function(st /* search type */, callback /* function */) {
    if(!!this.sid === false) {
      throw('socket id is not allocated');
    }

    var ssdp = M_SEARCH_REQUEST.replace("{{st}}", st);
    console.log(ssdp);
    var buffer = t2ab(ssdp);
    var closure_ = function(e){
      if(e.bytesWritten < 0) {
        throw("an Error occured while sending M-SEARCH : "+e.bytesWritten);
      }
      console.log("=== SENT UPnP M-SEARCH ===");
      console.dir(e);

      if(typeof(callback) === "function")
        callback();
    }

    // send M-SEARCH twice times
    for(var i = 0; i < 2; i++) {
      socket.sendTo(this.sid, buffer, this.MIP_, this.PORT_, function(e) {
        closure_(e);
      });
    }
  }

  // listen response to M-SEARCH
  UPnP.prototype.listen = function(callback) {
    if(!!this.sid === false) {
      throw('socket id is not allocated');
    }

    var self = this;
    var closure_ = function(recv){
      console.log("=== RECV UPnP packet from "+recv.address+"===");
      console.log(recv);
      recv.data = ab2t(recv.data);
      if(typeof(callback) === "function") {
        callback(recv);
      }
      self.listen(callback);
    }

    socket.recvFrom(this.sid, function(recv) {
      closure_(recv);
    });
  }
  // destroy socket
  UPnP.prototype.destroy = function() {
    socket.destroy(this.sid);
    this.sid = null;
  }
}());
