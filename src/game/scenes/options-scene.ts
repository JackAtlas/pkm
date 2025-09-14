import { DEBUG } from '@/config'
import { SCENE_KEYS } from './scene-keys'

const OPTIONS_TEXT_STYLE = Object.freeze({
  fontFamily: 'Power Green',
  fontSize: '28px',
  color: '#ffffff'
})

const OPTION_MENU_OPTION_DES_MSG = Object.freeze({
  TEXT_SPEED: '选择文字展示速度',
  BATTLE_SCENE: '选择是否在战斗中显示技能动画和特效',
  BATTLE_STYLE: '选择在对手宝可梦战斗不能时玩家能否更换宝可梦',
  BGMVOLUME: '背景音乐音量',
  SEVOLUME: '音效音量',
  CONFIRM: '确认并返回'
})

const strokeWidth: number = 4
const padding: number = 40

export class OptionsScene extends Phaser.Scene {
  protected _container: Phaser.GameObjects.Container
  protected _title: Phaser.GameObjects.Text
  protected _mainContainer: Phaser.GameObjects.Container
  protected _desContainer: Phaser.GameObjects.Container

  protected _optionsMenuCursor: Phaser.GameObjects.Rectangle

  protected _textSpeedOptionTextGameObjects: Phaser.GameObjects.Group
  protected _battleSceneOptionTextGameObjects: Phaser.GameObjects.Group
  protected _battleStyleOptionTextGameObjects: Phaser.GameObjects.Group
  protected _soundOptionTextGameObjects: Phaser.GameObjects.Group

  protected _BGMVolumeCursor: Phaser.GameObjects.Rectangle
  protected _BGMVolumeText: Phaser.GameObjects.Text

  protected _SEVolumeCursor: Phaser.GameObjects.Rectangle
  protected _SEVolumeText: Phaser.GameObjects.Text

  protected _selectedOptionDesMsgTextGameObject: Phaser.GameObjects.Text

  constructor() {
    super({
      key: SCENE_KEYS.OPTIONS_SCENE
    })
  }

  create() {
    console.log(`[${OptionsScene.name}: created] invoked`)

    this._title = this.add
      .text(0, 0, 'OPTIONS', OPTIONS_TEXT_STYLE)
      .setOrigin(0.5)

    this._createMainContainer()

    this._createDesContainer()

    this._createContainer()
  }

  _createContainer() {
    this._container = this.add.container(0, 0, [
      this._title,
      this._mainContainer,
      this._desContainer
    ])
    this._container.width = 700 + padding * 2 + strokeWidth * 2
    this._container.height =
      this._title.height +
      this._mainContainer.height +
      this._desContainer.height +
      padding * 2 +
      strokeWidth * 4
    this._title.setPosition(
      this._container.width / 2,
      padding / 2 + this._title.height / 2
    )
    this._mainContainer.setY(
      this._title.height + padding + strokeWidth
    )
    this._desContainer.setY(
      this._title.height +
        this._mainContainer.height +
        padding * 1.5 +
        strokeWidth * 3
    )
    if (DEBUG) {
      this._container.add(
        this.add
          .rectangle(
            0,
            0,
            this._container.width,
            this._container.height,
            0x00ffff,
            0.5
          )
          .setOrigin(0)
      )
    }
    this._container.setPosition(
      (this.scale.width - this._container.width) / 2,
      (this.scale.height - this._container.height) / 2
    )
  }

