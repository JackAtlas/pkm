import {
  LAYER_KEYS,
  TILE_ASSET_KEYS,
  WORLD_ASSET_KEYS
} from '@/assets/asset-keys'
import { DIRECTION } from '@/common/direction'
import {
  DEBUG,
  TILE_SIZE,
  TILED_COLLISION_LAYER_ALPHA
} from '@/config'
import {
  DATA_MANAGER_STORE_KEYS,
  dataManager
} from '@/utils/data-manager'
import { getTargetPositionFromGameObjectPositionAndDirection } from '@/utils/grid-utils'
import {
  CANNOT_READ_SIGN_TEXT,
  SAMPLE_TEXT
} from '@/utils/text-utils'
import {
  NPC,
  NPC_MOVEMENT_PATTERN,
  NpcMovementPattern,
  NPCPath
} from '@/world/characters/npc'
import { Player } from '@/world/characters/player'
import { SCENE_KEYS, SceneKeys } from './scene-keys'
import { Menu } from '@/world/menu/menu'
import { BaseScene } from './base-scene'
import { SCENE_COMMUNICATE_FLAGS } from '@/utils/scene-manager'

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
  ASSET_KEY: 'asset_key',
  VISIBLE: 'visible'
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

export class WorldScene extends BaseScene {
  /** 菜单场景，叠加在场景上 */
  protected _menuUIScene: Phaser.Scene
  protected _dialogScene: Phaser.Scene

  protected _player: Player
  protected _menu: Menu
  protected _wildPkmEncountered: boolean

  protected _backgroundGameObjectImage: Phaser.GameObjects.Image
  protected _foregroundGameObjectImage: Phaser.GameObjects.Image

  protected _collisionLayer: Phaser.Tilemaps.TilemapLayer
  protected _encounterLayer: Phaser.Tilemaps.TilemapLayer

  protected _signLayer: Phaser.Tilemaps.ObjectLayer | null

  protected _npcs: NPC[] = []
  protected _npcPlayerIsInteractingWith: NPC | null = null

  constructor() {
    super({
      key: SCENE_KEYS.WORLD_SCENE
    })
  }

  init() {
    super.init()
    this._wildPkmEncountered = false
    this._npcPlayerIsInteractingWith = null
  }

  create() {
    super.create()

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
    this._collisionLayer = collisionLayer
    this._collisionLayer
      .setAlpha(DEBUG ? TILED_COLLISION_LAYER_ALPHA : 0)
      .setDepth(2)

    this._signLayer = map.getObjectLayer(LAYER_KEYS.SIGN_LAYER)
    if (!this._signLayer) {
      console.error(
        `[${WorldScene.name}: create] encountered error while creating sign layer using data from tiled`
      )
      return
    }

    if (map.tilesets.find((tileset) => tileset.name === 'Yellow')) {
      const encounterTiles = map.addTilesetImage(
        'Yellow',
        TILE_ASSET_KEYS.YELLOW_TILE
      )
      if (encounterTiles) {
        const encounterLayer = map.createLayer(
          'ENCOUNTER',
          encounterTiles,
          0,
          0
        )
        if (encounterLayer) {
          this._encounterLayer = encounterLayer
          this._encounterLayer
            .setAlpha(DEBUG ? TILED_COLLISION_LAYER_ALPHA : 0)
            .setDepth(2)
        } else {
          console.warn(
            `[${WorldScene.name}: create] encountered error while creating encounter layer using data from tiled`
          )
        }
      } else {
        console.warn(
          `[${WorldScene.name}: create] encountered error while creating encounter tiles using data from tiled`
        )
      }
    }

    this._backgroundGameObjectImage = this.add
      .image(0, 0, WORLD_ASSET_KEYS.WORLD_BACKGROUND, 0)
      .setOrigin(0)

    // 生成 NPC
    this._createNPCs(map)

    // 生成玩家
    this._player = new Player({
      scene: this,
      visible: true,
      position: dataManager.store.get(
        DATA_MANAGER_STORE_KEYS.PLAYER_POSITION
      ),
      direction: dataManager.store.get(
        DATA_MANAGER_STORE_KEYS.PLAYER_DIRECTION
      ),
      collisionLayer: this._collisionLayer,
      spriteChangedDirectionCallback: () => {
        this._handlePlayerDirectionUpdate()
      },
      spriteGridMovementFinishedCallback: () => {
        this._handlePlayerMovementUpdate()
      },
      otherCharactersToCheckForCollisionsWith: this._npcs
    })

    this._npcs.forEach((npc) => {
      npc.addCharacterToCheckForCollisionsWith(this._player)
    })

    this._foregroundGameObjectImage = this.add
      .image(0, 0, WORLD_ASSET_KEYS.WORLD_FOREGROUND, 0)
      .setOrigin(0)

    this._menu = new Menu(this)

    this.cameras.main.setBounds(
      0,
      0,
      map.widthInPixels,
      map.heightInPixels
    )
    this.cameras.main.setZoom(3)
    this.cameras.main.startFollow(this._player.sprite, true)

    this.cameras.main.fadeIn(1000, 0, 0, 0)

    dataManager.store.set(DATA_MANAGER_STORE_KEYS.GAME_STARTED, true)

    if (!this.scene.isActive(SCENE_KEYS.WORLD_UI_SCENE)) {
      this.scene.launch(SCENE_KEYS.WORLD_UI_SCENE)
      this._menuUIScene = this.scene.get(SCENE_KEYS.WORLD_UI_SCENE)
      this.scene.bringToTop(SCENE_KEYS.WORLD_UI_SCENE)
      this._menuUIScene.events.on(
        SCENE_COMMUNICATE_FLAGS.HIDE_WORLD_MENU,
        () => {
          if (this._sceneManager.activeScene === this.scene.key)
            this._afterMenuHide()
        }
      )
    }

    if (!this.scene.isActive(SCENE_KEYS.DIALOG_SCENE)) {
      this.scene.launch(SCENE_KEYS.DIALOG_SCENE)
      this._dialogScene = this.scene.get(SCENE_KEYS.DIALOG_SCENE)
      this.scene.bringToTop(SCENE_KEYS.DIALOG_SCENE)
      this._dialogScene.events.on(
        SCENE_COMMUNICATE_FLAGS.HIDE_DIALOG,
        () => {
          if (this._sceneManager.activeScene === this.scene.key)
            this._afterDialogHide()
        }
      )
    }

    this._sceneManager.activeScene = this.scene.key as SceneKeys
  }

