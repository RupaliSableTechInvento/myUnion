var companyModel =require( '../models/companyModel')
var adminModel=require( '../models/adminModel')
var jwt =require( 'jsonwebtoken');
var env =require( "../env");
var mongoose = require('mongoose');
var encode = require('hashcode').hashCode;

var randomstring = require("randomstring");


function generateStrings(numberOfStrings, stringLength,callback) {
    const s = new Set()
    while (s.size < numberOfStrings) {
      s.add(randomstring.generate(stringLength))
    }  
    callback(null, s)
} 
const companyController = {
   
     addCompany: (req, res, next) => {
        console.log("Company  register", req.body)
         var token1=  req.body.authorization;
        var decoded = jwt.verify(token1, env.App_key);
        console.log("decoded reqest from==>", decoded.role)
    
        if (decoded.role=='admin') {      
            var numberOfStrings=parseInt(req.body.numberOfStrings)
            var stringLength =  parseInt(6)
            var obj={};
            var dataobj={
                
            }
              generateStrings(numberOfStrings, stringLength,function(err,data){
             if(err){
                 console.log("Error==>",err);
     
               res.send({success: false,data: err});
             }else{
                 var refference_code=[];
                //  console.log("No Error==>",data);       
                 for (const value of data.values()) {
                     console.log(value)
                      obj = {code: value ,
                        isactive:false};
                    //  console.log("object ==>",obj);
                     
                refference_code.push(obj)
                 }

                 if ( refference_code.length==numberOfStrings) {
                     console.log("company Data==>",refference_code);
                     dataobj.refference_code=refference_code;
                     dataobj.company_name=req.body.company_name;
                     let company = new companyModel(dataobj);

                     company.save(dataobj,function (err,company) {
                         if (err) {
                            res.send({success: false,data: err});
                         } else {
                            res.send({success: true,data: company});
                         }
                         
                     })

                    // companyModel.save(dataobj, function(err, company) {
                    //     if (err) return res.json(err);
                    //    res.send({success: true,data: company});
                    // })
                     
                 }
                //  res.send({success: true,data: data});
                  
                 
                     
             }
         })
        
        } else {
          res.json("Unauthorized access");
        }
      },
      getAllCount:(req,res,next)=>{
          companyModel.count(function (err,company) {
              if (err) {
                  res.json({
                      isError:true,
                      data:err
                  })
                  
              }
              else{
                  console.log("company count ==>",company);
                  
                res.json({
                    success:true,
                    data:company
                })
              }
              
          })
      },
      generateReffCode:(req,res,next)=>{
      var token1=  req.body.authorization;
        var decoded = jwt.verify(token1, env.App_key);
        console.log("decoded reqest from==>", decoded.role)

        if (decoded.role=='admin') { 
           var company_name=req.body.company_name;
           var numberOfStrings=parseInt(req.body.numberOfStrings)
           var stringLength =  parseInt(6)
           var obj={};
           var dataobj={};
           var count=0;
            companyModel.findOne({company_name:company_name},function (err,company) {
                
                if (err) {
                    res.json({
                        isError:true,
                        data:err
                    })
                    
                } else {
                    console.log("company==>",company);
                    
                    
                    generateStrings(numberOfStrings, stringLength,function(err,data){
                        if(err){
                            console.log("Error==>",err);
                
                          res.send({success: false,data: err});
                        }else{
                                  
                             for (const value of data.values()) {
                                 count++;
                                 console.log(value)
                                  obj = {code: value ,
                                    isactive:false};
                                //  console.log("object ==>",obj);
                                 
                                company.refference_code.push(obj)
                             }
            
                             if ( count===numberOfStrings) {
                                 console.log("company Data==>",company);
                                //  dataobj.refference_code=company.refference_code;
                                //  let company = new companyModel(dataobj);
            
                                 company.save(function (err,company) {
                                     if (err) {
                                        res.send({success: false,data: err});
                                     } else {
                                        res.send({success: true,data: company});
                                     }
                                     
                                 })
                            }
                        }
                        })


                }

            })



        }
        else{
            res.json("Unauthorized access");
        }


      },
      getInactiveReffCode:(req,res,next)=>{
        var token1=  req.body.authorization;
        var decoded = jwt.verify(token1, env.App_key);
        console.log("decoded reqest from==>", decoded.role)
        var company_name=req.body.company_name;
    
        if (decoded.role=='admin') { 
            companyModel.find({
                $and:[
                    {company_name:company_name},
                    {"refference_code": {$elemMatch: {"isactive" : false} } }
                ]
            }
                ,{"refference_code": 1,_id:0},function (err,company) {
                if (err) {
                    res.json({
                        isError:true,
                        data:err
                    })
                    
                }
                else{
                    console.log("getInactiveReffCode ==>",company);
                    if (company.length>0) {
                        var refferenceArray=company[0].refference_code
                        var refference_code=[];
                        //  console.log("No Error==>",data);   
                        var itemsProcessed = 0;
                        refferenceArray.forEach((item, index, array) => {
                            console.log("Element==>",item);
                            
                                itemsProcessed++;
                                if (!item.isactive) {
                                    console.log("item is not active==>",item);
                                    refference_code.push(item.code)
                                }
                                if(itemsProcessed === array.length) {
                                    res.json({
                                        success:true,
                                        data:refference_code
                                    })
                                }
       

                    });
                     
                            
                        
                    } else {
                        res.json({
                            success:true,
                            data:company
                        })
                    }
                    
                
                }
                
            })


        }
        else{
            res.json("Unauthorized access");
        }

    
    }
      
};


// var token1=  req.body.authorization;
// var decoded = jwt.verify(token1, env.App_key);
// console.log("decoded reqest from==>", decoded.role)

// if (decoded.role=='admin') { }
// else{
//     res.json("Unauthorized access");
// }



module.exports= companyController;