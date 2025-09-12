import { exhaustiveGuard } from '@/utils/guard'
import { MOVE_KEYS } from './move-keys'
import { IceShard } from './ice-shard'
import { Scratch } from './scratch'
import { Coordinate } from '@/types/typedef'

export type MOVE_TARGET =
  (typeof MOVE_TARGET)[keyof typeof MOVE_TARGET]

export const MOVE_TARGET = Object.freeze({
  PLAYER: 'PLAYER',
  FOE: 'FOE'
})

export class MoveManager {
  _scene: Phaser.Scene
  _container: Phaser.GameObjects.Container
  _foePosition: Coordinate
  _playerPosition: Coordinate
  _skipBattleAnimation: boolean
  _iceShardMove: IceShard
  _scratchMove: Scratch

  constructor(
    scene: Phaser.Scene,
    container: Phaser.GameObjects.Container,
    config: {
      foePosition: Coordinate
      playerPosition: Coordinate
    },
    skipBattleAnimation: boolean
  ) {
    this._scene = scene
    this._container = container
    this._foePosition = config.foePosition
    this._playerPosition = config.playerPosition
    this._skipBattleAnimation = skipBattleAnimation
  }

  playMoveAnimation(
    move: MOVE_KEYS,
    target: MOVE_TARGET,
    callback: () => void
  ) {
    if (this._skipBattleAnimation) {
      callback()
      return
    }

    // if target is foe
    let x = this._foePosition.x
    let y = this._foePosition.y
    if (target === MOVE_TARGET.PLAYER) {
      x = this._playerPosition.x
      y = this._playerPosition.y
    }

    switch (move) {
      case MOVE_KEYS.ICE_SHARD:
        if (!this._iceShardMove) {
          this._iceShardMove = new IceShard(
            this._scene,
            this._container,
            { x, y }
          )
        }
        this._iceShardMove.gameObject?.setPosition(x, y)
        this._iceShardMove.playAnimation(callback)
        break
      case MOVE_KEYS.SCRATCH:
        if (!this._scratchMove) {
          this._scratchMove = new Scratch(
            this._scene,
            this._container,
            { x, y }
          )
        }
        this._scratchMove.gameObject?.setPosition(x, y)
        this._scratchMove.playAnimation(callback)
        break
      default:
        exhaustiveGuard(move)
    }
  }
}
