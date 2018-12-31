var mongoose =require( 'mongoose');
var uniqueValidator =require( 'mongoose-unique-validator');
var autoIncrement =require( "mongoose-auto-increment");

const adminSchema = new mongoose.Schema({
 
    phone_no: {
    type: Number,
    // index: true,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },



});



// adminSchema.plugin(uniqueValidator);
// adminSchema.plugin(autoIncrement.plugin, 'id');

module.exports= adminSchema;