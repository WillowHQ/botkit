var Botkit = require('../lib/Botkit.js');
var express = require('express');
var morgan = require('morgan');
var app = express();

app.use(morgan('dev'));

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

function create_user_if_new (id, ts) {
  controller.storage.users.get(id, function (err, user) {
    if (err) {
      console.log(err);
    } else if (!user) {
      controller.storage.users.save({id: id, created_at: ts});
    }
  });
}

function handleFacebook (obj) {
  controller.debug('GOT A MESSAGE HOOK');
  if (obj.entry) {
    for (var e = 0; e < obj.entry.length; e++) {
      for (var m = 0; m < obj.entry[e].messaging.length; m++) {
        var facebook_message = obj.entry[e].messaging[m];

        console.log(facebook_message)

        //normal message
        if (facebook_message.message) {

          var message = {
              text: facebook_message.message.text,
              user: facebook_message.sender.id,
              channel: facebook_message.sender.id,
              timestamp: facebook_message.timestamp,
              seq: facebook_message.message.seq,
              mid: facebook_message.message.mid,
              attachments: facebook_message.message.attachments,
          }

          //save if user comes from m.me adress or Facebook search
          create_user_if_new(facebook_message.sender.id, facebook_message.timestamp)

          controller.receiveMessage(bot, message);
        }
        //clicks on a postback action in an attachment
        else if (facebook_message.postback) {

          // trigger BOTH a facebook_postback event
          // and a normal message received event.
          // this allows developers to receive postbacks as part of a conversation.
          var message = {
              payload: facebook_message.postback.payload,
              user: facebook_message.sender.id,
              channel: facebook_message.sender.id,
              timestamp: facebook_message.timestamp,
          };

          controller.trigger('facebook_postback', [bot, message]);

          var message = {
              text: facebook_message.postback.payload,
              user: facebook_message.sender.id,
              channel: facebook_message.sender.id,
              timestamp: facebook_message.timestamp,
          };

          controller.receiveMessage(bot, message);

        }
        //When a user clicks on "Send to Messenger"
        else if (facebook_message.optin) {

          var message = {
              optin: facebook_message.optin,
              user: facebook_message.sender.id,
              channel: facebook_message.sender.id,
              timestamp: facebook_message.timestamp,
          };

          //save if user comes from "Send to Messenger"
          create_user_if_new(facebook_message.sender.id, facebook_message.timestamp)

          controller.trigger('facebook_optin', [bot, message]);
        }
        //message delivered callback
        else if (facebook_message.delivery) {

          var message = {
              optin: facebook_message.delivery,
              user: facebook_message.sender.id,
              channel: facebook_message.sender.id,
              timestamp: facebook_message.timestamp,
          };

          controller.trigger('message_delivered', [bot, message]);

        }
        else {
          controller.log('Got an unexpected message from Facebook: ', facebook_message);
        }
      }
    }
  }
}

app.get('/webhook', function (req, res) {
  if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === 'FISH_TACOS') {
    res.send(req.query['hub.challenge']);
  } else {
    res.send('Incorrect verify token');
  }
});

app.post('/webhook', function (req, res) {
  //handleFacebook(req.body);

  res.send('Ok');
});

//controller.setupWebserver(3000, function (err, webserver) {
  // controller.createWebhookEndpoints(app, bot, function () {
  //   console.log('Bot online');
  //   console.log('Free stuff pl0x');
  // });
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
