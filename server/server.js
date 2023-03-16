const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const cors = require('cors');
app.use(cors());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const messages = []; // create an array to store messages

io.on('connection', (socket) => {
  console.log('a user connected - socket id:', socket.id);

  // send previous messages to the new client
  socket.emit('previousMessages', messages);

  // Handle incoming messages
  socket.on('message', (message) => {
    console.log('Received message:', message);
    // Get the current date and time as a string in a custom format
    let now = new Date();
    let dateString = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    let timeString = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    let dateTime = `${dateString} ${timeString}`;
    let userMsg = dateTime + ' - ' + socket.id + ': ' + message;
    messages.push(userMsg); // add the message to the array
    // Broadcast the message to all connected clients
    io.emit('message', userMsg);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

app.use(express.json());

app.get('/fetchMessages', (req, res) => {
  // Do something with the data
  res.send(messages);
});

// Start the server
const port = process.env.PORT || 3001;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
