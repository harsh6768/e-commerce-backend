const Router = require('express').Router();
const authController = require('../controllers/auth');

Router.route('/register').post(authController.register);
Router.route('/login').post(authController.login);
Router.route('/email_verification').post(authController.sendEmailVerification);
Router.route('/is_email_verify').post(authController.isEmailVerified);

module.exports = Router;
