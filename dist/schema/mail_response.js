var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var autoIncrement = require("mongoose-auto-increment");

const mailResponse = new mongoose.Schema({

  email: {
    type: String
  },
  error: {
    type: String
  },
  info: {
    type: String
  }
});

mailResponse.plugin(uniqueValidator);

module.exports = mailResponse;
//# sourceMappingURL=mail_response.js.map