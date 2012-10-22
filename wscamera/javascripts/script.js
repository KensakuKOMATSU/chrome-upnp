var flag = true;

(function(){
  $("button").bind("click", function(e){
    var blob = $("#camera").attr("src")
    flag = false;

    var canvas  = document.querySelector("canvas")
      , ctx = canvas.getContext('2d')
      , img = new Image();
    canvas.width = $("#camera").width()
    canvas.height = $("#camera").height()

    img.onload = function(){
      ctx.drawImage(img, 0, 0)
      window.webkitIntent.postResult(canvas.toDataURL())
    }  
    img.src = blob;
    //alert(img);
    //window.webkitIntent.postResult(img);
  })
}());


(function(){
  var camera;
  var ws;

  var createObjectURL =
    window.URL       && window.URL.createObjectURL       ? function (file) { return window.URL.createObjectURL(file);       } :
    window.webkitURL && window.webkitURL.createObjectURL ? function (file) { return window.webkitURL.createObjectURL(file); } :
    undefined;

  function onopen() {
    console.log("websocket connection is now opened")
    ws.send("request_image");
  }

  function onclose() {
  }

  function onmessage(e) {
    if(flag) {
      camera.src = createObjectURL(e.data);
      ws.send("request_image");
    }
  }

  function onunload() {
    if (ws) {
      ws.close();
    }
  }

  function initialize() {
    camera = document.getElementById("camera");
    var host = "192.168.13.3:40320"
    if(window.webkitIntent && window.webkitIntent.data) {
      host = window.webkitIntent.data;
    }
    ws = new WebSocket("ws://" + host + "/wscamera/ws");

    ws.addEventListener("open"   , onopen   , false);
    ws.addEventListener("close"  , onclose  , false);
    ws.addEventListener("message", onmessage, false);
    window.addEventListener("unload" , onunload , false);

  }

  window.addEventListener("load",initialize,false);
}())
