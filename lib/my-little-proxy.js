var util = require('util'),
    fs = require('fs'),
    path = require('path'),
    httpProxy = require('http-proxy');

var mlp = module.exports = myLittleProxy;
mlp.logref = require('./logref');
mlp.setupLogger = function () {
  log = process.logging
    ? process.logging('mlp')
    : function () {};
}

mlp.setupLogger();
mlp.cli = function () {
  process.logging = myLittleProxy.logref;
  myLittleProxy.setupLogger();
};

function myLittleProxy(handler) {
  fs.readFileSync(path.resolve(__dirname, '../img/mlp.ansi'))
    .toString()
    .split('\n')
    .forEach(function (l) {
      log(l);
    })
  ;

  log('MY LITTLE PROXY (node is magic)');
  log('a cute little http proxy server');
  log('programmed entirely in @jesusabdullah\'s bedroom');
  log('version %version, %date', {
    version: require('../package.json').version,
    date: '2012'
  });
  return httpProxy.createServer(rewriter(handler));
};

var idx = 0;

function rewriter(cb) {
  return function (req, res, proxy) {
    var i = idx++;

    log('(%idx) -> [%method] %host%url', {
      idx: i,
      method: req.method,
      host: req.headers.host,
      url: req.url
    });

    cb.call({
      rewrite: rewrite,
      forward: forward,
      withResponseBody: withResponseBody,
      withResponseHeaders: withResponseHeaders,
      end: end
    }, req, res, proxy);

    // Basic path rewrites
    function rewrite(from, to) {
      from = path.resolve('/', from);
      to = path.resolve('/', to);

      var m = req.url.match(from),
          rewrote = false;

      if (m && m.index === 0) {
        req.url = req.url.replace(from, to);
        rewrote = true;
      }

      return rewrote;
    }

    // Basic port forwarding
    function forward(host, port) {

      log('(%idx) <- [%method] %host:%port%url', {
        idx: i,
        method: req.method,
        host: host,
        port: port,
        url: req.url
      });

      proxy.proxyRequest(req, res, {
        host: host,
        port: port
      });
    }

    // Modify the response body in a callback
    function withResponseBody(cb) {
      res._write = res.write;
      res.write = function (buff) {
        cb(buff, res._write);
      };
    }

    // Modify the response headers in a callback
    function withResponseHeaders(cb) {
      res._writeHead = res.writeHead;
      // http-proxy doesn't call this with a human-readable reason, so
      // I'll implement the currying later if it ends up being an issue.
      res.writeHead = function (code, headers) {
        cb(code, headers, function () {
          var argv = [].slice.call(arguments);
          res._writeHead.apply(res, argv);
        });
      }
    }

    // A sort of "catch-all" to end all requests.
    function end() {
      res.statusCode = 404;
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify({
        error: 'not_found',
        message: 'my-little-proxy was unable to forward your request.',
        hints: 'you may have mistyped the url, or the resource may have been moved.'
      }, true, 2));
    }

  };
}
