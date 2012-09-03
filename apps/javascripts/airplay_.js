var videourl = (launchData && launchData.intent && launchData.intent.data) || "http://192.168.0.9:3000/vmenu/videos/bunny.mp4";

console.log(launchData && launchData.intent);

$("#videourl").val(videourl).bind("input", function(e) {
  videourl = $(this).val();
});

var list=[]

var ROOTDEVICE = "upnp:rootdevices"
  , AVTRANSPORT = "urn:schemas-upnp-org:service:AVTransport:1"

var  TARGET = ROOTDEVICE;  // ROOTDEVICE : debug, AVTRANSPORT : air_play

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
  console.log(o);
  var origin = o.location.split("/").slice(0,3).join("/")+ "/";

  if(check_overlapped(o,list)) return;

  list.push(o);

//  if(TARGET === ROOTDEVICE) {
    $("#device_lists").append("<pre>"+str+"</pre>");
//    return;
//  }
  console.log(list);

  $.get(o.location, function(data){
    console.log(data)

    var friendlyName = $(data).find("device > friendlyName").text();
    var iconurl = origin + $(data).find("device > iconList > icon").eq(0).find("url").text();

    var servicetypes = $(data).find("service > serviceType")

    var services = $(data).find("serviceList > service")
    services.each(function(e){
      var service = $(this)

      if(service.find("serviceType").text() == target){
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
/*
  var data = '<?xml version="1.0" encoding="utf-8"?>'
    +'<s:Envelope s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/" xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">'
    + '<s:Body>'
    + '<u:SetAVTransportURI xmlns:u="urn:schemas-upnp-org:service:AVTransport:1">'
    + '<InstanceID>0</InstanceID>'
    + '<CurrentURI>'
    + videourl
    + '</CurrentURI>'
    + '<CurrentURIMetaData/>'
    + '</u:SetAVTransportURI>'
    + '</s:Body>'
    + '</s:Envelope>'
    */
    // videourl = "http://192.168.0.11:10243/WMPNSSv4/3929665367/0_e0FFQUNFRThFLUY4REItNEEzOS1CREVBLURDRjgwOTUyMTNCMn0uMC44.wmv";
    var data = "<?xml version=\"1.0\"?>";
      data += "\n\n";

      data += "<SOAP-ENV:Envelope xmlns:SOAP-ENV=\"http://schemas.xmlsoap.org/soap/envelope/\" SOAP-ENV:encodingStyle=\"http://schemas.xmlsoap.org/soap/encoding/\"><SOAP-ENV:Body><m:SetAVTransportURI xmlns:m=\"urn:schemas-upnp-org:service:AVTransport:1\"><InstanceID xmlns:dt=\"urn:schemas-microsoft-com:datatypes\" dt:dt=\"ui4\">0</InstanceID><CurrentURI xmlns:dt=\"urn:schemas-microsoft-com:datatypes\" dt:dt=\"string\">"+videourl+"</CurrentURI><CurrentURIMetaData xmlns:dt=\"urn:schemas-microsoft-com:datatypes\" dt:dt=\"string\"></CurrentURIMetaData></m:SetAVTransportURI></SOAP-ENV:Body></SOAP-ENV:Envelope>"


  $.ajax({
    type: "POST",
    url: control_url,
    headers: {
      SOAPACTION: "\"urn:schemas-upnp-org:service:AVTransport:1#SetAVTransportURI\""
    },
    contentType: 'text/xml ; charset="utf-8"',
    data: data,
    success: function(msg){
      console.log(msg)
      play_uri(control_url)
    },
    error: function(e) {
      console.log(e);
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
      SOAPACTION: "\"urn:schemas-upnp-org:service:AVTransport:1#Play\""
    },
    contentType: 'text/xml ; charset="utf-8"',
    data: data,
    success: function(msg){
      console.log(msg)
    } 
  })
}

var D;



var parse = function(data) {
  D = data;
  var arr = data.replace(/\r\n|\r/g, "\n").split("\n"), ret = {};

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

var target;
// Main
$("#startsearch").bind("click", function(){
  $("#device_lists").html("start M-SEARCH...");
  var upnp = new UPnP();
  upnp.onready = function(){
    target = $("#root").attr("checked") === "checked" ? ROOTDEVICE : AVTRANSPORT;
    this.listen(show);
    this.search(target);
  }
})
