const MESSAGE_POLL_MS = 2000;
const MESSAGE_SHOW_MS = 20000;

let lastTimestamp = new Date().getTime() / 1000;

const fetchMessages = async after => {
  return fetch(`/get?after=${after}`);
};

const messages = [];
let showing = false;

const triggerMessage = () => {
  // Future calls to showMessage function are automated with a timeout, so
  // ignore if it's already active
  if (showing || messages.length === 0) {
    return;
  }
  showMessage();
};

const showMessage = () => {
  // Manual DOM manipulation because YOLO
  const containerEl = document.getElementById('container');
  const messageEl = document.getElementById('message');
  const messagesRemainingEl = document.getElementById('messagesRemaining');

  // No messages left? Clean up
  if (messages.length === 0) {
    messageEl.innerHTML = '';
    containerEl.classList.add('empty');
    showing = false;
    return;
  }

  // We have some messages! Get it going
  containerEl.classList.remove('empty');
  showing = true;

  const message = messages.shift();

  const authorEl = document.createElement('span');
  authorEl.innerText = message.author;
  authorEl.classList.add('messageAuthor');

  const textEl = document.createElement('span');
  textEl.innerText = message.text;
  textEl.classList.add('messageText');

  // Show the message, overwriting any existing
  messageEl.innerHTML = '';
  messageEl.appendChild(authorEl);
  messageEl.appendChild(document.createTextNode(': '));
  messageEl.appendChild(textEl);

  // Update the remaining count
  if (messages.length > 0) {
    messagesRemainingEl.innerText = `${messages.length} queued`
  } else {
    messagesRemainingEl.innerHTML = '';
  }

  // Schedule the next message
  setTimeout(showMessage, MESSAGE_SHOW_MS);
};

const updateMessages = () => {
  fetchMessages(lastTimestamp).then((resp) => resp.json()).then((data) => {
    data.forEach((message) => {
      if (message.timestamp > lastTimestamp) {
        lastTimestamp = message.timestamp;
      }
      messages.push(message);
    });
    triggerMessage();
  });

  // Schedule the next update
  setTimeout(updateMessages, MESSAGE_POLL_MS);
};

window.onload = () => {
  updateMessages();
};
