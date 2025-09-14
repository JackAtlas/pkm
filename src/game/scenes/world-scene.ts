import {
  TILE_ASSET_KEYS,
  WORLD_ASSET_KEYS
} from '@/assets/asset-keys'
import { DIRECTION } from '@/common/direction'
import {
  DEBUG,
  TILE_SIZE,
  TILED_COLLISION_LAYER_ALPHA
} from '@/config'
import { Controls } from '@/utils/controls'
import {
  DATA_MANAGER_STORE_KEYS,
  dataManager
} from '@/utils/data-manager'
import { getTargetPositionFromGameObjectPositionAndDirection } from '@/utils/grid-utils'
import {
  CANNOT_READ_SIGN_TEXT,
  SAMPLE_TEXT
} from '@/utils/text-utils'
import { DialogUI } from '@/world/characters/dialog-ui'
import {
  NPC,
  NPC_MOVEMENT_PATTERN,
  NpcMovementPattern,
  NPCPath
} from '@/world/characters/npc'
import { Player } from '@/world/characters/player'
import { SCENE_KEYS } from './scene-keys'

const TILED_SIGN_PROPERTY = Object.freeze({
  MESSAGE: 'message'
})

const CUSTOM_TILED_TYPES = Object.freeze({
  NPC: 'npc',
  NPC_PATH: 'npc_path'
})

const TILED_NPC_PROPERTY = Object.freeze({
  IS_SPAWN_POINT: 'is_spawn_point',
  MOVEMENT_PATTERN: 'movement_pattern',
  MESSAGES: 'messages',
  FRAME: 'frame',
  ASSET_KEY: 'asset_key'
})

type TypeMap = {
  string: string
  number: number
  boolean: boolean
}

type Property<K extends keyof TypeMap = keyof TypeMap> = {
  name: string
  type: K
  value: TypeMap[K]
}

export class WorldScene extends Phaser.Scene {
  protected _fpsText!: Phaser.GameObjects.Text
  protected _player: Player
  protected _controls: Controls
  protected _dialogUI: DialogUI
  protected _encounterLayer: Phaser.Tilemaps.TilemapLayer
  protected _wildPkmEncountered: boolean
  protected _signLayer: Phaser.Tilemaps.ObjectLayer | null

  protected _npcs: NPC[] = []
  protected _npcPlayerIsInteractingWith: NPC | null = null

  constructor() {
    super({
      key: SCENE_KEYS.WORLD_SCENE
    })
  }

  init() {
    this._wildPkmEncountered = false
  }

