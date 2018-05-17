const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'calvin.conceptz@gmail.com',
		pass: '32687377',
	},
});

module.exports = (to, subject, text) => {
	const from = 'Your Name <youremail@gmail.com>';
	const mailOptions = { from, to, subject, text };
	return new Promise((resolve, reject) => {
		transporter.sendMail(mailOptions, (error, info) => {
			if (error) {
				reject(error);
			} else {
				resolve(info);
			}
		});
	});
};
