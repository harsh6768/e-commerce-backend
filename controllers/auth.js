const db = require('../database/mysqlDb');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const keys = require('../config/keys');

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

let sendEmailVerification=async(req,res)=>{

}
module.exports = {
	register,
	login,
	sendEmailVerification
};
