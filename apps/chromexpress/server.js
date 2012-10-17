(function(global){
  var methods = ['head', 'get', 'post'];
  var Router = function(){
    this.routes = {};
  };
  Router.prototype.set = function(method, path, callback){ // TODO: callback => callbacks for middleware
    if(!this.routes.hasOwnProperty(method))
      this.routes[method] = {};
    if(!this.routes[method].hasOwnProperty(path))
      this.routes[method][path] = callback;
  };
  Router.prototype.lookup = function(method, pathname){
    method = method.toLowerCase();
    if(!this.routes[method])
      throw new Error('Cannot set method (' + method + ')');
    if(!this.routes[method][pathname])
      return this.routes[method]['404'];
    return this.routes[method][pathname];
  };

  var Server = function(){
    this.router = new Router();
    this.get('404', function(req, res){
      res.send('404 not found');
    })
  };
  methods.forEach(function(method){
    method = method.toLowerCase();
    Server.prototype[method] = function(path){
      if(arguments.length === 1){
        return this.router.routes.lookup(method, path);
      }
      var args = [method].concat([].slice.apply(arguments));
      this.router.set.apply(this.router, args);
    };
  });

  Server.prototype.listen = function(port, hostname, backlog, callback){
    var self = this;
    if(typeof callback === 'undefined' && typeof backlog === 'function' ){
      callback = backlog;
      backlog = undefined;
    }
    if(typeof callback === 'undefined' && typeof hostname === 'function' ){
      callback = hostname;
      hostname = undefined;
      backlog = undefined;
    }
    if(typeof callback === 'undefined' && typeof port === 'function' ){
      callback = hostname;
      backlog = undefined;
      hostname = undefined;
      backlog = undefined;
    }
    if(typeof callback === 'undefined'){
      callback = function(){};
    }
    chrome.socket.create('tcp', {}, function(socketInfo){
      chrome.socket.listen(socketInfo.socketId, hostname || '0.0.0.0', port || 0, backlog || 10, function(listenResult){
        if(listenResult < 0)
          throw new Error('Cannot listen port');
        self.__accept(socketInfo.socketId);
        chrome.socket.getInfo(socketInfo.socketId, function(info){
          self.port = info.localPort;
          self.addr = info.localAddress;
          self.socketId = socketInfo.socketId;
          callback(null);
        });
      });
    });
  };

  Server.prototype.__accept = function(sid){
    var self = this;
    chrome.socket.accept(sid, function(accInfo){
      var tSid = accInfo.socketId;
      var req, res;
      chrome.socket.read(tSid, 65535, function(reqInfo){
        if(reqInfo.data){
          req = new Request(tSid, reqInfo.data);
          res = new Response(req);
          self.router.lookup(req.method, req.pathname)(req, res);
        }else{
          // Some response
          chrome.socket.destroy(tSid);
        }
      });
      self.__accept(sid);
    });
  };

  var CRLF = '\r\n';
  var STATUS_CODE = {
    100 : 'Continue',
    101 : 'Switching Protocols',
    102 : 'Processing',                 // RFC 2518, obsoleted by RFC 4918
    200 : 'OK',
    201 : 'Created',
    202 : 'Accepted',
    203 : 'Non-Authoritative Information',
    204 : 'No Content',
    205 : 'Reset Content',
    206 : 'Partial Content',
    207 : 'Multi-Status',               // RFC 4918
    300 : 'Multiple Choices',
    301 : 'Moved Permanently',
    302 : 'Moved Temporarily',
    303 : 'See Other',
    304 : 'Not Modified',
    305 : 'Use Proxy',
    307 : 'Temporary Redirect',
    400 : 'Bad Request',
    401 : 'Unauthorized',
    402 : 'Payment Required',
    403 : 'Forbidden',
    404 : 'Not Found',
    405 : 'Method Not Allowed',
    406 : 'Not Acceptable',
    407 : 'Proxy Authentication Required',
    408 : 'Request Time-out',
    409 : 'Conflict',
    410 : 'Gone',
    411 : 'Length Required',
    412 : 'Precondition Failed',
    413 : 'Request Entity Too Large',
    414 : 'Request-URI Too Large',
    415 : 'Unsupported Media Type',
    416 : 'Requested Range Not Satisfiable',
    417 : 'Expectation Failed',
    418 : 'I\'m a teapot',              // RFC 2324
    422 : 'Unprocessable Entity',       // RFC 4918
    423 : 'Locked',                     // RFC 4918
    424 : 'Failed Dependency',          // RFC 4918
    425 : 'Unordered Collection',       // RFC 4918
    426 : 'Upgrade Required',           // RFC 2817
    428 : 'Precondition Required',      // RFC 6585
    429 : 'Too Many Requests',          // RFC 6585
    431 : 'Request Header Fields Too Large',// RFC 6585
    500 : 'Internal Server Error',
    501 : 'Not Implemented',
    502 : 'Bad Gateway',
    503 : 'Service Unavailable',
    504 : 'Gateway Time-out',
    505 : 'HTTP Version not supported',
    506 : 'Variant Also Negotiates',    // RFC 2295
    507 : 'Insufficient Storage',       // RFC 4918
    509 : 'Bandwidth Limit Exceeded',
    510 : 'Not Extended',               // RFC 2774
    511 : 'Network Authentication Required' // RFC 6585
  };

  var Request = function(sid, buf){
    this.sid = sid;
    this._headers = {};
    this._headerNames = {};
    this.parseHeader(buf);
    console.dir(this);
  };
  Request.prototype.parseHeader = function(buf){
    var headers = decodeFromBuffer(buf).split(/\n/);
    var statusLine = headers.shift();
    console.dir(headers);
    if(!statusLine)
      throw new Error('not found status line', headers);
    var methodPathProto = statusLine.split(/\s+/);
    this.method = methodPathProto[0];
    this.protocol = methodPathProto[2].toLowerCase();
    var params = {};

    var patharr = methodPathProto[1].split("?");
    this.pathname = patharr[0];
    if(!!patharr[1]){
      var qstrs = patharr[1].split("&");
      qstrs.forEach(function(qstr) {
          var tmpQ = qstr.split("=");
          params[tmpQ[0]] = decodeURIComponent(tmpQ[1]);
      });
    }
    this.params = params;

    var self = this;
    for(var i = 0, l = headers.length; i < l; i++){
      if(headers[i].match(/^\s+$/))
        continue;
      var keyVal = headers[i].split(/:\s+/);
      var key = keyVal[0].toLowerCase();
      this._headers[key] = keyVal[1];
      this._headerNames[key] = keyVal[0];
    };
  };
  Request.prototype.getHeader = function(key){
    key = key || '';
    return this._headers[key.toLowerCase()];
  };

  var Response = function(req){
    this.req = req;
    this.output = [];
    this.outputEncodings = [];

    this.writable = true;

    for(var key in this.defaultHeaders){
      if(this.defaultHeaders.hasOwnProperty(key))
        this.setHeader(key, this.defaultHeaders[key]);
    }
  };

  Response.prototype.statusLine = function(code, reason){
    return 'HTTP/1.1 '+code.toString() + ' ' + reason;
  };
  Response.prototype.defaultHeaders = {
    Server: 'chrome24',
    Connection: 'Close'
  };
  Response.prototype.setHeader = function(name, value){
    if (arguments.length < 2) {
      throw new Error('`name` and `value` are required for setHeader().');
    }

    if (this._header) {
      throw new Error('Can\'t set headers after they are sent.');
    }

    var key = name.toLowerCase();
    this._headers = this._headers || {};
    this._headerNames = this._headerNames || {};
    this._headers[key] = value;
    this._headerNames[key] = name;
  };

  Response.prototype.createHeader = function(code, reason){
    var headers = [this.statusLine(code, STATUS_CODE[code.toString()])];
    for(var key in this._headers){
      headers.push([this._headerNames[key], this._headers[key]].join(': '));
    }
    return headers.join(CRLF);
  };

  Response.prototype.send = function(body){
    var len = body.length;
    var code = 200;
    var self = this;
    this.setHeader('Access-Control-Allow-Origin', '*');
    this.setHeader('Content-Length', len);

    var header = this.createHeader(code);
    chrome.socket.write(this.req.sid, encodeToBuffer([header, body].join(CRLF + CRLF)), function(writeInfo){
      chrome.socket.destroy(self.req.sid);
    });
  };

  Response.prototype.render = function(body){
    this.setHeader('Content-Type', 'text/html');
    this.send(body);
  };

  Response.prototype.sendraw = function(body){
    chrome.socket.write(this.req.sid, body, function(writeInfo) {});
  }

  global.Server = Server;
}(this));
