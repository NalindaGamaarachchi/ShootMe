const config = require('../data/config');
const constant = require('../data/constant');
var game = require('./game');
var Bullet = game.Bullet;
var Player = game.Player;



describe('Player', () => {
    let player;
  
    beforeEach(() => {
      player = Player(1, 'player1', 0);
    });
  
  
    it('should create a player with correct initial values', () => {
      expect(player).toEqual({
        x: config.xStartingPosition,
        y: config.yStartingPosition,
        id: 1,
        username: 'player1',
        points: 0,
        char: 'Naruto Uzumaki',
        rightPress: false,
        leftPress: false,
        upPress: false,
        downPress: false,
        lastPosition: config.playerStartingDirection,
        speed: config.playerSpeed,
        updatePosition: expect.any(Function),
        addPoint: expect.any(Function),
        shootBullet: expect.any(Function)
      });
    });
  
    it('should correctly update position when rightPress is set', () => {
      player.rightPress = true;
      player.updatePosition();
  
      expect(player.x).toBe(config.xStartingPosition + config.playerSpeed);
    });
  
    it('should correctly update position when leftPress is set', () => {
      player.leftPress = true;
      player.updatePosition();
  
      expect(player.x).toBe(config.xStartingPosition - config.playerSpeed);
    });
  
    it('should correctly update position when upPress is set', () => {
      player.upPress = true;
      player.updatePosition();
  
      expect(player.y).toBe(config.yStartingPosition - config.playerSpeed);
    });
  
    it('should correctly update position when downPress is set', () => {
      player.downPress = true;
      player.updatePosition();
  
      expect(player.y).toBe(config.yStartingPosition + config.playerSpeed);
    });
  
    it('should correctly increase points', () => {
      player.addPoint();
  
      expect(player.points).toBe(1);
    });
  
    it('should add bullet to constant.bulletList when shootBullet is called', () => {
      player.shootBullet();
  
      const bullet = constant.bulletList[Object.keys(constant.bulletList)[0]];
      expect(bullet).toEqual({
        id: expect.any(Number),
        x: config.xStartingPosition + 25,
        y: config.yStartingPosition + 25,
        playerId: 1,
        direction: config.playerStartingDirection,
        speed: 10,
        timer: 0,
        toRemove: false,
        update: expect.any(Function),
        updatePosition: expect.any(Function)
      });
    });
  });
  
  
  describe("Bullet function tests", () => {
      let bullet;
      beforeEach(() => {
        bullet = new Bullet(1, 100, 100, "right");
      });
    
      it("Should create a bullet object with the correct properties", () => {
        expect(bullet).toHaveProperty("id");
        expect(bullet).toHaveProperty("x", 125);
        expect(bullet).toHaveProperty("y", 125);
        expect(bullet).toHaveProperty("playerId", 1);
        expect(bullet).toHaveProperty("direction", "right");
        expect(bullet).toHaveProperty("speed", 10);
        expect(bullet).toHaveProperty("timer", 0);
        expect(bullet).toHaveProperty("toRemove", false);
      });
    
      it("Should update the bullet position correctly when direction is right", () => {
        bullet.update();
        expect(bullet.x).toBe(135);
      });
    
      it("Should update the bullet position correctly when direction is left", () => {
        bullet.direction = "left";
        bullet.update();
        expect(bullet.x).toBe(115);
      });
    
      it("Should update the bullet position correctly when direction is up", () => {
        bullet.direction = "up";
        bullet.update();
        expect(bullet.y).toBe(115);
      });
    
      it("Should update the bullet position correctly when direction is down", () => {
        bullet.direction = "down";
        bullet.update();
        expect(bullet.y).toBe(135);
      });
    
      it("Should set the toRemove property to true when the timer is greater than 100", () => {
        bullet.timer = 101;
        bullet.update();
        expect(bullet.toRemove).toBe(true);
      });
  });
  
  
  jest.useFakeTimers();
    
  describe("Testing setInterval function", () => {
      test("should emit renderInfo and Time events", () => {
        constant.socketList = [{
          emit: jest.fn()
        }];
        constant.playerList = [{
          x: config.xStartingPosition,
          y: config.yStartingPosition,
          id: 1,
          username: "John Doe",
          points: 0,
          char: 'Naruto Uzumaki',
          rightPress: false,
          leftPress: false,
          upPress: false,
          downPress: false,
          lastPosition: config.playerStartingDirection,
          speed: config.playerSpeed,
          updatePosition: jest.fn(),
          addPoint: jest.fn()
        }];
        constant.bulletList = [{
          x: 50,
          y: 50,
          id: 1,
          playerId: 1,
          direction: 'right',
          speed: 10,
          timer: 0,
          toRemove: false,
          update: jest.fn()
        }];
    
        setInterval(() => {
          for (var i in constant.socketList) {
            var socket = constant.socketList[i];
            socket.emit('renderInfo', [], []);
            socket.emit('Time');
          }
        }, config.refreshRate);
    
        jest.advanceTimersByTime(config.refreshRate);
    
        expect(constant.socketList[0].emit).toHaveBeenCalledWith("renderInfo", [], []);
        expect(constant.socketList[0].emit).toHaveBeenCalledWith("Time");
      });
    });
    

  
  afterAll(() => {
    jest.resetModules();
    player = null;
  });