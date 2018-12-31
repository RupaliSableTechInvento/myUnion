var usersModel =require( './../models/usersModel');
var tokenModel =require( './../models/tokenModel');
var fightingFundModel=require('./../models/fightingFundModel')

var jwt =require( 'jsonwebtoken');
var env =require( "../env");
var encode = require('hashcode').hashCode;

var express =require( 'express');
const app = express();
var generator = require('generate-password');
const axios = require('axios');
function search(user, UserArray){
    console.log("Search Function==>",user,UserArray);
    for (let i=0; i < UserArray.length; i++) {
        console.log("in for loop==>",i,UserArray[i].user,user);
        
        if (UserArray[i].user== user) {
            console.log("Search Function User Found==>",user);
          return true;
            
        }
        if (i>UserArray.length) {
            console.log("Search Function Not found==>",user);
            return false;
          
           
        }
        
    }
    console.log("for loop iteration");
    
  }

  function EndTransaction(params) {
      
    options = {upsert: true};
    fightingFundModel.findOneAndUpdate({accountNo:params}, {$set:{isTransaction:false}}, options, function (err, data) {
        if (err) {
            console.log("EndTransaction end Error==>",err);
            
          return false
        }
       else if (!data) {
        console.log("EndTransaction end Error==>",data);
        return false
        }
        else{
            console.log("EndTransaction sucess==>",data);
            return true
        }
        
    });
      
  }

