import { DATABOX_ASSET_KEYS } from '@/assets/asset-keys'

export class HealthBar {
  _fullWidth: number
  _height: number
  _scene: Phaser.Scene
  _container: Phaser.GameObjects.Container
  _overlay_hp: Phaser.GameObjects.Sprite

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this._scene = scene

    this._createHealthBar(x, y)
    this._setMeterPercentage(1)
  }

  get container() {
    return this._container
  }

  _createHealthBar(x: number, y: number) {
    this._container = this._scene.add.container(x, y)
    const overlayHPTextureSourceImage = this._scene.textures
      .get(DATABOX_ASSET_KEYS.OVERLAY_HP)
      .getSourceImage()
    this._fullWidth = overlayHPTextureSourceImage.width
    this._height = overlayHPTextureSourceImage.height / 3
    this._container.width = this._fullWidth
    this._container.height = this._height

    this._overlay_hp = this._scene.add
      .sprite(0, 0, DATABOX_ASSET_KEYS.OVERLAY_HP, 0)
      .setOrigin(0)

    this._container.add(this._overlay_hp)
  }

  /**
   * 百分比调整 hp 条
   * @param percent hp 条百分比 0~1，默认 1
   */
  _setMeterPercentage(percent = 1) {
    const width = this._fullWidth * percent
    this._overlay_hp.setCrop(0, 0, width, this._height)
  }

  /**
   * 百分比调整 hp 条（动画）
   * @param percent hp 条百分比 0~1，默认 1
   * @param options
   * @param options.duration 动画持续时间
   * @param options.callback 动画结束回调
   */
  setMeterPercentageAnimated(
    percent = 1,
    options: {
      duration?: number
      callback?: () => void
      skipBattleAnimations?: boolean
    } = {
      skipBattleAnimations: false
    }
  ) {
    if (options?.skipBattleAnimations) {
      this._setMeterPercentage(percent)
      options?.callback?.()
      return
    }

    const width = this._fullWidth * percent
    this._scene.tweens.add({
      targets: this._overlay_hp,
      duration: options?.duration || 1000,
      width,
      ease: Phaser.Math.Easing.Sine.Out,
      onUpdate: () => {
        this._overlay_hp.setCrop(
          0,
          0,
          this._overlay_hp.width,
          this._height
        )
      },
      onComplete: options?.callback
    })
  }
}
