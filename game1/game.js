const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y : 300 },
      debug: false,
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  }
}

const game = new Phaser.Game(config);

function preload () {
  // assets loading
  this.load.image('sky', 'assets/sky.png')
  this.load.image('ground', 'assets/platform.png')
  this.load.image('star', 'assets/star.png')
  this.load.image('bomb', 'assets/bomb.png')

  this.load.spritesheet('dude', 'assets/dude.png', {
    frameWidth: 32, frameHeight: 48
  })

}

let platforms
let player
let stars
let bombs
let score = 0
let scoreText
let gameOver = false

function create () {
  /* 
  The values 400 and 300 are the x and y coordinates of the image. 
  Why 400 and 300? It's because in Phaser 3 all Game Objects are 
  positioned based on their center by default. 
  The background image is 800 x 600 pixels in size, 
  so if we were to display it centered at 0 x 0 you'd only 
  see the bottom-right corner of it. If we display it at 400 x 300 
  you see the whole thing.

  Hint: You can use setOrigin to change this.
  */
  this.add.image(400, 300, 'sky')

  platforms = this.physics.add.staticGroup()
  
  // ground is a 400x32 green square so setScale make it 800x64
  platforms.create(400, 568, 'ground').setScale(2).refreshBody()
  platforms.create(600, 400, 'ground')
  platforms.create(50, 250, 'ground')
  platforms.create(750, 220, 'ground')

  /* 
  sprite creation
  The sprite was created via the Physics Game Object Factory (this.physics.add) 
  which means it has a Dynamic Physics body by default.
  */
  player = this.physics.add.sprite(100, 450, 'dude')

  //This means when it lands after jumping it will bounce ever so slightly
  player.setBounce(0.2)

  //It will stop the player from being able to run off the edges of the screen or jump through the top.
  player.setCollideWorldBounds(true)

  player.body.setGravityY(300)

  // animation create
  this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('dude', {start: 0, end: 3}),
    frameRate: 10,
    repeat: -1, //-1 means loop
  })

  this.anims.create({
    key: 'turn',
    frames: [{key: 'dude', frame: 4}],
    frameRate: 20
  })

  this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('dude', {start: 5, end: 8}),
    frameRate: 10,
    repeat: -1
  })


  this.physics.add.collider(player, platforms)

  /*
  setXY: this is used to set the position of the 12 children the Group creates. 
  Each child will be placed starting at x: 12, y: 0 and with an x step of 70.
  */ 
  stars = this.physics.add.group({
    key: 'star',
    repeat: 11,
    setXY: {x: 12, y: 0, stepX: 70}
  })

  stars.children.iterate(function (child) {
    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8))
  })

  this.physics.add.collider(stars, platforms)

  this.physics.add.overlap(player, stars, collectStar, null, this)

  bombs = this.physics.add.group()
  this.physics.add.collider(bombs, platforms)
  this.physics.add.collider(player, bombs, hitBomb, null, this)

  // SCORE
  scoreText = this.add.text(16, 16, 'score: 0', {fontSize: '32px', fill: '#000'})

}


let cursors;

function update () {
  cursors = this.input.keyboard.createCursorKeys()
  
  if (gameOver) return 
  
  if (cursors.left.isDown) {
    player.setVelocityX(-160)
    player.anims.play('left', true)    
  }
  else if (cursors.right.isDown) {
    player.setVelocityX(160)
    player.anims.play('right', true)
  }
  else {
    player.setVelocityX(0)
    player.anims.play('turn')
  }

  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-480)
  }

}


function collectStar (player, star) {
  star.disableBody(true, true)  
  score += 10
  scoreText.setText('Score: ' + score)

  if (stars.countActive(true) === 0) {
    
    stars.children.iterate(function (child) {
      child.enableBody(true, child.x, 0, true, true)
    })

    let x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400)
    let bomb = bombs.create(x, 16, 'bomb')
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true)
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20)
  }
}

function hitBomb (player, bomb) {
  this.physics.pause()
  player.setTint(0xff0000)
  player.anims.play('turn')
  gameOver = true
}