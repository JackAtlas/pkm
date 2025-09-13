import {
  TILE_ASSET_KEYS,
  WORLD_ASSET_KEYS
} from '@/assets/asset-keys'
import { DIRECTION } from '@/common/direction'
import { TILE_SIZE, TILED_COLLISION_LAYER_ALPHA } from '@/config'
import { Coordinate } from '@/types/typedef'
import { Controls } from '@/utils/controls'
import { Player } from '@/world/characters/player'

const PLAYER_POSITION: Coordinate = Object.freeze({
  x: 5 * TILE_SIZE,
  y: 5 * TILE_SIZE
})

export class WorldScene extends Phaser.Scene {
  protected _fpsText!: Phaser.GameObjects.Text
  _player: Player
  _controls: Controls

  constructor() {
    super({
      key: 'WORLD_SCENE'
    })
  }

  create() {
    console.log(`[${WorldScene.name}: create] invoked`)

    this.cameras.main.setBounds(0, 0, 1024, 576)

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
    collisionLayer.setAlpha(TILED_COLLISION_LAYER_ALPHA).setDepth(2)

    this._fpsText = this.add
      .text(this.scale.width - 10, 10, '', {
        fontFamily: 'sans-serif',
        color: '#ffffff'
      })
      .setOrigin(1, 0)

    this.add
      .image(0, 0, WORLD_ASSET_KEYS.WORLD_BACKGROUND, 0)
      .setOrigin(0)

    this._player = new Player({
      scene: this,
      position: PLAYER_POSITION,
      direction: DIRECTION.DOWN,
      collisionLayer
    })

    // TODO const centerCamera = this.cameras.add(x, y, width, height)
    // centerCamera.setBounds(0, 0, mapWidth, mapHeight)
    // centerCamera.startFollow(this._player.sprite, true)
    this.cameras.main.startFollow(this._player.sprite, true)

    this.add
      .image(0, 0, WORLD_ASSET_KEYS.WORLD_FOREGROUND, 0)
      .setOrigin(0)

    this._controls = new Controls(this)

    this.cameras.main.fadeIn(1000, 0, 0, 0)
  }

  update(time: DOMHighResTimeStamp) {
    const fps = this.game.loop.actualFps.toFixed(1)
    this._fpsText.setText(`FPS: ${fps}`)

    const selectedDirection =
      this._controls.getDirectionKeyJustPressed()
    if (selectedDirection !== DIRECTION.NONE) {
      this._player.moveCharacter(selectedDirection)
    }

    this._player.update(time)
  }
}
