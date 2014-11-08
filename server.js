// set up ======================================================================
// get all the tools we need
var express  = require('express'),
	moment   = require('moment'), 
	app      = express(),
	port     = process.env.PORT || 8000,
	mongoose = require('mongoose');

var configDB = require('./config/database.js');

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

app.configure(function() {
	app.engine('html', require('ejs').renderFile);
	app.use(express.bodyParser());
	app.use(require('express-promise')()); //setup inline promises
	app.use(express.static(process.cwd() + '/public'));
});

//models =======================================================================
var reminderSchema = mongoose.Schema({
    title: String,
    isCompleted: Boolean,
    end: { type: Date, default: moment().add('hours', 1).toDate() }
});

var Reminder = mongoose.model('Reminder', reminderSchema);

// routes ======================================================================
app.get('/', function(req, res) {
	res.render('index.html');
});

app.get('/timers', function (req, res) {
	res.json({
		timers: Reminder.find().select('-__v')
	});
});

app.post('/timers', function (req, res) {
	var reminder = new Reminder();

	reminder.title = req.body.timer.title;
	reminder.end = new Date(req.body.timer.end);

	reminder.save();
	res.json({"timer": reminder });
});

app.put('/timers/:id', function (req, res) {
	Reminder.findById(req.params.id, function (err, record) {
		record.title = req.body.timer.title;
		record.isCompleted = req.body.timer.isCompleted;
		record.end = req.body.timer.end;
		record.save();

		res.json({"timer": record });
	});
});

app.delete('/timers/:id', function (req, res) {
	Reminder.findByIdAndRemove(req.params.id, function (err) {
		if (err) console.log('Error deleting', err);
	});
});

// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);

// 'cron' ======================================================================
require('./cron.js')(Reminder);
