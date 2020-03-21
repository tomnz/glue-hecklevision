import collections
import os
import random
import time

import flask
import slack
import slackeventsapi


# Tokens belonging to the bot
SLACK_BOT_TOKEN = os.environ['SLACK_BOT_TOKEN']
SLACK_SIGNING_SECRET = os.environ['SLACK_SIGNING_SECRET']

app = flask.Flask(__name__)
slack_client = slack.WebClient(token=SLACK_BOT_TOKEN)


# Make sure we are joined to the main channel
HECKLE_CHANNEL_NAME = 'heckle'
HECKLE_CHANNEL = None
for page in slack_client.conversations_list(types='public_channel'):
    for channel in page['channels']:
        if channel['name'] == HECKLE_CHANNEL_NAME:
            HECKLE_CHANNEL = channel['id']
            if not channel['is_member']:
                slack_client.conversations_join(channel=HECKLE_CHANNEL)
                break

    if HECKLE_CHANNEL:
        break


# Build user list so we have usernames
user_names_by_id = {}
for page in slack_client.users_list():
    for member in page['members']:
        user_names_by_id[member['id']] = member['profile'].get('display_name', None) \
            or member['profile']['real_name']


# Build emoji list
emojis_by_name = {}
for page in slack_client.emoji_list():
    for name, url in page['emoji'].items():
        if url.startswith('alias:'):
            continue
        emojis_by_name[name] = url


MESSAGE_HISTORY = 100
messages = []


def cleanup_messages():
    global messages
    messages = messages[-MESSAGE_HISTORY:]


class Message(object):
    def __init__(self, author, text, timestamp):
        self.author = author
        self.text = text
        self.timestamp = timestamp


# Throttle users to the given time between posts
USER_SILENCE_SECS = 4.0
user_last_posted = collections.defaultdict(lambda: 0.0)

# Limit user message length
MESSAGE_LENGTH_LIMIT = 100


SUCCESS_RESPONSES = [
    'Got em!',
    'Oh, so you think you\'re clever huh?',
    'Let\'s see how that one lands...',
    'One heckle, coming right up!',
    'You make heckling look easy!',
    'You funny mother fucker.',
]


slack_events_adapter = slackeventsapi.SlackEventAdapter(SLACK_SIGNING_SECRET, '/slack-actions', app)


def heckle(user_id, text):
    if not text:
        return False, 'You need to give me something to heckle with!'

    if text.lower().startswith('help'):
        return False, 'This is really easy, I promise. Just type `/heckle Wow this movie sucks!` or whatever ' \
                      'you want to heckle with!'

    if len(text) > MESSAGE_LENGTH_LIMIT:
        return False, 'Keep your rants to yourself. No more than {} characters please.'.format(MESSAGE_LENGTH_LIMIT)

    timestamp = time.time()
    last_posted = timestamp - user_last_posted[user_id]
    if last_posted < USER_SILENCE_SECS:
        return False, 'You can\'t heckle again so soon! Try again in {:.1f} seconds.'.format(
            USER_SILENCE_SECS - last_posted)

    user_name = user_names_by_id.get(user_id, 'UNKNOWN')
    messages.append(Message(
        author=user_name,
        text=text,
        timestamp=timestamp,
    ))
    user_last_posted[user_id] = timestamp
    cleanup_messages()

    return True, '{}\nThere may be a short delay before your message appears, you don\'t need to retry.'.format(
        random.choice(SUCCESS_RESPONSES))


@app.route('/post', methods=['POST'])
def post():
    data = flask.request.form
    user_id = data['user_id']
    text = data.get('text', None)
    _, response = heckle(user_id, text)
    return flask.jsonify({
        'text': response,
    })


@app.route('/get', methods=['GET'])
def get():
    after = flask.request.args.get('after', None)
    if after:
        response_messages = filter(lambda msg: msg.timestamp > float(after), messages)
    else:
        response_messages = messages

    return flask.jsonify([
        {
            'author': message.author,
            'text': message.text,
            'timestamp': message.timestamp,
        } for message in response_messages
    ])


@app.route('/', methods=['GET'])
def index():
    return flask.render_template('index.html')


@slack_events_adapter.on('message')
def channel_message(data):
    message = data['event']
    if message['channel'] != HECKLE_CHANNEL:
        return
    if not message.get('subtype', None):
        # Not a plain message
        return

    user_id = message['user']
    text = message['text']

    success, response = heckle(user_id, text)
    if success:
        slack_client.reactions_add(
            name='ok-hand',
            channel=message['channel'],
            timestamp=message['ts'],
        )
    else:
        slack_client.reactions_add(
            name='woman-gesturing-no',
            channel=message['channel'],
            timestamp=message['ts'],
        )
        slack_client.chat_postEphemeral(
            channel=message['channel'],
            user=user_id,
            text=response,
            icon_emoji=':woman-gesturing-no:',
        )


if __name__ == '__main__':
    # Note that we use debug mode to get helpful errors, and so we can serve static content
    # directly from Flask. This app is realllly low stakes, so not concerned about it.
    # TODO(tomnz): Look into serving static stuff with WhiteNoise?
    # http://whitenoise.evans.io/en/stable/flask.html
    app.debug = True

    app.run(
        # Listen on all interfaces
        host='0.0.0.0',
        # Grab the port from the environment if present (good for Heroku)
        port=int(os.environ.get('PORT', 7000)),
    )
