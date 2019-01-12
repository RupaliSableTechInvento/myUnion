var usersModel =require( '../models/usersModel')
// var tokenModel =require( './../models/tokenModel');
var companyModel =require( '../models/companyModel')
var Common = require('../common')

var messagesModel =require( '../models/messagesModel');
var userElectionModel =require('../models/userElectionModel')
var electionDetailsModel=require('../models/electionDetailsModel');
var postModel =require( '../models/postModel')
// var postatrade =require( '../models/postatrade')
var jwt =require( 'jsonwebtoken');
var env =require( "../env");
const nodemailer = require('nodemailer');
var mongoose = require('mongoose');
var encode = require('hashcode').hashCode;
var encode = require('hashcode').hashCode;
var generator = require('generate-password');
const axios = require('axios');
var base64ToImage = require('base64-to-image');
const path = require('path')
function search(election_name,candidate, supportArray){
  for (var i=0; i < supportArray.length; i++) {
      if ((supportArray[i].election_name === election_name)&&(supportArray[i].candidate === candidate)) {
          return true;
      }
      if (i>supportArray.length) {

         return false;
      }
      
  }
}


const async = require('async');


function addSupport(ajax_data, mainCallback) {

  var results = {};
  var candidate=ajax_data.candidate;
    var  id=ajax_data.id

  function _isValidCandidate(callback) {
    console.log("_isValidCandidate");
    
     userElectionModel.find({ _id: mongoose.Types.ObjectId(candidate)},function (err,userElection) {
       if (err) {
         callback(err)
       } else {
         results.userElection=userElection
         console.log("Result==>",results);
         
         callback(null,results)
       }
     })

  }

  function _getDeptVoteCount(results, callback) {
    var company_name=results.userElection[0].company_name;
    var department_name=results.userElection[0].department_name;
    console.log("company name and department==>",company_name,department_name);
    
    companyModel.find(
        {company_name:company_name},{department:1,_id:0},function(err, department) {
      if (err) {
        callback(err)
      } else {
        // console.log("_getDeptVoteCount==>",department);
        var getDept=department[0].department;
        // console.log("Department==>",getDept);
        Object.keys(getDept).forEach(function(key) {
          if (key==department_name) {
            results.department = getDept[key];
          }
      });
        callback(null, results)
      }
    })
  }

  function _validateVoting(results, callback) {
    console.log("_validateVoting",results);
    usersModel.find({ _id: mongoose.Types.ObjectId(id)},function (err,user) {
      if (err) {
        callback(err)
      } else {
        
        var deptData=user[0].deptDataOfVoting;
        console.log("_validateVoting data==>",user[0]);

        var department_name=results.userElection[0].department_name;
        var assignDeptCount=results.department.voteCount;

        Object.keys(deptData).forEach(function(key) {
          console.log("Object.keys(deptData)==>",deptData);
          
          if (key==department_name) {
            console.log("key matched", deptData[key].count, key,department_name);
            
            if (deptData[key].count>=assignDeptCount) {
              console.log("Voting Limit reached",key,department_name);

              results.canVote=false;
              callback(null, results)
              
            } else {
              results.canVote=true;
              callback(null, results)
              
            }
            
          }
      });




        // callback(null,results)
      }
    })
    
   
    
  }

  async.waterfall([
    _isValidCandidate, _getDeptVoteCount, _validateVoting
  ], function(err, results) {
    if (err) {
      console.log("maincallback Err=>",err);
      
      mainCallback(err)
    } else {
      console.log("maincallback Results=>",results);

      mainCallback(null, results)
    }
  })
}



