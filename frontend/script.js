var socket = io();

var signInBox = document.getElementById('signInBox');
var signInBoxUser = document.getElementById('signInBox-user');
var signInBoxPass = document.getElementById('signInBox-pass');
var signInBoxSignIn = document.getElementById('signInBox-signIn');
var signInBoxSignUp = document.getElementById('signInBox-signUp');
var hideButton = document.getElementById('hide-button');
var unhideButton = document.getElementById('unhide-button');
var timeStamp = document.getElementById('timeStamp');
var playerListDisplay = document.getElementById('player-list');

var charImg = new Image();
charImg.src = '/frontend/assets/Naruto Uzumaki.png';
var imgFrameIndex = 50;
var imgWidth = 50;
var imgHeight = 60;


signInBoxSignIn.onclick = function () {
    socket.emit('signIn', { username: signInBoxUser.value.trim(), password: signInBoxPass.value.trim() });
};

signInBoxSignUp.onclick = function () {
    socket.emit('signUp', { username: signInBoxUser.value.trim(), password: signInBoxPass.value.trim() });
};

hideButton.onclick = function () {
    socket.emit('hide');
};

unhideButton.onclick = function () {
    socket.emit('unhide');
};

socket.on('signUpResponse', function (data) {
    if (data.success) {
        alert("Sign Up Successful! Log in with Your Username and Password!")
    }
    else
        alert("Sign Up unsuccessful! Name already taken!");
});

socket.on('signInResponse', function (data) {
    if (data.success) {
        signInBox.style.display = 'none';
        background.style.display = 'none';
        gameDiv.style.display = 'inline-block';
    }
    else
        alert("Sign in unsuccessful");
});

var chatText = document.getElementById('chat-text');
var chatForm = document.getElementById('chat-form');
var chatInput = document.getElementById('chat-input');
var canvas = document.getElementById('myCanvas').getContext("2d");
canvas.font = '15px Arial';

socket.on('addToChat', function (data) {
    chatText.innerHTML += '<div>' + data + '</div>';
    chatText.scrollTop = chatText.scrollHeight;
});

function inTextField(event) {
    var elem = event.target || event.srcElement;
    if (elem.nodeType == 3)
        elem = elem.parentNode;

    return (elem.tagName == "TEXTAREA" ||
        (elem.tagName == "INPUT" && (elem.getAttribute("type") == "text")));
}

chatForm.onsubmit = function (event) {
    event.preventDefault();
    if (chatInput.value.substring(0, 1) === "/")
        socket.emit('sendCommandToServer', chatInput.value.substring(1, chatInput.value.length));

    socket.emit('sendMsgToServer', chatInput.value);

    chatInput.value = '';
};


socket.on('renderInfo', function (playerData,bulletData) {
    canvas.clearRect(0, 0, 1100, 500);

    playerListDisplay.innerHTML = '';

    for (var player of playerData) {
        canvas.fillText(player.username + ": " + player.points, player.x, player.y);
        playerListDisplay.innerHTML += '<div>' + player.username + ': ' + player.points + '</div>';

        drawChar(player);
    }

    for (var bullet of bulletData){
        drawBullet(bullet);
    }
});



socket.on('Time', function () {
    var date = Date().slice(4, 24);
    timeStamp.innerHTML = date;
});

document.onkeydown = function (event) {
    if (!inTextField(event)) {
        if (event.keyCode === 68) //d
            socket.emit('keyPress', { inputId: 'right', state: true });
        else if (event.keyCode === 83)  //s
            socket.emit('keyPress', { inputId: 'down', state: true });
        else if (event.keyCode === 65) //a
            socket.emit('keyPress', { inputId: 'left', state: true });
        else if (event.keyCode === 87) //w
            socket.emit('keyPress', { inputId: 'up', state: true });
        else if (event.keyCode === 88) //x
            socket.emit('keyPress', { inputId: 'shoot', state: true });
    }
};

document.onkeyup = function (event) {
    if (!inTextField(event)) {
        if (event.keyCode === 68) //d
            socket.emit('keyPress', { inputId: 'right', state: false });
        else if (event.keyCode === 83)  //s
            socket.emit('keyPress', { inputId: 'down', state: false });
        else if (event.keyCode === 65) //a
            socket.emit('keyPress', { inputId: 'left', state: false });
        else if (event.keyCode === 87) //w
            socket.emit('keyPress', { inputId: 'up', state: false });
        else if (event.keyCode === 88) //x
            socket.emit('keyPress', { inputId: 'shoot', state: false });
    }
};

function drawChar(player) {

    var playersImg = new Image();
    playersImg.src = '/frontend/assets/' + player.char + '.png';

    switch (player.lastPosition) {
        case 'down':
            canvas.drawImage(playersImg, 0, 0, imgWidth, imgHeight, player.x, player.y, imgWidth, imgHeight);
            break;
        case 'up':
            canvas.drawImage(playersImg, imgFrameIndex, 0, imgWidth, imgHeight, player.x, player.y, imgWidth, imgHeight);
            break;
        case 'left':
            canvas.drawImage(playersImg, imgFrameIndex * 2, 0, imgWidth, imgHeight, player.x, player.y, imgWidth, imgHeight);
            break;
        case 'right':
            canvas.drawImage(playersImg, imgFrameIndex * 3, 0, imgWidth, imgHeight, player.x, player.y, imgWidth, imgHeight);
            break;
    }
}

function drawBullet(bullet){
    var bulletImg = new Image();
    bulletImg.src = '/frontend/assets/bullet.png';

    canvas.drawImage(bulletImg, 0, 0, imgWidth, imgHeight, bullet.x, bullet.y, imgWidth, imgHeight);
}

function UpdateCharModel(name) {
    charImg.src = '/frontend/assets/' + name + '.png';
    socket.emit('charUpdate', { charName: name });
}

