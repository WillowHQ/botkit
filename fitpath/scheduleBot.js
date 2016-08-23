//schedule bot creates the req bots to have convos, then uses them to send the convos
//

var Botkit = require('../lib/Botkit.js');

//Thom is adding in dotenv so everything on this process will have access to the env variables
var express = require('express');
var app = express();






require('dotenv').config();
var serverIp = require('./env.js').serverIp;
var _ = require('underscore');
var request = require('request');
// var raven = require('raven');
// var client = new raven.Client('https://f755c390bd98419eb0ef404e519d8e4a:f3b90e92e81d42108d066106353e23d6@app.getsentry.com/88385');
//
// client.patchGlobal();
//
//var Promise = require('promise');


//get the bots we need to say the things we want to say

//specifically add twilio, fb and slack

var bots = {
  slack: require('./survey_slack_bot.js'),
  sms: require('./survey_sms_bot.js')

    //removing fb bot for now
  //fb: require('./survey_messenger_bot.js')
};
/**
// setting up incoming webhook so I can ping the bot and test that it is working


*/

app.get('/test', function(req, res){
    res.send('hello world');


});
app.post('/survey', function (req, res) {
    //take in a survey that looks exactly like what comes back from a convo now and return a survey response

    //ok so what does a convo object look like oh wait we don't care

    console.log(JSON.parse(body));  // just print out evertything we get back from this api call

    console.log("test method called line 55");

    //incoming convo will be for slack bot 'U24WU4SD' or a new twilio number

    res.send(dispatchConvo(JSON.parse(body)));

    //TODO in the event this is a test case we should be ab

    //now I need to program the test bot to take part in this survey

    //After newman calls this we either return with the respone or we cehck that it was stored on the backend somehow

    //might need to set a time out variable for newman to a few seconds to let this happen

    //actually ya - wait for this to come back as a 200 - then take the survey or assignment id and use it to get the resposne
    //as the next test

    //we can do this for both surveys and reminders, and sms and slack
    //




    //for both sms and slack

    //then i need to do something here - so that newman gets told this worked




})

app.listen(3000);



/**

var exports = module.exports = {};


r6
var controller = Botkit.slackbot({
    debug: true
});

//ok so build


controller.setupWebserver(3000, function(err, webserver) {
    controller.createWebhookEndpoints(webserver);
});

controller.on('outgoing_webhook', function(bot, message) {

    bot.replyPublic(message, 'This is a public reply to the outgoing webhook!');

});

exports.done = function() {
  //testing some stuff
  console.log("fooking works");
}

init(); //kick things off

// the next three methods are chained and start a process that asks
/* the backend every minute if there are any assignments

*/



init();

var activeConvoList = [];
function init() {
  //create a console.log that checks everysweet dreams minute

  //should prob figure out a way to persist this


  //TESTING promises

  //dispatchConvo();

  //make sure it starts on the minmute



  var d = new Date();

  var seconds = d.getSeconds();
  console.log("seconds are " + seconds);
  var timeout = (60 - seconds) * 1000;
  console.log("timeout is " + timeout);



  setTimeout(startScheduler, timeout);

}

function startScheduler(){
    var myVar = setInterval(doSomething, 60*1000);

}
function doSomething(){
  console.log("Check one");
  //now hit the api and ask if we have a survey or a reminder we can send
  request('http://' + serverIp + ':12557/api/assignment/convosNow', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log(JSON.parse(body));  // just print out evertything we get back from this api call
      console.log("we didn't completely fuck up yet");
      scheduleConvos(JSON.parse(body)); //send all the convo object to be scheduled
      } else {
      //console.log(error);
    }
  })

}
function scheduleConvos(convos) {
  console.log('scheduling');
  console.log(convos);
  //first this function checks if the user is already in a convo,

  //for( go thru all the convos)
  //get user for each convo

  _.each(convos, function(convo){
      console.log(convo.userId);
      var userId = convo.userId;

      if(isUserInConvo(userId)){
        console.log("user already in convo");
        addConvoToQue(convo);

      } else {
        console.log("dispatching convo");
        dispatchConvo(convo);

      }
    }, convos);

  //
  // for (var i = 0; i < convos.length; i++)
  //   var convo = convos[i];
  //   console.log(convo);
  //   var userId = convo.userId;


  // then it
}




function dispatchConvo(convo){
  //merge the questions thing from twilio sms bot and frank

  //figure out what bot to send the convo to then update the fact that the user is in a convo
  if (convo.userMedium == 'sms') {
    bots.sms.receiveConvo(convo);
  }
  else if(convo.userMedium == 'slack'){
    console.log('slack convo');
    bots.slack.receiveConvo(convo);
  }

}



exports.saySomething = function() {
  console.log("finally fucking working");
  //console.log(userId);


}
exports.sayHi = function(scheduleBot) {
  console.log("hi this worked ");
  //var sb = scheduleBot;
  //sb.done();
};
  //figure out which



//returns a boolean wethher the user is currently in a convo

//TODO make this a private constructor inside of the bot so we don't have to worry about someone touching the variables

function isUserInConvo(userId){
  var inConvo;
  for (var i = 0; i < activeConvoList.length; i++) {
    if(activeConvoList[i] == userId) {
      console.log('user is already in a convo');
      return true;
    }

  }
  return false;

}
function userNowInConvo(userId){
  activeConvoList.push(userId);

}
function userDoneConvo(userId){
  //remove the userId from the array
  var index = activeConvoList.indexOf(userId);
  if(index > -1) {
    activeConvoList.splice(index, 1);
  }
  //make sure it worked
  if(isUserInConvo){
    console.error("user is still in convo, userDoneConvo method failed");
  }

}

function createConvos(userId, userMedium, userContactInfo, surveyTemplateId){

  //this is where we take the assignments and make conversation objects
  //get convo object built, from assignment response, then send it to the right bot

  //worry about the active convos and the convo que after


  console.log("userId" + userId);
  console.log("userMedium" + userMedium);
  console.log("userContactInfo" + userContactInfo);
  console.log("questions" + questions);


//TODO could put better error checking in here - based on medium check if
  var convos = {
    userId: userId,
    userMedium: userMedium,
    userContactInfo: userContactInfo,
    questions: questions
  }
}

/** now once we have the assignments for that minute we need to send them to the
  appropriate bot to start a conversation

  1 - have an instance of all the bots and pass them the id fields they need to get the
  survey information and the right user.
  */
