var Botkit = require('../lib/Botkit.js');
var express = require('express');
var app = express();

console.log(__dirname + '/bangfitnesspublic');
app.use('/', express.static(__dirname + '/bangfitnesspublic'));

app.listen(3001, function () {
  console.log('App listening on port 3001');
});

var controller = Botkit.facebookbot({
  access_token: 'EAAD0LsmI8VABAEcFZCXoCCZC6srqcInDD6c6eozD2XdZBu6DGu9slevF0bn91aLEiGW3tLZAJBfR2UKFMd8KSrGsxySOjZAK30T8gr34H9MoTbgCVMxLYYRJbPdKKbZBOxoezurLCnT6AJ8oQFz5ci5MASH2pAZBFhG5SHttkOleQZDZD',
  verify_token: 'FISH_TACOS'
});

var bot = controller.spawn({});

//controller.setupWebserver(3000, function (err, webserver) {
  controller.createWebhookEndpoints(app, bot, function () {
    console.log('Bot online');
    console.log('Free stuff pl0x');
  });
//});

controller.on('facebook_optin', function (bot, message) {
  var messageData = {
    text: "Hi, this is Omnapatopea. I'm a robot!\n\nI'm contacting you because you reached out to Bang Fitness.\n\nI'm not very good with most subjects (because of the whole robot thing) but I can help you get whatever information you need.\n\nAre you interested in:",
    quick_replies: [
      {
        content_type: "text",
        title: "Visiting BangFitness",
        payload: "VISITING_BANG_FITNESS"
      },
      {
        content_type: "text",
        title: "About our approach",
        payload: "LEARNING_MORE_ABOUT_OUR__APPROACH"
      },
      {
        content_type: "text",
        title: "Technique advice",
        payload: "GETTING_MORE_SPECIFIC_ADVICE_ON_EXERCISE_TECHNIQUE"
      },
      {
        content_type: "text",
        title: "Training programs",
        payload: "TRAINING_PROGRAM_DESIGN"
      },
      {
        content_type: "text",
        title: "Nutrition",
        payload: "NUTRITION"
      },
      {
        content_type: "text",
        title: "Something else",
        payload: "SOMETHING_ELSE"
      }
    ]
  };

  bot.reply(message, messageData);
});

controller.hears('Visiting BangFitness', 'message_received', function (bot, message) {
  bot.startConversation(message, function (err, convo) {
    var messageData = {
      text: "I can definitely help you with that. Are evenings or daytimes better for you?",
      quick_replies: [
        {
          content_type: "text",
          title: "Evenings",
          payload: "EVENINGS"
        },
        {
          content_type: "text",
          title: "Daytimes",
          payload: "DAYTIMES"
        }
      ]
    };

    convo.ask(messageData, function (response, convo) {
      messageData = {
        text: "Got it. Are you free tomorrow?",
        quick_replies: [
          {
            content_type: "text",
            title: "Yes",
            payload: "YES"
          },
          {
            content_type: "text",
            title: "No",
            payload: "NO"
          }
        ]
      };
      convo.ask(messageData, function (response, convo) {
        if (response.text == 'No') {
          convo.ask('What\'s another day that would work?', function (response, convo) {
            convo.ask('What time would be best?', function (response, convo) {
              convo.say('Ok, I\'ll ask someone from our team to get in contact via e-mail.');
              convo.next();
            });
            convo.next();
          });
        } else {
          convo.ask('What time would be best?', function (response, convo) {
            convo.say('Ok, I\'ll ask someone from our team to get in contact via e-mail.');
            convo.next();
          });
        }
        convo.next();
      });
      convo.next();
    });
    convo.next();
  });
});

controller.hears('About our approach', 'message_received', function (bot, message) {
  bot.startConversation(message, function (err, convo) {
    messageData = {
      text: "That would be our pleasure. Would you prefer a phone call or an e-mail?",
      quick_replies: [
        {
          content_type: "text",
          title: "Phone call",
          payload: "PHONE_CALL"
        },
        {
          content_type: "text",
          title: "E-mail",
          payload: "EMAIL"
        }
      ]
    };
    convo.ask(messageData, function (response, convo) {
      if (response.text == 'Phone call') {
        convo.ask('No problem. What\'s your number?', function (response, convo) {
          convo.ask('What\'s a good time to call?', function (response, convo) {
            convo.say('Sounds great. I\'m a robot so I don\'t feel feelings but our team is looking forward to speaking with you!');
          });
        });
      } else {
        convo.say('Sounds great. I\'m a robot so I don\'t feel feelings but our team is looking forward to speaking with you!');
      }
      convo.next();
    });
    convo.next();
  });
});

controller.hears(['Technique advice', 'Training programs', 'Nutrition'], 'message_received', function (bot, message) {
  bot.startConversation(message, function (err, convo) {
    convo.ask('That\'s one of our favourite things. What would you specifically like to learn about?', function (response, convo) {
      messageData = {
        text: "That would be our pleasure. Would you prefer a phone call or an e-mail?",
        quick_replies: [
          {
            content_type: "text",
            title: "Phone call",
            payload: "PHONE_CALL"
          },
          {
            content_type: "text",
            title: "E-mail",
            payload: "EMAIL"
          }
        ]
      };
      convo.ask(messageData, function (response, convo) {
        if (response.text == 'Phone call') {
          convo.ask('No problem. What\'s your number?', function (response, convo) {
            convo.ask('What\'s a good time to call?', function (response, convo) {
              convo.say('Sounds great. I\'m a robot so I don\'t feel feelings but our team is looking forward to speaking with you!');
              convo.next();
            });
            convo.next();
          });
        } else {
          convo.say('Sounds great. I\'m a robot so I don\'t feel things but our team is looking forward to speaking with you!');
        }
        convo.next();
      });
      convo.next();
    });
    convo.next();
  });
});

controller.hears('Something else', 'message_received', function (bot, message) {
  bot.startConversation(message, function (err, convo) {
      messageData = {
        text: "I\'ll ask on of our team members to get in touch with you. Would you prefer a phone call or an e-mail?",
        quick_replies: [
          {
            content_type: "text",
            title: "Phone call",
            payload: "PHONE_CALL"
          },
          {
            content_type: "text",
            title: "E-mail",
            payload: "EMAIL"
          }
        ]
      };
      convo.ask(messageData, function (response, convo) {
        if (response.text == 'Phone call') {
          convo.ask('No problem. What\'s your number?', function (response, convo) {
            convo.ask('What\'s a good time to call?', function (response, convo) {
              convo.say('Sounds great. I\'m a robot so I don\'t feel feelings but our team is looking forward to speaking with you!');
              convo.next();
            });
            convo.next();
          });
        } else {
          convo.say('Sounds great. I\'m a robot so I don\'t feel things but our team is looking forward to speaking with you!');
          convo.next();
        }
        convo.next();
      });
    convo.next();
  });
});
