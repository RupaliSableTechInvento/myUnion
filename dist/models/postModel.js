
var mongoose = require('mongoose');
var postSchema = require('./../schema/post');

const postModel = mongoose.model('post', postSchema);

module.exports = postModel;
//# sourceMappingURL=postModel.js.map