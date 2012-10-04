var decodeFromBuffer = function(buf){
  var arr = new Int8Array(buf);
  var str = "";
  for(var i = 0, l = arr.length; i < l; i++) {
    str += String.fromCharCode.call(this, arr[i]);
  }
  return str;
};
var encodeToBuffer = function(str){
  var buffer = new ArrayBuffer(str.length);
  var view = new Uint8Array(buffer);
  for(var i = 0, l = str.length; i < l; i++) {
    view[i] = str.charAt(i).charCodeAt();
  }
  return buffer;
};
