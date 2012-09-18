var util = require('util'),
    fs = require('fs'),
    path = require('path'),
    url = require('url');

var httpProxy = require('http-proxy'),
    zip = require('zippy').zip;

var mlp = module.exports = myLittleProxy;
mlp.logref = require('./logref');

mlp.setupLogger = function () {
  mlp.log = process.logging
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
      mlp.log(l);
    })
  ;

  mlp.log('MY LITTLE PROXY (node is magic)');
  mlp.log('a cute little http proxy server');
  mlp.log('programmed entirely in @jesusabdullah\'s bedroom');
  mlp.log('version %version, %date', {
    version: require('../package.json').version,
    date: '2012'
  });
  return httpProxy.createServer(rewriter(handler));
};

var idx = 0;

function rewriter(cb) {
  return function (req, res, proxy) {
    var i = idx++;

    mlp.log('(%idx) -> [%method] %host%url', {
      idx: i,
      method: req.method,
      host: req.headers.host,
      url: req.url
    });

    // subdomains split and in "java order"
    var host = url.parse('http://' + req.headers.host),
        subdomains = host.hostname.split('.').reverse();

    host.port = host.port || "80";

    cb.call({
      host: checkHost,
      rewrite: rewrite,
      forward: forward,
      withResponseBody: withResponseBody,
      withResponseHeaders: withResponseHeaders,
      notFound: notfound
    }, req, res, proxy);

    function checkHost(h, p) {
      // zip potentially uneven arrays in "java order" and
      // reverse so that the zip is "aligned" on the tail
      // instead of the head.
      var matchHost = zip(h.split('.').reverse(), subdomains)
        .reverse()
        .every(function (tuple) {
          var incoming = tuple.pop(),
              match = tuple.shift();

          return (
            // Not enough subdomains
            (typeof incoming !== 'undefined') &&
            ((match === '*') || (match === incoming))
          );
        })
      ;

      var matchPort = (
        typeof p === 'undefined' ||
        p === null ||
        p == host.port // should typecast numbers as expected
      );

      return matchHost && matchPort;
    }

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

      mlp.log('(%idx) <- [%method] %host:%port%url', {
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
    function notFound() {
      if (res.finished) {
        mlp.log('☢ ☢ ☢  WARNING: ☢ ☢ ☢');
        mlp.log('you are trying to end a connection that has already');
        mlp.log('ended, brony! not a big deal but you are probably');
        mlp.log('not intending to do that.');
        return;
      }
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
