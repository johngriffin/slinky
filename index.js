var Botkit = require('botkit')
var token = process.env.SLACK_TOKEN
var google_creds = process.env.GOOGLE_CREDS
var spreadsheet_id = process.env.SPREADSHEET_ID

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
  bot.reply(message, "I'm watching you.")
})

controller.hears('\<(.*?)\>', ['ambient', 'direct_message','direct_mention','mention'], function (bot, message) {
  var GoogleSpreadsheet = require('google-spreadsheet');
  var async = require('async');
  // spreadsheet key is the long id in the sheets URL
  var doc = new GoogleSpreadsheet('18CEHcDMYhdxvit2PQKuQjpCXWdXWaCbvXRman-sk_Zk');
  
  async.series([
    function setAuth(step) {
      doc.useServiceAccountAuth(google_creds, step);
    },
    function addRow(step) {
      var new_row = {
        user: "john",
        link: message.match[1],
        full_message: message.text
      }
      doc.addRow(1, new_row, function(e) {console.log(e)})
      step();
    }
  ]);
      
  bot.reply(message, "I've added that link to the Google spreadsheet here: https://docs.google.com/spreadsheets/d/18CEHcDMYhdxvit2PQKuQjpCXWdXWaCbvXRman-sk_Zk/edit#gid=0");
});
