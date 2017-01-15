var bot = require('../controllers/botkit').bot;

// get the data we need about the user
var getCallToActionCampaign = function(fbId) {
  // TODO: pull these values from database
  return {
    "firstName": "user_first_name",
    "issueMessage": "issue_message",
    "repType": "rep_type",
    "repName": "repName"
  }
};


var callToAction = function(fbId) {
  // use a fakeMessage to initiate the conversation with the correct user
  var fakeMessage = {
    "channel": fbId,
    "user": fbId
  };

  // get the data we need about the user
  var callToActionCampaign = getCallToActionCampaign(fbId);

  // part 1
  callToActionPart1 = function(response, convo) {
    convo.say('Hi [firstName]! We’ve got an issue to call about.');
    convo.say("[issueMessage]. You can find out more about the issue here [issueLink].");
    convo.say(
      "You’ll be calling [repType] [RepName]. When you call you’ll talk to a staff member, or you’ll leave a voicemail. " +
      "Let them know: " +
      "*  You’re a constituent calling about [issueSubject]. " +
      "*  The call to action: “I’d like [repType] [repName] to [issueAction]. " +
      "*  Share any personal feelings or stories " +
      "*  If taking the wrong stance on this issue would endanger your vote, let them know. " +
      "*  Answer any questions the staffer has, and be friendly!" );
    convo.say(
      "Rep card " +
      "[repImage]" +
      "[repName]" +
      "[phoneNumber] ⇢" +
      "Website ⇢"
    );
    convo.ask("Give me a thumbs up once you’ve tried to call!", function(response, convo) {
      callToActionPart2(response, convo);
      convo.next();
    });
  };
  callToActionPart2 = function(response, convo) {
    // How’d it go?
    // I talked to a staff member
    // I left a voicemail
    // I changed my mind
    // Something went wrong
    // TODO: figure out how to do button attachments
    // bot.reply(response, {
    //   attachment: {
    //     "payload": {
    //       "template_type": "button",
    //       "text": "What do you want to do next?",
    //       "buttons": [
    //         {
    //           "type": "web_url",
    //           "url": "https://petersapparel.parseapp.com",
    //           "title": "Show Website"
    //         },
    //         {
    //           "type": "postback",
    //           "title": "Start Chatting",
    //           "payload": "USER_DEFINED_PAYLOAD"
    //         }
    //       ]
    //     }
    //   });
  };
  // start at the end
  bot.startConversation(fakeMessage, callToActionPart1);
};

module.exports = {
  callToAction: callToAction
};
