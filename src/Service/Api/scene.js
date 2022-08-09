const path = require('path')

const { defaultTo, find } = require('lodash')
const { Scene } = require('phaser')

const { Settings, SpriteType } = require('./enums')
const MatchState = require('./MatchState')
// const Orders = require('./Orders')
const ScoreTracker = require('./ScoreTracker')
 const SpriteItems = require('./sprites/items')
const {
    Star
} = require('./sprites/items')
const Player = require('./sprites/player')
const BugCloner = require('./sprites/bug_cloner')
/*
const Escalator = require('./sprites/escalator')
const Face = require('./sprites/face')
const Oven = require('./sprites/oven')
*/

const boxMap = {
    [SpriteType.STAR_BOX]: Star,
}

/*const ingredientsSet = new Set([
    SpriteType.CHOPPED_LETTUCE,
    SpriteType.CHOPPED_TOMATO,
    SpriteType.COOKED_BEEF,
])

const burgersSet = new Set([
    SpriteType.BURGER_BEEF,
    SpriteType.BURGER_BEEF_LETTUCE,
    SpriteType.BURGER_BEEF_TOMATO,
    SpriteType.BURGER_TOMATO,
    SpriteType.BURGER_TOMATO_LETTUCE,
    SpriteType.BURGER_LETTUCE,
])*/


class GameScene extends Scene {
    constructor() {
        super({ key: 'GameScene' })
        this.entityID = 1
        this.team = 0
    }

    getID() {
        return this.entityID++
    }

    getTeam() {
        // If the team increment is even, then the player will be assigned team 2, otherwise team 1
        this.team++
        return (this.team % 2) ? 1 : 2
    }

    prepareToSync(e) {
        const x = Math.round(e.x).toString(Settings.RADIX)
        const y = Math.round(e.y).toString(Settings.RADIX)
        const j = e.body.velocity.y < Settings.SHOW_ROCKET_VY ? 1:0 // is jumping
        const t = e.team ? e.team : 0
        const m = defaultTo(e.muted, false) ? 1 : 0
        return `${e.type},${e.entityID},${x},${y},${e.flipX ? 1:0},${e.flipY ? 1:0},${e.angle},${e.alpha},${e.anim ? 1:0},${j},${e.item ? 1:0},${t},${m},`
    }

    /**
     * Gets a mapping of channel ID to entity ID to help map audio/video streams to the correct player
     */
    getChannelEntityMap() {
        const channelEntityMap = {}
        this.io.connectionsManager.getConnections().forEach(conn => {
            channelEntityMap[conn.channel.id] = conn.channel.entityID
        })
        return channelEntityMap
    }

    getState() {
        let state = ''
        this.groups.forEach(group => {
            group.children.iterate(obj => {
                state += this.prepareToSync(obj)
            })
        })
        return state
    }

    preload() {
        this.load.image('star', path.join(__dirname, 'assets/star.png'))
        // this.load.tilemapTiledJSON('map', path.join(__dirname, '../../dist/assets/level-1.json'))
    }

