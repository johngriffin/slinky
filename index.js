var Botkit = require('botkit')
var token = process.env.SLACK_TOKEN
var google_creds = process.env.GOOGLE_CREDS

var controller = Botkit.slackbot({
  // reconnect to Slack RTM when connection goes bad
  retry: Infinity,
  debug: false
})

// Assume single team mode if we have a SLACK_TOKEN
if (token) {
  console.log('Starting in single-team mode')
  controller.spawn({
    token: token
  }).startRTM(function (err, bot, payload) {
    if (err) {
      throw new Error(err)
    }

    console.log('Connected to Slack RTM')
  })
// Otherwise assume multi-team mode - setup beep boop resourcer connection
} else {
  console.log('Starting in Beep Boop multi-team mode')
  require('beepboop-botkit').start(controller, { debug: true })
}

controller.on('bot_channel_join', function (bot, message) {
  if (bot.config.SPREADSHEET_ID == undefined) {
    bot.reply(message, "Hi! You haven't set the spreadsheet ID for me to track links in.  Please do this in the Slack App config.");
  }
  else {
    bot.reply(message, "Hi! I'm going to keep track of your links in this spreadsheet: https://docs.google.com/spreadsheets/d/" + bot.config.SPREADSHEET_ID);
  }
  
  bot.reply(message, "Please make sure that your spreadsheet is shared with this email address: slinky@slack-slinky.iam.gserviceaccount.com");
  bot.reply(message, "Your spreadsheet must have the following headings: 'timestamp', 'link', 'full_message'");
})

controller.hears('\<(.*?)\>', ['ambient', 'direct_message','direct_mention','mention'], function (bot, message) {
  
  var GoogleSpreadsheet = require('google-spreadsheet');
  var async = require('async');
  var doc = new GoogleSpreadsheet(bot.config.SPREADSHEET_ID);
  
  if (bot.config.SPREADSHEET_ID == undefined) {
    bot.reply(message, "You haven't set the spreadsheet ID for me to track links in.  Please do this in the Slack App config.");
  }
  else {
    async.series([
      function setAuth(step) {
        doc.useServiceAccountAuth(JSON.parse(google_creds), step);
      },
      function addRow(step) {
        var date = new Date();
        var new_row = {
          timestamp: date.toISOString(),
          link: message.match[1],
          full_message: message.text
        }
        doc.addRow(1, new_row, step)
      },
      function sendResponse(step){
        bot.reply(message, "I've added that link to the Google spreadsheet here: https://docs.google.com/spreadsheets/d/" + bot.config.SPREADSHEET_ID);
      }],
      function(err){
        if( err ) {
          bot.reply(message, "I'm having trouble accessing your spreadsheet - https://docs.google.com/spreadsheets/d/" + bot.config.SPREADSHEET_ID);
          bot.reply(message, "Please make sure that you've shared it with this email address: slinky@slack-slinky.iam.gserviceaccount.com");
          bot.reply(message, "Your spreadsheet must have the following headings: 'timestamp', 'link', 'full_message'");
          console.log('Errorr: '+err);
        }
      }
    );
  }
});

