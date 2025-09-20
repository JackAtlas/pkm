import { BaseScene } from './base-scene'
import { SCENE_KEYS, SceneKeys } from './scene-keys'
import {
  animateText,
  CANNOT_READ_SIGN_TEXT
} from '@/utils/text-utils'
import { GENERAL_ASSET_KEYS } from '@/assets/asset-keys'
import { dataManager } from '@/utils/data-manager'
import { SCENE_COMMUNICATE_FLAGS } from '@/utils/scene-manager'

const UI_TEXT_STYLE = Object.freeze({
  color: '#484848',
  fontSize: '36px',
  fontFamily: 'Power Red',
  wordWrap: { width: 0 }
})

interface DialogObj {
  avatarAsset: string
  avatarPosition: 'Left' | 'Right'
  message: string
}

export class DialogScene extends BaseScene {
  protected _callbackSceneKey: SceneKeys | null
  protected _container: Phaser.GameObjects.Container
  protected _width: number = 1000
  protected _height: number = 150
  protected _padding: number = 20

  protected _uiPanel: Phaser.GameObjects.Rectangle
  protected _uiText: Phaser.GameObjects.Text
  protected _userInputCursor: Phaser.GameObjects.Sprite
  protected _textAnimationPlaying: boolean = false
  protected _messagesToShow: string[] = []

  constructor() {
    super({
      key: SCENE_KEYS.DIALOG_SCENE
    })
  }
  create() {
    super.create()

    const width =
      this.scale.width > this._width ? this._width : this.scale.width

    const startX = (this.scale.width - width) / 2
    const startY =
      this.scale.height - this._height - this._padding - 4

    if (!this._uiPanel) {
      this._uiPanel = this.add
        .rectangle(
          startX,
          startY,
          width - this._padding * 2,
          this._height,
          0xede4f3
        )
        .setStrokeStyle(8, 0x905ac2, 1)
        .setOrigin(0)
    }

    if (!this._uiText) {
      this._uiText = this.add.text(
        startX + 18,
        startY + 12,
        CANNOT_READ_SIGN_TEXT,
        {
          ...UI_TEXT_STYLE,
          ...{
            wordWrap: {
              useAdvancedWrap: true,
              width: width - this._padding * 2 - 26
            }
          }
        }
      )
    }

    if (!this._userInputCursor) {
      this._userInputCursor = this.add
        .sprite(
          startX + width - this._padding * 3,
          startY + this._height - this._padding,
          GENERAL_ASSET_KEYS.PAUSE_ARROW
        )
        .setOrigin(1)
      this._userInputCursor.play(GENERAL_ASSET_KEYS.PAUSE_ARROW)
    }

    this.scene.setVisible(false)

    this.scene
      .get(SCENE_KEYS.WORLD_SCENE)
      .events.on(
        SCENE_COMMUNICATE_FLAGS.SHOW_DIALOG,
        (messages: string[], key: SceneKeys) => {
          this._showDialog(messages, key)
        }
      )
  }

  update(time: DOMHighResTimeStamp) {
    if (this._sceneManager.activeScene === this.scene.key) {
      super.update(time)

      const wasSpaceKeyPressed = this._controls.wasSpaceKeyPressed()
      if (wasSpaceKeyPressed) {
        if (this._textAnimationPlaying) return

        if (this._messagesToShow.length > 0) {
          this._showNextMessage()
        } else {
          this._hideDialog()
        }
      }
    }
  }

  _showDialog(messages: string[], key: SceneKeys) {
    if (!key) return

    this._sceneManager.activeScene = this.scene.key as SceneKeys
    this._callbackSceneKey = key
    this._messagesToShow = [...messages]

    this._showNextMessage()

    this.scene.setVisible(true)
  }

  _showNextMessage() {
    if (this._messagesToShow.length === 0) return

    this._uiText.setText('')
    animateText(
      this,
      this._uiText,
      this._messagesToShow.shift() as string,
      {
        delay: dataManager.getAnimatedTextSpeed(),
        callback: () => {
          this._textAnimationPlaying = false
        }
      }
    )
    this._textAnimationPlaying = true
  }

  _hideDialog() {
    this.scene.setVisible(false)
    this._sceneManager.activeScene =
      this._callbackSceneKey ?? SCENE_KEYS.WORLD_SCENE
    this.events.emit(
      SCENE_COMMUNICATE_FLAGS.HIDE_DIALOG,
      this._callbackSceneKey
    )
    this._callbackSceneKey = null
  }
}
