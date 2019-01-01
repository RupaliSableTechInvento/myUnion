var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var autoIncrement = require("mongoose-auto-increment");

const usersElectionSchema = new mongoose.Schema({
  election_name: {
    type: String,
    required: true
  },
  full_name: {
    type: String,
    required: true

  },
  phone_no: {
    type: String,
    required: true
  },
  empID: {
    type: String,
    required: true
  },
  company_name: {
    type: String,
    required: true
  },
  department_name: {
    type: String,
    required: true
  },
  Post: {
    type: String,
    default: 'No Post'
  },
  termsAndConditionsAgreed: {
    type: Boolean,
    required: true
  },
  isApprove: {
    type: Boolean,
    default: false

  },
  imageUrl: {
    type: Array
    // default: "../../assets/app/media/img/users/userProfileNew.png"
  },
  formSubmitted: {
    type: Date,
    default: new Date()
  }

});

usersElectionSchema.index({ election_name: 1, phone_no: 1 }, { unique: true });
usersElectionSchema.plugin(uniqueValidator);
// usersSchema.plugin(autoIncrement.plugin, 'id');

module.exports = usersElectionSchema;
//# sourceMappingURL=userElection.js.map