  create() {
    console.log(`[${WorldScene.name}: create] invoked`)

    this.cameras.main.setBounds(0, 0, 1920, 1920)

    const map = this.make.tilemap({
      key: WORLD_ASSET_KEYS.WORLD_MAIN_LEVEL
    })

    const collisionTiles = map.addTilesetImage(
      'Red',
      TILE_ASSET_KEYS.RED_TILE
    )
    if (!collisionTiles) {
      console.error(
        `[${WorldScene.name}: create] encountered error while creating collision tiles using data from tiled`
      )
      return
    }
    const collisionLayer = map.createLayer(
      'COLLISION',
      collisionTiles,
      0,
      0
    )
    if (!collisionLayer) {
      console.error(
        `[${WorldScene.name}: create] encountered error while creating collision layer using data from tiled`
      )
      return
    }
    collisionLayer
      .setAlpha(DEBUG ? TILED_COLLISION_LAYER_ALPHA : 0)
      .setDepth(2)

    this._signLayer = map.getObjectLayer('SIGNS')
    if (!this._signLayer) {
      console.error(
        `[${WorldScene.name}: create] encountered error while creating sign layer using data from tiled`
      )
      return
    }

    const encounterTiles = map.addTilesetImage(
      'Yellow',
      TILE_ASSET_KEYS.YELLOW_TILE
    )
    if (!encounterTiles) {
      console.error(
        `[${WorldScene.name}: create] encountered error while creating encounter tiles using data from tiled`
      )
      return
    }
    const encounterLayer = map.createLayer(
      'ENCOUNTER',
      encounterTiles,
      0,
      0
    )
    if (!encounterLayer) {
      console.error(
        `[${WorldScene.name}: create] encountered error while creating encounter layer using data from tiled`
      )
      return
    }
    this._encounterLayer = encounterLayer
    this._encounterLayer
      .setAlpha(DEBUG ? TILED_COLLISION_LAYER_ALPHA : 0)
      .setDepth(2)

    this._fpsText = this.add
      .text(this.scale.width - 10, 10, '', {
        fontFamily: 'sans-serif',
        color: '#ffffff'
      })
      .setOrigin(1, 0)

    this.add
      .image(0, 0, WORLD_ASSET_KEYS.WORLD_BACKGROUND, 0)
      .setOrigin(0)

    // 生成 NPC
    this._createNPCs(map)

    // 生成玩家
    this._player = new Player({
      scene: this,
      position: dataManager.store.get(
        DATA_MANAGER_STORE_KEYS.PLAYER_POSITION
      ),
      direction: dataManager.store.get(
        DATA_MANAGER_STORE_KEYS.PLAYER_DIRECTION
      ),
      collisionLayer,
      spriteGridMovementFinishedCallback: () => {
        this._handlePlayerMovementUpdate()
      },
      otherCharactersToCheckForCollisionsWith: this._npcs
    })

    this._npcs.forEach((npc) => {
      npc.addCharacterToCheckForCollisionsWith(this._player)
    })

    this.add
      .image(0, 0, WORLD_ASSET_KEYS.WORLD_FOREGROUND, 0)
      .setOrigin(0)

    // TODO const centerCamera = this.cameras.add(x, y, width, height)
    // centerCamera.setBounds(0, 0, mapWidth, mapHeight)
    // centerCamera.startFollow(this._player.sprite, true)
    this.cameras.main.startFollow(this._player.sprite, true)

    this._controls = new Controls(this)

    this._dialogUI = new DialogUI(this, this.scale.width)

    this.cameras.main.fadeIn(1000, 0, 0, 0)
  }

  update(time: DOMHighResTimeStamp) {
    if (this._wildPkmEncountered) {
      this._player.update(time)
      return
    }

    const fps = this.game.loop.actualFps.toFixed(1)
    this._fpsText.setText(`FPS: ${fps}`)

    const selectedDirection =
      this._controls.getDirectionKeyPressedDown()
    if (
      selectedDirection !== DIRECTION.NONE &&
      !this._isPlayerInputLocked()
    ) {
      this._player.moveCharacter(selectedDirection)
    }

    if (
      this._controls.wasSpaceKeyPressed() &&
      !this._player.isMoving
    ) {
      this._handlePlayerInteraction()
    }

    this._player.update(time)

    this._npcs.forEach((npc) => {
      npc.update(time)
    })
  }

  _handlePlayerInteraction() {
    if (this._dialogUI.isAnimationPlaying) return

    if (
      this._dialogUI.isVisible &&
      !this._dialogUI.moreMessagesToShow
    ) {
      this._dialogUI.hideDialogModel()
      if (this._npcPlayerIsInteractingWith) {
        this._npcPlayerIsInteractingWith.isTalkingToPlayer = false
        this._npcPlayerIsInteractingWith = null
      }
      return
    }

    if (
      this._dialogUI.isVisible &&
      this._dialogUI.moreMessagesToShow
    ) {
      this._dialogUI.showNextMessage()
      return
    }

    const { x, y } = this._player.sprite
    const targetPosition =
      getTargetPositionFromGameObjectPositionAndDirection(
        { x, y },
        this._player.direction
      )
    const nearbySign = this._signLayer?.objects.find((object) => {
      if (!object.x || !object.y) return
      return (
        object.x === targetPosition.x &&
        object.y - TILE_SIZE === targetPosition.y
      )
    })
    if (nearbySign) {
      const props = nearbySign.properties
      const message = props.find(
        (prop: Property) => prop.name === TILED_SIGN_PROPERTY.MESSAGE
      )?.value

      const usePlaceholderText =
        this._player.direction !== DIRECTION.UP

      let textToShow = CANNOT_READ_SIGN_TEXT
      if (!usePlaceholderText) {
        textToShow = message || SAMPLE_TEXT
      }
      this._dialogUI.showDialogModel([textToShow])
      return
    }

    const nearbyNPC = this._npcs.find((npc) => {
      return (
        npc.sprite.x === targetPosition.x &&
        npc.sprite.y === targetPosition.y
      )
    })
    if (nearbyNPC) {
      nearbyNPC.facePlayer(this._player.direction)
      nearbyNPC.isTalkingToPlayer = true
      this._npcPlayerIsInteractingWith = nearbyNPC
      this._dialogUI.showDialogModel(nearbyNPC.messages)
    }
  }

