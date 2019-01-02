var companyModel = require('../models/companyModel');
var adminModel = require('../models/adminModel');
var jwt = require('jsonwebtoken');
var env = require("../env");
var mongoose = require('mongoose');
var encode = require('hashcode').hashCode;

const companyController = {

    addDept: (req, res, next) => {
        console.log("department  register", req.body);
        var token1 = req.body.authorization;
        var decoded = jwt.verify(token1, env.App_key);
        console.log("decoded reqest from==>", decoded.role);

        if (decoded.role == 'admin') {

            var deptData = {};
            deptData.voteCount = parseInt(req.body.voteCount);
            var $setObj = {};
            var updateQuery = 'department.' + req.body.deptName;
            $setObj[updateQuery] = deptData;
            console.log("$setObj=>", $setObj);

            //  wallets[CoinCode];
            console.log("updateQuery department=>", updateQuery, deptData);

            companyModel.findOneAndUpdate({
                company_name: req.body.company_name
            }, {
                $set: $setObj
            }, {
                new: true
            }, (err, Company) => {

                if (err) return res.json({
                    isError: true,
                    data: err
                });
                res.json({
                    Success: true,
                    data: Company
                });
            });
        } else {
            res.json({
                isError: true,
                data: 'Unauthorized access'
            });;
        }
    },
    updateVoteCount: (req, res, next) => {

        console.log("department  register", req.body);
        var token1 = req.body.authorization;
        var decoded = jwt.verify(token1, env.App_key);
        console.log("decoded reqest from==>", decoded.role);

        if (decoded.role == 'admin') {
            var deptData = {};
            deptData.voteCount = parseInt(req.body.voteCount);
            var $setObj = {};
            var updateQuery = 'department.' + req.body.deptName;
            var deptName = req.body.deptName;
            $setObj[updateQuery] = deptData;
            console.log("$setObj=>", $setObj);

            //  wallets[CoinCode];
            console.log("updateQuery department=>", updateQuery, deptData);

            companyModel.find({ company_name: req.body.company_name }, (err, Company) => {

                if (err) return res.json({
                    isError: true,
                    data: err
                });else {
                    var dataRes = Company[0].department;
                    // console.log("newTransaction user data==>", users, dataRes);

                    for (var key in dataRes) {
                        if (key.toString() == deptName.toString()) {

                            console.log("key matched==>", key, deptName);

                            companyModel.findOneAndUpdate({ company_name: req.body.company_name }, {
                                $set: $setObj
                            }, {
                                new: true
                            }, (err, Company) => {

                                if (err) return res.json({
                                    isError: true,
                                    data: err
                                });
                                res.json({
                                    Success: true,
                                    data: Company
                                });
                            });
                        }
                    }
                }
            });
        } else {
            res.json("Unauthorized access");
        }
    },
    getAllCount: (req, res, next) => {
        var company_name = req.body.company_name;
        companyModel.find({ 'company_name': company_name }, function (err, company) {
            if (err) {
                res.json({
                    isError: true,
                    data: err
                });
            } else {
                console.log("company found==>", company);
                var department = company[0].department;
                console.log("size of department==>", Object.keys(department).length);

                var totalDept = Object.keys(department).length;

                res.json({
                    success: true,
                    data: totalDept
                });
            }
        });
    },
    getAllDept: (req, res, next) => {
        var company_name = req.body.company_name;
        companyModel.find({ 'company_name': company_name }, function (err, company) {
            if (err) {
                res.json({
                    isError: true,
                    data: err
                });
            } else {
                var department = company[0].department;
                var deptArray = [];
                console.log("department found==>", department);
                Object.keys(department).forEach(function (key) {

                    deptArray.push(key);
                });
                if (deptArray.length) {
                    res.json({
                        success: true,
                        data: deptArray
                    });
                }
            }
        });
    }
};

module.exports = companyController;
//# sourceMappingURL=departmentController.js.map