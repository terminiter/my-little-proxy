var util = require('util');

module.exports = function (name) {
	return function (msg, ctx) {
    process.stdout.write(
      util.format(
        '♥ %s♥  %s',
        name,
        logrefFormatter(msg, ctx || {})
      ) +
      '\n'
    );
  }
}

// Ripped out of logref, modified to work without spaces after interp. vars
// Note that the "standard" logref formatter will choke on mlp's messages.
function logrefFormatter (msg, ctx) {
  Object.keys(ctx).forEach(function (k) {
    var start = msg.indexOf('%'),
        end = k.length,
        slice = msg.slice(start + 1, start + end + 1);
    if (slice === k) {
      msg = msg.slice(0, start) + ctx[k] + msg.slice(start + k.length + 1);
    }
  });
  return msg
};
