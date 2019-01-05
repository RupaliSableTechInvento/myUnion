
var electionDetailsModel=require('../models/electionDetailsModel');
var userElectionModel=require('../models/userElectionModel');

var jwt =require( 'jsonwebtoken');
var env =require( "../env");



const electionController = {
  getElection:(req,res,next)=>{
    var company_name=req.body.company_name
    var query=  {
      $and:[
        {company_name:company_name},
        {isActive:true}
      ]
     }
    electionDetailsModel.find(
   query
      ).exec(function(err, result) { 
      if (err) {
        res.json({
          isError:true,
          data:err
        })
      } else {
        if (result.length) {
          res.json({
            success:true,
            data:result[0]
          })
          
        } else {
          res.json({
            success:true,
            data:"Yet Election is not added."
          })
        }
       
      }
     });
   
  },
  updateElection:(req,res,next)=>{
    var token1=  req.body.authorization;
    var company_name=req.body.company_name
    var election_name=req.body.election_name
    var newelection_name=req.body.newelection_name
    var decoded = jwt.verify(token1, env.App_key);
    console.log("decoded reqest from==>", decoded.role)

    if (decoded.role=='admin') {

    var update={}
    var query={
      company_name:company_name,
      election_name:election_name
    }
     if(newelection_name&&req.body.election_date ) {
      update={
        $set:{
          election_name: newelection_name,
          election_date:req.body.election_date
        }
      }
    }
    else if (newelection_name) {
      update={
        $set:{
          election_name: newelection_name
        }
      }
      
    } else if(req.body.election_date ) {
      update={
        $set:{
  
          election_date:req.body.election_date
        }
      }
    }
 
    else{
      update={}
    }
    options = {new: true};

      electionDetailsModel.findOneAndUpdate(query,update,options,function(err, result) { 
        if (err) {
          res.json({
            isError:true,
            data:err
          })
        } else {
          res.json({
            success:true,
            data:result
          })
        }
       });
    }
    else{

    }

  },
  getAllApproveCandidate:(req,res,next)=>{
    userElectionModel.find({isApprove:true},
    function (err,userElection) {
      if (err) {
        res.json({
          isError: true,
          data: err
        })
        
      } else {
        res.json({
          success: true,
          data: userElection
        })
     
      }
      
    })
  },
  
};

module.exports= electionController;