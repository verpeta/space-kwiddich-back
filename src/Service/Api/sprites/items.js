const { SpriteType } = require('../enums')


class IngredientBox extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, entityID, x = -100, y = -100) {
        super(scene, x, y, '')
        this.scene = scene
        scene.add.existing(this)
        scene.physics.add.existing(this)

        this.entityID = entityID
        this.body.setSize(127, 127)
    }

    postUpdate() {}

    needsSync() {
        return false
    }
}

class StarBox extends IngredientBox {
    constructor(scene, entityID, x = -100, y = -100) {
        super(scene, entityID, x, y)
        this.type = SpriteType.STAR_BOX
    }
}

class BugBox extends IngredientBox {
    constructor(scene, entityID, x = -100, y = -100) {
        super(scene, entityID, x, y)
        this.type = SpriteType.BUG_BOX
    }
}

class Ingredient extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, entityID, x = -100, y = -100) {
        super(scene, x, y, '')

        this.scene = scene

        scene.add.existing(this)
        scene.physics.add.existing(this)

        this.setCollideWorldBounds(true)
        this.body.onWorldBounds = true

        this.entityID = entityID

        this.xPad = 0
        this.yPad = 10

        this.prevNoMovement = true
        this.prevX = -1
        this.prevY = -1

        this.anim = false
        this.move = {}

        this.onEscalator = false
        this.escalator = null

        this.minAngularVelocity = 350
        this.maxAngularVelocity = 550
        this.minVelocityX = 250
        this.maxVelocityX = 450
        this.minVelocityY = 200
        this.maxVelocityY = 300

        scene.events.on('update', this.update, this)
    }

    removeEvents() {
        this.scene.events.off('update', this.update, this)
    }

    positionOnPlayer(player) {
        this.x = player.x + this.xPad
        this.y = player.y - player.body.height + this.yPad
        this.angle = 0
        this.flipY = this.defaultFlipY
    }

    throw(playerFlipX) {
        this.body.angularVelocity = Phaser.Math.Between(this.minAngularVelocity, this.maxAngularVelocity)
        this.setVelocityY(-Phaser.Math.Between(this.minVelocityY, this.maxVelocityY))
        if (playerFlipX) {
            this.setVelocityX(-Phaser.Math.Between(this.minVelocityX, this.maxVelocityX))
        } else {
            this.setVelocityX(Phaser.Math.Between(this.minVelocityX, this.maxVelocityX))
        }
    }

    update() {
        if (this.body && this.body.onFloor()) {
            this.body.angularVelocity = 0
            this.setVelocityX(0)
            this.setVelocityY(0)
        }

        if (this.onEscalator) {
            this.body.angularVelocity = 0

            this.onEscalator = false
            this.escalator = null
        }
    }

    postUpdate() {
        this.prevX = this.x
        this.prevY = this.y
    }

    needsSync() {
        const x = Math.abs(this.x - this.prevX) > 0.5
        const y = Math.abs(this.y - this.prevY) > 0.5
        return (x || y)
    }
}

class Star extends Ingredient {
    constructor(scene, entityID, x = -100, y = -100) {
        super(scene, entityID, x, y)
        this.type = SpriteType.STAR
        this.body.setSize(118, 77)
        this.yPad = 20
    }
}

class Bug extends Ingredient {
    constructor(scene, entityID, x = -100, y = -100) {
        super(scene, entityID, x, y)
        this.type = SpriteType.BUG
        this.body.setSize(162, 185)
        this.defaultFlipY = true
        this.xPad = 30
        this.yPad = 30

        // Randomly change direction after every X milliseconds
        this.timeFromLastMove = 0
        this.newMoveDelay = 4000

        // If moveLeft is true, the cow will move left, otherwise move right
        this.moveLeft = true

        // Reference to cloner that the cow came from
        // Mainly used to keep track of the cows that have been created by the cloner
        // Not the best approach, so probably want to improve on this later
        this.clonerSource = null
    }

    removeEvents() {
        // TODO: May need to rename this function to be something more like clean up or something
        super.removeEvents()
        // Need to decrement cow count when the cow is removed from the game, this way new cows
        // can be created
        this.clonerSource.subtractBug()
        this.clonerSource = null
    }

    setClonerSource(cloner) {
        this.clonerSource = cloner
    }

    shootUp() {
        // Logic for shooting a cow from the cloner
        // Randomly pick the x/y velocities so the cows fall in different directions
        this.body.angularVelocity = 500
        this.setVelocityY(Phaser.Math.Between(-600, -1000))

        // Randomly pick velocity and also randomly pick direction of velocity
        this.setVelocityX(Phaser.Math.Between(200, 600) * (Phaser.Math.Between(0, 1) ? 1 : -1))
    }

    update(time) {
        if (this.body && this.body.onFloor()) {
            // When the cow lands it needs to:
            //   - stop spinning
            //   - land on its feet
            //   - flipped so it's right side up (since it is upside down when a player holds it)
            //   - stop horizontal movement
            //   - stop vertical movement
            this.body.angularVelocity = 0
            this.angle = 0
            this.flipY = false
            this.setVelocityX(0)
            this.setVelocityY(0)

            // TODO(richard-to): Improve cow movement logic
            // For now randomly pick a direction (left/right) after X milliseconds elapse
            if (this.timeFromLastMove + this.newMoveDelay <= time) {
                this.moveLeft = Phaser.Math.Between(0, 1) ? true : false
                this.timeFromLastMove = time
            }

            if (this.moveLeft) {
                this.setFlipX(true)
                this.setVelocityX(-50)
            } else {
                this.setFlipX(false)
                this.setVelocityX(50)
            }
        }

        if (this.onEscalator) {
            this.body.angularVelocity = 0

            this.onEscalator = false
            this.escalator = null
        }
    }
}

module.exports = {
    Star: Star,
    StarBox: StarBox,
    Bug: Bug,
    BugBox: BugBox,
}
