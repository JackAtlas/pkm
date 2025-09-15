import { DEBUG } from '@/config'
import { SCENE_KEYS } from './scene-keys'
import { Controls } from '@/utils/controls'
import {
  BATTLE_SCENE_OPTIONS,
  BATTLE_STYLE_OPTIONS,
  BattleSceneOptions,
  BattleStyleOptions,
  OPTION_MENU_OPTIONS,
  OptionMenuOptions,
  TEXT_SPEED_OPTIONS,
  TextSpeedOptions
} from '@/common/options'
import { Direction, DIRECTION } from '@/common/direction'
import { exhaustiveGuard } from '@/utils/guard'
import {
  DATA_MANAGER_STORE_KEYS,
  dataManager
} from '@/utils/data-manager'

const OPTION_COLORS = Object.freeze({
  NORMAL: '#ffffff',
  HIGHLIGHTED: '#e4434a'
})

const OPTIONS_TEXT_STYLE = Object.freeze({
  fontFamily: 'Power Green',
  fontSize: '28px',
  color: OPTION_COLORS.NORMAL
})

const OPTION_MENU_OPTION_DES_MSG = Object.freeze({
  TEXT_SPEED: '选择文字展示速度',
  BATTLE_SCENE: '选择是否在战斗中显示技能动画和特效',
  BATTLE_STYLE: '选择在对手宝可梦战斗不能时玩家能否更换宝可梦',
  BGM_VOLUME: '背景音乐音量',
  SE_VOLUME: '音效音量',
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
  protected _controls: Controls
  protected _selectedOptionMenu: OptionMenuOptions

  protected _textSpeedOptionTextGameObjects: Phaser.GameObjects.Group
  protected _battleSceneOptionTextGameObjects: Phaser.GameObjects.Group
  protected _battleStyleOptionTextGameObjects: Phaser.GameObjects.Group
  protected _soundOptionTextGameObjects: Phaser.GameObjects.Group

  protected _BGMVolumeCursor: Phaser.GameObjects.Rectangle
  protected _BGMVolumeText: Phaser.GameObjects.Text

  protected _SEVolumeCursor: Phaser.GameObjects.Rectangle
  protected _SEVolumeText: Phaser.GameObjects.Text

  protected _selectedOptionDesMsgTextGameObject: Phaser.GameObjects.Text

  protected _BGMVolumeValue: number
  protected _SEVolumeValue: number
  protected _selectedTextSpeedOption: TextSpeedOptions
  protected _selectedBattleSceneOption: BattleSceneOptions
  protected _selectedBattleStyleOption: BattleStyleOptions

  constructor() {
    super({
      key: SCENE_KEYS.OPTIONS_SCENE
    })
  }

  init() {
    this._selectedOptionMenu = OPTION_MENU_OPTIONS.BGM_VOLUME
    this._BGMVolumeValue = dataManager.store.get(
      DATA_MANAGER_STORE_KEYS.OPTIONS_BGM_VOLUME
    )
    this._SEVolumeValue = dataManager.store.get(
      DATA_MANAGER_STORE_KEYS.OPTIONS_SE_VOLUME
    )
    this._selectedTextSpeedOption = dataManager.store.get(
      DATA_MANAGER_STORE_KEYS.OPTIONS_TEXT_SPEED
    )
    this._selectedBattleSceneOption = dataManager.store.get(
      DATA_MANAGER_STORE_KEYS.OPTIONS_BATTLE_SCENE_ANIMATION
    )
    this._selectedBattleStyleOption = dataManager.store.get(
      DATA_MANAGER_STORE_KEYS.OPTIONS_BATTLE_STYLE
    )
  }

  create() {
    console.log(`[${OptionsScene.name}: created] invoked`)

    this._title = this.add
      .text(0, 0, 'OPTIONS', OPTIONS_TEXT_STYLE)
      .setOrigin(0.5)

    this._createMainContainer()

    this._createDesContainer()

    this._createContainer()
    this._BGMVolumeCursor.setFillStyle(
      Number(OPTION_COLORS.HIGHLIGHTED.replace('#', '0x'))
    )

    this._updateBGMVolumeGameObject()
    this._updateSEVolumeGameObject()
    this._updateTextSpeedGameObjects()
    this._updateBattleSceneGameObjects()
    this._updateBattleStyleGameObjects()

    this._controls = new Controls(this)

    this.cameras.main.once(
      Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
      () => {
        this.scene.start(SCENE_KEYS.TITLE_SCENE)
      }
    )
  }

  update() {
    if (this._controls.isInputLocked) return

    if (this._controls.wasBackKeyPressed()) {
      this._controls.lockInput = true
      this.cameras.main.fadeOut(500, 0, 0, 0)
      return
    }

    if (
      this._controls.wasSpaceKeyPressed() &&
      this._selectedOptionMenu === OPTION_MENU_OPTIONS.CONFIRM
    ) {
      this._controls.lockInput = true
      this._updateOptionDataInDataManager()
      this.cameras.main.fadeOut(500, 0, 0, 0)
      return
    }

    const selectedDirection =
      this._controls.getDirectionKeyJustPressed()
    if (selectedDirection !== DIRECTION.NONE) {
      this._moveOptionMenuCursor(selectedDirection)
    }
  }

  _updateOptionDataInDataManager() {
    dataManager.store.set({
      [DATA_MANAGER_STORE_KEYS.OPTIONS_BGM_VOLUME]:
        this._BGMVolumeValue,
      [DATA_MANAGER_STORE_KEYS.OPTIONS_SE_VOLUME]:
        this._SEVolumeValue,
      [DATA_MANAGER_STORE_KEYS.OPTIONS_TEXT_SPEED]:
        this._selectedTextSpeedOption,
      [DATA_MANAGER_STORE_KEYS.OPTIONS_BATTLE_SCENE_ANIMATION]:
        this._selectedBattleSceneOption,
      [DATA_MANAGER_STORE_KEYS.OPTIONS_BATTLE_STYLE]:
        this._selectedBattleStyleOption
    })
    dataManager.saveData()
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
              0xffffff
            )
            .setOrigin(0.5)
          this._mainContainer.add(this._BGMVolumeCursor)
          this._BGMVolumeText = this.add
            .text(
              this._mainContainer.width - padding,
              textGameObject.y,
              '100%',
              OPTIONS_TEXT_STYLE
            )
            .setOrigin(1, 0)
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
              0xffffff
            )
            .setOrigin(0.5)
          this._mainContainer.add(this._SEVolumeCursor)
          this._SEVolumeText = this.add
            .text(
              this._mainContainer.width - padding,
              textGameObject.y,
              '100%',
              OPTIONS_TEXT_STYLE
            )
            .setOrigin(1, 0)
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
            this.add
              .text(
                (this._mainContainer.width - padding - 300) / 2 + 300,
                textGameObject.y,
                'Mid',
                OPTIONS_TEXT_STYLE
              )
              .setOrigin(0.5, 0),
            this.add
              .text(
                this._mainContainer.width - padding,
                textGameObject.y,
                'Fast',
                OPTIONS_TEXT_STYLE
              )
              .setOrigin(1, 0)
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
            this.add
              .text(
                (this._mainContainer.width - padding - 300) / 2 + 300,
                textGameObject.y,
                'Off',
                OPTIONS_TEXT_STYLE
              )
              .setOrigin(0.5, 0)
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
            this.add
              .text(
                (this._mainContainer.width - padding - 300) / 2 + 300,
                textGameObject.y,
                'Shift',
                OPTIONS_TEXT_STYLE
              )
              .setOrigin(0.5, 0)
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
      .setStrokeStyle(
        strokeWidth,
        Number(OPTION_COLORS.HIGHLIGHTED.replace('#', '0x')),
        1
      )
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
      OPTION_MENU_OPTION_DES_MSG.BGM_VOLUME,
      {
        ...OPTIONS_TEXT_STYLE,
        wordWrap: { width: this._desContainer.width - 250 }
      }
    )
    this._desContainer.add(this._selectedOptionDesMsgTextGameObject)
  }

  _moveOptionMenuCursor(direction: Direction) {
    if (direction === DIRECTION.NONE) return

    this._updateSelectedOptionMenuFromInput(direction)

    switch (this._selectedOptionMenu) {
      case OPTION_MENU_OPTIONS.BGM_VOLUME:
        this._optionsMenuCursor.setY(
          0 * this._title.height + 1 * padding - padding / 4
        )
        this._updateSliderColor('BGM_VOLUME')
        break
      case OPTION_MENU_OPTIONS.SE_VOLUME:
        this._optionsMenuCursor.setY(
          1 * this._title.height + 2 * padding - padding / 4
        )
        this._updateSliderColor('SE_VOLUME')
        break
      case OPTION_MENU_OPTIONS.TEXT_SPEED:
        this._optionsMenuCursor.setY(
          2 * this._title.height + 3 * padding - padding / 4
        )
        this._updateSliderColor()
        break
      case OPTION_MENU_OPTIONS.BATTLE_SCENE:
        this._optionsMenuCursor.setY(
          3 * this._title.height + 4 * padding - padding / 4
        )
        this._updateSliderColor()
        break
      case OPTION_MENU_OPTIONS.BATTLE_STYLE:
        this._optionsMenuCursor.setY(
          4 * this._title.height + 5 * padding - padding / 4
        )
        this._updateSliderColor()
        break
      case OPTION_MENU_OPTIONS.CONFIRM:
        this._optionsMenuCursor.setY(
          5 * this._title.height + 6 * padding - padding / 4
        )
        this._updateSliderColor()
        break
      default:
        exhaustiveGuard(this._selectedOptionMenu)
    }

    this._selectedOptionDesMsgTextGameObject.setText(
      OPTION_MENU_OPTION_DES_MSG[this._selectedOptionMenu]
    )
  }

  _updateSliderColor(slider?: 'BGM_VOLUME' | 'SE_VOLUME') {
    if (slider === 'BGM_VOLUME') {
      this._BGMVolumeCursor.setFillStyle(
        Number(OPTION_COLORS.HIGHLIGHTED.replace('#', '0x'))
      )
      this._SEVolumeCursor.setFillStyle(0xffffff)
    } else if (slider === 'SE_VOLUME') {
      this._BGMVolumeCursor.setFillStyle(0xffffff)
      this._SEVolumeCursor.setFillStyle(
        Number(OPTION_COLORS.HIGHLIGHTED.replace('#', '0x'))
      )
    } else {
      this._BGMVolumeCursor.setFillStyle(0xffffff)
      this._SEVolumeCursor.setFillStyle(0xffffff)
    }
  }

  _updateSelectedOptionMenuFromInput(direction: Direction) {
    if (direction === DIRECTION.NONE) return

    if (this._selectedOptionMenu === OPTION_MENU_OPTIONS.BGM_VOLUME) {
      switch (direction) {
        case DIRECTION.DOWN:
          this._selectedOptionMenu = OPTION_MENU_OPTIONS.SE_VOLUME
          break
        case DIRECTION.UP:
          this._selectedOptionMenu = OPTION_MENU_OPTIONS.CONFIRM
          break
        case DIRECTION.LEFT:
        case DIRECTION.RIGHT:
          this._updateBGMVolumeOption(direction)
          break
        default:
          exhaustiveGuard(direction)
      }
      return
    }

    if (this._selectedOptionMenu === OPTION_MENU_OPTIONS.SE_VOLUME) {
      switch (direction) {
        case DIRECTION.DOWN:
          this._selectedOptionMenu = OPTION_MENU_OPTIONS.TEXT_SPEED
          break
        case DIRECTION.UP:
          this._selectedOptionMenu = OPTION_MENU_OPTIONS.BGM_VOLUME
          break
        case DIRECTION.LEFT:
        case DIRECTION.RIGHT:
          this._updateSEVolumeOption(direction)
          break
        default:
          exhaustiveGuard(direction)
      }
      return
    }

    if (this._selectedOptionMenu === OPTION_MENU_OPTIONS.TEXT_SPEED) {
      switch (direction) {
        case DIRECTION.DOWN:
          this._selectedOptionMenu = OPTION_MENU_OPTIONS.BATTLE_SCENE
          break
        case DIRECTION.UP:
          this._selectedOptionMenu = OPTION_MENU_OPTIONS.SE_VOLUME
          break
        case DIRECTION.LEFT:
        case DIRECTION.RIGHT:
          this._updateTextSpeedOption(direction)
          this._updateTextSpeedGameObjects()
          break
        default:
          exhaustiveGuard(direction)
      }
      return
    }

    if (
      this._selectedOptionMenu === OPTION_MENU_OPTIONS.BATTLE_SCENE
    ) {
      switch (direction) {
        case DIRECTION.DOWN:
          this._selectedOptionMenu = OPTION_MENU_OPTIONS.BATTLE_STYLE
          break
        case DIRECTION.UP:
          this._selectedOptionMenu = OPTION_MENU_OPTIONS.TEXT_SPEED
          break
        case DIRECTION.LEFT:
        case DIRECTION.RIGHT:
          this._updateBattleSceneOption(direction)
          this._updateBattleSceneGameObjects()
          break
        default:
          exhaustiveGuard(direction)
      }
      return
    }

    if (
      this._selectedOptionMenu === OPTION_MENU_OPTIONS.BATTLE_STYLE
    ) {
      switch (direction) {
        case DIRECTION.DOWN:
          this._selectedOptionMenu = OPTION_MENU_OPTIONS.CONFIRM
          break
        case DIRECTION.UP:
          this._selectedOptionMenu = OPTION_MENU_OPTIONS.BATTLE_SCENE
          break
        case DIRECTION.LEFT:
        case DIRECTION.RIGHT:
          this._updateBattleStyleOption(direction)
          this._updateBattleStyleGameObjects()
          break
        default:
          exhaustiveGuard(direction)
      }
      return
    }

    if (this._selectedOptionMenu === OPTION_MENU_OPTIONS.CONFIRM) {
      switch (direction) {
        case DIRECTION.DOWN:
          this._selectedOptionMenu = OPTION_MENU_OPTIONS.BGM_VOLUME
          break
        case DIRECTION.UP:
          this._selectedOptionMenu = OPTION_MENU_OPTIONS.BATTLE_STYLE
          break
        case DIRECTION.LEFT:
          break
        case DIRECTION.RIGHT:
          break
        default:
          exhaustiveGuard(direction)
      }
      return
    }
  }

  _updateBGMVolumeOption(direction: Direction) {
    if (direction === DIRECTION.NONE) return

    if (direction === DIRECTION.LEFT) {
      this._BGMVolumeValue -= 10
      if (this._BGMVolumeValue < 0) {
        this._BGMVolumeValue = 0
      }
    }

    if (direction === DIRECTION.RIGHT) {
      this._BGMVolumeValue += 10
      if (this._BGMVolumeValue > 100) {
        this._BGMVolumeValue = 100
      }
    }

    this._BGMVolumeCursor.x = 300 + (260 * this._BGMVolumeValue) / 100
    this._BGMVolumeText.setText(`${this._BGMVolumeValue}%`)
  }

  _updateBGMVolumeGameObject() {
    this._BGMVolumeCursor.setX(
      300 + (260 * this._BGMVolumeValue) / 100
    )
    this._BGMVolumeText.setText(`${this._BGMVolumeValue}%`)
  }

  _updateSEVolumeGameObject() {
    this._SEVolumeCursor.setX(300 + (260 * this._SEVolumeValue) / 100)
    this._SEVolumeText.setText(`${this._SEVolumeValue}%`)
  }

  _updateSEVolumeOption(direction: Direction) {
    if (direction === DIRECTION.NONE) return

    if (direction === DIRECTION.LEFT) {
      this._SEVolumeValue -= 10
      if (this._SEVolumeValue < 0) {
        this._SEVolumeValue = 0
      }
    }

    if (direction === DIRECTION.RIGHT) {
      this._SEVolumeValue += 10
      if (this._SEVolumeValue > 100) {
        this._SEVolumeValue = 100
      }
    }

    this._SEVolumeCursor.x = 300 + (260 * this._SEVolumeValue) / 100
    this._SEVolumeText.setText(`${this._SEVolumeValue}%`)
  }

  _updateTextSpeedOption(direction: 'LEFT' | 'RIGHT') {
    if (direction === DIRECTION.LEFT) {
      if (this._selectedTextSpeedOption === TEXT_SPEED_OPTIONS.SLOW) {
        return
      } else if (
        this._selectedTextSpeedOption === TEXT_SPEED_OPTIONS.MID
      ) {
        this._selectedTextSpeedOption = TEXT_SPEED_OPTIONS.SLOW
        return
      } else if (
        this._selectedTextSpeedOption === TEXT_SPEED_OPTIONS.FAST
      ) {
        this._selectedTextSpeedOption = TEXT_SPEED_OPTIONS.MID
        return
      } else {
        exhaustiveGuard(this._selectedTextSpeedOption)
      }
    } else if (direction === DIRECTION.RIGHT) {
      if (this._selectedTextSpeedOption === TEXT_SPEED_OPTIONS.SLOW) {
        this._selectedTextSpeedOption = TEXT_SPEED_OPTIONS.MID
        return
      } else if (
        this._selectedTextSpeedOption === TEXT_SPEED_OPTIONS.MID
      ) {
        this._selectedTextSpeedOption = TEXT_SPEED_OPTIONS.FAST
        return
      } else if (
        this._selectedTextSpeedOption === TEXT_SPEED_OPTIONS.FAST
      ) {
        return
      } else {
        exhaustiveGuard(this._selectedTextSpeedOption)
      }
    }
  }

  _updateTextSpeedGameObjects() {
    const textGameObjects =
      this._textSpeedOptionTextGameObjects.getChildren() as Phaser.GameObjects.Text[]
    textGameObjects.forEach((obj) => {
      obj.setColor('#ffffff')
    })

    if (this._selectedTextSpeedOption === TEXT_SPEED_OPTIONS.SLOW) {
      textGameObjects[0].setColor(OPTION_COLORS.HIGHLIGHTED)
    } else if (
      this._selectedTextSpeedOption === TEXT_SPEED_OPTIONS.MID
    ) {
      textGameObjects[1].setColor(OPTION_COLORS.HIGHLIGHTED)
    } else if (
      this._selectedTextSpeedOption === TEXT_SPEED_OPTIONS.FAST
    ) {
      textGameObjects[2].setColor(OPTION_COLORS.HIGHLIGHTED)
    } else {
      exhaustiveGuard(this._selectedTextSpeedOption)
    }
  }

  _updateBattleSceneOption(direction: 'LEFT' | 'RIGHT') {
    if (direction === DIRECTION.LEFT) {
      if (
        this._selectedBattleSceneOption === BATTLE_SCENE_OPTIONS.ON
      ) {
        return
      } else if (
        this._selectedBattleSceneOption === BATTLE_SCENE_OPTIONS.OFF
      ) {
        this._selectedBattleSceneOption = BATTLE_SCENE_OPTIONS.ON
        return
      } else {
        exhaustiveGuard(this._selectedBattleSceneOption)
      }
    } else if (direction === DIRECTION.RIGHT) {
      if (
        this._selectedBattleSceneOption === BATTLE_SCENE_OPTIONS.ON
      ) {
        this._selectedBattleSceneOption = BATTLE_SCENE_OPTIONS.OFF
        return
      } else if (
        this._selectedBattleSceneOption === BATTLE_SCENE_OPTIONS.OFF
      ) {
        return
      } else {
        exhaustiveGuard(this._selectedBattleSceneOption)
      }
    }
  }

  _updateBattleSceneGameObjects() {
    const textGameObjects =
      this._battleSceneOptionTextGameObjects.getChildren() as Phaser.GameObjects.Text[]
    textGameObjects.forEach((obj) => {
      obj.setColor('#ffffff')
    })

    if (this._selectedBattleSceneOption === BATTLE_SCENE_OPTIONS.ON) {
      textGameObjects[0].setColor(OPTION_COLORS.HIGHLIGHTED)
    } else if (
      this._selectedBattleSceneOption === BATTLE_SCENE_OPTIONS.OFF
    ) {
      textGameObjects[1].setColor(OPTION_COLORS.HIGHLIGHTED)
    } else {
      exhaustiveGuard(this._selectedBattleSceneOption)
    }
  }

  _updateBattleStyleOption(direction: 'LEFT' | 'RIGHT') {
    if (direction === DIRECTION.LEFT) {
      if (
        this._selectedBattleStyleOption === BATTLE_STYLE_OPTIONS.SET
      ) {
        return
      } else if (
        this._selectedBattleStyleOption === BATTLE_STYLE_OPTIONS.SHIFT
      ) {
        this._selectedBattleStyleOption = BATTLE_STYLE_OPTIONS.SET
        return
      } else {
        exhaustiveGuard(this._selectedBattleStyleOption)
      }
    } else if (direction === DIRECTION.RIGHT) {
      if (
        this._selectedBattleStyleOption === BATTLE_STYLE_OPTIONS.SET
      ) {
        this._selectedBattleStyleOption = BATTLE_STYLE_OPTIONS.SHIFT
        return
      } else if (
        this._selectedBattleStyleOption === BATTLE_STYLE_OPTIONS.SHIFT
      ) {
        return
      } else {
        exhaustiveGuard(this._selectedBattleStyleOption)
      }
    }
  }

  _updateBattleStyleGameObjects() {
    const textGameObjects =
      this._battleStyleOptionTextGameObjects.getChildren() as Phaser.GameObjects.Text[]
    textGameObjects.forEach((obj) => {
      obj.setColor('#ffffff')
    })

    if (
      this._selectedBattleStyleOption === BATTLE_STYLE_OPTIONS.SET
    ) {
      textGameObjects[0].setColor(OPTION_COLORS.HIGHLIGHTED)
    } else if (
      this._selectedBattleStyleOption === BATTLE_STYLE_OPTIONS.SHIFT
    ) {
      textGameObjects[1].setColor(OPTION_COLORS.HIGHLIGHTED)
    } else {
      exhaustiveGuard(this._selectedBattleStyleOption)
    }
  }
}