  _handlePlayerMovementUpdate() {
    dataManager.store.set(DATA_MANAGER_STORE_KEYS.PLAYER_POSITION, {
      x: this._player.sprite.x,
      y: this._player.sprite.y
    })
    dataManager.store.set(
      DATA_MANAGER_STORE_KEYS.PLAYER_DIRECTION,
      this._player.direction
    )

    if (!this._encounterLayer) return

    const isInEncounterZone =
      this._encounterLayer.getTileAtWorldXY(
        this._player.sprite.x,
        this._player.sprite.y,
        true
      ).index !== -1
    if (!isInEncounterZone) return

    console.log(
      `[${WorldScene.name}: _handlePlayerMovementUpdate] player is in an encounter zone`
    )
    this._wildPkmEncountered = Math.random() < 0.2
    if (this._wildPkmEncountered) {
      console.log(
        `[${WorldScene.name}: _handlePlayerMovementUpdate] player encountered a wild pkm`
      )
      this.cameras.main.fadeOut(2000)
      this.cameras.main.once(
        Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
        () => {
          this.scene.start(SCENE_KEYS.BATTLE_SCENE)
        }
      )
    }
  }

  _isPlayerInputLocked() {
    return this._dialogUI.isVisible
  }

  _createNPCs(map: Phaser.Tilemaps.Tilemap) {
    const npcLayers = map
      .getObjectLayerNames()
      .filter((name) => name.includes('NPC'))
    npcLayers.forEach((name) => {
      const layer = map.getObjectLayer(name)

      const npcObject = layer?.objects.find(
        (obj) => obj.type === CUSTOM_TILED_TYPES.NPC
      )
      if (
        !npcObject ||
        npcObject.x === undefined ||
        npcObject.y === undefined
      ) {
        return
      }

      const pathObjects = layer?.objects.filter((obj) => {
        return obj.type === CUSTOM_TILED_TYPES.NPC_PATH
      })
      const npcPath: NPCPath = {
        0: { x: npcObject.x, y: npcObject.y - TILE_SIZE }
      }
      pathObjects?.forEach((obj) => {
        if (obj.x === undefined || obj.y === undefined) return

        npcPath[parseInt(obj.name, 10)] = {
          x: obj.x,
          y: obj.y - TILE_SIZE
        }
      })

      const npcFrame =
        npcObject.properties.find(
          (property: Property) =>
            property.name === TILED_NPC_PROPERTY.FRAME
        )?.value || '0'
      const npcAssetKey =
        npcObject.properties.find(
          (property: Property) =>
            property.name === TILED_NPC_PROPERTY.ASSET_KEY
        )?.value || 'NPC_01'
      const npcMessagesString =
        npcObject.properties.find(
          (property: Property) =>
            property.name === TILED_NPC_PROPERTY.MESSAGES
        )?.value || ''
      const npcMessages = npcMessagesString.split('::')
      const npcMovement =
        (npcObject.properties.find(
          (property: Property) =>
            property.name === TILED_NPC_PROPERTY.MOVEMENT_PATTERN
        )?.value as NpcMovementPattern) || NPC_MOVEMENT_PATTERN.IDLE

      const npc = new NPC({
        assetKey: npcAssetKey,
        scene: this,
        position: { x: npcObject.x, y: npcObject.y - TILE_SIZE },
        direction: DIRECTION.DOWN,
        frame: parseInt(npcFrame, 10),
        messages: npcMessages,
        npcPath,
        movementPattern: npcMovement
      })
      this._npcs.push(npc)
    })
  }
}
