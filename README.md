# My Little Proxy

![](https://raw.github.com/jesusabdullah/my-little-proxy/master/img/mlp.web.png)

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

![](https://raw.github.com/jesusabdullah/my-little-proxy/master/img/screenie.png)

## License:

MIT/X11.
