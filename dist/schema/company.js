var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

const Company = new mongoose.Schema({
  company_name: {
    type: String
  },
  refference_code: {
    type: Array
  },
  department: {
    type: Object
  }

}, { timestamps: true, usePushEach: true });

module.exports = Company;
//# sourceMappingURL=company.js.map