var show = function(recv){
  var head = "<h3>receive from "+recv.address+":"+recv.port+"</h3>";
  var str = recv.data;
  var o = parse(str);

  $("body").append("<hr>"+head+"</div>");
  console.dir(o);

  $("body").append("<dl>");
  if(o.hasOwnProperty('server')) {
    $("body").append("<dt>SERVER</dt><dd>"+o.server+"</dd>");
  }
  if(o.hasOwnProperty('location')) {
    $("body").append("<dt>LOCATION</dt><dd><a href='"+o.location+"' target='_blank'>"+o.location+"</a></dd>");
  }
  $("body").append("<dt>Plain data</dt><dd><pre style='font-size:0.4em;background:#ccc;'>"+str+"</pre></dd>");
  $("body").append("</dl>");
}

var parse = function(data) {
  var arr = data.split("\n"), ret = {};

  for(var i = 0, l = arr.length; i < l; i++ ) {
    var a = arr[i].split(":");
    var k = a[0].toLowerCase();
    var v = a.slice(1).join(":");

    if(!!v) {
      ret[k] = v;
    }
  }
  return ret;
}


// Main
var upnp = new UPnP();
upnp.onready = function(){
  this.listen(show);
  this.search();
}
