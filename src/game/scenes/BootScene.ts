import { Scene } from 'phaser'
import { SCENE_KEYS } from './scene-keys'

export class BootScene extends Scene {
  constructor() {
    super({
      key: SCENE_KEYS.BOOT_SCENE
    })
  }

  preload() {
    //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
    //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.
  }

  create() {
    this.scene.start(SCENE_KEYS.PRELOADER_SCENE)
  }
}
