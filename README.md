## Overview

This is a really basic application that is designed to [accept POST requests from a Slack app slash command](https://api.slack.com/interactivity/slash-commands#app_command_handling) (e.g. `/heckle His face looks like grilled cheese!`) or messages from a specific channel; and turn them into messages for display in the application. The intended use case is to show the messages (along with their author name) stacked at the bottom of the page, for overlay onto a movie stream. Similar in concept to [the Hecklevision concept by Central Cinema](https://www.central-cinema.com/hecklevision).

Messages appear in the order they were received (newest at the top), and disappear after a set duration, allowing other messages to drop further down.

Everything is styled in simple HTML/CSS, and unique colors are created for messages based on the author's name. Dynamic logic is written in basic vanilla JS, and is NOT run through Babel, so only supported on modern browsers. This project was written with an OBS Browser Overlay in mind, and it works great with the Chromium version integrated in that application.

Due to the nature of the data, and wanting to keep the project simple, messages are just stored in-memory in Python data structures - there is no form of permanent storage. This means messages will be lost if the process resets, but we only keep a few recent ones in memory anyway.

## Setup

NOTE: The project is designed to be run as a Slack bot, so you will need to provide environment variables for `SLACK_BOT_TOKEN` and `SLACK_SIGNING_SECRET`. You'll need to [create a Slack app / bot user](https://slack.com/help/articles/115005265703-Create-a-bot-for-your-workspace) for your workspace to obtain these.

0. Install prerequisites (Python 3.7, I think that's it!)
0. Clone the repository.
0. `pip3 install -r requirements.txt`
0. `python3 -m app`

You should now have the server up and running at [localhost:7000](http://localhost:7000). It will just show a blank page for now.

To simulate someone using the Slack `/heckle` slash command, you simply need to send POST requests with form-encoded data. For example (`curl` used here but anything should work):

```shell script
curl --data-urlencode 'user_name=tom' --data-urlencode 'text=His face looks like grilled cheese!' http://localhost:7000/post
```

The message should appear at the bottom of the page, and then disappear again after some time.

Alternatively, you can use a direct submission link at [localhost:7000/submit](http://localhost:7000/submit). Messages submitted to this endpoint will also be forwarded to the connected Slack channel. The full list of endpoints:

* / - Shows a player based on video.js
* /messages - The default view for rendering incoming messages
* /submit - A form for manually submitting messages
* /post - Endpoint hit by the slack command to post messages

## Development

Project layout is straightforward, and hopefully the code is all easy to follow.

* `static/messages.js` - The main dynamic logic which powers the browser view. Takes care of polling for new messages, rendering them, and clearing them after the elapsed duration. It's vanilla JS, so there's some raw DOM manipulation. Shield your eyes.
* `static/*.css` - Styling for the various pages.
* `templates/*.html` - Basic page layout, which loads the JS/CSS. Shouldn't typically need modifying.
* `app.py` - Flask-powered backend. Note that we are naughty and always run this in `debug` mode as this is required for Flask to host static files. The stakes are low, it should be fine.
* `Procfile`/`runtime.txt` - Heroku things. Shouldn't need to touch these.

Changes to `app.py` will automatically reload due to `debug` mode being enabled. For JS/CSS changes, fully reload the web page (may need to Ctrl+Shift+R).

## Deployment

Submit a Pull Request to GitHub. New changes are automatically deployed from master. I'm not going to list the public application URL in this README since the app isn't built to be secure or handle a ton of requests. Reach out if you are curious.
