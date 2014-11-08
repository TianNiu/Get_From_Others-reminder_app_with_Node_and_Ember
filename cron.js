var accountSid = 'YOUR_ACCOUNT_SID',
	authToken = 'YOUR_AUTH_TOKEN',
	client = require('twilio')(accountSid, authToken);

module.exports = function (Reminder) {

	function checkReminders () {
		Reminder.find({ 'end': { $lt: Date.now() } }, function (err, reminders) {
			if (err) {
				console.log(err);
				return;
			}

			for (var i = reminders.length - 1; i >= 0; i--) {
				var reminder = reminders[i];
				if (!reminder.isCompleted) {
					reminder.isCompleted = true
					reminder.save();
					
					client.sms.messages.create({
						body: reminder.title,
						to: 'YOUR_NUMBER',
						from: 'YOUR_TWILIO_NUMBER'
					}, function(err, message) {
						if (err) {
							console.log(err);
							return;
						}
					});
				}
			}
		});
	}

	setInterval(checkReminders, 60000);
	checkReminders();
};