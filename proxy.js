var myLittleProxy = require('./lib/my-little-proxy');

// Yes, turning on logging is a Whole Thing.
if (!process.logging) {
  process.logging = myLittleProxy.logref;
  myLittleProxy.setupLogger();
}

myLittleProxy(function (req, res, proxy) {
  if (this.rewrite('/couchdb', '/')) {
    return this.forward('localhost', 5984);
  }
  this.end();
}).listen(8000);
