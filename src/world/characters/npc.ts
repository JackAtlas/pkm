import { DIRECTION, Direction } from '@/common/direction'
import { Character, CharacterConfig } from './character'
import { exhaustiveGuard } from '@/utils/guard'

type NPCConfig = Omit<CharacterConfig, 'idleFrameConfig'> & {
  frame: number
}

export class NPC extends Character {
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
