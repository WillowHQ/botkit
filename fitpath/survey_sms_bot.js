var Botkit = require('../lib/Botkit.js');
var config = require('./env.js');
var request = require('request');

var ConvoObjects = [
  {
    userId: '5754345drt4654353',
    userMedium: 'sms',
    userContactInfo: {name: 'Josh', phoneNumber: '+15064261732'},
    questions: [
      'Do you like pancakes?',
      'Do you like waffles?',
      'Do you like french toast?'
    ],
    surveyId: '35435436afaf',
    type: 'survey'
  },
  {
    userId: '3456ytrafda',
    userMedium: 'sms',
    userContactInfo: {name: 'Bob', phoneNumber: '+15064261732'},
    questions: [
      'Do you like pancakes?',
      'Do you like waffles?',
      'Do you like french toast?'
    ],
    surveyId: '32432534642',
    type: 'survey'
  },
  {
    userId: '34q4wq4',
    userMedium: 'sms',
    userContactInfo: {name: 'George', phoneNumber: '+15064706220'},
    questions: [
      'Do you like pancakes?',
      'Do you like waffles?',
      'Do you like french toast?'
    ],
    surveyId: '23432423',
    type: 'survey'
  }
];

console.log(config.phoneNumber);

var controller = Botkit.twiliosmsbot({
  account_sid: 'ACf83693e222a7ade08080159c4871c9e3',
  auth_token: '20b36bd42a33cd249e0079a6a1e8e0dd',
  twilio_number: config.phoneNumber
});

var bot = controller.spawn({});

controller.setupWebserver(3000, function (err, webserver) {
  controller.createWebhookEndpoints(controller.webserver, bot, function () {
    console.log('TwilioSMSBot is online!');
  });
});

// bot.startConversation({channel: '+15064706220', user: '+15064706220', text: ''}, function (err, convo) {
//     convo.say('Hello!');
//     convo.ask('What is your name?', function (res, convo) {
//       convo.say(`Nice to meet you, ${res.text}!`);
//       console.log(res.text);
//       convo.next();
//     });
// });

controller.hears('.*', 'message_received', function (bot, message) {
  bot.reply(message, 'Sorry, my programmer was too lazy to come up with a response for that.');
});


module.exports.receiveConvo = function (convoObject) {
  var _this = this;
  console.log('received convo');
  console.log('73: ' + JSON.stringify(convoObject));
  bot.startPrivateConversation({user: convoObject.userContactInfo.phoneNumber, text: ''}, function (err, convo) {
    if (convoObject.type == 'survey') {
      convo.say('Hi! Here\'s a survey your coach wanted me to send you.');
      setTimeout(function () {
        console.log('in timeout callback');
        _this.startSurvey(err, convo, convoObject);
      }, 2000);
    } else {
      console.log('120: ' + JSON.stringify(convoObject));
      // Must be a reminder
      (function (convoObject) {
        convo.ask(convoObject.questions[0], function (res, convo) {
          console.log('123: ' + res.text);
          console.log('124: ' + JSON.stringify(convoObject));
          var response = {};
          response.type = 'reminder';
          response.assignment = convoObject.assignmentId;
          response.userId = convoObject.userId;
          response.reminderId = convoObject.reminderId;
          response.questions = [];
          response.questions[0] = {};
          response.questions[0].header = convoObject.questions[0];
          response.questions[0].question = convoObject.questions[0];
          response.questions[0].type = 'WRITTEN',
          response.questions[0].answer = res.text;
          console.log('136: ' + JSON.stringify(response));
          request.post({url: 'http://' + config.serverIp + ':12557/api/response/create', json: true, body: response}, function (err, response, body) {
            console.log('138: ' + JSON.stringify(body));
          });
        });
      }(convoObject));
    }
  });
};

module.exports.startSurvey = function (err, convo, convoObject) {
  var _this = this;
  for (var i = 0; i < convoObject.questions.length; i++) {
    console.log('82: ' + convoObject.questions[i]);
      convo.ask(convoObject.questions[i], function (res, convo) {
        console.log(res.text);
        setTimeout(function () {
          convo.next();
        }, 1000);
      });
  }
  setTimeout(function () {
    _this.endSurvey(err, convo, convoObject);
  }, 1000);
};

module.exports.endSurvey = function (err, convo, convoObject) {
  convo.say('Thanks for answering my questions. Enjoy the rest of your day ' + String.fromCodePoint(128578));
  convo.on('end', function (convo) {
    if (convo.status == 'completed') {
      console.log();
      console.log('ended');
      console.log();
      var responses = convo.extractResponses();
      console.log('Responses: ' + responses);

      var responseArray = [];
      // In order to send responses back as an array in the right order, loop through questions array
      var response = {};
      response.assignment = convoObject.assignmentId;
      response.userId = convoObject.userId;
      response.type = 'survey';
      response.surveyTemplateId = convoObject.surveyId;
      response.questions = [];
      for (var i = 0; i < convoObject.questions.length; i++) {
        var question = convoObject.questions[i].question;
        console.log('Question: ' + question);
        // Responses are indexed by the question as a key
        console.log('Response: ' + response);
        // Push the response onto the responseArray
        //responseArray.push(response);
        response.questions[i] = convoObject.questions[i];
        response.questions[i].answer = responses[question];
      }
      // request.post({url: 'http://' + config.serverIp + ':12557/api/response/create', json: true, body: response}, function (err, response, body) {
      //   console.log(err);
      //   console.log(response);
      //   console.log(body);
      // });
    }
  });
};

//for (var i = 0; i < ConvoObjects.length; i++) {
//  var ConvoObject = ConvoObjects[i];
  module.exports.receiveConvo(ConvoObjects[0]);
//}
