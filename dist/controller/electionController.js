var adminModel = require('../models/adminModel');
var usersModel = require('./../models/usersModel');
var tokenModel = require('./../models/tokenModel');
var companyModel = require('../models/companyModel');
var jwt = require('jsonwebtoken');
var env = require("../env");
var mongoose = require('mongoose');
var encode = require('hashcode').hashCode;
var generator = require('generate-password');
const axios = require('axios');

encode().value(passwordGenerated);

const adminController = {

  login: (req, res, next) => {
    req.body.password = encode().value(req.body.password);
    const credential = req.body;
    console.log("admin Login Credential==>", credential);

    adminModel.findOne({ $and: [{ phone_no: credential.phone_no }, { password: credential.password }] }, (err, admin) => {
      if (err) res.json(err);
      if (admin) {
        console.log("admin=>", admin);
        var d = new Date();
        var v = new Date();
        v.setMinutes(d.getMinutes() + 10);
        const token1 = jwt.sign({
          phone_no: admin.phone_no,
          role: 'admin',
          expiry: v
        }, env.App_key);
        var decoded = jwt.verify(token1, env.App_key);
        console.log("decoded reqest from==>", decoded.role);
        res.json({
          sucess: true,
          data: token1
        });
      } else {
        // console.log("admin Login Error==>",err,admin,adminModel);

        res.json({
          isError: true,
          data: "Not a admin !"
        });
      }
    });
  },
  register: (req, res, next) => {
    console.log("admin  register", req.body);
    var account_created = new Date();
    if (req.body.password != "" && req.body.password.length > 6) {
      req.body.password = encode().value(req.body.password);
      let admin = new adminModel(req.body);
      req.body.account_created = account_created;

      console.log("Account Created==>", account_created);
      admin.save(req.body, function (err, user) {
        if (err) return res.json({
          isError: true,
          data: err
        });
        res.json({
          sucess: true,
          data: user
        });
      });
    } else {
      res.json({
        isError: true,
        data: 'invalid Password'
      });
    }
  }

};

module.exports = adminController;
//# sourceMappingURL=electionController.js.map