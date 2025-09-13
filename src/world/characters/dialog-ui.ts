import { GENERAL_ASSET_KEYS } from '@/assets/asset-keys'
import {
  animateText,
  CANNOT_READ_SIGN_TEXT
} from '@/utils/text-utils'

const UI_TEXT_STYLE = Object.freeze({
  color: '#484848',
  fontSize: '36px',
  fontFamily: 'Power Red',
  wordWrap: { width: 0 }
})

export class DialogUI {
  protected _scene: Phaser.Scene
  protected _container: Phaser.GameObjects.Container
  protected _width: number
  protected _height: number = 124
  protected _padding: number = 90
  protected _isVisible: boolean

  protected _uiText: Phaser.GameObjects.Text
  protected _userInputCursor: Phaser.GameObjects.Sprite
  protected _textAnimationPlaying: boolean = false
  protected _messagesToShow: string[] = []

  constructor(scene: Phaser.Scene, width: number) {
    this._scene = scene
    this._width = width - this._padding * 2

    const panel = this._scene.add
      .rectangle(0, 0, this._width, this._height, 0xede4f3, 0.9)
      .setOrigin(0)
      .setStrokeStyle(8, 0x905ac2, 1)
    this._uiText = this._scene.add.text(
      18,
      12,
      CANNOT_READ_SIGN_TEXT,
      {
        ...UI_TEXT_STYLE,
        ...{ wordWrap: { width: this._width - 18 } }
      }
    )
    this._container = this._scene.add.container(0, 0, [
      panel,
      this._uiText
    ])
    this._createPlayerInputCursor()
    this.hideDialogModel()
  }

  get isVisible(): boolean {
    return this._isVisible
  }

  get isAnimationPlaying(): boolean {
    return this._textAnimationPlaying
  }

  get moreMessagesToShow(): boolean {
    return this._messagesToShow.length > 0
  }

  showDialogModel(messages: string[]) {
    this._messagesToShow = [...messages]

    const { x, bottom } = this._scene.cameras.main.worldView
    const startX = x + this._padding
    const startY = bottom - this._height - this._padding / 4

    this._container.setPosition(startX, startY)
    this._container.setAlpha(1)
    this._isVisible = true

    this.showNextMessage()
  }

  showNextMessage() {
    if (this._messagesToShow.length === 0) {
      return
    }

    this._uiText.setText('').setAlpha(1)
    animateText(
      this._scene,
      this._uiText,
      this._messagesToShow.shift() as string,
      {
        delay: 50,
        callback: () => {
          this._textAnimationPlaying = false
        }
      }
    )
    this._textAnimationPlaying = true
  }

  hideDialogModel() {
    this._container.setAlpha(0)
    this._isVisible = false
  }

  _createPlayerInputCursor() {
    this._userInputCursor = this._scene.add
      .sprite(
        this._width - this._padding / 4,
        this._height - this._padding / 4,
        GENERAL_ASSET_KEYS.PAUSE_ARROW
      )
      .setOrigin(1)
    this._container.add(this._userInputCursor)
    this._userInputCursor.play(GENERAL_ASSET_KEYS.PAUSE_ARROW)
  }
}