function demo(ajax_data, mainCallback) {
  var searchData = 'search';
  var searchQuery;
  // searchData = Number(searchData);
  // if (Number.isNaN(searchData)) {
  //   searchData = '';
  // }
  if (searchData != '') {
    console.log("SearchData for meeting", searchData);
    // var regexString = new RegExp('.*' + searchData + '.*', 'i');
    // searchQuery = { meeting_no: { $regex: regexString } };

  } else {
    searchQuery = {};
  }
  // var meeting = Database.getCollection('meeting');
  var results = {};

  function _isValidCandidate(callback) {
    console.log("_isValidCandidate");
    

    var a=1;
    if (!a) {
      callback(err)
    } else {
      results.a = a
      callback(null, results)
      
    }

  }

  function _checkSupportCount(results, callback) {
    console.log("_checkSupportCount",results);
    
 
    var b=1;
    if (!b) {
      callback(err)
    } else {
      results.b = b
      callback(null, results)
      
    }
  }

  function _getAllMeeting(results, callback) {
    console.log("_getAllMeeting",results);
    
    var c=1;
    if (!c) {
      callback(err)
    } else {
      results.c = c
      callback(null, results)
      
    }
  }

  async.waterfall([
    _isValidCandidate, _checkSupportCount, _getAllMeeting
  ], function(err, results) {
    if (err) {
      console.log("maincallback Err=>",err);
      
      mainCallback(err)
    } else {
      console.log("maincallback Results=>",results);

      mainCallback(null, results)
    }
  })
}



