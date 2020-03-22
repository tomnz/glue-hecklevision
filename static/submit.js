const submit = () => {
  const responseEl = document.getElementById('response');
  const userName = document.getElementById('userName').value;
  if (!userName) {
    responseEl.innerText = 'Must provide a name!';
    return;
  }
  const textEl = document.getElementById('text');
  const text = textEl.value;
  if (!text) {
    responseEl.innerText = 'Must provide a message!';
    return;
  }

  fetch(window.location.href, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: [
      `user_name=${encodeURIComponent(userName)}`,
      `text=${encodeURIComponent(text)}`
    ].join('&'),
  }).then((resp) => resp.json()).then((data) => {
    responseEl.innerText = data.text;
    textEl.value = '';
    textEl.focus();
  });
};

document.getElementById('submit').onclick = submit;
