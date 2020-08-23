const db = require('../database/mysqlDb');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodeMailer = require('nodemailer');
const aws = require('aws-sdk');
const path = require('path');
const Handlebars = require('handlebars');
const randomString = require('random-string');
const keys = require('../config/keys');

//importing configuration file
let configPath = path.join(__dirname, '../config/config.json');

//configure aws-sdk
aws.config.loadFromPath(configPath);

let register = async (req, res) => {
	console.log(req.body);

	const { username, email, password } = req.body;

	if (username && email && password) {
		try {
			sql = `select * from users where  email='${email}'`;

			const user = await db.queryAsync(sql);
			console.log('>>>>>>>>>>>>>>>>>>>>>>>>user');
			console.log(user);
			//check if user exist or not
			if (user.length > 0) {
				console.log('>>>>>>>>>>>>>>>>>>>>>> user already exist');
				res.status(401).send('Users already exist with given email!');
			} else {
				//encrypt password
				let saltRounds = 10;
				bcrypt.hash(password, saltRounds, async (err, hashPassword) => {
					if (err) throw err;

					try {
						let sql = `insert into users(username,email,password) values('${username}','${email}','${hashPassword}')`;

						const response = await db.queryAsync(sql);
						console.log('>>>>>>>>>>>>>>>>>>>>.resopnse');
						console.log(response.data);

						res.status(200).json({
							data: response,
							message: 'User registered successfully!',
						});
					} catch (error) {
						res.status(401).send('Sql Query Eror While Inserting the user!');
					}
				});
			}
		} catch (error) {
			res.status(401).send('Sql Query Error!');
		}
	} else {
		console.log('Fields are empty!!!');
		res.status(401).send('Fields are empty!!!');
	}
};

let login = async (req, res) => {
	const { email, password } = req.body;
	console.log(req.body);
	if (email && password) {
		let sql = `select * from users where email='${email}'`;

		try {
			const users = await db.queryAsync(sql);
			console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>Users');
			console.log(users);
			if (users.length > 0) {
				console.log('User exist!!!');

				bcrypt.compare(password, users[0].password, (err, isPasswordMatched) => {
					console.log(`check Password ${isPasswordMatched}`);

					if (isPasswordMatched) {
						console.log('>>>>>>>>>>>>>.');
						//create jwt token
						const auth_token = jwt.sign({ id: users[0].id }, keys.jwt.SECRET_TOKEN);

						console.log(auth_token);

						res.status(200).json({
							body: {
								token: auth_token,
							},
							message: 'User Login Successfully!',
						});
					} else {
						console.log('Password is incorrect');
						// throw('Password is incorrect')
						res.status(401).send('Password is incorrect!');
					}
				});
			} else {
				console.error('User does not exist!');
				res.status(401).send('User does not exist!');
			}
		} catch (error) {
			res.status(401).send('Sql Query Error');
		}
	} else {
		console.log('Input fields are empty!');
		res.status(401).send('Fields are empty');
	}
};

let sendEmailVerification = async (req, res) => {
	const { email } = req.body;
	console.log('Email Id ', email);
	try {
		//generate random string
		let token = randomString({ length: 15 });

		let sql = `update users set token='${token}' where email='${email}'`;

		//inserting token
		await db.queryAsync(sql);
		console.log(`Token updated :  ${token} `);
		//create node-mailer SES transporter
		let transporter = nodeMailer.createTransport({
			SES: new aws.SES({
				apiVersion: '2010-12-01',
			}),
		});

		//importing html template as js object
		let source = require('../templates/email-templates/email_verification.html').source;

		//compile the html template
		let template = Handlebars.compile(source);

		let data = {
			'MC:SUBJECT': 'TEST_SUBJECT',
			MC_PREVIEW_TEXT: 'TEST_PREVIEW_TEXT',
			ActivationCode: `http://localhost:3000/check_email_verification?email=${email}&token=${token}`,
			CURRENT_YEAR: '2020',
		};

		let resultedTemplate = template(data);

		// send some mail
		transporter.sendMail(
			{
				from: 'harshchaurasiya6768@gmail.com', //email should be verified on aws plateform
				to: email, //if you are in sand box then to email should also verified
				subject: 'Email Verification',
				html: resultedTemplate,
				ses: {
					// optional extra arguments for SendRawEmail
					// Tags: [{
					//     Name: 'tag name',
					//     Value: 'tag value'
					// }]
				},
			},
			(err, info) => {
				console.log(err, '========', info);
				// return res.send(info);
				if (err) return;
				res.status(200).json({
					message: 'Email sent successfully!',
					info,
				});
			}
		);
	} catch (error) {
		console.log('Error');
		console.log(error);
		res.status(401).send('Failed to send verification email');
	}
};

let isEmailVerified = async (req, res) => {
	const { token, email } = req.body;
	try {
		let sql = `select * from users where email="${email}"`;

		let users = await db.queryAsync(sql);
		console.log(users);
		if (users.length > 0 && users[0].token == token) {
			let sql = `update users set email_verified=1 where email="${email}"`;
			await db.queryAsync(sql);

			res.status(200).send({
				message: 'email verified successfully!',
				body: {
					email,
					token,
				},
			});
		} else {
			res.status(500).send({
				message: 'failed to verify email',
				body: {
					email,
					token,
				},
			});
		}
	} catch (error) {
		console.log('Inside error');
		console.log(error);
		res.status(500).send({
			error: error,
			message: 'Failed to verify the email',
		});
	}
};

module.exports = {
	register,
	login,
	sendEmailVerification,
	isEmailVerified,
};
