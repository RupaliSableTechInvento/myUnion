var mongoose =require( 'mongoose');
var uniqueValidator =require( 'mongoose-unique-validator');
var autoIncrement =require( "mongoose-auto-increment");

const usersElectionSchema = new mongoose.Schema({
  election_name:{
    type: String,
    required: true
  },
  full_name: {
    type: String,
    required: true

  },
  phone_no: {
    type: String,
    required: true
  },
  empID: {
    type: String,
    required: true
  },
  user_id:{
    type: String,
    required: true
  },
  company_name:{
    type: String,
    required: true
  },
  department_name:{
    type: String,
    required: true
  },
  status:{
    type:String,
    default:'No Post'
  },
  termsAndConditionsAgreed : {
    type: Boolean,
    required: true
  },
  isApprove: {
    type: Boolean,
    default: false,
  },
  imageUrl: {
    type: String,
    default:null
    // default: "../../assets/app/media/img/users/userProfileNew.png"
  },
  formSubmitted: {
    type: Date,
    default: new Date(),
  },



});


usersElectionSchema.index({ election_name: 1, user_id: 1}, { unique: true });
usersElectionSchema.plugin(uniqueValidator);
// usersSchema.plugin(autoIncrement.plugin, 'id');

module.exports= usersElectionSchema;