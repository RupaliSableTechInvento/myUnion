
var electionDetailsModel = require('../models/electionDetailsModel');
var userElectionModel = require('../models/userElectionModel');
var usersModel = require('../models/usersModel');
var mongoose = require('mongoose');

var jwt = require('jsonwebtoken');
var env = require("../env");

const electionController = {
  getElection: (req, res, next) => {
    var company_name = req.body.company_name;
    var query = {
      $and: [{ company_name: company_name }, { isActive: true }]
    };
    electionDetailsModel.find(query).exec(function (err, result) {
      if (err) {
        res.json({
          isError: true,
          data: err
        });
      } else {
        if (result.length) {
          res.json({
            success: true,
            data: result[0]
          });
        } else {
          res.json({
            success: true,
            data: "Yet Election is not added."
          });
        }
      }
    });
  },
  updateElection: (req, res, next) => {
    var token1 = req.body.authorization;
    var company_name = req.body.company_name;
    var election_name = req.body.election_name;
    var newelection_name = req.body.newelection_name;
    var decoded = jwt.verify(token1, env.App_key);
    console.log("decoded reqest from==>", decoded.role);

    if (decoded.role == 'admin') {

      var update = {};
      var query = {
        company_name: company_name,
        election_name: election_name
      };
      if (newelection_name && req.body.election_date) {
        update = {
          $set: {
            election_name: newelection_name,
            election_date: req.body.election_date
          }
        };
      } else if (newelection_name) {
        update = {
          $set: {
            election_name: newelection_name
          }
        };
      } else if (req.body.election_date) {
        update = {
          $set: {

            election_date: req.body.election_date
          }
        };
      } else {
        update = {};
      }
      options = { new: true };

      electionDetailsModel.findOneAndUpdate(query, update, options, function (err, result) {
        if (err) {
          res.json({
            isError: true,
            data: err
          });
        } else {
          res.json({
            success: true,
            data: result
          });
        }
      });
    } else {}
  },
  getAllApproveCandidate: (req, res, next) => {
    let company_name = req.body.company_name;
    let department_name = req.body.department_name;
    var decoded = jwt.verify(req.body.authorization, env.App_key);
    var findElectionQuery = {
      $and: [{ company_name: company_name }, { isActive: true }]
    };

    electionDetailsModel.find(findElectionQuery, function (err, result) {
      if (err) {
        res.json({
          isError: true,
          data: err
        });
      } else {
        if (result.length > 0) {
          var election_name = result[0].election_name;
          console.log("Election name==>", election_name);
          var findQuery = {
            $and: [{ company_name: company_name }, { department_name: department_name }, { election_name: election_name }, { isApprove: true }]
          };
          var resultObj = [];
          var candidateData = [];
          var data = {};
          candidateData = result[0].candidateData;
          userElectionModel.find(findQuery, function (err, userElection) {
            if (err) {
              res.json({
                isError: true,
                data: err
              });
            } else {
              var searchQuery = {
                $and: [{ '_id': mongoose.Types.ObjectId(decoded.id) }, { 'company_name': company_name }]
              };
              usersModel.find(searchQuery, { support: 1, _id: 0 }, function (err, result) {
                if (err) {
                  res.json({
                    isError: true,
                    data: err
                  });
                } else {

                  if (result.length > 0) {
                    let supportArray = result[0].support;
                    userElection.forEach(element => {
                      candidateData.forEach(item => {
                        if (item.candidate == element._id) {
                          supportArray.forEach(resultItem => {
                            if (resultItem.candidate == item.candidate) {
                              // console.log("Element Matched==>",resultItem.candidate);
                              data = {
                                _id: element._id,
                                full_name: element.full_name,
                                phone_no: element.phone_no,
                                imageUrl: element.imageUrl,
                                status: element.status,
                                support: item.support,
                                department_name: element.department_name,
                                company_name: element.company_name,
                                isSupport: true
                              };
                            } else {
                              // console.log("Element Not Matched==>",resultItem);
                              data = {
                                _id: element._id,
                                full_name: element.full_name,
                                phone_no: element.phone_no,
                                imageUrl: element.imageUrl,
                                status: element.status,
                                support: item.support,
                                department_name: element.department_name,
                                company_name: element.company_name,
                                isSupport: false
                              };
                            }
                          });

                          resultObj.push(data);
                          console.log("resultObj with support array==>", resultObj);
                        }
                      });
                    });
                    if (resultObj.length == userElection.length) {
                      console.log("resultObj==>", resultObj);
                      res.json({
                        success: true,
                        data: { resultObj }
                      });
                    }
                  } else {
                    userElection.forEach(element => {
                      candidateData.forEach(item => {
                        if (item.candidate == element._id) {
                          data = {
                            _id: element._id,
                            full_name: element.full_name,
                            phone_no: element.phone_no,
                            imageUrl: element.imageUrl,
                            status: element.status,
                            support: item.support,
                            department_name: element.department_name,
                            company_name: element.company_name,
                            isSupport: false
                          };
                          resultObj.push(data);
                          console.log("resultObj withOut support array==>", resultObj);
                        }
                      });
                    });
                    if (resultObj.length == userElection.length) {
                      console.log("resultObj==>", resultObj);
                      res.json({
                        success: true,
                        data: { resultObj }
                      });
                    }
                  }
                }
              });
            }
          });
        } else {

          res.json({
            isError: true,
            data: 'No data found'
          });
        }
      }
    });
  }

};

module.exports = electionController;
//# sourceMappingURL=electionController.js.map