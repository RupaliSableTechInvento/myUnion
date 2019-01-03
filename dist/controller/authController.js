var usersModel = require('./../models/usersModel');
var tokenModel = require('./../models/tokenModel');
var companyModel = require('../models/companyModel');

var jwt = require('jsonwebtoken');
var env = require("../env");
var encode = require('hashcode').hashCode;
var generator = require('generate-password');
const axios = require('axios');
function search(refference_code, refference_codeArray) {
  console.log("Search call");

  for (var i = 0; i < refference_codeArray.length; i++) {
    if (refference_codeArray[i].code.toString() == refference_code.toString()) {
      console.log("Search found==> True");

      return true;
    }
    console.log("Search call", i);
    if (i > refference_codeArray.length) {

      return false;
    }
  }
}
var express = require('express');
const app = express();

const authController = {
  login: (req, res, next) => {

    req.body.password = encode().value(req.body.password);
    const credential = req.body;
    console.log("user login==>", credential);
    var query = {
      $and: [{ phone_no: credential.phone_no }, { password: credential.password }, { isActive: 'active' }]
      // global.email = credential.email;
    };usersModel.find(query, (err, user) => {
      if (err) res.json(err);
      if (user.length) {
        console.log("User[0]=>", user);
        var d = new Date();
        var v = new Date();
        v.setMinutes(d.getMinutes() + 10);
        const token1 = jwt.sign({
          phone_no: user[0].phone_no,
          id: user[0]._id,
          role: 'user',
          expiry: v
        }, env.App_key);
        var decoded = jwt.verify(token1, env.App_key);
        console.log("decoded reqest from==>", decoded.role);
        let token = new tokenModel();
        var currentTime = new Date();
        var token2 = {
          token: token1,
          phone_no: user[0].phone_no,
          isActive: "active",
          expiry: v,
          userActiveTime: currentTime
        };
        tokenModel.findOneAndUpdate({
          $and: [{
            phone_no: user[0].phone_no
          }, {
            isActive: "active"
          }]
        }, {
          $set: {
            isActive: "inactive"
          }
        }, (err, data) => {
          if (err) return res.json({
            isError: true,
            data: err
          });else {
            console.log("tokenModel.findOneAndUpdate else", data, credential.phone_no);

            tokenModel.create(token2, function (err, token) {
              if (err) return res.json({
                isError: true,
                data: token1
              });
              res.json({
                sucess: true,
                data: token1,
                user: {
                  phone_no: user[0].phone_no,
                  full_name: user[0].full_name,
                  id: user[0]._id
                }
              });
            });
          }
        });
      } else {
        console.log("USer==>", user);

        res.json({
          isError: true,
          data: "Invalid User !"
        });
      }
    });
  },
  getActiveUser: async (req, res, next) => {
    await tokenModel.find({
      isActive: "active"
    }, (err, tokenModel) => {
      if (err) return res.json({
        isError: true,
        tokenModel: err
      });else {
        var emailObj = [];
        console.log("trade model result", tokenModel.length);
        for (let index = 0; index < tokenModel.length; index++) {
          emailObj.push(tokenModel[index].email);
        }
        console.log("active user email ", emailObj);

        usersModel.find({
          'email': {
            $in: emailObj
          }
        }, (err, user) => {
          if (err) return res.json({
            isError: true,
            user: err
          });else {
            return res.json({
              sucess: true,
              tokenModel: tokenModel,
              user: user
            });
          }
        });
      }
    });
  },
  register: (req, res, next) => {
    console.log("req.body for register", req.body);
    var account_created = new Date();
    var passwordGenerated = generator.generate({
      length: 6,
      numbers: true
    });
    var phone_no = req.body.phone_no;
    var userMsg = 'Congrats you are succesfully registerd for My union. Your password :' + passwordGenerated;
    req.body.password = encode().value(passwordGenerated);
    req.body.account_created = account_created;

    var isCompanyValid = false;
    var isDeptartmentValid = false;
    var isRefference_codeValid = false;
    var isCompanyValid = req.body.company_name.length > 0 ? true : false;
    var isDeptartmentValid = req.body.department_name.length > 0 ? true : false;
    var isRefference_codeValid = req.body.refference_code.length > 0 ? true : false;
    // console.log("Account Created==>", account_created,isCompanyValid,isDeptartmentValid,isRefference_codeValid);

    if (isCompanyValid && isDeptartmentValid && isRefference_codeValid) {
      var company_name = req.body.company_name;
      var department_name = req.body.department_name;
      var refference_code = req.body.refference_code;
      companyModel.findOne({ 'company_name': company_name }, function (err, company) {
        if (company) {

          var isRefferenceCodeFound = false;
          var isDeptartmentFound = false;
          var refference_codeArray = [];
          refference_codeArray = company.refference_code;
          console.log("department in comapny==>", refference_codeArray, refference_code);

          var dataRes = company.department;
          var deptDataOfVoting = {};
          console.log(" Company data==>", dataRes);

          for (var key in dataRes) {
            console.log("key==>", key);
            var deptData = {
              count: 0
              // var updateQuery = 'deptDataOfVoting.' + key;
            };deptDataOfVoting[key] = deptData;

            if (key.toString() == department_name.toString()) {
              isDeptartmentFound = true;
              var isRefferenceCodeFound = search(refference_code, refference_codeArray);
              console.log("department and reff code found ==>", isDeptartmentFound, isRefferenceCodeFound);
            }
          }

          if (isDeptartmentFound && isRefferenceCodeFound) {

            req.body.deptDataOfVoting = deptDataOfVoting;
            console.log("valid Data==>", req.body);

            if (req.body.deptDataOfVoting.hasOwnProperty(department_name)) {
              console.log("deptDataOfVoting==>", req.body.deptDataOfVoting);

              let user = new usersModel(req.body);
              user.save(req.body, function (err, user) {
                if (err) {
                  console.log("Error in user save", err, user);

                  res.json({
                    isError: true,
                    error: err
                  });
                } else {
                  axios.get('http://sms.swebsolutions.in/api/mt/SendSMS?user=WEBSOLUTION&password=swsmymv*13&senderid=SWSCOM&channel=Trans&DCS=0&flashsms=0&number=' + phone_no.trim() + '&text= ' + userMsg + '&route=6').then(response => {

                    companyModel.update({
                      $and: [{ company_name: company_name }, { refference_code: { $elemMatch: { 'code': refference_code } } }]

                    }, { $set: { "refference_code.$.isactive": true } }, function (err, result) {
                      if (result.nModified) {

                        console.log("refference code modified-->", result);

                        res.json({
                          sucess: true,
                          data: user
                        });
                      }
                    });
                  }).catch(error => {
                    console.log(error);
                  });
                }
              });
            } else {
              res.json({
                isError: true,
                data: 'Departement not found'
              });
            }
          } else {
            res.json({
              isError: true,
              data: 'match not found'
            });
          }
        } else {
          res.json({
            isError: true,
            data: 'Company not found'
          });
        }
      });
    } else {
      res.json({
        isError: true,
        data: 'please provide required fields'
      });
    }
  },
  logout: (req, res, next) => {

    var decoded = jwt.verify(req.body.authorization, env.App_key);
    var userInactiveTime = new Date();

    console.log("logout request==>", decoded.phone_no, req.body.authorization, userInactiveTime);

    tokenModel.findOneAndUpdate({
      $and: [{
        token: req.body.authorization
      }, {
        phone_no: decoded.phone_no
      }]
    }, {
      $set: {
        isActive: "inactive",
        userInactiveTime: userInactiveTime
      }
    }, { new: true }, (err, data) => {
      console.log("logout data==>", data);

      if (err) {
        res.json({
          isError: true,
          data: err
        });
      } else {
        res.json({
          success: true,
          data: data
        });
      }
    });
  },
  isTokenValid: (req, res, next) => {
    console.log("is Token valid==>", req.body);
    var query = {
      $and: [{
        token: req.body.authorization
      }, {
        isActive: "active"
      }]
    };

    tokenModel.find(query, (err, data) => {
      if (err) {
        res.json({
          isError: true,
          data: err
        });
      } else {
        if (data.length) {
          res.json({
            success: true,
            data: data
          });
        } else {
          res.json({
            isError: true,
            data: 'invalid Token'
          });
        }
      }
    });
  }

};

module.exports = authController;
//# sourceMappingURL=authController.js.map