var adminModel = require('../models/adminModel');
var usersModel = require('./../models/usersModel');
var tokenModel = require('./../models/tokenModel');
var companyModel = require('../models/companyModel');
var electionDetailsModel = require('../models/electionDetailsModel');
var jwt = require('jsonwebtoken');
var env = require("../env");
var mongoose = require('mongoose');
var encode = require('hashcode').hashCode;
var generator = require('generate-password');
const axios = require('axios');

encode().value(passwordGenerated);

const electionController = {
  getElection: (req, res, next) => {
    var company_name = req.body.company_name;
    electionDetailsModel.find({ company_name: company_name });
  }

};

module.exports = electionController;
//# sourceMappingURL=electionController.js.map