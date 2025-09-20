import { SceneKeys } from '@/game/scenes/scene-keys'

export const SCENE_COMMUNICATE_FLAGS = Object.freeze({
  HIDE_DIALOG: 'HIDE_DIALOG',
  HIDE_WORLD_MENU: 'HIDE_WORLD_MENU',
  SHOW_DIALOG: 'SHOW_DIALOG',
  SHOW_WORLD_MENU: 'SHOW_WORLD_MENU'
})

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
