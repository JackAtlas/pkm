import { SceneKeys } from '@/game/scenes/scene-keys'

/**
 * 记录当前操作的场景
 */
export class SceneManager {
  protected _activeScene: SceneKeys

  set activeScene(key: SceneKeys) {
    this._activeScene = key
    console.log(
      `[SceneManager]: current active scene is set to%c ${key} `,
      'color: yellow;'
    )
  }

  get activeScene() {
    return this._activeScene
  }
}

export const sceneManager = new SceneManager()
