# My Little Proxy

## Example:

proxy.js

```js
var myLittleProxy = require('./lib/my-little-proxy');

// My Little Proxy logs with a custom implementation of mikeal/logref
if (!process.logging) {
  process.logging = myLittleProxy.logref;
  myLittleProxy.setupLogger();
}

// Mirrors the basic http-proxy api but with `this` scoped to a collection
// of helpful little things
myLittleProxy(function (req, res, proxy) {
  if (this.rewrite('/couchdb', '/')) {
    return this.forward('localhost', 5984);
  }
  this.end();
}).listen(8000);
```

### output:

```
$ npm start

> my-little-proxy@0.0.0 start /home/josh/dev/my-little-proxy
> node ./proxy.js

♥ mlp♥  MY LITTLE PROXY
♥ mlp♥  a cute little http proxy server
♥ mlp♥  programmed entirely in @jesusabdullah's bedroom
♥ mlp♥  version 0.0.0, 2012
♥ mlp♥  (0) -> [GET] localhost:8000/couchdb
♥ mlp♥  (0) <- [GET] localhost:5984/
```

## License:

MIT/X11.
