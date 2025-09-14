import { DIRECTION, Direction } from '@/common/direction'
import { Character, CharacterConfig } from './character'
import { exhaustiveGuard } from '@/utils/guard'

interface NPCConfigProps {
  frame: number
  messages: string[]
}

type NPCConfig = Omit<CharacterConfig, 'idleFrameConfig'> &
  NPCConfigProps

export class NPC extends Character {
  protected _messages: string[]
  protected _talkingToPlayer: boolean = false

  constructor(config: NPCConfig) {
    super({
      ...config,
      origin: { x: 0, y: 1 / 3 },
      idleFrameConfig: {
        DOWN: config.frame,
        LEFT: config.frame + 4,
        RIGHT: config.frame + 8,
        UP: config.frame + 12,
        NONE: config.frame
      }
    })

    this._messages = config.messages
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
}
