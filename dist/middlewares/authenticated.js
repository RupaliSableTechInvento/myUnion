var jwt = require('jsonwebtoken');
var env = require("../env");
var tokenModel = require('./../models/tokenModel');
const authenticated = (req, res, next) => {
  // console.log("req.headers", req.headers)
  const token = req.headers['authorization'];
  var today = new Date();
  tokenModel.findOne({
    $and: [{
      'token': token
    }, {
      'isActive': 'active'
    }, {
      expiry: {
        $gt: today
      }
    }]
  }, (err, user) => {
    if (err) {
      res.json({
        isError: true,
        data: err
      });
    } else {
      if (user != null) {
        // console.log("-------------",user);
        jwt.verify(token, env.App_key, (err, decode) => {
          if (err) {
            res.json({
              isError: true,
              data: err
            });
          } else {
            next();
          }
        });
      } else {
        res.json({
          isError: true,
          data: "Middle Order Login Again"
        });
      }
    }
  });
};

module.exports = authenticated;
//# sourceMappingURL=authenticated.js.map