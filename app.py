import collections
import datetime

import flask


app = flask.Flask(__name__)


MESSAGE_HISTORY = 20
messages = collections.deque()


def cleanup_messages():
    while len(messages) > MESSAGE_HISTORY:
        messages.pop()


class Message(object):
    def __init__(self, author, text):
        self.author = author
        self.text = text
        self.timestamp = datetime.datetime.utcnow().timestamp()


@app.route('/post', method='POST')
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

    user_name = data.get('user_name', None)
    if not user_name:
        return flask.jsonify({
            'text': 'Hmm, I didn\'t get a user... Is this even possible??',
        })

    messages.appendleft(Message(
        author=user_name,
        text=text,
    ))
    cleanup_messages()

    return flask.jsonify({
        'text': 'Nice one! I\'ll show it soon!',
    })


@app.route('/get', method='GET')
def get():
    return flask.jsonify([
        {
            'author': message.author,
            'text': message.text,
            'timestamp': message.timestamp,
        } for message in messages
    ])


@app.route('/', method='GET')
def index():
    return flask.render_template('index.html')


if __name__ == '__main__':
    # Note that we use debug mode to get helpful errors, and so we can serve static content
    # directly from Flask. This app is realllly low stakes, so not concerned about it.
    app.debug = True

    app.run(host='0.0.0.0', port=80)
