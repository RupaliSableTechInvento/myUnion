var express =require('express');
var env =require('./env');
var routes =require('./routes');
var database=require('./database/db')
var bodyParser =require('body-parser');
var authenticated =require( './middlewares/authenticated');
var async =require( 'async');
const app = express();
var cors=require('cors')

var path = require('path');

app.use(cors())
app.use(bodyParser.json())
// app.use(express.static(path.join(__dirname,'../dist')))
app.use(express.static(path.join(__dirname,'../frontend')))



var server = require('http').createServer(app);
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(express.static('client'))
app.use(function (req, res, next) {

  // Website you wish to allow to connect


  var allowedOrigins = ['http://192.168.0.107:4200','http://192.168.0.10:4200','http://localhost:4200'];
  var origin = req.headers.origin;
  console.log("Request orign==>",origin);

  if(allowedOrigins.indexOf(origin) > -1){
    console.log("allow orign true==>",origin);
    
       res.setHeader('Access-Control-Allow-Origin', origin);
  }
  // res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  // res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');


  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});
// app.use('/users', authenticated);
// app.use('/users/*', authenticated);
routes(app);
// require('./controller/messagesController')(app, io);
server.listen(env.Api_port, () => {
  console.log(`Api listening on port ${env.Api_port}!`);
});