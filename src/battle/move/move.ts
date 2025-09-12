import { Coordinate } from '@/types/typedef'

export class Move {
  protected _scene: Phaser.Scene
  protected _container: Phaser.GameObjects.Container
  protected _position: Coordinate
  protected _moveGameObject:
    | Phaser.GameObjects.Container
    | Phaser.GameObjects.Sprite
    | undefined

  protected _isAnimationPlaying: boolean

  constructor(
    scene: Phaser.Scene,
    container: Phaser.GameObjects.Container,
    position: Coordinate
  ) {
    this._scene = scene
    this._container = container
    this._position = position
    this._moveGameObject = undefined

    this._isAnimationPlaying = false
  }

  get gameObject() {
    return this._moveGameObject
  }

  playAnimation(): void {
    throw new Error('playAnimation is not implemented')
  }
}
