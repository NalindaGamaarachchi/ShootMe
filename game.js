let config = require('./config');
var constant = require('./constant')

var Bullet = function (playerId,posX,posY,direction) {
    var bullet = {
        id: Math.random(),
        x: posX + 25,
        y: posY + 25,
        playerId: playerId,
        direction: direction,
        speed: 10,
        timer: 0,
        toRemove: false,
    };

    bullet.update = function(){
        bullet.updatePosition();
        if (bullet.timer++ > 100)
        bullet.toRemove = true;
    };

    bullet.updatePosition = function(){
    if (bullet.direction === 'right')
        bullet.x += bullet.speed;
    else if (bullet.direction === 'left')
        bullet.x -= bullet.speed;
    else if (bullet.direction === 'up')
        bullet.y -= bullet.speed;
    else if (bullet.direction === 'down')
        bullet.y += bullet.speed;
    };

    return bullet;
}

var Player = function (id, name, points) {
    var player = {
        x: config.xStartingPosition,
        y: config.yStartingPosition,
        id: id,
        username: name,
        points: points,
        char: 'Naruto Uzumaki',

        rightPress: false,
        leftPress: false,
        upPress: false,
        downPress: false,
        lastPosition: config.playerStartingDirection,

        speed: config.playerSpeed
    };

    player.updatePosition = function () {
        if (player.rightPress)
            player.x += player.speed;
        if (player.leftPress)
            player.x -= player.speed;
        if (player.upPress)
            player.y -= player.speed;
        if (player.downPress)
            player.y += player.speed;
    };

    player.addPoint = function () {
        player.points++;
    };

    player.shootBullet = function (){
        var bullet = Bullet(player.id,player.x,player.y,player.lastPosition);
        constant.bulletList[bullet.id] = bullet;
    };

    return player;
};

setInterval(function () {
    var pack = [];

    for (var i in constant.playerList) {
        var player = constant.playerList[i];
        player.updatePosition();
        pack.push({
            x: player.x,
            y: player.y,
            username: player.username,
            points: player.points,
            lastPosition: player.lastPosition,
            char: player.char
        });
    }

    var bulletPack = [];

    for (var i in constant.bulletList) {

        if (constant.bulletList[i].toRemove === true) {
            delete constant.bulletList[i];
        }
        else{
            var bullet = constant.bulletList[i];
            bullet.update();
            
            for (var i in constant.playerList) {
                var player = constant.playerList[i];
                if (bullet.x > player.x && bullet.x < player.x + 50 && bullet.y > player.y && bullet.y < player.y + 60){
                    if (player.id != bullet.playerId)
                    constant.playerList[bullet.playerId].addPoint();
                }
            }


            bulletPack.push({
                x: bullet.x,
                y: bullet.y,
                playerId: bullet.playerId
            });
        }
    }
    

    for (var i in constant.socketList) {
        var socket = constant.socketList[i];
        socket.emit('renderInfo', pack, bulletPack);
        socket.emit('Time');
    }
}, config.refreshRate);
  
  module.exports = {
    Bullet: Bullet,
    Player: Player
  };