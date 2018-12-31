var mongoose = require('mongoose');
var usersSchema = require('./../schema/users');

const usersModel = mongoose.model('users', usersSchema);

module.exports = usersModel;
//# sourceMappingURL=usersModel.js.map