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
    if (refference_codeArray[i].code == refference_code) {
      console.log("Search found==> True");

      return true;
    }
    console.log("Search call", i, refference_codeArray[i].code, refference_code);
    if (i > refference_codeArray.length) {
      console.log("length end");

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
      if (user.length > 0) {
        console.log("User[0]=>", user);
        var d = new Date();
        var v = new Date();
        v.setMinutes(d.getMinutes() + 10);
        const token1 = jwt.sign({
          phone_no: user[0].phone_no,
          id: user[0]._id,
          name: user[0].full_name,
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
                userData: user[0]
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
        data: err
      });else {
        var PhoneObj = [];
        console.log("trade model result", tokenModel.length);
        for (let index = 0; index < tokenModel.length; index++) {
          PhoneObj.push(tokenModel[index].phone_no);
        }
        console.log("active user phone_no ", PhoneObj);

        usersModel.find({
          'phone_no': {
            $in: PhoneObj
          }
        }, (err, user) => {
          if (err) return res.json({
            isError: true,
            data: err
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

    var company_name = req.body.company_name;
    var department_name = req.body.department_name;
    var refference_code = req.body.refference_code;

    var findQuery = {

      'company_name': company_name
    };
    console.log("Find Query==>", findQuery);

    companyModel.find(findQuery, async function (err, company) {
      if (company) {
        console.log("Company found==>", company);
        var refference_codeArray = [];
        refference_codeArray = company[0].refference_code;
        var dataRes = company[0].department;
        var deptDataOfVoting = {};
        console.log(" Company data==>", dataRes);
        for (var key in dataRes) {
          console.log("key==>", key);
          var deptData = {
            count: 0
          };
          deptDataOfVoting[key] = deptData;
        }
        var isRefferenceCodeFound = await search(refference_code, refference_codeArray);
        if (await isRefferenceCodeFound) {

          req.body.deptDataOfVoting = deptDataOfVoting;
          console.log("valid Data==>", req.body);

          if (req.body.deptDataOfVoting.hasOwnProperty(department_name)) {
            console.log("deptDataOfVoting==>", req.body.deptDataOfVoting);
            var passwordGenerated = generator.generate({
              length: 6,
              numbers: true
            });
            var phone_no = req.body.phone_no;
            var userMsg = 'Congrats you are succesfully registerd for My union. Your password :' + passwordGenerated;
            req.body.password = encode().value(passwordGenerated);
            req.body.account_created = account_created;

            let user = new usersModel(req.body);
            user.save(req.body, function (err, user) {
              if (err) {
                console.log("Error in user save", err, user);

                res.json({
                  isError: true,
                  data: err
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
          console.log("Not found==>", isRefferenceCodeFound);

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