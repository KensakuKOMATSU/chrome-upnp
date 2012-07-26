var upnp = new UPnP();

upnp.onready = function(){
	this.listen();
	this.search();
}