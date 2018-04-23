const mandrill = require('mandrill-api/mandrill');
const mandrill_client = new mandrill.Mandrill(process.env.MANDRILL_KEY);

module.exports = (subject, template_name, to, global_merge_vars) => {
	var message = {
		subject,
		from_email: "noreply@domain.com",
		from_name: "domain.com Team",
		to: [{
			email: to.email,
			name: to.name || to.email.split("@")[0],
			type: "to"
		}],
		global_merge_vars,
		// [
		// 	{
		// 		name: 'VAR1',
		// 		content: var1
		// 	},
		// 	{
		// 		name: 'VAR2',
		// 		content: var2,
		// 	}
		// ],
	};
	return new Promise((resolve, reject) => {
		mandrill_client.messages.sendTemplate({
			template_name,
			template_content: "",
			message,
		}, (result) => {
			resolve(result)
		}, (e) => {
			reject(e)
		});
	})
};
