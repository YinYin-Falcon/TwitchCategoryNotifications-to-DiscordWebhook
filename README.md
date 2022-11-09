# TwitchCategoryNotifications-to-DiscordWebhook

Well hello there! This is a little google apps script with google sheets as a database.  
It can fetch live streams from a twitch game category of your choice  
and post any new streams to a discord channel webhook.

Here is how to set it up:

## STEP 1 spreadsheeting
Create a google spreadsheet.  
Name the first sheet "token" and hide it.  
Create additional sheets in the same document.  
Name them after the twitch game categories you want to track.

## STEP 2 appscripting
Click on "Extensions" and then "Apps Script" in the menu bar at the top of the spreadsheet.  
Paste the code.gs content from [here](../master/code.gs) in there.  
Go to https://dev.twitch.tv/console/apps to create a client ID and secret.  
Replace the respective placeholder strings in your code.gs with them.

## STEP 3 discording
Get to the discord channel you want your notifications to appear in.  
Right click and edit the channel. Go to Integrations > Webhooks.  
Create a new webhook. Copy the webhook URL.  
Paste it into the B2 cell of the games sheet you want posting to this channel.

---

At this point you can already hit run on the check function in your apps script.  
Any new live streams of your chosen game should appear in your discord channel.  
All last found streams will also be listed on the games sheet.  
(Pick a popular game to test! Clear the stream list in the sheet to retest discord messages)  
If any of this fails without an external error (twitch/discord/google services not responding) double check all your previous steps.

## STEP 4 triggering
In the left sidebar of your apps script, go to the alarm clock icon to open the Triggers.  
Add a new trigger, set it to run the check function, time-driven and every 5 minutes.

You are all set!

## STEP C customising
Give your webhook a cool name and avatar in discord.  
Extra webhooks for the same game can go in the B column below the first webhook.  
The A column can be used to filter these per language ("en" for example will only send english streams to the webhook).  
And the background colour of column A is also used for the notification colour of that webhooks messages.

## STEP E expanding
You can repeat step 3 for as many extra games and discord channels as your script cycles and API quotas can handle per day.  
If you are only checking one or two games, you can possibly set the trigger to every minute instead of every 5.  
If you are checking a lot of games, you may need to increase the trigger interval above 5 minutes  
or set up a new sheet with a new instance of this script.  
Research how many cycles you actually have or watch at what point errors start piling up during a day.
