var mongoose =require( 'mongoose');
var adminSchema =require( './../schema/admin');

const adminModel = mongoose.model('admin', adminSchema);

module.exports= adminModel;