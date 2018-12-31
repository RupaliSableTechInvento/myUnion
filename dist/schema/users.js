var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var autoIncrement = require("mongoose-auto-increment");
const uniqueArrayPlugin = require('mongoose-unique-array');

const usersSchema = new mongoose.Schema({
  full_name: {
    type: String
  },
  phone_no: {
    type: String,
    index: true,
    unique: true,
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
  refference_code: {
    type: String,
    unique: true,
    required: true
  },
  isVote: {
    type: Boolean,
    default: false
  },
  deptDataOfVoting: {
    type: Object,
    required: true

  },

  transactionApprove: {
    type: Boolean,
    default: false
  },
  password: {
    type: String,
    required: true
  },
  isActive: {
    type: String,
    default: 'active'
  },
  imgURL: {
    type: Array
    // default: "../../assets/app/media/img/users/userProfileNew.png"
  },
  account_created: {
    type: Date,
    default: new Date()
  },

  verification: {
    mobile_verified: {
      type: Boolean,
      default: false
    }
  },
  support: {
    type: Array

  }

});

usersSchema.plugin(uniqueValidator);
// usersSchema.plugin(autoIncrement.plugin, 'id');

module.exports = usersSchema;
//# sourceMappingURL=users.js.map