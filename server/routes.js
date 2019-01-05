var usersController = require('./controller/usersController');
var authController = require('./controller/authController');
var fightingFundController = require('./controller/fightingFundController');
var adminController = require('./controller/adminController');
var companyController = require('./controller/companyController');
var departmentController = require('./controller/departmentController');
var electionController=require('./controller/electionController');
var path = require('path');
console.log("routes js called.. ");

const routes = (route) => {
  // route.get('*', (req, res) => {
  //   res.sendFile(path.resolve(__dirname + '/../dist/' + 'index.html'));
  // });
  // route.get('#/', (req, res) => {
  //   res.sendFile(path.resolve(__dirname + '/../dist/' + 'index.html'));
  // });

  route.get('#/', (req, res) => {
    res.sendFile(path.resolve(__dirname + '/../frontend/' + 'index.html'));
  });


  //Admin Route
  route.route('/adminLogin')
    .post(adminController.login);
  route.route('/adminRegister')
    .post(adminController.register);
  route.route('/setActiveUser')
    .post(adminController.setActiveUser);
  route.route('/deActivateUser')
    .post(adminController.deActivateUser);
  route.route('/registerUser')
    .post(adminController.registerUser);

      // Election API
  route.route('/createElection')
    .post(adminController.createElection);
    route.route('/getElection')
    .post(electionController.getElection);
    route.route('/updateElection')
    .post(electionController.updateElection);
    
  route.route('/addNotice')
    .post(adminController.addNotice);
  route.route('/candidateReq')
    .post(adminController.candidateReq)
  route.route('/approveCandidateReq')
    .post(adminController.approveCandidateReq)
// Approve Transaction
  route.route('/approveTransactionReq')
    .post(adminController.approveTransactionReq);

  // Authentication API

  route.route('/login')
    .post(authController.login);
  route.route('/signUp')
    .post(authController.register);
  route.route('/logout')
    .post(authController.logout);
  route.route('/isTokenValid')
    .post(authController.isTokenValid);


  // User API
  route.route('/getAllUserCount')
    .post(usersController.getAllCount)
  route.route('/forgotPassword')
    .post(usersController.forgotPassword)
  route.route('/getOne')
    .post(usersController.getOne)
    
  route.route('/getUserInfo')
    .post(usersController.getUserInfo)
  route.route('/getAllMessagesWithFriend')
    .get(usersController.getAllMessagesWithFriend)
  route.route('/uploadProfilePhoto')
    .post(usersController.uploadProfilePhoto)
  route.route('/users/changePassword')
    .post(usersController.changePassword);
  route.route('/addCandidate')
    .post(usersController.addCandidate);
  route.route('/addSupport')
    .post(usersController.addSupport)
  route.route('/unSupport')
    .post(usersController.unSupport)
  route.route('/EditUserProfile')
    .post(usersController.EditUserProfile)
    route.route('/addPost')
    .post(usersController.addPost)
    route.route('/getUserPost')
    .post(usersController.getUserPost)
    
    
  // Company API
  route.route('/addCompany')
    .post(companyController.addCompany);
  route.route('/getAllCompanyCount')
    .post(companyController.getAllCount)
  route.route('/getAllCompany')
    .get(companyController.getAllCompany)
  route.route('/getInactiveReffCode')
    .post(companyController.getInactiveReffCode)
  route.route('/generateReffCode')
    .post(companyController.generateReffCode)

  // Department API
  route.route('/addDept')
  .post(departmentController.addDept);
  route.route('/updateVoteCount')
  .post(departmentController.updateVoteCount)
  route.route('/getAllDeptCount')
  .post(departmentController.getAllCount)
  route.route('/getAllDept')
  .post(departmentController.getAllDept)

  // Fighting Fund API
  route.route('/createAccount')
    .post(fightingFundController.createAccount);
  route.route('/getBalance')
    .post(fightingFundController.getBalance);
  route.route('/DepositsTransaction')
    .post(fightingFundController.DepositsTransaction);
  route.route('/WithdrawalTransaction')
    .post(fightingFundController.WithdrawalTransaction);
};

module.exports = routes;