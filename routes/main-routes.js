const Router=require('express').Router();
const authController=require('../controllers/auth');


Router.route('/register').post(authController.register);
Router.route('/login').post(authController.login);


module.exports=Router;