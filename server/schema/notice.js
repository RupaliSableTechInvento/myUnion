var mongoose =require( 'mongoose');
var uniqueValidator =require( 'mongoose-unique-validator')

const noticeSchema = new mongoose.Schema({
  notice: {
    type: String,
    required:true
  },
  created: {
    type: Date,
    default:new Date()
  },
  publishOn:{
      type:Date,
      required:true
  }

});


noticeSchema.plugin(uniqueValidator);
// noticeSchema.plugin(autoIncrement.plugin, 'id'); 

module.exports= noticeSchema;