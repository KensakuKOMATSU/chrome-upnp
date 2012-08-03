(function(){
  if( navigator.getNetworkServices ) return;

  var ID = "___discovery___";
  var callback_;

  var div = document.createElement('div');
  div.setAttribute("id", ID);
  div.style.width = "1px";
  div.style.height = "1px";
  div.style.overflow = "hidden";
  document.querySelector('body').appendChild(div);

  // from content_script to frontend
  div.addEventListener("getNetworkServicesResult", function(e){
    var res = JSON.parse(this.innerText);

    // [TODO] remove overlapped result.
    console.log(res);

    var obj = {
      res_: res,
      services_: res.res,
      getServices: function(){
        return this.services_;
      }
    }

    if(typeof(callback_) === "function") {
      callback_(obj);
    }
  }, false);



  // from frontend to content_script
  function fireGetNetworkServicesEvent(data) {
    var ev = document.createEvent('Event')
      , hiddenDiv = document.getElementById(ID);
    ev.initEvent('getNetworkServices', true, true);

    hiddenDiv.innerText = JSON.stringify(data);
    hiddenDiv.dispatchEvent(ev);
  }

  navigator.getNetworkServices = function(type, callback) {
    console.log(type);

    fireGetNetworkServicesEvent({"type":type});
    callback_ = callback;
  }
}());
