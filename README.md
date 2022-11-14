# TwitchCategoryNotifications-to-DiscordWebhook

Well hello there! This is a little google apps script with google sheets as a database.  
It can fetch live streams from a twitch game category of your choice  
and post any new streams to a discord channel webhook.

Here is how to set it up:

## STEP 1 Create a google spreadsheet
Name the first sheet "token" and hide it.  
Create additional sheets in the same document.  
Name them after the twitch game categories you want to track.

## STEP 2 Attach the code.gs script
Click on "Extensions" and then "Apps Script" in the menu bar at the top of the spreadsheet.  
Paste the code.gs content from [here](../master/code.gs) in there.  


Go to https://dev.twitch.tv/console/apps, click Register Your Application.
Give it a name, "http://localhost:3000" as the OAuth Redirect URL and category "other".
Once generated you can grab the client ID and generate a secret from the manage page of the app.
Replace the respective placeholder strings in your code.gs with them.

## STEP 3 Enter a discord channel webhook
Get to the discord channel you want your notifications to appear in.  
Right click and edit the channel. Go to Integrations > Webhooks.  
Create a new webhook. Copy the webhook URL.  
Paste it into the B2 cell of the games sheet you want posting to this channel.

---

At this point you can already hit run on the check function in your apps script.  
Any new live streams of your chosen game should appear in your discord channel.  
All current live streams will also be listed on the games sheet.  
(Pick a popular game to test! Clear the stream list in the sheet to retest discord messages)  
If any of this fails, double check your previous steps.

## STEP 4 Automate with a trigger
In the left sidebar of your apps script, go to the alarm clock icon to open the Triggers.  
Add a new trigger, set it to run the check function, time-driven and every 5 minutes.

You are all set!

---

## STEP C customising
Give your webhook a cool name and avatar in discord.  
Extra webhooks for the same game can go in the B column below the first webhook.  
The A column can be used to filter these per language.  
("en" for example will only send english streams to the webhook)  
And the background colour of column A is also used for the notification colour of that webhooks messages.

## STEP E expanding
You can repeat step 3 for as many extra games and channels as your script cycles and API quotas can handle.  
If you are only checking a few games, you can possibly set the trigger to a 1 instead of 5 minute interval.  
If you are checking a lot of games, you may need to use a longer interval  
or set up a new sheet with a new instance of this script.  
Research how many cycles you actually have or watch at what point errors start piling up during a day.
