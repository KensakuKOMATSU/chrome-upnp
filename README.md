# What's this?

This project is developing Service Discovery API emulation library. Service Discovery means a browser discovers local web services automatically under IP multicast technology such as UPnP and mDNS. To realize IP multicast communication via udp in current browser, utilizing chrome extension's raw socket api (experimental feature).

# Demonstration site

[Demo](http://upnp.komasshu.info/)

# How to use?

The library (now developing UPnP support only...)  enables "[Networked Service Discovery and Messaging](http://people.opera.com/richt/release/specs/discovery/Overview.html)" proposed by Opera and CableLabs. To enable IP Multicast in current browser, installing chrome extension is required. (The extension is using experimental feature, so you'll need [Google Chrome Canary](https://tools.google.com/dlpage/chromesxs) (in Linux case, [Google Chrome Dev Channel](http://www.chromium.org/getting-involved/dev-channel/)).

* Navigate to `chrome://flags/` in Canary, and enable 'Experimental Extension APIs'
* Navigate to `chrome://chrome/extensions/` and enable Developer Mode.
* Download [the packed extension](http://upnp.komasshu.info/extension.crx)
* Drag and drop the file into `chrome://chrome/extensions` and follow the prompt to install (if required).

With extension, including [this library](https://raw.github.com/KensakuKOMATSU/chrome-upnp/master/testserver/public/javascripts/discovery.js) enables service discovery features in your site.

Please note that this library is quite experimental, you shouldn't use it in productive purpose.

License
----------
Copyright &copy; 2012 Kensaku Komatsu ([@komasshu](http://twitter.com/komasshu))
Licensed under the [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0)