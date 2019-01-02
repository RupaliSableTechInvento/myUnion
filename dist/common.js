var Common = {};
module.exports = Common;

Common.getAlphaNumericRandomString = function (length, nature) {
  var mask = '';
  if (nature.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
  if (nature.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (nature.indexOf('#') > -1) mask += '0123456789';
  if (nature.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
  var result = '';
  for (var i = length; i > 0; --i) result += mask[Math.floor(Math.random() * mask.length)];
  return result;
};
//# sourceMappingURL=common.js.map