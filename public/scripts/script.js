const P2P = require('socket.io-p2p');
const io = require('socket.io-client');

const params = new URLSearchParams(window.location.search);

const socket = io({ query: { username: params.get('username') } });
const p2p = new P2P(socket);

const chatMessage = document.querySelector('#chat-messages');
const form = document.querySelector('#send-message');
const message = document.querySelector('#text-message');
const users = document.querySelector('#contacts .users');

const state = {
  self: {
    elements: {
      username: document.querySelector('.self > div > h2'),
      ip: document.querySelector('.self .ip')
    }
  },
  users: []
};

function updateUsers() {
  users.innerHTML = "";

  state.users.forEach(user => {
    const userElement = document.createElement('div');
    const userNameElement = document.createElement('h3');
    const userAddressElement = document.createElement('div');

    const userNameText = document.createTextNode(user.username);
    const userAddressText = document.createTextNode(`${user.address.address}:${user.address.port}`);

    userElement.classList.add('user');
    userAddressElement.classList.add('address');

    userElement.appendChild(userNameElement);
    userElement.appendChild(userAddressElement);

    userNameElement.appendChild(userNameText);
    userAddressElement.appendChild(userAddressText);

    users.appendChild(userElement);
  });
}

p2p.on('self-setup', (user) => {
  state.self.id = user.id;
  state.self.username = user.username;
  state.self.address = user.address;

  state.self.elements.username.innerHTML = state.self.username;
  state.self.elements.ip.innerHTML = `${state.self.address.address}:${state.self.address.port}`;
});

p2p.on('setup', (data) => {
  state.users = data.filter(user => user.id !== state.self.id);
  updateUsers();
});

p2p.on('add-user', (user) => {
  state.users.push(user);
  updateUsers();
});

p2p.on('remove-user', (user) => {
  state.users = state.users.filter(item => item.id !== user.id);
  updateUsers();
});

p2p.on('peer-msg', (data) => {
  const messageItemElement = document.createElement('div');
  const messageElement = document.createElement('div');
  const whoElement = document.createElement('div');

  const whoText = document.createTextNode(data.who);
  const messageText = document.createTextNode(data.message);

  whoElement.classList.add('who');
  messageItemElement.classList.add('message-item');
  messageElement.classList.add('message');

  chatMessage.appendChild(messageItemElement);
  messageItemElement.appendChild(whoElement);
  messageItemElement.appendChild(messageElement);
  messageElement.appendChild(messageText);
  whoElement.appendChild(whoText);
});

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const messageItemElement = document.createElement('div');
  const messageElement = document.createElement('div');
  const textElement = document.createTextNode(message.value);

  messageItemElement.classList.add('message-item', 'message-user');
  messageElement.classList.add('message');

  chatMessage.appendChild(messageItemElement);
  messageItemElement.appendChild(messageElement);
  messageElement.appendChild(textElement);

  p2p.emit('peer-msg', {
    who: state.self.username,
    message: message.value
  });

  form.reset();
});
