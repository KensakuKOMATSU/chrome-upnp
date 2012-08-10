
window.intent = window.intent || window.webkitIntent;

var videourl = ( window.intent && window.intent.data ) || "";

$("#videourl").val(videourl).bind("input", function(e) {
  videourl = $(this).val();
});

var list=[]

function check_overlapped(o, list){


  for(i=0; i<list.length; i++){
    if (o.location == list[i].location){
      return true;
    }
  }
  return false;

}


var show = function(recv){
  var str = recv.data;
  var o = parse(str);
  var origin = o.location.split("/").slice(0,3).join("/")+ "/";

  if(check_overlapped(o,list)) return;
  list.push(o);

  $.get(o.location, function(data){
    console.log(data)

    var friendlyName = $(data).find("device > friendlyName").text();
    var iconurl = origin + $(data).find("device > iconList > icon").eq(0).find("url").text();

    var servicetypes = $(data).find("service > serviceType")

    var services = $(data).find("serviceList > service")
    services.each(function(e){
      var service = $(this)

      if(service.find("serviceType").text() == "urn:schemas-upnp-org:service:AVTransport:1"){
        var controlurl = origin + service.find("controlURL").text()

        $("#device_lists").append("<dl><dt><img src='"+iconurl+"'></dt>")
          .append("<dd><a href='"+controlurl+"'>"+friendlyName+"</a>");

        return;
      }
    })
  })
}

$("a").live('click', function(e){
  var controlurl=$(this).attr("href")
  set_uri(controlurl)

  e.preventDefault()
})



function set_uri(control_url){

 // var object_url = "http://172.16.0.139/testmovie.mp4"

 // var object_url = "http://video30th.komasshu.info/videos/bunny.mp4"

  var data = '<?xml version="1.0" encoding="utf-8"?>'
    +'<s:Envelope s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/" xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">'
    + '<s:Body>'
    + '<u:SetAVTransportURI xmlns:u="urn:schemas-upnp-org:service:AVTransport:1">'
    + '<InstanceID>0</InstanceID>'
    + '<CurrentURI>'
    + videourl
    + '</CurrentURI>'
    + '<CurrentURIMetaData>test</CurrentURIMetaData>'
    + '</u:SetAVTransportURI>'
    + '</s:Body>'
    + '</s:Envelope>'


  $.ajax({
    type: "POST",
    url: control_url,
    headers: {
      SOAPACTION: "urn:schemas-upnp-org:service:AVTransport:1#SetAVTransportURI"
    },
    contentType: 'text/xml ; charset="utf-8"',
    data: data,
    success: function(msg){
      console.log(msg)
      play_uri(control_url)
    } 
  })
}




function play_uri(control_url){

  var data = '<?xml version="1.0" encoding="utf-8"?>'
  + '<s:Envelope s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/" xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">'
  + '<s:Body>'
  + '<u:Play xmlns:u="urn:schemas-upnp-org:service:AVTransport:1">'
  + '<InstanceID>0</InstanceID>'
  + '<Speed>1</Speed>'
  + '</u:Play>'
  + '</s:Body>'
  + '</s:Envelope>'

  $.ajax({
    type: "POST",
    url: control_url,
    headers: {
      SOAPACTION: "urn:schemas-upnp-org:service:AVTransport:1#Play"
    },
    contentType: 'text/xml ; charset="utf-8"',
    data: data,
    success: function(msg){
      console.log(msg)
    } 
  })
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
  this.search("urn:schemas-upnp-org:service:AVTransport:1");
}