    create() {
        this.io = this.game.geckos({
            // iceServers: [
            //     { urls: 'stun:stun1.l.google.com:19302' },
            //     { urls: 'stun:stun2.l.google.com:19302' },
            //     { urls: 'stun:stun3.l.google.com:19302' },
            //     { urls: 'stun:stun4.l.google.com:19302' },
            // ],
        })
        this.io.addServer(this.game.server)

        this.physics.world.setBounds(0, 0, Settings.LEVEL_WIDTH, Settings.LEVEL_HEIGHT)

        // Tracks match state
        this.matchState = new MatchState()

        this.facesGroup = this.physics.add.group({
            allowGravity: false,
            immovable: true,
            collideWorldBounds: true,
        })

        this.boxesGroup = this.physics.add.group({
            allowGravity: false,
            immovable: true,
            collideWorldBounds: true,
        })

        this.cowClonerGroup = this.physics.add.group({
            allowGravity: false,
            collideWorldBounds: true,
            // Haven't figured out how to make the player push the cloner correctly
            // using arcade physics. I'm not able to control the speed in which the
            // the cloner gets pushed. So for now, going to manually control the
            // logic for pushing cloner.
            //
            // One option may be to decrease the velocity of the player when they
            // are pushing the cloner.
            immovable: true,
        })

        this.itemsGroup = this.physics.add.group({
            angularVelocity: 0,
            allowGravity: false,
            immovable: true,
        })

        this.ingredientsGroup = this.physics.add.group({
            allowGravity: true,
            bounceY: 0.2,
            immovable: false,
            collideWorldBounds: true,
        })

        this.playersGroup = this.physics.add.group({
            bounceY: 0.2,
            collideWorldBounds: true,
        })

        this.respawnGroup = this.physics.add.group({
            allowGravity: false,
            immovable: true,
        })

        this.movingPlatforms = this.physics.add.group({
            allowGravity: false,
            immovable: true,
            collideWorldBounds: true,
        })

        this.knivesGroup = this.physics.add.group({
            angularVelocity: 0,
            allowGravity: false,
            immovable: false,
            collideWorldBounds: true,
        })

        this.ovensGroup = this.physics.add.group({
            allowGravity: false,
            angularVelocity: 0,
            collideWorldBounds: true,
            immovable: true,
        })

        // Keep track of all groups so we can apply game state updates more easily
        this.groups = [
            this.boxesGroup,
            this.cowClonerGroup,
            this.facesGroup,
            this.ingredientsGroup,
            this.itemsGroup,
            this.knivesGroup,
            this.movingPlatforms,
            this.ovensGroup,
            this.playersGroup,
            this.respawnGroup,
        ]

        const levelMap = this.make.tilemap({ key: 'map' })
        const tiles = levelMap.addTilesetImage('platform', 'platform', Settings.TILE_WIDTH, Settings.TILE_HEIGHT)

        // Add collisions to tile map
       // const worldLayer = levelMap.createDynamicLayer('platform', tiles).setCollision(1)

       /* // Add faces
        levelMap.getObjectLayer('faces')['objects'].forEach(face => {
            const team = find(face.properties, {name: 'Team'}).value
            const flipY = find(face.properties, {name: 'FlipY'}).value
            const angle = find(face.properties, {name: 'Angle'}).value
            const faceSprite = new Face(this, this.getID(), face.x + face.width / 2, face.y + face.height / 2, team)
            faceSprite.setAngle(angle).setFlipY(flipY)
            this.facesGroup.add(faceSprite)
        })
*/
        /*// Add ingredient boxes
        levelMap.getObjectLayer('boxes')['objects'].forEach(box => {
            this.boxesGroup.add(new SpriteItems[box.name](this, this.getID(), box.x, box.y))
        })*/
        this.boxesGroup.add(new SpriteItems[box.name](this, this.getID(), box.x, box.y))


        // Add cow cloners
        levelMap.getObjectLayer('cow_cloners')['objects'].forEach(cloner => {
            this.cowClonerGroup.add(new BugCloner(this, this.getID(), cloner.x + cloner.width / 2, cloner.y + cloner.height / 2))
        })
        /*
        // Add moving platforms
        levelMap.getObjectLayer('moving_platform')['objects'].forEach(escalator => {
            this.movingPlatforms.add(new Escalator(this, this.getID(), escalator.x, escalator.y))
        })

        // Add knives
        levelMap.getObjectLayer('knives')['objects'].forEach(knife => {
            this.knivesGroup.add(new Knife(this, this.getID(), knife.x, knife.y))
        })


        // Add ovens
        levelMap.getObjectLayer('ovens')['objects'].forEach(oven => {
            const flipX = find(oven.properties, {name: 'FlipX'}).value
            const ovenSprite = new Oven(this, this.getID(), oven.x + oven.width / 2, oven.y + oven.height / 2)
            ovenSprite.setFlipX(flipX)
            this.ovensGroup.add(ovenSprite)
        })*/

        // Event to handle falling into pits
        //
        // Technically it may be better to use an invisible hit box instead, but we'll go
        // with this for now.
        this.physics.world.on('worldbounds', this.onWorldBounds, this)

        /*this.physics.add.collider(this.ingredientsGroup, worldLayer)
        this.physics.add.collider(this.playersGroup, worldLayer)
        this.physics.add.collider(this.cowClonerGroup, worldLayer)
        this.physics.add.collider(this.ovensGroup, worldLayer)
        this.physics.add.collider(this.ingredientsGroup, this.boxesGroup)
        this.physics.add.collider(this.ingredientsGroup, this.ovensGroup)
        this.physics.add.collider(this.ingredientsGroup, this.movingPlatforms, this.onEscalatorLanding, null, this);
        this.physics.add.collider(this.playersGroup, this.movingPlatforms, this.onEscalatorLanding, null, this);
        this.physics.add.collider(this.playersGroup, this.boxesGroup, this.grabItemFromBlock, null, this)
        this.physics.add.collider(this.playersGroup, this.facesGroup, this.feedFace, null, this)
        this.physics.add.collider(this.ingredientsGroup, this.cowClonerGroup)
        this.physics.add.collider(this.playersGroup, this.cowClonerGroup, this.pushCloner, null, this)
        this.physics.add.overlap(this.playersGroup, this.ingredientsGroup, this.pickupItem, null, this)
        this.physics.add.overlap(this.playersGroup, this.knivesGroup, this.cutIngredient, null, this)
        this.physics.add.collider(this.playersGroup, this.ovensGroup, this.cookBeef, null, this)*/

      //  this.orders = new Orders(Array.from(burgersSet))

        let teamNames = []
        this.facesGroup.children.iterate(obj => teamNames.push(obj.team))
        this.scores = new ScoreTracker(teamNames, Settings.MIN_SCORE_TO_WIN_GAME)

        this.io.onConnection(async (channel) => {
            channel.onDisconnect(() => {
                console.log('Disconnect user ' + channel.id)
                let disconnectedPlayer = null
                this.playersGroup.children.each((player) => {
                    if (player.entityID === channel.entityID) {
                        disconnectedPlayer = player
                    }
                })
                if (disconnectedPlayer) {
                    const item = disconnectedPlayer.item
                    if (item) {
                        disconnectedPlayer.item = null
                        channel.room.emit('removeEntity', item.entityID)
                        item.removeEvents()
                        this.itemsGroup.remove(item, true, true)
                    }

                    disconnectedPlayer.removeEvents()
                    this.playersGroup.remove(disconnectedPlayer, true, true)
                    channel.room.emit('removeEntity', channel.entityID)
                }
            })

            channel.on('getID', () => {
                channel.entityID = this.getID()
                channel.emit('getID', channel.entityID.toString(Settings.RADIX))

                // Notify everyone when someone joins the game so we can add their stream
                channel.broadcast.emit('joinGame', `${channel.id},${channel.entityID}`, { reliable: true })
            })

            channel.on('playerMove', (data) => {
                this.playersGroup.children.iterate((player) => {
                    if (player.entityID === channel.entityID) {
                        player.setMove(data)
                    }
                })
            })

            channel.on('addPlayer', () => {
                this.playersGroup.add(
                    new Player(
                        this,
                        channel.entityID,
                        this.getTeam(),
                        Phaser.Math.RND.integerInRange(0, Settings.LEVEL_WIDTH),
                    )
                )
            })

            // Add a small delay to avoid a race condition with the ready event.
            // Without the delay, the ready event may be emitted before the client
            // has connected.
            await new Promise(resolve => setTimeout(resolve, 500))
            channel.emit('ready')
        })
    }

