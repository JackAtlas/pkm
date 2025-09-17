import { DIRECTION, Direction } from '@/common/direction'
import { Character, CharacterConfig } from './character'
import { exhaustiveGuard } from '@/utils/guard'
import { Coordinate } from '@/types/typedef'

export type NpcMovementPattern =
  (typeof NPC_MOVEMENT_PATTERN)[keyof typeof NPC_MOVEMENT_PATTERN]

export const NPC_MOVEMENT_PATTERN = Object.freeze({
  CLOCKWISE: 'CLOCKWISE',
  IDLE: 'IDLE'
})

export type NPCPath = Record<number, Coordinate>

interface NPCConfigProps {
  frame: number
  messages: string[]
  npcPath: NPCPath
  movementPattern: NpcMovementPattern
}

type NPCConfig = Omit<CharacterConfig, 'idleFrameConfig'> &
  NPCConfigProps

export class NPC extends Character {
  protected _messages: string[]
  protected _talkingToPlayer: boolean = false
  protected _npcPath: NPCPath
  protected _currentPathIndex: number = 0
  protected _movementPattern: NpcMovementPattern

  /** 移动前的延迟 */
  protected _lastMovementTime: number = Phaser.Math.Between(
    3500,
    5000
  )

  constructor(config: NPCConfig) {
    super({
      ...config,
      origin: { x: 0.25, y: 0.5 },
      idleFrameConfig: {
        DOWN: 0,
        UP: 4,
        RIGHT: 8,
        LEFT: 12,
        NONE: 0
      }
    })

    this._messages = config.messages
    this._npcPath = config.npcPath
    this._movementPattern = config.movementPattern
  }

  get messages(): string[] {
    return this._messages
  }

  get isTalkingToPlayer(): boolean {
    return this._talkingToPlayer
  }

  set isTalkingToPlayer(value: boolean) {
    this._talkingToPlayer = value
  }

  update(time: DOMHighResTimeStamp): void {
    if (!this._visible) return

    if (this._isMoving) return

    if (this._talkingToPlayer) return

    super.update(time)

    if (this._movementPattern === NPC_MOVEMENT_PATTERN.IDLE) {
      return
    }

    if (this._lastMovementTime >= time) return

    let characterDirection: Direction = DIRECTION.NONE
    let nextPosition = this._npcPath[this._currentPathIndex + 1]

    const prevPosition = this._npcPath[this._currentPathIndex]
    if (
      prevPosition.x !== this._characterGameObject.x ||
      prevPosition.y !== this._characterGameObject.y
    ) {
      nextPosition = this._npcPath[this._currentPathIndex]
    } else {
      if (nextPosition === undefined) {
        nextPosition = this._npcPath[0]
        this._currentPathIndex = 0
      } else {
        this._currentPathIndex++
      }
    }

    if (nextPosition.x > this._characterGameObject.x) {
      characterDirection = DIRECTION.RIGHT
    } else if (nextPosition.x < this._characterGameObject.x) {
      characterDirection = DIRECTION.LEFT
    } else if (nextPosition.y > this._characterGameObject.y) {
      characterDirection = DIRECTION.DOWN
    } else if (nextPosition.y < this._characterGameObject.y) {
      characterDirection = DIRECTION.UP
    }

    this.moveCharacter(characterDirection)
    this._lastMovementTime = time + Phaser.Math.Between(2000, 5000)
  }

  facePlayer(playerDirection: Direction) {
    switch (playerDirection) {
      case DIRECTION.DOWN:
        this._characterGameObject.setFrame(this._idleFrameConfig.UP)
        break
      case DIRECTION.LEFT:
        this._characterGameObject.setFrame(
          this._idleFrameConfig.RIGHT
        )
        break
      case DIRECTION.RIGHT:
        this._characterGameObject.setFrame(this._idleFrameConfig.LEFT)
        break
      case DIRECTION.UP:
        this._characterGameObject.setFrame(this._idleFrameConfig.DOWN)
        break
      case DIRECTION.NONE:
        this._characterGameObject.setFrame(this._idleFrameConfig.UP)
        break
      default:
        exhaustiveGuard(playerDirection)
    }
  }

  moveCharacter(direction: Direction) {
    super.moveCharacter(direction)

    switch (this._direction) {
      case DIRECTION.DOWN:
      case DIRECTION.LEFT:
      case DIRECTION.RIGHT:
      case DIRECTION.UP:
        if (
          !this._characterGameObject.anims.isPlaying ||
          this._characterGameObject.anims.currentAnim?.key !==
            `${this._assetKey}_${this._direction}`
        ) {
          this._characterGameObject.play(
            `${this._assetKey}_${this._direction}`
          )
        }
        break
      case DIRECTION.NONE:
        break
      default:
        exhaustiveGuard(this._direction)
    }
  }
}
