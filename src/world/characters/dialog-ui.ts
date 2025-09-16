import { GENERAL_ASSET_KEYS } from '@/assets/asset-keys'
import { dataManager } from '@/utils/data-manager'
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
  protected _width: number = 200
  protected _height: number = 150
  protected _padding: number = 20
  protected _isVisible: boolean

  protected _uiPanel: Phaser.GameObjects.Rectangle
  protected _uiText: Phaser.GameObjects.Text
  protected _userInputCursor: Phaser.GameObjects.Sprite
  protected _textAnimationPlaying: boolean = false
  protected _messagesToShow: string[] = []

  constructor(scene: Phaser.Scene) {
    this._scene = scene
    this._container = this._scene.add.container(0, 0)
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

    const {
      width: viewPortwith,
      x,
      bottom
    } = this._scene.cameras.main.worldView
    const width = viewPortwith > 1000 ? 1000 : viewPortwith
    const startX =
      width < viewPortwith
        ? (viewPortwith - width) / 2 + x + this._padding
        : x + this._padding
    const startY = bottom - this._height - this._padding

    if (!this._uiPanel) {
      this._uiPanel = this._scene.add
        .rectangle(
          0,
          0,
          width - this._padding * 2,
          this._height,
          0xede4f3,
          0.9
        )
        .setStrokeStyle(8, 0x905ac2, 1)
        .setOrigin(0)
    }

    if (!this._uiText) {
      this._uiText = this._scene.add.text(
        18,
        12,
        CANNOT_READ_SIGN_TEXT,
        {
          ...UI_TEXT_STYLE,
          ...{ wordWrap: { width: this._width - 18 } }
        }
      )
    }

    if (!this._userInputCursor) {
      this._userInputCursor = this._scene.add
        .sprite(
          width - this._padding * 3,
          this._height - this._padding,
          GENERAL_ASSET_KEYS.PAUSE_ARROW
        )
        .setOrigin(1)
      this._userInputCursor.play(GENERAL_ASSET_KEYS.PAUSE_ARROW)
    }

    if (this._container.length === 0) {
      this._container.add(this._uiPanel)
      this._container.add(this._uiText)
      this._container.add(this._userInputCursor)
    }

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
        delay: dataManager.getAnimatedTextSpeed(),
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
}
