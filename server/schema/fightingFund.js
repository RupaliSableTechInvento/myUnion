var mongoose =require( 'mongoose');
var uniqueValidator =require( 'mongoose-unique-validator');
var autoIncrement =require( "mongoose-auto-increment");

const fightingFound = new mongoose.Schema({
 
  accountNo: {
    type: String,
    // index: true,
    unique: true,
    required: true
  },
  company_name:{
    type:String,
    required:true
  },
  user:{
    type:Array,
  },
  phone_no:{
      type:String,
      required:true
  },
  password:{
    type:String,
    required:true
  },
  transaction: {
    type: Array,
    default:null
  },
  isTransaction:{
    type:Boolean,
    default:false
  },
  balance:{
      type:Number,
      default:0
  }



});

fightingFound.index({ accountNo: 1, company_name: 1}, { unique: true });


// adminSchema.plugin(uniqueValidator);
// adminSchema.plugin(autoIncrement.plugin, 'id');

module.exports= fightingFound;