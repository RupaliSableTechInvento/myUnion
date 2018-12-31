var mongoose =require( 'mongoose');
var companySchema =require( '../schema/company');

const companyModel = mongoose.model('company',companySchema);
module.exports= companyModel;