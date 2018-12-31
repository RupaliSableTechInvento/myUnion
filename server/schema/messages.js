var mongoose =require( 'mongoose');
var uniqueValidator =require( 'mongoose-unique-validator');
var autoIncrement =require( "mongoose-auto-increment");

const messages = new mongoose.Schema({
  message: {
    type: String,
  },
  sender: {
    type: String,
  },
  senderName: {
    type: String,
  },

  reciever: {
    type: String,
  },
  date: {
    type: Date,
  },
  isRead: {
    type: Boolean,
  }
});


messages.plugin(uniqueValidator);
module.exports= messages;