  update(time: DOMHighResTimeStamp) {
    super.update(time)
    if (this._wildPkmEncountered) {
      this._player.update(time)
      return
    }

    if (this._sceneManager.activeScene === this.scene.key) {
      const wasSpaceKeyPressed = this._controls.wasSpaceKeyPressed()
      const selectedDirectionHeldDown =
        this._controls.getDirectionKeyPressedDown()
      if (
        selectedDirectionHeldDown !== DIRECTION.NONE &&
        !this._isPlayerInputLocked()
      ) {
        this._player.moveCharacter(selectedDirectionHeldDown)
      }

      if (wasSpaceKeyPressed && !this._player.isMoving) {
        this._handlePlayerInteraction()
      }

      if (
        this._controls.wasMenuKeyPressed() &&
        !this._player.isMoving
      ) {
        this.events.emit(SCENE_COMMUNICATE_FLAGS.SHOW_WORLD_MENU)
        this.scene.pause()
      }

      this._player.update(time)

      this._npcs.forEach((npc) => {
        npc.update(time)
      })
    }
  }

  _afterDialogHide() {
    if (this._npcPlayerIsInteractingWith) {
      this._npcPlayerIsInteractingWith.isTalkingToPlayer = false
      this._npcPlayerIsInteractingWith = null
    }
    this.scene.resume()
  }

  _afterMenuHide() {
    this.scene.resume()
  }

  _handlePlayerInteraction() {
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
      this.events.emit(
        SCENE_COMMUNICATE_FLAGS.SHOW_DIALOG,
        [textToShow],
        this.scene.key
      )
      this.scene.pause()
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
      this.events.emit(
        SCENE_COMMUNICATE_FLAGS.SHOW_DIALOG,
        nearbyNPC.messages,
        this.scene.key
      )
      this.scene.pause()
    }
  }

  _handlePlayerMovementUpdate() {
    dataManager.store.set(DATA_MANAGER_STORE_KEYS.PLAYER_POSITION, {
      x: this._player.sprite.x,
      y: this._player.sprite.y
    })

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
    return (
      this._controls.isInputLocked ||
      this._sceneManager.activeScene !== this.scene.key
    )
  }

  _createNPCs(map: Phaser.Tilemaps.Tilemap) {
    this._npcs = []

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

      const npcVisibility =
        npcObject.properties.find(
          (property: Property) =>
            property.name === TILED_NPC_PROPERTY.VISIBLE
        )?.value ?? true

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
        movementPattern: npcMovement,
        visible: npcVisibility
      })
      this._npcs.push(npc)
    })
  }

  _handlePlayerDirectionUpdate() {
    dataManager.store.set(
      DATA_MANAGER_STORE_KEYS.PLAYER_DIRECTION,
      this._player.direction
    )
  }
}
