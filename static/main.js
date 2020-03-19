const MESSAGE_POLL_MS = 1000;
const MESSAGE_SHOW_MS = 20000;

let lastTimestamp = new Date().getTime() / 1000;

const fetchMessages = async after => {
  return fetch(`/get?after=${after}`);
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

      const messageEl = document.createElement('div');
      messageEl.classList.add('message');

      messageEl.appendChild(authorEl);
      messageEl.appendChild(document.createTextNode(': '));
      messageEl.appendChild(textEl);

      messagesEl.insertBefore(messageEl, messagesEl.children[0]);

      setTimeout(() => {
        messagesEl.removeChild(messageEl);
      }, MESSAGE_SHOW_MS)
    });
  });

  // Schedule the next update
  setTimeout(updateMessages, MESSAGE_POLL_MS);
};

window.onload = () => {
  updateMessages();
};
