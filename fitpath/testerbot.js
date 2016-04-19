var Botkit = require('../lib/Botkit.js');

var convoCount;


var controller = Botkit.slackbot({
    json_file_store: '../db/',
    debug: false
});

var bot = controller.spawn({
  token: 'xoxb-26193855205-jgOD0Xq7UlUWAWzeaTBUqa9t',
}).startRTM()

controller.hears('init', ['direct_message,', 'ambient'], function(bot, message) {
  bot.reply(message, 'init is heard');
  console.log(message);
});

controller.hears('convo', ['direct_message'], function(bot, message) {
	//setInterval(function() {
		bot.startPrivateConversation({user: message.user}, function(response, convo) {

		convo.ask('How have you been', function(response, convo) {
			convo.next();
		});
		
		convo.on('end', function(convo) {
			if (convo.status == 'timeout') {
				var res = convo.extractResponses();	
				console.log('timeout');
			}
		})
	});
	// }, 10000);
});