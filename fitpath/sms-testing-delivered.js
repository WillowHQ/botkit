var TwilioSMSBot = require('../lib/TwilioSMSBot');

var config = require('./env.js');

var controller = TwilioSMSBot({
  account_sid: 'ACf83693e222a7ade08080159c4871c9e3',
  auth_token: '20b36bd42a33cd249e0079a6a1e8e0dd',
  twilio_number: '+12045002519',
  server_url: config.serverIp + ':3000'
});

var bot = controller.spawn({
  debug: true
});

controller.setupWebserver(3000, function (err, webserver) {
  controller.createWebhookEndpoints(controller.webserver, bot, function () {
    console.log('TwilioSMSBot is online!');
  });
});

controller.hears('hi', 'message_received', function (bot, message) {
  bot.startConversation(message, function (err, convo) {
    convo.say('Hi!');
    convo.ask('What\'s your name?', function (response, convo) {
      convo.say(`Nice to meet you, ${response.text}!`);
      convo.next();
    });
  });
});

controller.hears('.*', 'message_received', function (bot, message) {
  bot.reply(message, 'huh?');
});
