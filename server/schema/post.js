var mongoose =require( 'mongoose');
var uniqueValidator =require( 'mongoose-unique-validator')
var autoIncrement =require( "mongoose-auto-increment");

const postSchema = new mongoose.Schema({
  post: {
    type: String,
  },
  imageUrlsArr :{
      type:Array
  }, 
  createdAT:{
      type:Date,
     default: new Date()
  },
  createdBy:{
        type:Object
  }
 

});


postSchema.plugin(uniqueValidator);


module.exports= postSchema;