const usersController = {
 
  getAllMessagesWithFriend: (req, res, next) => {

    var decoded = jwt.verify(req.body.authorization, env.App_key);
    // console.log("getAllMessagesWithFriend reqest from==>", decoded.email, req.query.data)
    var friend = req.query.data.friend;
    var date = req.query.data.date;
    var temp = req.query.data.limit;
    var limit = '';
    // var limit=parseInt(temp)
    // if (temp && temp < 10) {
    //   limit = temp
    // } else {
    //   limit = 10;
    // }
    var query = '';
    if (date) {
      query = {
        $or: [
          { $and: [{ sender: decoded.email }, { reciever: friend }] },
          { $and: [{ sender: friend }, { reciever: decoded.email }] }
        ],
        "date": { $lt: date }
      }
    } else {
      query = {
        $or: [
          { $and: [{ sender: decoded.email }, { reciever: friend }] },
          { $and: [{ sender: friend }, { reciever: decoded.email }] }
        ]
      }
    }



    messagesModel.find(
      query
    ).sort({ 'date': -1 }).limit(10)


    .exec(function(err, messages) {
      if (err) return res.json({
        isError: true,
        data: err
      });
      res.json({
        success: true,
        data: messages
      });
    });

  

  },
  setMsgRead: (req, res, next) => {
    var arrMsgID = [];
    arrMsgID = req.body.data;
    console.log("arrMsgID", arrMsgID);
    var _id = '';
    var arrMsgIDList = arrMsgID.map(function(aField) {
        // return mongoose.Types.ObjectId(aField);
        return aField
      })
    

    var bulk = messagesModel.collection.initializeUnorderedBulkOp();

    arrMsgID.forEach((item, index) => {
      _id = mongoose.Types.ObjectId(item)
        // var id = arrMsgID[index];
      bulk.find({ _id: _id }).updateOne({ $set: { isRead: true } });

    })
    bulk.execute((err, messages) => {
      if (err) return res.json({
        isError: true,
        data: err
      });
      res.json({
        success: true,
        data: messages
      });
    });

  },
  getFriendsList: (req, res, next) => {
    var decoded = jwt.verify(req.body.authorization, env.App_key);
    console.log("addUserInfo", decoded.email)
    usersModel.find({
      'email': decoded.email
    }, { "friends": 1, "_id": 0 }, (err, users) => {
      if (err) return res.json({
        isError: true,
        data: err
      });
      res.json({
        success: true,
        data: users
      });
    });
  },
  getUserInfo: (req, res, next) => {
    console.log("get USer Info call from frnt end",req.url,req.body);
    
    var decoded = jwt.verify(req.body.authorization, env.App_key);
    usersModel.find({
      _id: decoded.id
    }, (err, users) => {
      if (err) return res.json({
        isError: true,
        data: err
      });
      res.json({
        success: true,
        data: users
      });
    });
  },
  getAllCount:(req,res,next)=>{
    console.log("getAllUserCount==>");
    
    var company_name=req.body.company_name;
    var query={};
    if (company_name) {
      query={
        'company_name':company_name
      }
      
    }
    else{
      query={

      }
    }
    usersModel.count(query,function (err,user) {
        if (err) {
            res.json({
                isError:true,
                data:err
            })            
        }
        else{
          console.log("company found==>",user);
          res.json({
              success:true,
              data:user
          })
        }
        
    })
  },
  getAll: async(req, res, next) => {
    usersModel.find({}, (err, users) => {
      if (err) return res.json({
        isError: true,
        data: err
      });
      res.json({
        success: true,
        data: users
      });
    });

  },
  EditUserProfile: async(req, res, next) => {
    var decoded = jwt.verify(req.body.authorization, env.App_key);
    console.log("Add User info for user==>",decoded.phone_no);
    
      if (req.body.dateOfBirth) {
        var dateOfBirth= new Date(req.body.dateOfBirth)
        req.body.dateOfBirth=dateOfBirth;
      }
    usersModel.findOneAndUpdate({

      _id: decoded.id
    }, req.body, {
      new: true
    }, (err, user) => {
      if (err) return res.json({
        isError: true,
        data: err
      });
      res.json({  
        success: true,
        data:req.body
      })
    });

  },
  userProfile: (req, res, next) => {
    // var _id = Number(req.query.id);

    var _id = mongoose.Types.ObjectId(req.query.id);
    console.log("id=>", _id);
    usersModel.findOne({
      _id: _id
    }, (err, user) => {

      if (err) {
        res.json({
          isError: true,
          data: err
        });
      } else {
        var email = user.email;
        console.log("Email==>", email);
        tokenModel.findOne({ 'email': email }, (err, tokenData) => {
          res.json({
            success: true,
            data: { user: user, tokenData: tokenData }
          });
        }).sort({ _id: -1 }).limit(1)

      }
    });
  },
  getOne: (req, res, next) => {
    // console.log("------------",next);
    var decoded = jwt.verify(req.body.authorization, env.App_key);
    usersModel.find({ _id: mongoose.Types.ObjectId(decoded.id)}, (err, user) => {
      if (err) {
        res.json({
          isError: true,
          data: err
        });
      } else {
        res.json({
          success: true,
          data: user[0]
        });
      }
    });
  },
  create: (req, res, next) => {
    usersModel.create(req.body, function(err, user) {
      if (err) return res.json({
        isError: true,
        data: err
      });
      res.json({
        success: true,
        data: user
      })
    })
  },
  uploadProfilePhotoOld: (req, res, next) => {
    // var id = mongoose.Types.ObjectId(req.body.id);
      var base64Str = req.body.imageUrl;
      var decoded = jwt.verify(req.body.authorization, env.App_key);
      if (base64Str) {
        var imageUrls = [];
        var folderPath = path.join(__dirname+'../../../', 'frontend', 'Images', '');
        console.log("Folder path==>",folderPath);
        var baseId = Common.getAlphaNumericRandomString(6, '#a')
        var optionalObj = { 'fileName': baseId, 'type': 'png' };
        var imageInfo = base64ToImage(base64Str, folderPath, optionalObj);
        imageUrls.push({ url: '/Images/_' + imageInfo.fileName, })
        var query={
          $set:{
            imgURL : imageUrls,
          } 
        }
      usersModel.findOneAndUpdate({
        _id: decoded.id
      }, query, {
        new: true
      }, (err, user) => {
        if (err) return res.json({
          isError: true,
          data: err
        });
        res.json({
          success: true,
          data: user
        })
      });
      } else {
        res.json({
          isError: true,
          data: 'Unable to upload'
        })
      }
  },
  uploadProfilePhoto: (req, res, next) => {
    // var id = mongoose.Types.ObjectId(req.body.id);
      var base64Str = req.body.imageUrl;
      var decoded = jwt.verify(req.body.authorization, env.App_key);
      console.log("Add User info for user==>",decoded.phone_no);
      if (base64Str) {
        var dataObj={
          imageUrl:base64Str,
        }

        query = {  _id: decoded.id},
        update = {  
          $push: { imgURL: dataObj } 
        },
        options = {new: true};
        usersModel.findOneAndUpdate(query,update,options
       , (err, user) => {
          if (err) return res.json({
            isError: true,
            data: err
          });
          res.json({  
            success: true,
            data:user
          })
        });
      }
      else{
        res.json({
          isError: true,
          data: 'image url not found'
        });
      }
     
     
  },
  delete: (req, res, next) => {
    var decoded = jwt.verify(req.body.authorization, env.App_key);
    usersModel.findOneAndUpdate({
      'email': decoded.email
    }, {
      isActive: 'inactive'
    }, (err, ok) => {
      if (err) return res.json({
        isError: true,
        data: err
      });
      else {
        res.json({
          success: true,
          data: true
        })
      }
    });
  },
  forgotPassword: (req, res, next) => {
    var phone_no = req.body.phone_no;
    console.log("forgot password password request==>",phone_no);

    usersModel.find({
      'phone_no': req.body.phone_no
    }, function(err, result) {
      if (err) {
        res.json({ 
          isError: true,
          data: err
        })
      } else {
        if (result != "") {
          var passwordGenerated = generator.generate({
            length: 6,
            numbers: true
          });
          var userName=result[0].full_name
          var userMsg='Hello '+userName+' ,your new account details are ,Mobile No: '+result[0].phone_no+' and password: '+passwordGenerated;
          var new_pasword = encode().value(passwordGenerated);

        
          axios.get('http://sms.swebsolutions.in/api/mt/SendSMS?user=WEBSOLUTION&password=swsmymv*13&senderid=SWSCOM&channel=Trans&DCS=0&flashsms=0&number='+ phone_no.trim() +'&text= '+ userMsg+'&route=6')
          .then(response => {

            usersModel.update({
              $and: [{ phone_no: phone_no  }]
        
            }, { $set: { "password":new_pasword } }, function(err, result) {
              if (result.nModified) {

                console.log("pasword modified-->",result);
                
        
                res.json({
                  success: true,
                  data: 'New password has been sent to your registerd No.'
                });
    

              }
            })
           
          

          })
          .catch(error => {
            console.log(error);
          });


        } else {
          console.log("result==> phone no not found",result);
          
          res.json({
            isError: true,
            data: 'sorry Not a registerd number'
          });
        }
      }
    })
  },
  isVerified: (req, res, next) => {
    var decoded = jwt.verify(req.query.token, env.App_key);
    usersModel.findOneAndUpdate({
      'email': decoded.email
    }, (err, user) => {
      if (err) return res.json({
        isError: true,
        data: err
      });
      res.json({
        success: true,
        data: user
      });
    });

  },
  emailVerification: (req, res, next) => {
    var host = req.headers.host;
    var decoded = jwt.verify(req.body.authorization, env.App_key);
    console.log("Emailverification==>", decoded.email);
    usersModel.find({
      'email': decoded.email
    }, function(err, result) {
      if (err) {
        res.json({
          isError: true,
          data: err
        })
      } else {
        if (result != "") {
          var d = new Date();
          var v = new Date();
          v.setMinutes(d.getMinutes() + 30);
          const token = jwt.sign({
            exp: Math.floor(v),
            email: decoded.email,
          }, env.App_key);
          console.log(result);
          nodemailer.createTestAccount((err, account) => {
            // create reusable transporter object using the default SMTP transport
            var transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                user: 'itstechinvento@gmail.com',
                pass: 'techinvento123'
              }
            });
            var htmlforemail = ``;
            let mailOptions = {
              from: 'itstechinvento@gmail.com', // sender address
              to: decoded.email, // list of receivers
              subject: 'Email Verification', // Subject line
              text: 'Please Click below link to Verify Your Email address', // plain text body
              html: 'Please<a id ="varified"href=http://' + host + '/ev/' + token + '>Click Here to processed email verification</a>',
            };
            transporter.sendMail(mailOptions, (error, info) => {
             
              if (error) {
                res.json({
                  isError: true,
                  data: error
                });
                return console.log("error--11--", error);
              } else {
                console.log('Message sent: %s', info.messageId);
                console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                res.json({
                  success: true,
                  data: 'Please check your email'
                });
              }
            });
          });
        } else {
          res.json({
            isError: true,
            data: 'please provide a valid mail'
          });
        }
      }
    })
  },
  emailVerified: (req, res, next) => {
    var decoded = jwt.verify(req.params.token, env.App_key);
    var dt = new Date();
    var checkDate = new Date(decoded.exp);
    if (dt < checkDate) {
      console.log("----------");
      usersModel.findOneAndUpdate({
        "email": decoded.email
      }, {
        $set: {
          "verification.email_verified": true
        }
      }, (err, user) => {
        if (err) return res.json({
          isError: true,
          data: err
        });
        res.redirect('/#/profile');
        // res.send('verified')
        //res.json({ isError: false, data: "your E-Mail address is verified sucessfully" });

      });
    } else {
      res.json({
        isError: true,
        data: "session expire"
      });
    }
  },
  varifyToken: (req, res, next) => {
    console.log("in verify Token=>");
    var decoded = jwt.verify(req.params.token, env.App_key);
    var dt = new Date();
    var checkDate = new Date(decoded.exp);
    if (dt < checkDate) {
      console.log("----");
      var d = new Date();
      var v = new Date();
      v.setMinutes(d.getMinutes() + 60);
      const token = jwt.sign({
        exp: Math.floor(v),
        email: decoded.email,
      }, env.App_key);
      res.redirect('/recover/' + token)
    } else {
      res.json({
        isError: true,
        data: "session expire"
      });
    }
  },
  changePassword: (req, res, next) => {
    // console.log("req.headers--->", req.body.authorization, req.body);
    var decoded = jwt.verify(req.body.authorization, env.App_key);
    console.log("change password request==>",decoded.phone_no);
    
    req.body.password = encode().value(req.body.password);
    req.body.new_pasword = encode().value(req.body.new_pasword);
    usersModel.findOneAndUpdate({
      $and: [{
        password: req.body.password
      }, {
        _id: decoded.id
      }]
    }, {
      $set: {
        "password": req.body.new_pasword,
      }
    }, (err, user) => {
      if (err) return res.json({
        isError: true,
        data: err
      });
      if(user){
          res.json({
            success: true,
            data: "Password has been Changed successfully"
          });
          
    
      }
      else{
        res.json({
          isError: true,
          data: 'No Record Found'
        });
 
      }
  
    
      console.log("user=>", user);
    })
  },
  addCandidate:(req,res,next)=>{
    // console.log("addCandidate==>",req.body);
    var decoded = jwt.verify(req.body.authorization, env.App_key);

    var phone_no=decoded.phone_no;
    var userQuery={
      $and: [{
        phone_no:phone_no
      }, {
        company_name: req.body.company_name
      },
      {
        department_name: req.body.department_name
      }
    ]
    }

    usersModel.find(userQuery
    ,function (err,user) {
      if (err) {
        res.json({
          isError:true,
          data:err
        });
      
      } else if(user.length){

        var imageUrl=req.body.imageUrl
        console.log("req body==>",user);

        var query={
        }
        req.body.phone_no=phone_no
        req.body.empID=user[0].empID
        req.body.user_id=decoded.id
        // code to convert image
        // if (imageUrl) {
        //   var base64Str = req.body.imageUrl;
        //   var imageUrls = [];
        //   var folderPath = path.join(__dirname+'../../../', 'frontend', 'Images', '_');
        //   console.log("Folder path==>",folderPath);
        //   var baseId = Common.getAlphaNumericRandomString(6, '#a')
        //   var optionalObj = { 'fileName': baseId, 'type': 'png' };
        //   var imageInfo = base64ToImage(base64Str, folderPath, optionalObj);
        //   imageUrls.push({ url: '/Images/_' + imageInfo.fileName, })
        //   req.body.imageUrl=imageUrls;
        //   query=req.body;

        // } else {
        //   query=req.body
        // }
        query=req.body
        console.log("user _id==>", req.body.user_id);
        
        let userElection = new userElectionModel(query);
        userElection.save(query, function(err, user) {
          if (err) {
            res.json({
              isError:true,
              data:err
            });

          }
          else{
            res.json({
              success:true,
              data:user
            });
          }
        })
        
      }
      else{
        console.log("USer Not Found==>",user);
        
        res.json({
          isError:true,
          data:err
        });

      }
      
    })
  },
  addSupport:(req,res,next)=>{
    var decoded = jwt.verify(req.body.authorization, env.App_key);
    console.log("add support request==>",decoded.phone_no);
    var candidate=req.body.candidate
  
    // candidate is candidate _id from userElection
 
    userElectionModel.find({ _id: mongoose.Types.ObjectId(candidate)},function (err,userElection) {
      if (err) {
        res.json({
          isError: true,
          data: err
        });
      } else {

        if (userElection.length>0) {
          var election_name=userElection[0].election_name
          var ajax_data = {
            election_name:election_name,
            candidate:req.body.candidate,
            id:decoded.id
          }
          addSupport(ajax_data, function(err, data) {
            if (err) {
              res.send({ isError: true, data: err });
            } else {
              console.log("Addsupport ==>>",data);
              if (data.canVote==false) {
                res.json({
                  isError: true,
                  data: 'Limit Reached'
                });
              
              } else {
                console.log("Valid Voting==>",data.canVote);
                
              usersModel.find({ _id: mongoose.Types.ObjectId(decoded.id)},async function (err,result) {
                if(err){
                  res.json({
                    isError: true,
                    data: err
                  });
                }
                else{
                  var company_name=data.userElection[0].company_name;
                  var department_name=data.userElection[0].department_name
                  var supportArray=result[0].support
                  var isAlreadyVote=await search(election_name,candidate, supportArray)

                  if (await isAlreadyVote) {
                    res.json({
                      isError:true,
                      data:'Invalid Attempt'
                    })
                    
                  } else {    
                  var dataObj={
                    election_name:election_name,
                    candidate:req.body.candidate,
                    company_name:company_name,
                    department_name:department_name,
                    date:new Date()
                  }
                  var q1='deptDataOfVoting.'+department_name
                var queryString=q1+'.count';
                
                  query = { $and:[
                    { _id: mongoose.Types.ObjectId(decoded.id)},
                    {"support":{ $not: {$elemMatch: { candidate} } }}
                  ]},
                  update = {
                    $inc: { [queryString]: 1 } ,
                    $push: { support: dataObj } 
                  },
                  options = {upsert: true};
                  
                usersModel.findOneAndUpdate(
                query,update,options
              ,function (err,user) {
                if (err) {
                  res.json({
                    isError: true,
                    data: err
                  });
                  
                } else {
                  console.log("add support  result==>",user);

                  electionDetailsModel.find({ election_name:election_name},
                    
                    function (err,electionDetails) {
                    if (err) {
                      res.json({
                        isError: true,
                        data: err
                      });
                      
                    } else {

                      console.log("Election Details==>",electionDetails);
                    
                      var candidateData= electionDetails[0].candidateData;
                      candidateData.forEach((item, index) => {
                        if (item.candidate == req.body.candidate) {
                          electionDetailsModel.findOneAndUpdate(
                        {
                          $and:[
                            { election_name:election_name},
                            {[`candidateData.${index}.candidate`]: req.body.candidate}
                          ]
                        }, { $inc: { [`candidateData.${index}.support`]: 1 } },{new:true},function (err,result) {
                          if (err) {
                            res.json({
                              isError: true,
                              data: err
                            });
                          }
                          else{
                            console.log(" support added result==>",result);
                
                            res.json({
                              success: true,
                              data: result
                            });
                          }
                          
                        })

                        }
                      
                    })
                  }
                    
                  })

                
                }
                
              })

                }
                
                }
                
              })
              }
            
            }
          })
        }
        else{
          res.json({
            isError: true,
            data: 'Invalid Attempt'
          });
        }
      }
    })
  },
  unSupport:(req,res,next)=>{

    var decoded = jwt.verify(req.body.authorization, env.App_key);
    console.log("unSupport  request==>",decoded.phone_no);

    var candidate=req.body.candidate
    userElectionModel.find({ _id: mongoose.Types.ObjectId(candidate)},function (err,userElection) {
      if (err) {
        res.json({
          isError: true,
          data: err
        });
      } else {

        if (userElection.length>0) {
          var election_name=userElection[0].election_name
        
          usersModel.find({ _id: mongoose.Types.ObjectId(decoded.id)},async function (err,result) {
            if(err){
              res.json({
                isError: true,
                data: err
              });
            }
            else{
          
              var department_name=userElection[0].department_name
              var supportArray=result[0].support
              var isAlreadyVote=await search(election_name,candidate, supportArray)
              console.log("|isAlreadyVote in unsupport==>", await isAlreadyVote);
             if (await !isAlreadyVote) {
                res.json({
                  isError:true,
                  data:'Invalid Attempt'
                })
                
              } else {
            
              var q1='deptDataOfVoting.'+department_name
              var queryString=q1+'.count';
                console.log("deptDataOfVoting==>",queryString);
                
              query = { $and:[
                { _id: mongoose.Types.ObjectId(decoded.id)},
                {"support": {$elemMatch: { candidate} } }
              ]},
              update = {
                $inc: { [queryString]: -1 } ,
                $pull: { 'support': { candidate: candidate } } }
              ,
              // $pullAll: { support :{$elemMatch: {candidate: null } }}

              options = {
                upsert: true};
              
            usersModel.findOneAndUpdate(
            query,update,options
          ,function (err,user) {
            if (err) {
              res.json({
                isError: true,
                data: err
              });
              
            } else {
              console.log("Un support  result==>",user);

              electionDetailsModel.find({ election_name:election_name},
                
                function (err,electionDetails) {
                if (err) {
                  res.json({
                    isError: true,
                    data: err
                  });
                  
                } else {

                  console.log("Election Details==>",electionDetails);
                
                  var candidateData= electionDetails[0].candidateData;
                  candidateData.forEach((item, index) => {
                    if (item.candidate == req.body.candidate) {
                      electionDetailsModel.findOneAndUpdate(
                    {
                      $and:[
                        { election_name:election_name},
                        {[`candidateData.${index}.candidate`]: req.body.candidate}
                      ]
                    }, { $inc: { [`candidateData.${index}.support`]: -1 } },{new:true},function (err,result) {
                      if (err) {
                        res.json({
                          isError: true,
                          data: err
                        });
                      }
                      else{
                        console.log(" Unsupport result==>",result);
            
                        res.json({
                          success: true,
                          data: result
                        });
                      }
                      
                    })

                    }
                  
                })
              }
                
              })

            
            }
            
          })

            }
            
            }
            
          })
        
        }
        else{
          res.json({
            isError: true,
            data: 'Invalid Attempt'
          });
        }
      }
    })


  },
  addPost:(req,res,next)=>{
    var decoded = jwt.verify(req.body.authorization, env.App_key);
    var query={
      phone_no:decoded.phone_no
    }
    var imageUrls = [];
    var postInfo={
    }
    var imageUrl=req.body.imageUrl
    var createdBy={}
    if (imageUrl.isArray) {
      console.log("image url is an Array-==>");
      
      for (var i = 0; i < imageUrl.length; i++) {
        var baseId = Common.getAlphaNumericRandomString(6, '#a')
        var base64Str = imageUrl[i];
        // console.log("base 64==<",base64Str,imageUrl);
        
        var folderPath = path.join(__dirname+'../../../', 'frontend', 'Images', '');
        var optionalObj = { 'fileName': baseId, 'type': 'png' };
        var imageInfo = base64ToImage(base64Str, folderPath, optionalObj);
        imageUrls.push({ url: '/Images/_' + imageInfo.fileName})
      }
    }
    else{
      console.log("image url is  Not an Array-==>");
      var baseId = Common.getAlphaNumericRandomString(6, '#a')
      var base64Str = imageUrl;
      // console.log("base 64==<",base64Str,imageUrl);
      
      var folderPath = path.join(__dirname+'../../../', 'frontend', 'Images', '');
      var optionalObj = { 'fileName': baseId, 'type': 'png' };
      var imageInfo = base64ToImage(base64Str, folderPath, optionalObj);
      imageUrls.push({ url: '/Images/_' + imageInfo.fileName})
    }
    createdBy={
    full_name:decoded.full_name,
    phone_no:decoded.phone_no,
    user_id:decoded.id
    }
    console.log("Post created by==>",createdBy,decoded);
    
    postInfo.imageUrlsArr = imageUrls;
    postInfo.post=req.body.post
    postInfo.createdBy=createdBy
    console.log("Post Info==>",postInfo);
    
    let post= new postModel(postInfo)
    post.save(postInfo,function (err,docs) {
      if (err) {
        return res.json({
          isError:true,
          data:err
        })
      } else {
        res.json({
          success:true,
          data:'Post added successfully'
        })
      }
      
    })
  },
  getUserPost:(req,res,next)=>{  
    user_id=req.body.user_id
    console.log("getUserPost==>",user_id);
    
    postModel.find({'createdBy.user_id':user_id},function (err,result) {
      if (err) {
        res.json({
          isError:true,
          data:err
        })
        
      } else {
        if (result.length) {
          res.json({
            success:true,
            data:result
          })
        } else {
          res.json({
            isError:true,
            data:'No post found'
          })
        }
      
        
      }
      
    })

  }
};

module.exports= usersController;