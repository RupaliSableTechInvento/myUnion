var mongoose =require( 'mongoose');
var userElectionSchema =require( './../schema/userElection');

const userElectionModel = mongoose.model('userElection', userElectionSchema);

module.exports= userElectionModel;