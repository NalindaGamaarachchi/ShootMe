const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server, {transports  : [ 'websocket' ]});
const mongoClient = require('mongodb').MongoClient;
const config = require('./src/data/config');
const constant = require('./src/data/constant');
const game = require('./src/model/game');

const app1 = require("./app");
toAllChat = app1.toAllChat
onConnect = app1.onConnect

describe('toAllChat integration tests', () => {
  let dbo;

  beforeAll(() => {
    mongoClient.connect(config.mongoURL, { useNewUrlParser: true, useUnifiedTopology: true }, (err, db) => {
      if (err) throw err;
      dbo = db.db("shootme");
      dbo.collection(config.mongoRepo, (err, res) => {
        if (err) throw err;
        console.log("Collection created!");
      });
    });
  });

  afterAll(() => {
    dbo.close();
  });

  it('sends a message to all connected clients', () => {
    let player1 = new game.Player();
    let player2 = new game.Player();
    constant.playerList[1] = player1;
    constant.playerList[2] = player2;

    player1.username = 'player1';
    player2.username = 'player2';

    const socket1 = {
      id: 1,
      emit: jest.fn()
    };
    const socket2 = {
      id: 2,
      emit: jest.fn()
    };

    constant.socketList[1] = socket1;
    constant.socketList[2] = socket2;

    toAllChat('test message');

    expect(socket1.emit).toHaveBeenCalledWith('addToChat', 'test message');
    expect(socket2.emit).toHaveBeenCalledWith('addToChat', 'test message');
  });
});



var socket = io.sockets.on('connection', function (socket) {
    socket.id = Math.random();
    constant.socketList[socket.id] = socket;
})

describe('onConnect integration tests', () => {
  afterAll(() => {
    server.close();
  });

  it('should successfully create a player object', () => {
    socket.emit('signUp', { username: 'test', password: 'password' });
    socket.emit('signIn', { username: 'test', password: 'password' });
    socket.on('signInResponse', response => {
      expect(response.success).toBe(true);
      expect(constant.playerList[socket.id]).toBeDefined();
    });
  });

  it('should successfully receive and broadcast chat messages', () => {
    socket.emit('sendMsgToServer', 'Test message');
    socket.on('addToChat', message => {
      expect(message).toContain('Test message');
    });
  });

});