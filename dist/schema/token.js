var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var autoIncrement = require("mongoose-auto-increment");

const tokenSchema = new mongoose.Schema({
  token: {
    type: String
  },
  phone_no: {
    type: String
  },
  isActive: {
    type: String
  },
  expiry: {
    type: Date
  },
  userActiveTime: {
    type: Date
  },
  userInactiveTime: {
    type: Date,
    default: ''
  }

});

tokenSchema.plugin(uniqueValidator);
// tokenSchema.plugin(autoIncrement.plugin, 'id'); 

module.exports = tokenSchema;
//# sourceMappingURL=token.js.map