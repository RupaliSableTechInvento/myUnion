var mongoose =require( 'mongoose');
var fightingFoundSchema =require( './../schema/fightingFund');

const fightingFoundModel = mongoose.model('fightingFound', fightingFoundSchema);

module.exports= fightingFoundModel;