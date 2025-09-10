import { BATTLE_BACKGROUND_ASSET_KEYS } from '@/assets/asset-keys'

export class Background {
  _scene: Phaser.Scene
  _container: Phaser.GameObjects.Container
  _backgroundGameObject: Phaser.GameObjects.Image

  /**
   *
   * @param {Phaser.Scene} scene Battle Background 所在的 Scene 对象
   * @param {Phaser.GameObjects.Container} container Battle Background 所在的 Container 对象
   */
  constructor(
    scene: Phaser.Scene,
    container: Phaser.GameObjects.Container
  ) {
    this._scene = scene
    this._container = container

    this._backgroundGameObject = this._scene.add
      .image(0, 0, BATTLE_BACKGROUND_ASSET_KEYS.FOREST)
      .setOrigin(0)
      .setVisible(false)
    this._container.add(this._backgroundGameObject)
    this._container.width = 1024
    this._container.height = 576
  }

  showForest() {
    this._backgroundGameObject
      .setTexture(BATTLE_BACKGROUND_ASSET_KEYS.FOREST)
      .setVisible(true)
  }
}
