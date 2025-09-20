import { Controls } from '@/utils/controls'
import { sceneManager, SceneManager } from '@/utils/scene-manager'

export class BaseScene extends Phaser.Scene {
  /** 管理当前操作的场景 */
  protected _sceneManager: SceneManager
  protected _controls: Controls

  constructor(config: Phaser.Types.Scenes.SettingsConfig) {
    super(config)
    if (this.constructor === BaseScene) {
      throw new Error('BaseScene 是不能直接实例化的抽象类')
    }
    this._sceneManager = sceneManager
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