const fightingFundController = {
  createAccount: (req, res, next) => {
    var token1=  req.body.authorization;
    var decoded = jwt.verify(token1, env.App_key);
    console.log("decoded reqest from==>", decoded.role)

    if (decoded.role=='admin') {  

         var account_created = new Date();
         var passwordGenerated = generator.generate({
            length: 6,
            numbers: true
          });
      
          var phone_no=req.body.phone_no;
          var userMsg='Congrats you are Account '+ req.body.accountNo+' is created  successfully. Your password :'+passwordGenerated;
        req.body.password = encode().value(passwordGenerated);
        req.body.account_created = account_created
        var user={
            user:phone_no
        }
        req.body.user=[]
        req.body.user.push(user)
          console.log("req body for create account=", req.body);
          let fightingFund = new fightingFundModel(req.body);

          fightingFund.save(req.body, function(err, fightingFund) {
            if (err) return res.json({
              isError: true,
              data: err,
              });
             
              else{
                
          axios.get('http://sms.swebsolutions.in/api/mt/SendSMS?user=WEBSOLUTION&password=swsmymv*13&senderid=SWSCOM&channel=Trans&DCS=0&flashsms=0&number='+ phone_no.trim() +'&text= '+ userMsg+'&route=6')
          .then(response => {

            res.json({
                success: true,
                data: fightingFund
              });
          })
          .catch(error => {
            res.json({
           isError: true,
           error: error
         });
          });

              }
          })

        }
        else{
         res.json({
           isError: true,
           error: 'Unauthorized Access'
         });
        }
  

  },
  getBalance:(req,res,next)=>{
      console.log("get Balance==>",req.body.accountNo);
      var accountNo=req.body.accountNo;
      
      fightingFundModel.findOne({accountNo:accountNo},{balance:1,_id:0},function (err,result) {
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
          
      })
   
  },
  DepositsTransaction:(req,res,next)=>{
    console.log("DepositsTransaction ",req.body);

    var user=req.body.user;
    var accountNo=req.body.accountNo;
    var decoded = jwt.verify(req.body.authorization, env.App_key);

    var phone_no=decoded.phone_no;
    req.body.password = encode().value(req.body.password);
    console.log("phone_no==>",phone_no,user);
    
    if(user==phone_no){

        fightingFundModel.find({$and:[
            {accountNo:accountNo},
            {password:req.body.password}
        ]},async  function  (err,result) {
            if (err) {
                res.json({
                    isError:true,
                    data:err
                })
                
            } else {
                console.log("Account found==>",result);
                if (result.length>0) {
                    console.log("Result length GT 0");
                    
                    var UserArray=result[0].user
                    var balance=parseFloat(result[0].balance) ;
                    var newAmt=parseFloat(req.body.newAmt)
                    var userValid=await search(phone_no,UserArray);
                         if (userValid) {
                             console.log("ResPonse==>",userValid);
                                  
                                console.log("USer valid",userValid);         
                                if (newAmt>0) {
                                    console.log("newAmt",newAmt);
        
                                    options = {upsert: true};
                                    fightingFundModel.findOneAndUpdate({accountNo:accountNo}, {$set:{isTransaction:true}}, options, function (err, data) {
                                        if (err) {
                                            console.log("Set Transaction Error==>");
                                            
                                            res.json({
                                                isError:true,
                                                data:err})
                                        }
                                       else if (!data) {
                                        console.log("Set Transaction Not Data==>",data);
        
                                            res.json({
                                                isError:true,
                                                data:err})
                                        }
                                        else{
        
                                            
            
                                    var newBalance=balance+newAmt;
                                    console.log("DepositsTransaction==>  newBalance",newBalance);
            
                                    var dateObj = new Date();
                                    var month = dateObj.getUTCMonth() + 1; //months from 1-12
                                    var day = dateObj.getUTCDate();
                                    var year = dateObj.getUTCFullYear();
            
                                    var newdate = year + "/" + month + "/" + day;
                               
                                    var dataObj=
                                    {
                                        role:'deposit',
                                        amt:newAmt,
                                        user:user,
                                        oldBalance:balance,
                                        balance:newBalance,
                                        date:dateObj
                                
                                    }
                                    query = {'accountNo': accountNo},
                                    update = {
                                        $set: {balance: newBalance},
                                        $push: {transaction: dataObj}
                                    },
                                    options = {upsert: true,new:true};
                                    
                                    fightingFundModel . findOneAndUpdate  (query, update, options,async function(err, data) {
                                       
                                            
                                        if (err) {
                                             res.json({
                                              isError:true,
                                              data:err})
                                             
                                          }
                                          if (!data) {
                                              
                                    
                                         res.json({
                                                isError:true,
                                                data:err}) 
                                          }
                                          else{
                                            res.json({
                                                success:true,
                                                data:data}) 
                                          }
          
                                      
                                    });
            
                                          
                                        }
                                        
                                    });
            
                                } else {
                                    res.json({
                                        isError:true,
                                        data:"Invalid Transaction"
                                    })
                                    
                                }
                        
                             
                             
                         } else {
                            console.log("ResPonse Error==>",userValid);
                            res.json({
                                isError:true,
                                data:isFound
                            
                            })
                         }
                         
                } else {
                    console.log("Result length LT 0",result);
                    res.json({
                        isError:true,
                        data:"Invalid Transaction"
                    })
                    
                }
           
                
            }
            
        })
     

    }else{
        res.json({
            isError:true,
            data:'Unauthorised Access'
        })
    }

  },
  WithdrawalTransaction:(req,res,next)=>{
      console.log("WithdrawalTransaction ",req.body);
      
    var user=req.body.user;
    var accountNo=req.body.accountNo;
    var decoded = jwt.verify(req.body.authorization, env.App_key);

    var phone_no=decoded.phone_no;
    req.body.password = encode().value(req.body.password);

    if(user==phone_no){

        fightingFundModel.find({$and:[
            {accountNo:accountNo},
            {password:req.body.password}
        ]
                },async  function  (err,result) {
            if (err) {
                res.json({
                    isError:true,
                    data:err
                })
                
            } else {

                if (result.length>0) {
                    console.log("Account found==>",result[0]);
                
                    var UserArray=result[0].user
                    var balance=parseFloat(result[0].balance) ;
                    var newAmt=parseFloat(req.body.newAmt)
                    var userValid=await search(phone_no,UserArray);
               
                    if (userValid) {
                        if (((balance>0)&&(newAmt>0))&&(balance>=newAmt)) {
                           
    
                            var newBalance=balance-newAmt;
                         
                            // result[0].balance=newBalance;
                            // result[0].transaction=dataObj
                            if (newBalance>=0) {
                                options = {upsert: true,new:true};
                                fightingFundModel.findOneAndUpdate({accountNo:accountNo}, {$set:{isTransaction:true}}, options, function (err, data) {
                                    if (err) {
                                        res.json({
                                            isError:true,
                                            data:err})
                                    }
                                   else if (!data) {
                                        res.json({
                                            isError:true,
                                            data:err})
                                    }
                                    else{

                                console.log("WithdrawalTransaction",result[0],result[0].transaction);
                                var dateObj = new Date();
                                var month = dateObj.getUTCMonth() + 1; //months from 1-12
                                var day = dateObj.getUTCDate();
                                var year = dateObj.getUTCFullYear();
        
                                var newdate = year + "/" + month + "/" + day;
                                
                                var dataObj=
                                {
                                    role:'Withdraw',
                                    amt:newAmt,
                                    user:user,
                                    oldBalance:balance,
                                    balance:newBalance,
                                    date:dateObj
                              
                                }
        
                                query = {'accountNo': accountNo},
                                update = {
                                    $set: {balance: newBalance},
                                    $push: {transaction: dataObj}
                                },
                              
                                fightingFundModel.findOneAndUpdate(query, update, options, function (err, data) {
                                    if (err) {
                                        res.json({
                                            isError:true,
                                            data:err})
                                    }
                                   else if (!data) {
                                        res.json({
                                            isError:true,
                                            data:err})
                                    }
                                    else{
                               
                                        res.json({
                                            success:true,
                                            data:data})
                                    }
                                    
                                });



                                      
                                    }
                                    
                                });


        
        
                 
                            }
                            else{
                                res.json({
                                    isError:true,
                                    data:'Transaction Failed'
                                })
                            }
                             
                        } else {
                            res.json({
                                isError:true,
                                data:"Invalid Transaction"
                            })
                            
                        }
                
                    } else {
                        res.json({
                            isError:true,
                            data:"Invalid Transaction"
                        })
                    }
                
                    
                } else {
                    res.json({
                        isError:true,
                        data:"Invalid Transaction"
                    })
                }
             
                
            }
            
        })
     

    }else{
        res.json({
            isError:true,
            data:'Unauthorised Access'
        })
    }



  }

 
};


module.exports= fightingFundController;