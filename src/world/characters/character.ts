import { Direction, DIRECTION } from '@/common/direction'
import { DEBUG, SPEED_MULTIPLIER } from '@/config'
import { Coordinate } from '@/types/typedef'
import { getTargetPositionFromGameObjectPositionAndDirection } from '@/utils/grid-utils'
import { exhaustiveGuard } from '@/utils/guard'

interface CharacterIdleFrameConfig {
  DOWN: number
  LEFT: number
  RIGHT: number
  UP: number
  NONE: number
}

export interface CharacterConfig {
  scene: Phaser.Scene
  assetKey: string
  visible: boolean
  origin?: Coordinate
  position: Coordinate
  direction: Direction
  collisionLayer?: Phaser.Tilemaps.TilemapLayer
  spriteGridMovementFinishedCallback?: () => void
  spriteChangedDirectionCallback?: () => void
  idleFrameConfig: CharacterIdleFrameConfig
  otherCharactersToCheckForCollisionsWith?: Character[]
}

export class Character {
  protected _scene: Phaser.Scene
  protected _assetKey: string
  protected _visible: boolean
  protected _characterGameObject: Phaser.GameObjects.Sprite
  protected _debugRect: Phaser.GameObjects.Rectangle
  protected _idleFrameConfig: CharacterIdleFrameConfig
  protected _origin: Coordinate = { x: 0, y: 0 }
  protected _direction: Direction
  protected _isMoving: boolean
  protected _targetPosition: Coordinate
  protected _previousTargetPosition: Coordinate
  protected _spriteGridMovementFinishedCallback:
    | (() => void)
    | undefined

  protected _spriteChangedDirectionCallback: (() => void) | undefined

  protected _collisionLayer: Phaser.Tilemaps.TilemapLayer | undefined

  /** 其他要进行碰撞检测的角色 */
  protected _otherCharactersToCheckForCollisionsWith: Character[] = []

  constructor(config: CharacterConfig) {
    this._scene = config.scene
    this._visible = config.visible
    this._direction = config.direction
    this._origin = config.origin
      ? { ...config.origin }
      : { x: 0.25, y: 0.5 }
    this._idleFrameConfig = config.idleFrameConfig
    this._isMoving = false
    this._targetPosition = { ...config.position }
    this._previousTargetPosition = { ...config.position }
    this._otherCharactersToCheckForCollisionsWith =
      config.otherCharactersToCheckForCollisionsWith || []
    this._assetKey = config.assetKey

    this._characterGameObject = this._scene.add
      .sprite(
        config.position.x,
        config.position.y,
        config.assetKey,
        this._getIdleFrame()
      )
      .setOrigin(this._origin.x, this._origin.y)
      .setVisible(config.visible)
    if (DEBUG) {
      this._debugRect = this._scene.add
        .rectangle(
          this._characterGameObject.x,
          this._characterGameObject.y,
          this._characterGameObject.width,
          this._characterGameObject.height,
          0xff0000,
          0.5
        )
        .setOrigin(this._origin.x, this._origin.y)
    }
    this._collisionLayer = config.collisionLayer
    this._spriteGridMovementFinishedCallback =
      config.spriteGridMovementFinishedCallback
    this._spriteChangedDirectionCallback =
      config.spriteChangedDirectionCallback
  }

  get sprite(): Phaser.GameObjects.Sprite {
    return this._characterGameObject
  }

  get isMoving(): boolean {
    return this._isMoving
  }

  get direction(): Direction {
    return this._direction
  }

  update(time: DOMHighResTimeStamp): void {
    if (this._isMoving) return

    const idleFrame =
      this._characterGameObject.anims.currentAnim?.frames[0].frame
        .name
    this._characterGameObject.anims.stop()
    if (idleFrame === undefined || idleFrame === null) return
    switch (this._direction) {
      case DIRECTION.DOWN:
      case DIRECTION.LEFT:
      case DIRECTION.RIGHT:
      case DIRECTION.UP:
        this._characterGameObject.setFrame(idleFrame)
        break
      case DIRECTION.NONE:
        break
      default:
        exhaustiveGuard(this._direction)
    }
  }

  _getIdleFrame() {
    return this._idleFrameConfig[this._direction]
  }

  moveCharacter(direction: Direction) {
    if (this.isMoving) {
      return
    }

    this._moveSprite(direction)
  }

  /** 加入到该角色的碰撞检测对象中 */
  addCharacterToCheckForCollisionsWith(character: Character) {
    this._otherCharactersToCheckForCollisionsWith.push(character)
  }

  _moveSprite(direction: Direction) {
    const changedDirection = this._direction !== direction
    this._direction = direction

    if (changedDirection) {
      if (this._spriteChangedDirectionCallback !== undefined) {
        this._spriteChangedDirectionCallback()
      }
    }

    if (this._isBlockingTile()) {
      return
    }
    this._isMoving = true
    this._handleSpriteMovement()
  }

  _isBlockingTile(): boolean {
    if (this._direction === DIRECTION.NONE) {
      return true
    }

    const targetPosition = { ...this._targetPosition }
    const updatedPosition =
      getTargetPositionFromGameObjectPositionAndDirection(
        targetPosition,
        this._direction
      )
    return (
      this._doesPositionCollideWithCollisionLayer(updatedPosition) ||
      this._doesPositionCollideWithOtherCharacters(updatedPosition)
    )
  }

  _handleSpriteMovement() {
    if (this._direction === DIRECTION.NONE) return

    const updatedPosition =
      getTargetPositionFromGameObjectPositionAndDirection(
        this._targetPosition,
        this._direction
      )

    this._previousTargetPosition = { ...this._targetPosition }
    this._targetPosition.x = updatedPosition.x
    this._targetPosition.y = updatedPosition.y

    this._scene.add.tween({
      delay: 0,
      duration: 300 / SPEED_MULTIPLIER,
      y: {
        from: this._characterGameObject.y,
        start: this._characterGameObject.y,
        to: this._targetPosition.y
      },
      x: {
        from: this._characterGameObject.x,
        start: this._characterGameObject.x,
        to: this._targetPosition.x
      },
      targets: this._characterGameObject,
      onComplete: () => {
        if (DEBUG && this._debugRect) {
          this._debugRect.setPosition(
            this._characterGameObject.x,
            this._characterGameObject.y
          )
        }
        this._isMoving = false
        this._previousTargetPosition = { ...this._targetPosition }
        if (this._spriteGridMovementFinishedCallback) {
          this._spriteGridMovementFinishedCallback()
        }
      }
    })
  }

  _doesPositionCollideWithCollisionLayer(
    position: Coordinate
  ): boolean {
    if (!this._collisionLayer) return false

    const { x, y } = position
    const tile = this._collisionLayer.getTileAtWorldXY(x, y, true)

    return tile.index !== -1
  }

  _doesPositionCollideWithOtherCharacters(
    position: Coordinate
  ): boolean {
    const { x, y } = position
    if (this._otherCharactersToCheckForCollisionsWith.length === 0) {
      return false
    }

    const collidesWithACharacter =
      this._otherCharactersToCheckForCollisionsWith.some(
        (character) => {
          return (
            (character._targetPosition.x === x &&
              character._targetPosition.y === y) ||
            (character._previousTargetPosition.x === x &&
              character._previousTargetPosition.y === y)
          )
        }
      )

    return collidesWithACharacter
  }
}