    onWorldBounds(body, _up, down, _left, _right) {
        // Handle events where player falls through a pit (bottom world bounds)
        if (!down) {
            return
        }
        // Get the sprite
        const sprite = body.gameObject
        if (sprite.type === SpriteType.PLAYER) {
            // When a player falls through a pit and respawns, items will be lost.
            if (sprite.item) {
                const item = sprite.item
                sprite.item = null
                this.io.room().emit('removeEntity', item.entityID)
                item.removeEvents()
                this.itemsGroup.remove(item, true, true)
            }
            sprite.respawn()
        } else {
            // Remove ingredients that fall through pit
            this.io.room().emit('removeEntity', sprite.entityID)
            sprite.removeEvents()
            this.ingredientsGroup.remove(sprite, true, true)
        }
    }


    pickupItem = (sprite, freeItem) => {
        console.log(sprite, freeItem)
        /*if (sprite.type !== SpriteType.PLAYER) {
            return
        }*/

        // this.io.room().emit('removeEntity', playerItem.entityID)
    }

    update(time) {
        let updates = ''

        if (this.matchState.hasEnded()) {
            if (this.matchState.isEndMatchTransitionReady()) {
                this.matchState.startEndMatchTransition(time)
                this.io.room().emit('updateMatchState', this.matchState.getState())
                // Freeze all players once the game has ended
                this.playersGroup.children.iterate(p => p.movementDisabled = true)
            } else if (this.matchState.isEndMatchTransitionDone(time)) {
                this.matchState.setActive()
                this.io.room().emit('updateMatchState', this.matchState.getState())

                // Reset game state

                // Remove player items
                this.playersGroup.children.each(player => {
                    const item = player.item
                    if (item) {
                        this.io.room().emit('removeEntity', item.entityID)
                        this.itemsGroup.remove(item, true, true)
                    }
                })

                // Remove ingredients
                this.ingredientsGroup.children.each(ingredient => {
                    this.io.room().emit('removeEntity', ingredient.entityID)
                    ingredient.removeEvents()
                    this.ingredientsGroup.remove(ingredient, true, true)
                }, this)

                // Generate new orders
                // this.orders.reset()
                // this.io.room().emit('updateOrders', this.orders.toArray())

                // Reset score
                this.scores.reset()
                this.io.room().emit('updateScores', this.scores.toArray())
            }
        }

        const syncSpriteData = (sprite) => {
            if (sprite.needsSync()) {
                updates += this.prepareToSync(sprite)
            }
            sprite.postUpdate()
        }

        this.groups.forEach(group => {
            group.children.iterate(syncSpriteData)
        })

        if (updates.length > 0) {
            this.io.room().emit('updateEntities', [updates])
        }
    }

    onEscalatorLanding(initiator, escalator) {
        if (!initiator.onEscalator) {
            initiator.onEscalator = true
            initiator.escalator = escalator
        }
    }
}

module.exports = GameScene
