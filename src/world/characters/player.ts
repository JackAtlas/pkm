import { CHARACTER_ASSET_KEYS } from '@/assets/asset-keys'
import { Character, CharacterConfig } from './character'
import { DIRECTION, Direction } from '@/common/direction'
import { exhaustiveGuard } from '@/utils/guard'

type PlayerConfig = Omit<
  CharacterConfig,
  'assetKey' | 'idleFrameConfig'
>

export class Player extends Character {
  constructor(config: PlayerConfig) {
    super({
      ...config,
      assetKey: CHARACTER_ASSET_KEYS.PLAYER,
      origin: { x: 0.25, y: 0.5 },
      idleFrameConfig: {
        DOWN: 0,
        LEFT: 4,
        RIGHT: 8,
        UP: 12,
        NONE: 0
      }
    })
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
            `PLAYER_${this._direction}`
        ) {
          this._characterGameObject.play(`PLAYER_${this._direction}`)
        }
        break
      case DIRECTION.NONE:
        break
      default:
        exhaustiveGuard(this._direction)
    }
  }
}
