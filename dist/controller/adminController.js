var adminModel = require('../models/adminModel');
var usersModel = require('./../models/usersModel');
var tokenModel = require('./../models/tokenModel');
var companyModel = require('../models/companyModel');
var electionDetailsModel = require('../models/electionDetailsModel');
var userElectionModel = require('../models/userElectionModel');
var fightingFundModel = require('./../models/fightingFundModel');

var jwt = require('jsonwebtoken');
var env = require("../env");
var mongoose = require('mongoose');
var encode = require('hashcode').hashCode;
var generator = require('generate-password');
const axios = require('axios');
function search(refference_code, refference_codeArray) {
  for (var i = 0; i < refference_codeArray.length; i++) {
    if (refference_codeArray[i].code === refference_code) {
      return true;
    }
    if (i > refference_codeArray.length) {

      return false;
    }
  }
}

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
        let token = new tokenModel();
        var currentTime = new Date();
        var token2 = {
          token: token1,
          phone_no: admin.phone_no,
          isActive: "active",
          expiry: v,
          adminActiveTime: currentTime
        };
        tokenModel.findOneAndUpdate({
          $and: [{
            phone_no: admin.phone_no
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
                data: token1
              });
            });
          }
        });
      } else {
        console.log("admin Login Error==>", err, admin, adminModel);
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
  },
  registerUser: (req, res, next) => {

    console.log("  register User", req.body);
    var token1 = req.body.authorization;
    var decoded = jwt.verify(token1, env.App_key);
    console.log("decoded reqest from==>", decoded.role);

    if (decoded.role == 'admin') {
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

      console.log("Account Created==>", account_created, isCompanyValid, isDeptartmentValid, isRefference_codeValid);

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
            var deptDataForVoting = {};
            console.log(" Company data==>", dataRes);

            for (var key in dataRes) {
              console.log("key==>", key);
              var deptData = {
                count: 0
              };
              var updateQuery = 'deptDataForVoting.' + key;
              deptDataForVoting[key] = deptData;

              if (key.toString() == department_name.toString()) {
                isDeptartmentFound = true;
                var isRefferenceCodeFound = search(refference_code, refference_codeArray);
                console.log("department and reff code found ==>", isDeptartmentFound, isRefferenceCodeFound);
              }
            }

            if (isDeptartmentFound && isRefferenceCodeFound) {
              console.log("valid Data==>", deptDataForVoting);
              req.body.deptDataForVoting = deptDataForVoting;
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
    } else {
      res.json({
        isError: true,
        error: 'Unauthorized Access'
      });
    }
  },
  createElection: (req, res, next) => {
    var token1 = req.body.authorization;
    var decoded = jwt.verify(token1, env.App_key);
    console.log("decoded reqest from==>", decoded.role);

    if (decoded.role == 'admin') {
      var election_name = req.body.election_name;
      var date = req.body.election_date;

      let electionDetails = new electionDetailsModel(req.body);
      electionDetails.save(req.body, function (err, electionDetails) {
        if (err) {
          res.json({
            isError: true,
            data: err
          });
        } else {
          res.json({
            success: true,
            data: electionDetails
          });
        }
      });
    } else {
      res.json({
        isError: true,
        error: 'Unauthorized Access'
      });
    }
  },
  candidateReq: (req, res, next) => {
    var token1 = req.body.authorization;
    var decoded = jwt.verify(token1, env.App_key);
    console.log("decoded reqest from==>", decoded.role);

    if (decoded.role == 'admin') {
      userElectionModel.find({
        $and: [{ election_name: req.body.election_name }, { isApprove: false }]
      }, function (err, userElection) {
        if (err) {
          res.json({
            isError: true,
            data: err
          });
        } else {
          if (userElection) {

            res.json({
              sucess: true,
              data: userElection
            });
          } else {
            res.json({
              isError: true,
              data: "No Data Found"
            });
          }
        }
      });
    } else {
      res.json({
        isError: true,
        error: 'Unauthorized access'
      });
    }
  },
  approveCandidateReq: (req, res, next) => {
    var token1 = req.body.authorization;
    var decoded = jwt.verify(token1, env.App_key);
    console.log("decoded reqest from==>", decoded.role);
    var _id = req.body._id;
    if (decoded.role == 'admin') {
      userElectionModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(_id) }, {
        $set: { isApprove: true }

      }, function (err, userElection) {
        if (err) {
          res.json({
            isError: true,
            data: err
          });
        } else {
          console.log(userElection);

          var election_name = userElection.election_name;
          var emplID = userElection._id;
          var dataObj = {
            candidate: _id,
            support: 0
          };

          query = { election_name: election_name }, update = {
            $push: { candidateData: dataObj }
          }, options = { new: true };
          electionDetailsModel.findOneAndUpdate(query, update, options, function (error, electionDetails) {
            if (error) {
              res.json({
                isError: true,
                data: error
              });
            } else {
              res.json({
                success: true,
                data: { userElection: userElection, electionDetails: electionDetails }
              });
            }
          });
        }
      });
    } else {
      res.json({
        isError: true,
        data: 'Unauthorised Access'
      });
    }
  },
  approveTransactionReq: (req, res, next) => {
    var token1 = req.body.authorization;
    var decoded = jwt.verify(token1, env.App_key);
    var _id = req.body._id;
    var phone_no = req.body.phone_no;
    var accountNo = req.body.accountNo;
    console.log("decoded reqest from==>", decoded.role, accountNo);

    if (decoded.role == 'admin') {
      usersModel.findOneAndUpdate({ phone_no: phone_no }, {
        $set: { transactionApprove: true }

      }, function (err, userApprove) {
        if (err) {
          res.json({
            isError: true,
            data: err
          });
        } else {
          var userMsg = 'Transaction  Request Approve for user :' + phone_no;
          var dataObj = {
            user: phone_no
          };

          axios.get('http://sms.swebsolutions.in/api/mt/SendSMS?user=WEBSOLUTION&password=swsmymv*13&senderid=SWSCOM&channel=Trans&DCS=0&flashsms=0&number=' + decoded.phone_no + '&text= ' + userMsg + '&route=6').then(response => {
            if (response) {
              if (accountNo) {
                fightingFundModel.findOneAndUpdate({ accountNo: accountNo }, { $push: { 'user': dataObj } }, {
                  upsert: true
                }, function (err, result) {
                  if (err) {
                    res.json({
                      isError: true,
                      data: err
                    });
                  } else {
                    res.json({
                      success: true,
                      data: 'request Approve for ' + phone_no
                    });
                  }
                });
              } else {

                res.json({
                  isError: true,
                  data: 'Invalid Account'
                });
              }
            }
          }).catch(error => {
            res.json({
              isError: true,
              error: error
            });
          });
        }
      });
    } else {
      res.json({
        isError: true,
        data: 'Unauthorised Access'
      });
    }
  },
  deActivateUser: (req, res, next) => {
    var phone_no = req.body.phone_no;
    var token1 = req.body.authorization;
    var decoded = jwt.verify(token1, env.App_key);
    console.log("decoded reqest from==>", decoded.role);

    if (decoded.role == 'admin') {
      usersModel.findOneAndUpdate({ phone_no: phone_no }, { $set: { isActive: false } }, function (err, result) {
        if (err) {
          res.json({
            isError: true,
            error: err
          });
        } else {
          tokenModel.findOneAndUpdate({ phone_no: phone_no }, { sort: { 'expiry': -1 } }, { $set: { isActive: false } }, { new: true }, function (error, data) {

            if (error) {
              res.json({
                isError: true,
                err: error
              });
            } else {
              res.json({
                success: true,
                data: data
              });
            }
          });
        }
      });
    } else {
      res.json({
        isError: true,
        error: 'Unauthorized access'
      });
    }
  },
  setActiveUser: (req, res, next) => {
    var phone_no = req.body.phone_no;
    var token1 = req.body.authorization;
    var decoded = jwt.verify(token1, env.App_key);
    console.log("decoded reqest from==>", decoded.role);

    if (decoded.role == 'admin') {
      usersModel.findOneAndUpdate({ phone_no: phone_no }, { $set: { isActive: true } }, function (err, result) {
        if (err) {
          res.json({
            isError: true,
            error: err
          });
        } else {

          res.json({
            success: true,
            data: result
          });
        }
      });
    } else {
      res.json({
        isError: true,
        error: 'Unauthorized access'
      });
    }
  },
  deactiveCandidate: (req, res, next) => {}

};

module.exports = adminController;
//# sourceMappingURL=adminController.js.map