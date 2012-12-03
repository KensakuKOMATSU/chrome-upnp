
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});


Array.prototype.last = function(){
  return this[this.length - 1]
}

// Routes

urls = []

app.get('/', routes.index);

app.get('/redirect/:path', function(req, res) {
  console.log(req.params.path);
  if(!!req.params.path) {
    res.redirect("/"+req.params.path);
  } else {
    res.end("can't find :path");
  }
});


app.get('/proxy_url/:source', function(req, res){
  var url = req.params.source;

  var idx = urls.indexOf(url)
    , ret = idx === -1 ? urls.push(url) - 1 : idx;

  console.dir(req.headers.host);

  ret = "http://" + req.headers.host + "/proxy/" + ret + ".mp4"

  res.end(ret)
})

app.get('/proxy/:url', function(req, res){
  console.log(urls.last())
  var idx = decodeURIComponent(req.params.url).split(".")[0].split("/").last();
  console.log(idx)
  console.log(urls[idx])




  res.end(urls[idx])
})

var port = process.env.PORT || 3000;

app.listen(port, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
