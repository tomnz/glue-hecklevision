import collections
import os
import random
import time

import flask


app = flask.Flask(__name__)


MESSAGE_HISTORY = 100
messages = collections.deque()


def cleanup_messages():
    while len(messages) > MESSAGE_HISTORY:
        messages.popleft()


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


@app.route('/post', methods=['POST'])
def post():
    data = flask.request.form
    text = data.get('text', None)
    if not text:
        return flask.jsonify({
            'text': 'You need to give me something to heckle with!',
        })

    if text.lower().startswith('help'):
        return flask.jsonify({
            'text': 'This is really easy, I promise. Just type `/heckle Wow this movie sucks!` or whatever '
                    'you want to heckle with!',
        })

    if len(text) > MESSAGE_LENGTH_LIMIT:
        return flask.jsonify({
            'text': 'Keep your rants to yourself. No more than {} characters please.'.format(MESSAGE_LENGTH_LIMIT),
        })

    user_name = data.get('user_name', None)
    if not user_name:
        return flask.jsonify({
            'text': 'Hmm, I didn\'t get a user... Is this even possible??',
        })

    timestamp = time.time()
    last_posted = timestamp - user_last_posted[user_name]
    if last_posted < USER_SILENCE_SECS:
        return flask.jsonify({
            'text': 'You can\'t heckle again so soon! Try again in {:.1f} seconds.'.format(
                USER_SILENCE_SECS - last_posted)
        })

    messages.append(Message(
        author=user_name,
        text=text,
        timestamp=timestamp,
    ))
    user_last_posted[user_name] = timestamp
    cleanup_messages()

    return flask.jsonify({
        'text': '{}\nThere may be a short delay before your message appears, you don\'t need to retry.'.format(
            random.choice(SUCCESS_RESPONSES)),
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
