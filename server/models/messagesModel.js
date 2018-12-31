var mongoose =require( 'mongoose');
var messagesSchema =require( './../schema/messages');

const messagesModel = mongoose.model('messages', messagesSchema);
module.exports= messagesModel;