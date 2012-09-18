var myLittleProxy = require('./lib/my-little-proxy');

// Turn on cli logging
myLittleProxy.cli();

myLittleProxy(function (req, res, proxy) {
  if (this.host('ssh.jesusabdullah.net')) {
    res.statusCode = 403;
    res.setHeader('content-type', 'application/json');
    return res.end(JSON.stringify({
      error: 'forbidden',
      message: 'scuse me wtf ur doin',
      hints: 'go bother someone else.'
    }, true, 2));
  }

  if (this.rewrite('/couchdb', '/')) {
    return this.forward('localhost', 5984);
  }

  this.notFound();
}).listen(9090);
