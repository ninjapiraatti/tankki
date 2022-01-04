var express = require('express');
var mqtt = require('mqtt');
var router = express.Router();
var url = require('url');

var mqtt_url = process.env.CLOUDMQTT_URL || 'mqtt://localhost:1883';
var topic = process.env.CLOUDMQTT_TOPIC || 'test';
var client = mqtt.connect(mqtt_url);

/* GET home page. */
router.get('/', function(req, res, next) {
	var config =  url.parse(mqtt_url);
	config.topic = topic;
	res.render('index', {
		connected: client.connected,
		config: config
	});
});

client.on('connect', function() {
  router.post('/publish', function(req, res) {
		//var formData = req.body
		const formData = JSON.parse(JSON.stringify(req.body));
		console.log(formData.turnleft)
		var data = JSON.stringify({
			date: new Date().toString(),
			msg: formData.msg,
			turnleft: formData.turnleft,
			turnright: formData.turnright,
			goforward: formData.goforward,
			gobackward: formData.gobackward,
			
			//msg: "tanklol"
		});
		/*
		var data = JSON.stringify({
			date: new Date().toString(),
			msg: req.body.msg,
			turnleft: req.body.turnleft,
			turnright: req.body.turnright,
			goforward: req.body.goforward,
			gobackward: req.body.gobackward,
			
			//msg: "tanklol"
		});
		*/
		console.log(data)
		client.publish(topic, data, function() {
			res.writeHead(204, { 'Connection': 'keep-alive' });
		res.end();
		});
	});

	router.get('/stream', function(req, res) {
		// send headers for event-stream connection
		// see spec for more information
		res.writeHead(200, {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			'Connection': 'keep-alive'
		});
		res.write('\n');

		// Timeout timer, send a comment line every 20 sec
		var timer = setInterval(function() {
			res.write('event: ping' + '\n\n');
		}, 20000);

		client.subscribe(topic, function() {
			client.on('message', function(topic, msg, pkt) {
				//res.write("New message\n");
				var json = JSON.parse(msg);
				var statcmessage = "tanklol too"
				if (json.values) {
					res.write("data: " + json.date + ": " + json.values[0] + "\n\n");
				} else {
					res.write("data: " + json.date + ": " + json.msg + "\n\n");
				}
			});
		});
	});
});

module.exports = router;
