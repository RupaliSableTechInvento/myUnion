var mongoose = require('mongoose');
var tokenSchema = require('./../schema/token');

const tokenModel = mongoose.model('token', tokenSchema);

module.exports = tokenModel;
//# sourceMappingURL=tokenModel.js.map