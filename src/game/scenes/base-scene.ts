import { Controls } from '@/utils/controls'

export class BaseScene extends Phaser.Scene {
  protected _controls: Controls

  constructor(config: Phaser.Types.Scenes.SettingsConfig) {
    super(config)
    if (this.constructor === BaseScene) {
      throw new Error('BaseScene 是不能直接实例化的抽象类')
    }
  }

  init() {
    this._log(`[${this.constructor.name}: init] invoked`)
  }

  preload() {
    this._log(`[${this.constructor.name}: preload] invoked`)
  }

  create() {
    this._log(`[${this.constructor.name}: create] invoked`)

    this._controls = new Controls(this)
  }

  update(time: DOMHighResTimeStamp) {}

  _log(message: string, style?: string) {
    console.log(
      `%c${message}`,
      style ?? 'color: orange; background: black;'
    )
  }
}
