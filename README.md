# Slinky

I'm a slack bot that will keep track of links that have been shared in a Google Spreadsheet.

# Installation
* Copy this spreadsheet template, do not change the headings.
* Enter your spreadsheet ID
* Share your spreadsheet with "slinky@slack-slinky.iam.gserviceaccount.com" - can edit

# TODO
x Pass in google creds globally
x remove google credentials before committing
x Update Google email credentials to be shared
x Submit to app store
x Pass in spreadsheet ID on installation

* Ask user to invite us to the spreadsheet
* Store username and timestamp
* add help function
        bot.reply(message, "Hmm, I'm having trouble accessing your spreadsheet - https://docs.google.com/spreadsheets/d/" + spreadsheet_id);
        bot.reply(message, "Please make sure that you've shared it with this email address: slinky@slack-slinky.iam.gserviceaccount.com");
 

* Simple site to on-board
* launchrock page and blog post