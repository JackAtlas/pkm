import { MOVE_ASSET_KEYS } from '@/assets/asset-keys'
import { Move } from './move'
import { Coordinate } from '@/types/typedef'

export class IceShard extends Move {
  protected _moveGameObject: Phaser.GameObjects.Sprite

  constructor(
    scene: Phaser.Scene,
    container: Phaser.GameObjects.Container,
    position: Coordinate
  ) {
    super(scene, container, position)

    this._scene.anims.create({
      key: MOVE_ASSET_KEYS.ICE_SHARD_START,
      frames: this._scene.anims.generateFrameNumbers(
        MOVE_ASSET_KEYS.ICE_SHARD,
        { start: 0, end: 0 }
      ),
      frameRate: 1,
      repeat: 0,
      delay: 0
    })

    this._scene.anims.create({
      key: MOVE_ASSET_KEYS.ICE_SHARD,
      frames: this._scene.anims.generateFrameNumbers(
        MOVE_ASSET_KEYS.ICE_SHARD,
        { start: 1, end: 6 }
      ),
      frameRate: 5,
      repeat: 0,
      delay: 0
    })

    this._moveGameObject = this._scene.add
      .sprite(position.x, position.y, MOVE_ASSET_KEYS.ICE_SHARD, 0)
      .setOrigin(0.5)
      .setVisible(false)
    this._container.add(this._moveGameObject)
  }

  playAnimation(callback?: () => void): void {
    if (this._isAnimationPlaying) {
      return
    }

    this._isAnimationPlaying = true
    this._moveGameObject.setVisible(true)

    this._moveGameObject.on(
      Phaser.Animations.Events.ANIMATION_COMPLETE,
      (animation: Phaser.Animations.Animation) => {
        if (animation.key === MOVE_ASSET_KEYS.ICE_SHARD_START) {
          this._moveGameObject.play(MOVE_ASSET_KEYS.ICE_SHARD)
          return
        }
        if (animation.key === MOVE_ASSET_KEYS.ICE_SHARD) {
          this._isAnimationPlaying = false
          this._moveGameObject.setVisible(false).setFrame(0)

          if (callback) callback()

          this._moveGameObject.off(
            Phaser.Animations.Events.ANIMATION_COMPLETE
          )
        }
      }
    )
    this._moveGameObject.play(MOVE_ASSET_KEYS.ICE_SHARD_START)
  }
}