  _createMainContainer() {
    const menuOptions = [
      'BGMVolume',
      'SEVolume',
      'Text Speed',
      'Battle Scene',
      'Battle Style',
      'Close'
    ]
    this._mainContainer = this.add.container(
      padding + strokeWidth,
      padding + strokeWidth
    )
    this._mainContainer.width = 700
    this._mainContainer.height =
      (menuOptions.length + 1) * padding +
      menuOptions.length * this._title.height
    const bg = this.add
      .rectangle(
        0,
        0,
        this._mainContainer.width,
        this._mainContainer.height,
        0xffffff,
        0.3
      )
      .setStrokeStyle(strokeWidth, 0xffffff)
      .setOrigin(0)
    this._mainContainer.add(bg)

    menuOptions.forEach((option, index) => {
      const x = padding
      const textGameObject = this.add.text(
        x,
        0,
        option,
        OPTIONS_TEXT_STYLE
      )
      textGameObject.setY(
        padding * (index + 1) + index * this._title.height
      )

      this._mainContainer.add(textGameObject)

      switch (index) {
        case 0:
          this._mainContainer.add(
            this.add
              .rectangle(
                300,
                textGameObject.y + 2 + textGameObject.height / 2,
                260,
                5,
                0xffffff
              )
              .setOrigin(0, 0.5)
          )
          this._BGMVolumeCursor = this.add
            .rectangle(
              560,
              textGameObject.y + 2 + textGameObject.height / 2,
              10,
              25,
              0xe4434a
            )
            .setOrigin(0.5)
          this._mainContainer.add(this._BGMVolumeCursor)
          this._BGMVolumeText = this.add.text(
            600,
            textGameObject.y,
            '100%',
            OPTIONS_TEXT_STYLE
          )
          this._mainContainer.add(this._BGMVolumeText)
          break
        case 1:
          this._mainContainer.add(
            this.add
              .rectangle(
                300,
                textGameObject.y + 2 + textGameObject.height / 2,
                260,
                5,
                0xffffff
              )
              .setOrigin(0, 0.5)
          )
          this._SEVolumeCursor = this.add
            .rectangle(
              560,
              textGameObject.y + 2 + textGameObject.height / 2,
              10,
              25,
              0xe4434a
            )
            .setOrigin(0.5)
          this._mainContainer.add(this._SEVolumeCursor)
          this._SEVolumeText = this.add.text(
            600,
            textGameObject.y,
            '100%',
            OPTIONS_TEXT_STYLE
          )
          this._mainContainer.add(this._SEVolumeText)
          break
        case 2:
          this._textSpeedOptionTextGameObjects = this.add.group([
            this.add.text(
              300,
              textGameObject.y,
              'Slow',
              OPTIONS_TEXT_STYLE
            ),
            this.add.text(
              450,
              textGameObject.y,
              'Mid',
              OPTIONS_TEXT_STYLE
            ),
            this.add.text(
              600,
              textGameObject.y,
              'Fast',
              OPTIONS_TEXT_STYLE
            )
          ])
          this._mainContainer.add(
            this._textSpeedOptionTextGameObjects.getChildren()
          )
          break
        case 3:
          this._battleSceneOptionTextGameObjects = this.add.group([
            this.add.text(
              300,
              textGameObject.y,
              'On',
              OPTIONS_TEXT_STYLE
            ),
            this.add.text(
              450,
              textGameObject.y,
              'Off',
              OPTIONS_TEXT_STYLE
            )
          ])
          this._mainContainer.add(
            this._battleSceneOptionTextGameObjects.getChildren()
          )
          break
        case 4:
          this._battleStyleOptionTextGameObjects = this.add.group([
            this.add.text(
              300,
              textGameObject.y,
              'Set',
              OPTIONS_TEXT_STYLE
            ),
            this.add.text(
              450,
              textGameObject.y,
              'Shift',
              OPTIONS_TEXT_STYLE
            )
          ])
          this._mainContainer.add(
            this._battleStyleOptionTextGameObjects.getChildren()
          )
          break
      }
    })

    this._optionsMenuCursor = this.add
      .rectangle(
        padding / 2,
        padding - padding / 4,
        this._mainContainer.width - padding,
        this._title.height + padding / 2,
        0xffffff,
        0
      )
      .setOrigin(0)
      .setStrokeStyle(strokeWidth, 0xe4434a, 1)
    this._mainContainer.add(this._optionsMenuCursor)
  }

  _createDesContainer() {
    this._desContainer = this.add.container(padding + strokeWidth, 0)
    this._desContainer.width = 700
    this._desContainer.height = this._title.height * 3 + padding * 2
    const bg = this.add
      .rectangle(
        0,
        0,
        this._desContainer.width,
        this._desContainer.height,
        0xffffff,
        0.3
      )
      .setStrokeStyle(strokeWidth, 0xffffff)
      .setOrigin(0)
    this._desContainer.add(bg)
    this._selectedOptionDesMsgTextGameObject = this.add.text(
      padding,
      padding / 2,
      OPTION_MENU_OPTION_DES_MSG.BGMVOLUME,
      {
        ...OPTIONS_TEXT_STYLE,
        wordWrap: { width: this._desContainer.width - 250 }
      }
    )
    this._desContainer.add(this._selectedOptionDesMsgTextGameObject)
  }
}
