var mongoose =require( 'mongoose');
var postTradeSchema =require( './../schema/trade');

const tradeModel = mongoose.model('trade', postTradeSchema);

module.exports= tradeModel;
