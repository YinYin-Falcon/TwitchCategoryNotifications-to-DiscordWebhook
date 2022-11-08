function idle() {} //to suspend a trigger without deleting it

function check() { //the actual thing

	var allsheets = SpreadsheetApp.getActive().getSheets();

	//twitch application info from https://dev.twitch.tv/console/apps
	var client_id = 'CLIENT_ID_IN_THESE_QUOTES';
	var client_secret = 'CLIENT_SECRET_IN_THOSE_QUOTES';

	//authorisation token things, see if the twitch app token is still good, get a new one if not
  //the token is fetched and stored from the B1 cell of the sheet named "token"
	Logger.log("Validating old access token from the spreadsheet.");
	var access_token = SpreadsheetApp.getActive().getSheetByName('token').getRange(1, 2).getValue().toString();
	var validate = UrlFetchApp.fetch("https://id.twitch.tv/oauth2/validate", {
		'method': 'get',
		'muteHttpExceptions': true,
		'headers': {
			'Client-ID': client_id,
			'Authorization': 'Bearer ' + access_token
		}
	});
	var stock = JSON.parse(validate.getContentText());

	if(stock["status"] != null) {
		Logger.log("Old token isn't working, requesting a new one.");
		var url = 'https://id.twitch.tv/oauth2/token'
		var data = {
			"client_id": client_id,
			"client_secret": client_secret,
			"grant_type": "client_credentials"
		};
		var options = {
			'method': 'post',
			'payload': data,
		};
		var stock = JSON.parse(UrlFetchApp.fetch(url, options).getContentText());
		access_token = stock["access_token"];
		var sheet = SpreadsheetApp.getActive().getSheetByName('Local')
		SpreadsheetApp.getActive().getSheetByName('token').getRange(1, 2, 1, 1).setValue(access_token);
	}

	//go through all sheets to get streams by game (sheet name = game name)
	for(var s in allsheets) {

		//get the current sheet
		sheet = allsheets[s];

		//skip the token sheet, let's hope there never is a token game
		if(sheet.getName() == 'token') {} else {

			var game = sheet.getName();
			Logger.log("Trying to check for " + game + " streams.");

			//get old stream user ids and clear the list (C column onwards)
			var previous_ids = [];
			var last_row = sheet.getRange("C2:C").getValues().filter(String).length;
			for(var i = 0; i < last_row; i++)
				previous_ids[i] = sheet.getRange(2 + i, 3).getValue().toString();
			sheet.getRange(2, 3, sheet.getLastRow() - 1, sheet.getLastColumn() - 2).clearContent();

			//get the game id and box art
			var response = UrlFetchApp.fetch("https://api.twitch.tv/helix/games?name=" + game, {
				'method': 'get',
				'muteHttpExceptions': true,
				'headers': {
					'Client-ID': client_id,
					'Authorization': 'Bearer ' + access_token
				}
			});
			stock = JSON.parse(response.getContentText());
			if(stock["data"].length == 0) {
				Logger.log("Could not find the game " + game + ".");
				continue;
			}
			var id = stock["data"][0]["id"];
			var box_art_url = stock["data"][0]["box_art_url"];

			//get up to 100 live streams of the game
			var response = UrlFetchApp.fetch("https://api.twitch.tv/helix/streams?game_id=" + id + "&limit=100", {
				'method': 'get',
				'headers': {
					'Client-ID': client_id,
					'Authorization': 'Bearer ' + access_token
				},
				'muteHttpExceptions': true
			});
			stock = JSON.parse(response.getContentText());

			//get discord webhooks (B column), language filters and colours (A column)
			var webhooks = [];
			var language_filters = [];
			var colours = [];
			var last_row = sheet.getRange("B2:B").getValues().filter(String).length;
			for(var i = 0; i < last_row; i++)
				webhooks[i] = sheet.getRange(2 + i, 2).getValue().toString();
			for(var i = 0; i < last_row; i++)
				language_filters[i] = sheet.getRange(2 + i, 1).getValue().toString();
			for(var i = 0; i < last_row; i++)
				colours[i] = sheet.getRange(2 + i, 1).getBackgroundColor().toString();

			//write new stream list
			for(var i = 0; i < stock["data"].length; i++) {
				sheet.getRange(2 + i, 3, 1, 1).setValue(stock["data"][i]["user_id"]);
				sheet.getRange(2 + i, 4, 1, 1).setValue(stock["data"][i]["user_name"]);
				sheet.getRange(2 + i, 5, 1, 1).setValue(stock["data"][i]["title"]);
				sheet.getRange(2 + i, 6, 1, 1).setValue(stock["data"][i]["started_at"]);
				sheet.getRange(2 + i, 7, 1, 1).setValue(stock["data"][i]["language"]);
				sheet.getRange(2 + i, 8, 1, 1).setValue(stock["data"][i]["is_mature"]);

				//post new streams to each webhook, respecting its language filter
				if(!previous_ids.includes(stock["data"][i]["user_id"])) {

					//get user profile picture
					var user = UrlFetchApp.fetch("https://api.twitch.tv/helix/users?id=" + stock["data"][i]["user_id"], {
						'method': 'get',
						'headers': {
							'Client-ID': client_id,
							'Authorization': 'Bearer ' + access_token
						},
						'muteHttpExceptions': true
					});

					for(var j = 0; j < webhooks.length; j++) {
						if(language_filters[j] == "")
							postMessageToDiscord("",
								stock["data"][i]["user_name"],
								"https://www.twitch.tv/" + stock["data"][i]["user_name"],
								box_art_url.replace("{width}", "138").replace("{height}", "190"),
								JSON.parse(user.getContentText())["data"][0]["profile_image_url"].replace("{width}", "100").replace("{height}", "100"),
								"[" + stock["data"][i]["title"] + "](" + "https://www.twitch.tv/" + stock["data"][i]["user_name"] + ")",
								stock["data"][i]["thumbnail_url"].replace("{width}", "440").replace("{height}", "248"),
								stock["data"][i]["started_at"],
								webhooks[j],
								colours[j],
								stock["data"][i]["language"]);
						else if(language_filters[j] == stock["data"][i]["language"])
							postMessageToDiscord("",
								stock["data"][i]["user_name"],
								"https://www.twitch.tv/" + stock["data"][i]["user_name"],
								box_art_url.replace("{width}", "138").replace("{height}", "190"),
								JSON.parse(user.getContentText())["data"][0]["profile_image_url"].replace("{width}", "100").replace("{height}", "100"),
								"[" + stock["data"][i]["title"] + "](" + "https://www.twitch.tv/" + stock["data"][i]["user_name"] + ")",
								stock["data"][i]["thumbnail_url"].replace("{width}", "440").replace("{height}", "248"),
								stock["data"][i]["started_at"],
								webhooks[j],
								colours[j],
							);

					}
				}
			}
		}
	}
}

//SEND IT
function postMessageToDiscord(content, title, url, thumb, thumbnail_url, type, large, started_at, webhook, colour, language) {
	let languageNames = new Intl.DisplayNames(['en'], {
		type: 'language'
	});
	if(language == null)
		language = ""
	else
		language = languageNames.of(language);
	var data = {
		"content": content,
		"embeds": [{
			"type": "rich",
			"color": parseInt(colour.replace("#", ""), 16),
			"author": {
				"name": title,
				"url": url,
				"icon_url": thumbnail_url,
			},
			"title": "",
			"url": "",
			"thumbnail": {
				"url": thumb,
			},
			"description": type,
			"image": {
				"url": large,
			},
			"footer": {
				"text": language,
			},
			"timestamp": started_at,
		}]
	};
	var options = {
		method: "post",
		payload: JSON.stringify(data),
		contentType: "application/json; charset=utf-8",
		muteHttpExceptions: true
	};
	Logger.log("Attempting to send:");
	Logger.log(JSON.stringify(data));
	var response = UrlFetchApp.fetch(webhook, options);
	Logger.log(response.getContentText());
}
