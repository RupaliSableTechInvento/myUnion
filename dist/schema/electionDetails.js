var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var autoIncrement = require("mongoose-auto-increment");

const electionDetailsSchema = new mongoose.Schema({
  election_name: {
    type: String,
    unique: true,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  election_date: {
    type: Date,
    required: true
  },
  election_created: {
    type: Date,
    required: true
  },
  company_name: {
    type: String,
    required: true
  },
  candidateData: {
    type: Array
  }

});

electionDetailsSchema.plugin(uniqueValidator);
// usersSchema.plugin(autoIncrement.plugin, 'id');

module.exports = electionDetailsSchema;
//# sourceMappingURL=electionDetails.js.map