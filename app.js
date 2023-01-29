var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server, {});
var mongoClient = require('mongodb').MongoClient;
let config = require('./config');
var constant = require('./constant')
var promise = require('promise');
var dbo;

var game = require('./game');
var Bullet = game.Bullet;
var Player = game.Player;

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/frontend/index.html');
});

app.use('/frontend', express.static(__dirname + '/frontend'));

server.listen(process.env.PORT || config.servePort);
console.log('Server Started! localhost: ' + config.servePort);




mongoClient.connect(config.mongoURL,{ useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
    if (err) throw err;
    dbo = db.db("shootme");

    dbo.collection(config.mongoRepo, function (err, res) {
        if (err) throw err;
        console.log("Collection created!");
    });

});

io.sockets.on('connection', function (socket) {

    socket.id = Math.random();
    constant.socketList[socket.id] = socket;
    console.log("Socket " + socket.id + " has connected");

    socket.on('signUp', function (userData) {
        isValidNewCredential(userData).then(function (res) {
            if (res)
                insertCredential(userData);
            socket.emit('signUpResponse', { success: res });
        })
    });

    socket.on('signIn', function (userData) {
        isCorrectCredential(userData).then(function (res) {
            if (res.valid)
                onConnect(socket, userData.username, res.points);
            socket.emit('signInResponse', { success: res.valid });
        })
    });

    socket.on('disconnect', function () {
        if (constant.socketList[socket.id] != null) {
            delete constant.socketList[socket.id];
            console.log(socket.id + " has disconnected");
        }
        var player = constant.playerList[socket.id];
        if (player != null) {
            toAllChat(player.username + " has disconnected.");

            var query = {
                username: player.username
            };
            var newValues = { $set: { points: player.points } };
            dbo.collection(config.mongoRepo).updateOne(query, newValues, function (err, res) {
                if (err) throw err;
                console.log("MongoDB Document Updated: " + res.result);
            });

            delete constant.playerList[socket.id];
        }
    });
});


function isValidNewCredential(userData) {
    return new Promise(function (callback) {
        var query = {
            username: userData.username
        };
        dbo.collection(config.mongoRepo).find(query).toArray(function (err, result) {
            if (err) throw err;
            if (result.length == 0) {
                console.log("user credential not taken yet: " + JSON.stringify(userData));
                callback(true);
            }
            else {
                callback(false);
                console.log("User credential already exist: " + JSON.stringify(result));
            }
        });
    });
}

function isCorrectCredential(userData) {
    return new Promise(function (callback) {
        var query = {
            username: userData.username,
            password: userData.password
        };
        dbo.collection(config.mongoRepo).find(query).toArray(function (err, result) {
            if (err) throw err;
            if (result.length != 0) {
                console.log("Matching Credential: " + JSON.stringify(result[0]));
                callback({ valid: true, points: result[0].points });
            }
            else {
                callback({ valid: false, points: null });
                console.log("incorrect user or password");
            }
        });
    });
}

function insertCredential(data) {
    var account = {
        username: data.username,
        password: data.password,
        points: 0
    };
    dbo.collection(config.mongoRepo).insertOne(account, function (err, res) {
        if (err) throw err;
        console.log("MongoDB Document Inserted: " + JSON.stringify(account));
    });
}

function toAllChat(line) {
    for (var i in constant.socketList)
    constant.socketList[i].emit('addToChat', line);
}

function onConnect(socket, name, points) {

    var player = Player(socket.id, name, points);
    constant.playerList[socket.id] = player;

    socket.on('keyPress', function (data) {            //glitchy character movement
        if (data.inputId === 'right')
            player.rightPress = data.state;
        else if (data.inputId === 'left')
            player.leftPress = data.state;
        else if (data.inputId === 'up')
            player.upPress = data.state;
        else if (data.inputId === 'down')
            player.downPress = data.state;

        if (data.inputId === 'shoot' && constant.playerList[socket.id] != null)
            player.shootBullet();
        else
            player.lastPosition = data.inputId;
    });

    socket.on('sendMsgToServer', function (data) {
        var playerName = ("" + player.username);
        toAllChat(playerName + ': ' + data);
    });

    socket.on('kms', function () {
        if (constant.playerList[socket.id] != null) {
            delete constant.playerList[socket.id];
        }
    });

    socket.on('revive', function () {
        if (constant.playerList[socket.id] == null) {
            constant.playerList[socket.id] = player;
        }
    });

    socket.on('charUpdate', function (data) {
        player.char = data.charName;
    });
}