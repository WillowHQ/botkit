var Botkit = require('../lib/Botkit.js');
var request = require('request');

var controller = Botkit.facebookbot({
  access_token: 'EAADXmpOGmZBQBABDURo1rKzdgIk9A7lm34zK6WzZAhoC2nqs4Oc0ZBZAniwdzjyZCX4ZAnF1xBon0nMEZByQhfwQRS43LFmL1B5BZC1ER7B0sbFVhg3ZA062926erguLxYOaWPRQoKQHfEY13LFF8NL90cDWFSVVTZABwWnaQuSkQ9eAZDZD',
  verify_token: 'FISH_TACOS'
});

var bot = controller.spawn({});

controller.setupWebserver(3000, function(err,webserver) {
  controller.createWebhookEndpoints(controller.webserver, bot, function() {
    console.log('This bot is online!!!');
  });
});

controller.on('facebook_optin', function (bot, message) {
  console.log('facebook_optin');
  console.log(message);
  bot.startConversation(message, function (err, convo) {
    convo.say('Congrats, you\'re here.');

    var messageData = {
      text: "Tell us why?",
      quick_replies: [
        {
          content_type: "text",
          title: "Lose weight",
          payload: "LOSE_WEIGHT"
        },
        {
          content_type: "text",
          title: "More energy",
          payload: "MORE_ENERGY"
        },
        {
          content_type: "text",
          title: "Less stress",
          payload: "LESS_STRESS"
        },
        {
          content_type: "text",
          title: "Everything!",
          payload: "EVERYTHING"
        }
      ]
    };

    convo.ask(messageData, function (response, convo) {
      var messageData = {
        text: "What do you want to do?",
        quick_replies: [
          {
            content_type: "text",
            title: "Eat less junk",
            payload: "LESS_JUNK"
          },
          {
            content_type: "text",
            title: "Start meditating",
            payload: "START_MEDITATING"
          },
        ]
      };

      convo.ask(messageData, function (response, convo) {
        var messageData = {
          text: "What\'s your next step?",
          quick_replies: [
            {
              content_type: "text",
              title: "Eat less chips",
              payload: "LESS_CHIPS"
            },
            {
              content_type: "text",
              title: "Meditate 5 minutes",
              payload: "MEDITATE_MINUTES"
            },
          ]
        };

        convo.ask(messageData, function (response, convo) {
          convo.say('Thanks for answering our questions! We\'ll be in touch shortly.');
          var profileOptionsObject = convo.extractResponses();

          var profileOptions = [];

          for (var key in profileOptionsObject) {
            profileOptions.push(profileOptionsObject[key]);
          }

          console.log(profileOptions);

          var user = {
            role: 'user',
            // Generate a random phoneNumber
            phoneNumber: (Math.random() + 1).toString(36).substring(12),
            profileOptions: profileOptions
          };

          request.post({url: 'http://159.203.61.15:12557/api/user/create', body: user, json: true}, function (error, response, body) {
            if (!error && response.statusCode == 200) {
              console.log('Success');
            } else {
              console.log(error);
            }
          });

          convo.next();
        });

        convo.next();
      });

      convo.next();
    });
  });
});
