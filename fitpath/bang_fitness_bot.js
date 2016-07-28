var Botkit = require('../lib/Botkit.js');
var moment = require('moment');
var _ = require('underscore');
var request = require('request');
var db = require('../lib/storage/simple_storage.js');

var controller = Botkit.slackbot({
  json_file_store: '../db/',
  debug: false
  //include "log: false" to disable logging
  //or a "logLevel" integer from 0 to 7 to adjust logging verbosity
});

// connect the bot to a stream of messages
var bot = controller.spawn({
  token: 'xoxb-37920661316-Umfkqk2AxA5glTiQS4vMqNdT',//josh_bot token
  json_file_store: '../db/'
}).startRTM()





module.exports.receiveConvo = function(convo){


  console.log('received Convo');
  console.log(JSON.stringify(convo));
  //, channel:'C0NGETH71'


  var ask1 = function(response, convo){

      convo.say("Hi, this is Omnapatopea. I'm a robot!");
      convo.say("I'm contacting you because you reached out to Bang Fitness.");
      convo.say("I’m not very good with most subjects (because of the whole robot thing) but I can help you get whatever information you need.");
      convo.ask("-1 Visiting Bang Fitness \n-2 Learning more about our approach \n-3 Getting some specific advice on exercise technique \n-4 Training program design \n-5 Nutrition \n-6 Something else?", function(response, convo) {

        convo.say("Awesome.");
        console.log("ask2 start here");

        if(response){
          console.log("dasd");
        }

        //
        // convo.next();
        // console.log("after next");
        //
        // ask2(response, convo);

      });

      // }else{
    //   convo.say("Bye");
    //   closeSurvey(response,convo);
    //   convo.next();
    // }
  }





























  var ask2 = function(response, convo){
    console.log("ask2");
    if(convo.convoObject.questions[1]){
      console.log("past if");

      convo.ask(convo.convoObject.questions[1].question, function(response, convo) {

        convo.say("Awesome.");
        ask3(response, convo);
        convo.next();
      });

    }else{
      convo.say("Bye");
      closeSurvey(response,convo);
      convo.next();
    }

  }

  var ask3 = function(response, convo){
    console.log("ask3");
    if(convo.convoObject.questions[2]){
      console.log("past if");

      convo.ask(convo.convoObject.questions[2].question, function(response, convo) {

        convo.say("Awesome.");
        ask4(response, convo);
        convo.next();
      });

    }else{
      convo.say("Bye");
      closeSurvey(response,convo);
      convo.next();
    }
  }

  var ask4 = function (response, convo) {
    console.log("ask4");
    if(convo.convoObject.questions[3]){
      console.log("past if");

      convo.ask(convo.convoObject.questions[3].question, function(response, convo) {

        convo.say("Awesome.");
        ask5(response, convo);
        convo.next();
      });

    }else{
      convo.say("Bye");
      closeSurvey(response,convo);
      convo.next();
    }

  }
  var ask5 = function(response, convo){
    console.log("ask5");
    if(convo.convoObject.questions[4]){
      console.log("past if");

      convo.ask(convo.convoObject.questions[4].question, function(response, convo) {

        convo.say("Awesome.");
        convo.say("Bye");
        closeSurvey(response,convo);
        convo.next();
      });

    }else{
      convo.say("Bye");
      closeSurvey(response,convo);
      convo.next();
    }

  }

  closeSurvey = function(response, convo) {
    convo.on('end',function(convo) {

      if (convo.status=='completed') {
        // do something useful with the users responses
        var res = convo.extractResponses();
        console.log(res);

        //ok now format the responses
        sendResponses(res, convo.convoObject.userContactInfo.slack_Id);
        submitResponse(res, convo);

        // reference a specific response by key
        //var value  = convo.extractResponse('key');

        // ... do more stuff...

      } else {
        // something happened that caused the conversation to stop prematurely
      }

    });

  }



  submitResponse = function(res, convo) {
    var response = {};
    response.assignment = convo.convoObject.assignmentId;
    response.userId = convo.convoObject.userId;
    response.timeStamp = Date.now();
    // if(typeof convo.convoObject.surveyTemplateId !== 'undefined' && variable !== null){
    //   response.surveyTemplateId = convo.convoObject.surveyId;}
    // else if(typeof convo.convoObject.reminderId !== 'undefined' && variable !== null) {response.reminderId = convo.convoObject.surveyId;}
    //
    if(convo.convoObject.type && convo.convoObject.type === 'survey'){
        console.log('server');
        console.log(convo.convoObject.surveyId);
        response.surveyTemplateId = convo.convoObject.surveyId;
    }
    else if (convo.convoObject.type && convo.convoObject.type === 'reminder'){
      console.log('server');
      console.log(convo.convoObject.reminderId);
      response.reminderId = convo.convoObject.reminderId;
    }



    response.questions = [];
    for (var i = 0; i < convo.convoObject.questions.length; i++) {
      var question = convo.convoObject.questions[i].question;
      console.log('Question: ' + question);
      // Responses are indexed by the question as a key
      console.log('Response: ' + response);
      // Push the response onto the responseArray
      //responseArray.push(response);
      response.questions[i] = convo.convoObject.questions[i];
      response.questions[i].answer = res[question];
      console.log(response.questions[i].answer);
    }

    request.post({url: 'http://' + config.serverIp + ':12557/api/response/create', json: true, body: response}, function (err, response, body) {
      console.log(err);
      console.log(response.questions);
      console.log(body);
    });

  }

  function sendResponses(response, id){
    var responses = surveyResponseToString(response);
    console.log('sned Responses');
    var attachments = {
      'username': 'survey',
      'channel': 'C0NGETH71',
      'attachments': [
        {
          'text': responses,
          'color': '#81C784',
          'title': '<@' + id + '>' + ' has completed their weekly survey!',
          'fallback': '<@' + id + '>' + ' has completed their weekly survey!',
          'mrkdwn_in' : [
            'text',
            'title',
            'fallback'
          ]
        }
      ],
      'icon_url': 'https://i.imgsafe.org/1b33b2f.png'
    }
    console.log(attachments);
    bot.say(attachments);
  }

  function surveyResponseToString(surveyObj) {

    var result = _.reduce(surveyObj, function(output, item, key, surveyObj) {
      if (key === Object.keys(surveyObj)[1]) {
       output = "*" + Object.keys(surveyObj)[0] + "*: " + output + "\n";
      }
      return output + "*" + key + "*: " + item + "\n";

    });
    return result;
  }


  console.log(convoObject.userContactInfo.slack_Id);
  console.log(convoObject.type);
  console.log(convoObject.userContactInfo.slack_Id);
  bot.startPrivateConversation({user:U136W8M0W}, ask1);


}
