# My Little Proxy

![](https://raw.github.com/jesusabdullah/my-little-proxy/master/img/mlp.web.png)

## Example:

proxy.js

```js
var myLittleProxy = require('./lib/my-little-proxy');

// Turn on cli logger (powered by logref)
myLittleProxy.cli();

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

## Things MLP Currently Supports:

### this.rewrite(from, to)

Rewrite paths from one root to another (similar to how couch does it). Returns true if the rewrite matches/applies.

### this.forward(host, port)

A thin wrapper around proxyRequest. Only takes host/port args as positionals,
and logs the event.

### this.withResponseBody(function(buffer, write))

A shim for res.write which allows for modifying the write on its way out.
`write` is a callback with signature `function(buffer)`.

### this.withResponseHeader(function (code, headers, writeHead) {

A shim for res.writeHead which allows for modifying the response code and
headers. `writeHead` is a callback with signature
`function (code, [humanReason], headers)`.

## License:

MIT/X11.
