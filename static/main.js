const MESSAGE_POLL_MS = 1000;
const MESSAGE_SHOW_MS = 20000;
const MESSAGE_OVERLOAD_LOW = 3;
const MESSAGE_OVERLOAD_HIGH = 5;

let lastTimestamp = new Date().getTime() / 1000;

const stringToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = (hash >> 7) % 360;
  return `hsl(${hue}, 80%, 70%)`;
};

const fetchMessages = async after => {
  return fetch(`/get?after=${after}`);
};

const newSpinnerEl = () => {
  const spinnerEl = document.createElement('div');
  spinnerEl.classList.add('pie');
  spinnerEl.classList.add('spinner');

  const fillerEl = document.createElement('div');
  fillerEl.classList.add('pie');
  fillerEl.classList.add('filler');

  const maskEl = document.createElement('div');
  maskEl.classList.add('mask');

  const containerEl = document.createElement('div');
  containerEl.classList.add('spinnerContainer');
  containerEl.appendChild(spinnerEl);
  containerEl.appendChild(fillerEl);
  containerEl.appendChild(maskEl);

  return containerEl;
};

const checkMessageOverload = () => {
  const messagesEl = document.getElementById('messages');
  if (messagesEl.children.length >= MESSAGE_OVERLOAD_HIGH) {
    if (!messagesEl.classList.contains('messageOverloadHigh')) {
      messagesEl.className = '';
      messagesEl.classList.add('messageOverloadHigh');
    }
  } else if (messagesEl.children.length >= MESSAGE_OVERLOAD_LOW) {
    if (!messagesEl.classList.contains('messageOverloadLow')) {
      messagesEl.className = '';
      messagesEl.classList.add('messageOverloadLow');
    }
  } else {
    messagesEl.className = '';
  }
  // Scroll to the bottom of the page
  window.scrollTo(0, document.body.scrollHeight);
};

const updateMessages = () => {
  const messagesEl = document.getElementById('messages');

  fetchMessages(lastTimestamp).then((resp) => resp.json()).then((data) => {
    data.forEach((message) => {
      if (message.timestamp > lastTimestamp) {
        lastTimestamp = message.timestamp;
      }

      const authorEl = document.createElement('span');
      authorEl.innerText = message.author;
      authorEl.classList.add('messageAuthor');

      const textEl = document.createElement('span');
      textEl.innerText = message.text;
      textEl.classList.add('messageText');
      // Generate a random color based on username, because why not
      textEl.style.color = stringToColor(message.author);

      const messageEl = document.createElement('div');
      messageEl.classList.add('message');

      messageEl.appendChild(newSpinnerEl());
      messageEl.appendChild(authorEl);
      messageEl.appendChild(document.createTextNode(': '));
      messageEl.appendChild(textEl);

      messagesEl.appendChild(messageEl);

      setTimeout(() => {
        messagesEl.removeChild(messageEl);
        checkMessageOverload();
      }, MESSAGE_SHOW_MS)
    });
    checkMessageOverload();
  });

  // Schedule the next update
  setTimeout(updateMessages, MESSAGE_POLL_MS);
};

window.onload = () => {
  updateMessages();
};
