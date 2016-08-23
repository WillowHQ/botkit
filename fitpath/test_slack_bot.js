
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 This is the bot that tests the survey_sms_bots.js

 it's like the internal affairs of bots


                        ************
                      *****************
                     ********************
                      ********************
                       ********
                        ********                 *********
                         ***********              *********
           *********      ****       *            *********
        *             ***               *          *********
      *                       **         *          ********
     *                         **         *       ***********
   *        *****              **      *********************
  *        *******                     *********************
  *         *****                         *****************
   *                                        *
    *     *               *                 *
     *     *             *                  *
       *    *           *                  *
        *    *       *                   *
           *   *****                   *
       ***               *     ************
   *   *            *      *
   *   *          *********          ***
  ****    **********        *          *   *
 *               *         *           *   *
 *              *           *************    ****
 *      *******                                  *
 *      *    *                                    *
 *****    *              *****************      *
 *               *               *      *
 *      ****      *                *****
 *    *      **   *
 *   *         ** *
 *** *  *            *
 *    *   *            *    *
 *    *   *           *   * *
 *     *  *          *  *  *
 *     * *         *  *  *
 *       *        *  *  *
 *       *    *****   *
 *      * * *****  *


~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
var Botkit = require('../lib/Botkit.js');

//set this flag to a process.env.debug flag prob

var config = require('./env.js');
var request = require('request');

var counter = 0;
var _ = require('underscore');

// var convoObject =
//   {
//     userId: '5784f67bf87bfc21174bc93f',
//     userMedium: 'slack',
//     userContactInfo: {name: 'jlaver', slackId: 'U136W8M0W'},
//     questions: [
//       'Do you like pancakes?',
//       'Do you like waffles?',
//       'Do you like french toast?'
//     ],
//     surveyId: '35435436afaf',
//     type: 'survey'
// };



//console.log(config.phoneNumber);


//var convoObject;
var controller = Botkit.slackbot({
    json_file_store: '../db/',
    debug: false
});

var bot = controller.spawn({
  token: 'xoxb-72200956897-SQYOtR8ylfjSyOmC2Hw9LJnX',
  json_file_store: '../db/',
}).startRTM()



controller.hears(['test'], ['direct_message'], function(bot, message){

    console.log("yes! Survey");
    console.log(message);

    bot.reply(message, "test heard");


})
controller.hears(['ask1'], ['direct_message'], function(bot, message){
    console.log("question one asked ");

    bot.reply(message, "response1");
})
controller.hears(['ask2'], ['direct_message'], function(bot, message){
    console.log("question two asked ");

    bot.reply(message, "response2");
})
controller.hears(['ask3'], ['direct_message'], function(bot, message){
    console.log("question three asked ");

    bot.reply(message, "response3");
})


