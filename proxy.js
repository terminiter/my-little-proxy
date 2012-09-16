var myLittleProxy = require('./lib/my-little-proxy');

// Turn on cli logging
myLittleProxy.cli();

myLittleProxy(function (req, res, proxy) {
  if (this.rewrite('/couchdb', '/')) {
    return this.forward('localhost', 5984);
  }
  this.end();
}).listen(8000);
