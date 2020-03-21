const MESSAGE_POLL_MS = 1000;
const MESSAGE_SHOW_MS = 20000;
const MESSAGE_OVERLOAD_LOW = 3;
const MESSAGE_OVERLOAD_HIGH = 5;

const stringToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = (hash >> 3) % 360;
  return `hsl(${hue}, 100%, 75%)`;
};

const fetchMessages = async after => {
  return fetch(`/get?after=${after}`);
};

const historyMode = new URLSearchParams(window.location.search).has('history');
let lastTimestamp = historyMode ? 0 : new Date().getTime() / 1000;

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

const scrollToBottom = () => {
  window.scrollTo(0, document.body.scrollHeight);
};

const checkMessageOverload = () => {
  const messagesEl = document.getElementById('messages');
  if (messagesEl.children.length >= MESSAGE_OVERLOAD_HIGH) {
    if (!messagesEl.classList.contains('messageOverloadHigh')) {
      messagesEl.classList.remove('messageOverloadLow');
      messagesEl.classList.add('messageOverloadHigh');
    }
  } else if (messagesEl.children.length >= MESSAGE_OVERLOAD_LOW) {
    if (!messagesEl.classList.contains('messageOverloadLow')) {
      messagesEl.classList.remove('messageOverloadHigh');
      messagesEl.classList.add('messageOverloadLow');
    }
  } else {
    messagesEl.classList.remove('messageOverloadLow');
    messagesEl.classList.remove('messageOverloadHigh');
  }
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

      if (historyMode) {
        const timeEl = document.createElement('span');
        timeEl.innerText = new Date().toLocaleTimeString('en-US');
        timeEl.classList.add('messageTime');
        messageEl.appendChild(timeEl);
      } else {
        messageEl.appendChild(newSpinnerEl());
      }
      messageEl.appendChild(authorEl);
      messageEl.appendChild(document.createTextNode(': '));
      messageEl.appendChild(textEl);

      messagesEl.appendChild(messageEl);

      if (!historyMode) {
        setTimeout(() => {
          messagesEl.removeChild(messageEl);
          checkMessageOverload();
        }, MESSAGE_SHOW_MS);
      }
    });
    checkMessageOverload();
    if (data.length > 0) {
      scrollToBottom();
    }
  });

  // Schedule the next update
  setTimeout(updateMessages, MESSAGE_POLL_MS);
};

if (historyMode) {
  window.document.body.classList.add('blackBackground');
  const containerEl = document.getElementById('container');
  containerEl.classList.add('alignLeft');
  const messagesEl = document.getElementById('messages');
  messagesEl.classList.add('alignLeft');
}
updateMessages();
